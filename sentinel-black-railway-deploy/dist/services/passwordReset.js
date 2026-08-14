"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
exports.passwordResetService = {
    // In production, store in database with expiration
    resetTokens: new Map(),
    async generateResetToken(email) {
        const user = await prismaClient_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("User not found");
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        this.resetTokens.set(token, { token, expiresAt });
        return token;
    },
    async verifyResetToken(token) {
        const resetToken = this.resetTokens.get(token);
        if (!resetToken)
            return false;
        if (new Date() > resetToken.expiresAt) {
            this.resetTokens.delete(token);
            return false;
        }
        return true;
    },
    async resetPassword(token, newPassword) {
        if (!(await this.verifyResetToken(token)))
            throw new Error("Invalid or expired token");
        this.resetTokens.delete(token);
        return token;
    },
};
exports.default = exports.passwordResetService;
