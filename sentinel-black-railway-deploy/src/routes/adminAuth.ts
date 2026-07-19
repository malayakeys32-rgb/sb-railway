import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import { config } from "../config";
import { adminAuthenticate, AdminRequest } from "../middleware/adminAuth";
import { logAudit } from "../services/audit";
import mfaService from "../services/mfa";
import passwordResetService from "../services/passwordReset";

const router = Router();
const ADMIN_EMAIL_DOMAINS = (process.env.ADMIN_EMAIL_DOMAINS || "admin.local").split(",");

// Admin Login with MFA
router.post("/admin/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    // Validate email domain for admins
    const domain = email.split("@")[1];
    if (!ADMIN_EMAIL_DOMAINS.some(d => domain?.endsWith(d))) {
      res.status(403).json({ error: "Invalid admin email domain" });
      await logAudit("", "ADMIN_LOGIN_FAILED", "admin_auth", null, { reason: "invalid_domain", email });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      await logAudit("", "ADMIN_LOGIN_FAILED", "admin_auth", null, { reason: "invalid_credentials", email });
      return;
    }

    if (user.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access denied" });
      await logAudit(user.id, "ADMIN_LOGIN_FAILED", "admin_auth", user.id, { reason: "not_admin" });
      return;
    }

    // Generate MFA code if MFA enabled
    if (user.mfaEnabled) {
      const mfaCode = mfaService.generateCode();
      await mfaService.storeMFACode(user.id, mfaCode);
      // In production: send via email
      console.log(`MFA Code for ${email}: ${mfaCode}`);
      res.json({ requiresMFA: true, message: "MFA code sent to email", userId: user.id });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    await logAudit(user.id, "ADMIN_LOGIN", "admin_auth", user.id, { ip: req.ip });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify MFA Code
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
      await logAudit(userId, "MFA_VERIFICATION_FAILED", "admin_auth", userId);
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
      { expiresIn: "1h" }
    );

    await logAudit(userId, "ADMIN_LOGIN_MFA_SUCCESS", "admin_auth", userId);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Request Password Reset
router.post("/admin/forgot-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "ADMIN") {
      // Don't reveal whether email exists
      res.json({ message: "If account exists, reset link has been sent" });
      return;
    }

    const resetToken = await passwordResetService.generateResetToken(email);
    await logAudit(user.id, "PASSWORD_RESET_REQUESTED", "admin_auth", user.id);

    // In production: send reset link via email
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: "Password reset link sent to email", resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reset Password with Token
router.post("/admin/reset-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, newPassword } = req.body as { resetToken?: string; newPassword?: string };
    if (!resetToken || !newPassword) {
      res.status(400).json({ error: "resetToken and newPassword are required" });
      return;
    }

    if (newPassword.length < 12) {
      res.status(400).json({ error: "Password must be at least 12 characters" });
      return;
    }

    const isValid = await passwordResetService.verifyResetToken(resetToken);
    if (!isValid) {
      res.status(401).json({ error: "Invalid or expired reset token" });
      return;
    }

    // Find user by reset token (in production, store in DB)
    // For now, we'll need to pass email in the request
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    await logAudit(user.id, "PASSWORD_RESET_SUCCESS", "admin_auth", user.id);
    await passwordResetService.resetPassword(resetToken, newPassword);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Admin Dashboard Data (protected)
router.get("/admin/dashboard", adminAuthenticate, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalIncidents = await prisma.incident.count();
    const totalEvidence = await prisma.evidence.count();
    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    });

    res.json({
      stats: { totalUsers, totalIncidents, totalEvidence },
      recentAuditLogs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Manage Users (Admin only)
router.get("/admin/users", adminAuthenticate, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, mfaEnabled: true, createdAt: true },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update User Role (Admin only)
router.patch("/admin/users/:userId", adminAuthenticate, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role, mfaEnabled } = req.body as { role?: string; mfaEnabled?: boolean };

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role ? { role: role as any } : {}),
        ...(mfaEnabled !== undefined ? { mfaEnabled } : {}),
      },
      select: { id: true, email: true, name: true, role: true, mfaEnabled: true },
    });

    await logAudit(req.user!.userId, "USER_UPDATED", "user", userId, { updatedFields: { role, mfaEnabled } });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Deactivate User (Admin only)
router.delete("/admin/users/:userId", adminAuthenticate, async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (userId === req.user!.userId) {
      res.status(400).json({ error: "Cannot deactivate your own account" });
      return;
    }

    await prisma.user.delete({ where: { id: userId } });
    await logAudit(req.user!.userId, "USER_DELETED", "user", userId);

    res.json({ message: "User deactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

