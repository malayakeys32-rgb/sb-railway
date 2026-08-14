"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthenticate = adminAuthenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
async function adminAuthenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.user = decoded;
        if (decoded.role !== "ADMIN") {
            res.status(403).json({ error: "Admin access required" });
            return;
        }
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
}
exports.default = adminAuthenticate;
