"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mfaService = void 0;
exports.mfaService = {
    // Generate 6-digit code
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },
    // Store MFA code in cache (in production, use Redis)
    mfaStore: new Map(),
    async storeMFACode(userId, code) {
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        this.mfaStore.set(userId, { code, expiresAt, attempts: 0 });
    },
    async verifyMFACode(userId, code) {
        const session = this.mfaStore.get(userId);
        if (!session)
            return false;
        if (new Date() > session.expiresAt) {
            this.mfaStore.delete(userId);
            return false;
        }
        if (session.attempts >= 3) {
            this.mfaStore.delete(userId);
            return false;
        }
        session.attempts++;
        if (session.code === code) {
            this.mfaStore.delete(userId);
            return true;
        }
        return false;
    },
    clearMFACode(userId) {
        this.mfaStore.delete(userId);
    },
};
exports.default = exports.mfaService;
