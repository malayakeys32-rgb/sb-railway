"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
/**
 * ADMIN LOGIN (actually user login with role)
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing email or password" });
        }
        const user = await prismaClient_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid password" });
        }
        return res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (err) {
        console.error("AUTH LOGIN ERROR:", err);
        return res.status(500).json({ error: "Server error" });
    }
});
/**
 * ADMIN CREATE (actually user create with required name)
 */
router.post("/create", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Missing email, password, or name" });
        }
        const exists = await prismaClient_1.default.user.findUnique({
            where: { email },
        });
        if (exists) {
            return res.status(409).json({ error: "Email already exists" });
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const newUser = await prismaClient_1.default.user.create({
            data: {
                email,
                password: hashed,
                name,
            },
        });
        return res.json({
            success: true,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            },
        });
    }
    catch (err) {
        console.error("AUTH CREATE ERROR:", err);
        return res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
