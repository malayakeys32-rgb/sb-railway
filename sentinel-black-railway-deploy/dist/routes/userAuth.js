"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// Railway environment variables:
// ADMIN_EMAIL
// ADMIN_PASSWORD_HASH
// JWT_SECRET
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing email or password" });
        }
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const match = await bcryptjs_1.default.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ email }, process.env.JWT_SECRET, { expiresIn: "2h" });
        return res.json({ token });
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
