import { Router } from "express";
import prisma from "../prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";

const router = Router();

/**
 * ADMIN LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * ADMIN ACCOUNT CREATION
 */
router.post("/create", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const exists = await prisma.admin.findUnique({
      where: { email },
    });

    if (exists) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashed,
      },
    });

    const token = jwt.sign(
      { id: newAdmin.id, email: newAdmin.email, role: "admin" },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
      },
    });
  } catch (err) {
    console.error("ADMIN CREATE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
