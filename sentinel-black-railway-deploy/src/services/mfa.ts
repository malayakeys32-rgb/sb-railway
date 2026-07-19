import crypto from "crypto";
import prisma from "../prismaClient";

export interface MFASession {
  code: string;
  expiresAt: Date;
  attempts: number;
}

export const mfaService = {
  // Generate 6-digit code
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Store MFA code in cache (in production, use Redis)
  mfaStore: new Map<string, MFASession>(),

  async storeMFACode(userId: string, code: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    this.mfaStore.set(userId, { code, expiresAt, attempts: 0 });
  },

  async verifyMFACode(userId: string, code: string): Promise<boolean> {
    const session = this.mfaStore.get(userId);
    if (!session) return false;
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

  clearMFACode(userId: string): void {
    this.mfaStore.delete(userId);
  },
};

export default mfaService;

