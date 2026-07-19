"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AdminLoginPage() {
  const [step, setStep] = useState<"login" | "mfa" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  async function handleAdminLogin() {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/admin/login`, {
        email,
        password,
      });

      if (res.data.requiresMFA) {
        setUserId(res.data.userId);
        setStep("mfa");
      } else {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleMFAVerify() {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/admin/verify-mfa`, {
        userId,
        mfaCode,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "MFA verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/admin/forgot-password`, {
        email: resetEmail,
      });
      alert("Check your email for password reset instructions");
      setResetEmail("");
      setStep("login");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 12) {
      setError("Password must be at least 12 characters");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/admin/reset-password`, {
        resetToken,
        email: resetEmail,
        newPassword,
      });
      alert("Password reset successful. Please log in.");
      setStep("login");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "1rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(200,0,26,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,0,26,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 450, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <Image src="/logo-black.png" alt="Sentinel Black" width={140} height={140} priority style={{ objectFit: "contain" }} />
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginTop: "0.4rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            ADMIN OPERATIONS
          </div>
        </div>

        <div className="card" style={{ padding: "2rem", border: "1px solid var(--border2)" }}>
          {step === "login" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Admin Email</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="admin@organization.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Security Credential</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                    disabled={loading}
                  />
                </div>

                {error && <p className="error-msg">⚠ {error}</p>}

                <button className="btn btn-red" onClick={handleAdminLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "0.7rem" }}>
                  {loading ? "Authenticating…" : "Secure Access"}
                </button>

                <button
                  onClick={() => {
                    setStep("reset");
                    setError("");
                  }}
                  style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            </>
          )}

          {step === "mfa" && (
            <>
              <h3 style={{ marginBottom: "1rem", color: "var(--text)" }}>Two-Factor Authentication</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>Enter the 6-digit code sent to your email.</p>
                <div className="form-group">
                  <label className="form-label">MFA Code</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="000000"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && handleMFAVerify()}
                    disabled={loading}
                    maxLength={6}
                  />
                </div>

                {error && <p className="error-msg">⚠ {error}</p>}

                <button className="btn btn-red" onClick={handleMFAVerify} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "0.7rem" }}>
                  {loading ? "Verifying…" : "Verify Code"}
                </button>

                <button
                  onClick={() => {
                    setStep("login");
                    setMfaCode("");
                    setError("");
                  }}
                  style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.85rem" }}
                  disabled={loading}
                >
                  Back to login
                </button>
              </div>
            </>
          )}

          {step === "reset" && !resetToken && (
            <>
              <h3 style={{ marginBottom: "1rem", color: "var(--text)" }}>Password Recovery</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>Enter your admin email to receive a recovery link.</p>
                <div className="form-group">
                  <label className="form-label">Admin Email</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="admin@organization.local"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                    disabled={loading}
                  />
                </div>

                {error && <p className="error-msg">⚠ {error}</p>}

                <button className="btn btn-red" onClick={handleForgotPassword} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "0.7rem" }}>
                  {loading ? "Sending…" : "Send Recovery Link"}
                </button>

                <button
                  onClick={() => {
                    setStep("login");
                    setResetEmail("");
                    setError("");
                  }}
                  style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "0.85rem" }}
                  disabled={loading}
                >
                  Back to login
                </button>
              </div>
            </>
          )}

          {step === "reset" && resetToken && (
            <>
              <h3 style={{ marginBottom: "1rem", color: "var(--text)" }}>Reset Password</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>Minimum 12 characters</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {error && <p className="error-msg">⚠ {error}</p>}

                <button className="btn btn-red" onClick={handleResetPassword} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "0.7rem" }}>
                  {loading ? "Resetting…" : "Reset Password"}
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.72rem", marginTop: "1.5rem", letterSpacing: "0.04em" }}>
          ADMIN ACCESS RESTRICTED · ALL ACTIVITY LOGGED
        </p>
      </div>
    </div>
  );
}

