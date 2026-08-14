"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
let transporter = null;
async function getTransporter() {
    if (transporter)
        return transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    else {
        const testAccount = await nodemailer_1.default.createTestAccount();
        transporter = nodemailer_1.default.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("Using Ethereal test email. Check logs for preview URLs.");
    }
    return transporter;
}
exports.emailService = {
    async sendMFACode(email, code) {
        try {
            const transporter = await getTransporter();
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Sentinel Black" <noreply@sentinelblack.local>',
                to: email,
                subject: "Your Sentinel Black MFA Code",
                html: `<h2>Two-Factor Authentication</h2><p>Your MFA code is: <strong>${code}</strong></p><p>Expires in 10 minutes.</p>`,
            });
            if (!process.env.SMTP_HOST) {
                console.log("MFA Email preview:", nodemailer_1.default.getTestMessageUrl(info));
            }
            return true;
        }
        catch (err) {
            console.error("Failed to send MFA code:", err);
            return false;
        }
    },
    async sendPasswordReset(email, resetToken) {
        try {
            const transporter = await getTransporter();
            const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5000"}/admin/login?resetToken=${resetToken}&email=${encodeURIComponent(email)}`;
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Sentinel Black" <noreply@sentinelblack.local>',
                to: email,
                subject: "Sentinel Black - Password Reset",
                html: `<h2>Password Reset</h2><p><a href="${resetLink}">Click here to reset password</a></p><p>Link expires in 24 hours.</p>`,
            });
            if (!process.env.SMTP_HOST) {
                console.log("Reset Email preview:", nodemailer_1.default.getTestMessageUrl(info));
            }
            return true;
        }
        catch (err) {
            console.error("Failed to send password reset:", err);
            return false;
        }
    },
};
exports.default = exports.emailService;
