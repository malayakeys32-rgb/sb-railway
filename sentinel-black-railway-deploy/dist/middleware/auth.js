"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(authHeader.slice(7), config_1.config.jwtSecret);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
function requireAdmin(req, res, next) {
    if (req.user?.role !== "ADMIN") {
        res.status(403).json({ error: "Admin access required" });
        return;
    }
    next();
}
