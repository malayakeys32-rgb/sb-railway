import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";

const router = Router();

/**
 * USER LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("USER LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * USER ACCOUNT CREATION
 */
router.post("/create", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashed,
    });

    return res.json({
      success: true,
      user: {
        id: newUser._id,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("USER CREATE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
