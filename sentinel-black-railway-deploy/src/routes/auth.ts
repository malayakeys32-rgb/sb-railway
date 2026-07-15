import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
import { config } from "../config";
import { authenticate, AuthRequest } from "../middleware/auth";
import { logAudit } from "../services/audit";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
    if (!email || !password || !name) {
      res.status(400).json({ error: "email, password, and name are required" });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ error: "Email already registered" }); return; }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
      select: { id: true, email: true, name: true, role: true, maskedMode: true, createdAt: true },
    });
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) { res.status(400).json({ error: "email and password are required" }); return; }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: "7d" });
    await logAudit(user.id, "LOGIN", "user", user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, maskedMode: user.maskedMode, createdAt: user.createdAt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, maskedMode: true, createdAt: true },
    });
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { maskedMode } = req.body as { maskedMode?: boolean };
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { ...(maskedMode !== undefined ? { maskedMode } : {}) },
      select: { id: true, email: true, name: true, role: true, maskedMode: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
