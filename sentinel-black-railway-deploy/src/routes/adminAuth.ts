import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../prismaClient";
import { config } from "../config";
import emailService from "../services/emailService";
import mfaService from "../services/mfa";

const router = Router();
const resetTokens = new Map<string, { email: string; expiresAt: Date }>();

// Middleware to verify token
const verifyToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    (req as any).userId = decoded.userId;
    (req as any).userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.post("/admin/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (user.mfaEnabled) {
      const mfaCode = mfaService.generateCode();
      await mfaService.storeMFACode(user.id, mfaCode);
      await emailService.sendMFACode(user.email, mfaCode);
      res.json({ requiresMFA: true, userId: user.id, message: "MFA code sent to email" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/verify-mfa", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, mfaCode } = req.body as { userId?: string; mfaCode?: string };
    if (!userId || !mfaCode) {
      res.status(400).json({ error: "userId and mfaCode are required" });
      return;
    }

    const isValid = await mfaService.verifyMFACode(userId, mfaCode);
    if (!isValid) {
      res.status(401).json({ error: "Invalid MFA code" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("MFA error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/forgot-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.json({ message: "If account exists, reset link has been sent" });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    resetTokens.set(resetToken, { email, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });

    await emailService.sendPasswordReset(email, resetToken);
    res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/reset-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, email, newPassword } = req.body as { resetToken?: string; email?: string; newPassword?: string };

    if (!resetToken || !email || !newPassword) {
      res.status(400).json({ error: "resetToken, email, and newPassword are required" });
      return;
    }

    if (newPassword.length < 12) {
      res.status(400).json({ error: "Password must be at least 12 characters" });
      return;
    }

    const tokenData = resetTokens.get(resetToken);
    if (!tokenData || tokenData.email !== email || new Date() > tokenData.expiresAt) {
      res.status(401).json({ error: "Invalid or expired reset token" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    resetTokens.delete(resetToken);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/create", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
    if (!email || !password || !name) {
      res.status(400).json({ error: "email, password, and name are required" });
      return;
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: { email, password: hashed, name, role: "ADMIN" },
    });

    res.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New endpoints for admin dashboard
router.get("/admin/dashboard", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalIncidents = await prisma.incident.count();
    const totalEvidence = await prisma.evidence.count();

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    });

    res.json({
      stats: { totalUsers, totalIncidents, totalEvidence },
      recentAuditLogs: recentAuditLogs.map(log => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        userId: log.userId,
        user: log.user,
        createdAt: log.createdAt,
      })),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/users", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        mfaEnabled: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (err) {
    console.error("Users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

