"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authApi, useAuthStore } from "../api/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const { setAuth } = useAuthStore();
  const router = useRouter();

  async function handleSubmit() {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      if (mode === "forgot") {
        // Reset password with email, name, and new password
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to reset password");
          return;
        }
        setSuccessMsg("Password reset successfully!");
        setEmail("");
        setName("");
        setNewPassword("");
        setTimeout(() => setMode("login"), 2000);
        return;
      }

      const res = mode === "login"
        ? await authApi.login(email, password)
        : await authApi.register(email, password, name);
      setAuth(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Authentication failed");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "1rem", position: "relative", overflow: "hidden" }}>
      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(200,0,26,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,0,26,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <Image src="/logo-black.png" alt="Sentinel Black" width={140} height={140} priority style={{ objectFit: "contain" }} />
          </div>
          <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginTop: "0.4rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Forensic Evidence Vault
          </div>
        </div>

        <div className="card" style={{ padding: "2rem", border: "1px solid var(--border2)" }}>
          {/* Tabs - only show for login/register modes */}
          {mode !== "forgot" && (
            <div style={{ display: "flex", background: "var(--surface2)", borderRadius: "var(--radius)", padding: "3px", marginBottom: "1.75rem", border: "1px solid var(--border)" }}>
              {(["login", "register"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(""); setSuccessMsg(""); }}
                  style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "none", background: mode === m ? "var(--red)" : "transparent", color: mode === m ? "#fff" : "var(--text-dim)", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.05em", textTransform: "uppercase", transition: "all 0.15s", cursor: "pointer" }}>
                  {m === "login" ? "Access System" : "New Operator"}
                </button>
              ))}
            </div>
          )}

          {/* Forgot Password Header */}
          {mode === "forgot" && (
            <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
              <h2 style={{ color: "var(--text)", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>Reset Password</h2>
              <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", margin: 0 }}>Enter your details to reset your password</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">Operator Name</label>
                <input className="form-input" type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}

            {mode !== "forgot" && (
              <div className="form-group">
                <label className="form-label">Identity</label>
                <input className="form-input" type="email" placeholder="email@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
              </div>
            )}

            {mode === "forgot" && (
              <>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="email@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">User Name</label>
                  <input className="form-input" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" placeholder="••••••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                </div>
              </>
            )}

            {(mode === "login" || mode === "register") && (
              <div className="form-group">
                <label className="form-label">Auth Key</label>
                <input className="form-input" type="password" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
              </div>
            )}

            {error && <p className="error-msg">⚠ {error}</p>}
            {successMsg && <p style={{ color: "var(--green)", fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>✓ {successMsg}</p>}

            <button className="btn btn-red" onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", padding: "0.7rem" }}>
              {loading ? "Processing…" : mode === "login" ? "Enter System" : mode === "register" ? "Create Account" : "Reset Password"}
            </button>

            {/* Forgot Password and Create Account buttons */}
            {mode === "login" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button 
                  onClick={() => { setMode("forgot"); setError(""); setSuccessMsg(""); }}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--text-dim)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface2)";
                    e.currentTarget.style.color = "var(--text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-dim)";
                  }}
                >
                  Forgot Password?
                </button>
                <button 
                  onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); }}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--red)";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "var(--red)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--surface2)";
                    e.currentTarget.style.color = "var(--text)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Back to Login button */}
            {mode === "forgot" && (
              <button 
                onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); setEmail(""); setName(""); setNewPassword(""); }}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  transition: "all 0.15s",
                  marginTop: "0.5rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--surface2)";
                }}
              >
                Back to Login
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.72rem", marginTop: "1.5rem", letterSpacing: "0.04em" }}>
          ALL ACTIVITY IS FORENSICALLY LOGGED
        </p>
      </div>
    </div>
  );
}

