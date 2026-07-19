import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
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

export const emailService = {
  async sendMFACode(email: string, code: string): Promise<boolean> {
    try {
      const transporter = await getTransporter();
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Sentinel Black" <noreply@sentinelblack.local>',
        to: email,
        subject: "Your Sentinel Black MFA Code",
        html: `<h2>Two-Factor Authentication</h2><p>Your MFA code is: <strong>${code}</strong></p><p>Expires in 10 minutes.</p>`,
      });
      if (!process.env.SMTP_HOST) {
        console.log("MFA Email preview:", nodemailer.getTestMessageUrl(info));
      }
      return true;
    } catch (err) {
      console.error("Failed to send MFA code:", err);
      return false;
    }
  },

  async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
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
        console.log("Reset Email preview:", nodemailer.getTestMessageUrl(info));
      }
      return true;
    } catch (err) {
      console.error("Failed to send password reset:", err);
      return false;
    }
  },
};

export default emailService;
