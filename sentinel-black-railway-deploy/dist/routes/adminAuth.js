"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const config_1 = require("../config");
const emailService_1 = __importDefault(require("../services/emailService"));
const mfa_1 = __importDefault(require("../services/mfa"));
const router = (0, express_1.Router)();
const resetTokens = new Map();
// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};
router.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "email and password are required" });
            return;
        }
        const user = await prismaClient_1.default.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        if (user.mfaEnabled) {
            const mfaCode = mfa_1.default.generateCode();
            await mfa_1.default.storeMFACode(user.id, mfaCode);
            await emailService_1.default.sendMFACode(user.email, mfaCode);
            res.json({ requiresMFA: true, userId: user.id, message: "MFA code sent to email" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, config_1.config.jwtSecret, { expiresIn: "24h" });
        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/admin/verify-mfa", async (req, res) => {
    try {
        const { userId, mfaCode } = req.body;
        if (!userId || !mfaCode) {
            res.status(400).json({ error: "userId and mfaCode are required" });
            return;
        }
        const isValid = await mfa_1.default.verifyMFACode(userId, mfaCode);
        if (!isValid) {
            res.status(401).json({ error: "Invalid MFA code" });
            return;
        }
        const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, config_1.config.jwtSecret, { expiresIn: "24h" });
        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        });
    }
    catch (err) {
        console.error("MFA error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/admin/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: "email is required" });
            return;
        }
        const user = await prismaClient_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.json({ message: "If account exists, reset link has been sent" });
            return;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        resetTokens.set(resetToken, { email, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
        await emailService_1.default.sendPasswordReset(email, resetToken);
        res.json({ message: "Password reset link sent to email" });
    }
    catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/admin/reset-password", async (req, res) => {
    try {
        const { resetToken, email, newPassword } = req.body;
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
        const user = await prismaClient_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(newPassword, 12);
        await prismaClient_1.default.user.update({ where: { id: user.id }, data: { password: hashed } });
        resetTokens.delete(resetToken);
        res.json({ message: "Password reset successful" });
    }
    catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/admin/create", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({ error: "email, password, and name are required" });
            return;
        }
        const exists = await prismaClient_1.default.user.findUnique({ where: { email } });
        if (exists) {
            res.status(409).json({ error: "Email already exists" });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(password, 12);
        const newUser = await prismaClient_1.default.user.create({
            data: { email, password: hashed, name, role: "ADMIN" },
        });
        res.json({
            success: true,
            user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
        });
    }
    catch (err) {
        console.error("Create user error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// New endpoints for admin dashboard
router.get("/admin/dashboard", verifyToken, async (req, res) => {
    try {
        const totalUsers = await prismaClient_1.default.user.count();
        const totalIncidents = await prismaClient_1.default.incident.count();
        const totalEvidence = await prismaClient_1.default.evidence.count();
        const recentAuditLogs = await prismaClient_1.default.auditLog.findMany({
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
    }
    catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/admin/users", verifyToken, async (req, res) => {
    try {
        const users = await prismaClient_1.default.user.findMany({
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
    }
    catch (err) {
        console.error("Users error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
