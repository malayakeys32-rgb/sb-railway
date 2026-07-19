import crypto from "crypto";
import prisma from "../prismaClient";

export interface PasswordResetToken {
  token: string;
  expiresAt: Date;
}

export const passwordResetService = {
  // In production, store in database with expiration
  resetTokens: new Map<string, PasswordResetToken>(),

  async generateResetToken(email: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    this.resetTokens.set(token, { token, expiresAt });
    return token;
  },

  async verifyResetToken(token: string): Promise<boolean> {
    const resetToken = this.resetTokens.get(token);
    if (!resetToken) return false;
    if (new Date() > resetToken.expiresAt) {
      this.resetTokens.delete(token);
      return false;
    }
    return true;
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    if (!(await this.verifyResetToken(token))) throw new Error("Invalid or expired token");
    this.resetTokens.delete(token);
    return token;
  },
};

export default passwordResetService;

