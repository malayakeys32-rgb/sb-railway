"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authApi, useAuthStore } from "../api/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  async function handleSubmit() {
    setError(""); setLoading(true);
    try {
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
          {/* Tabs */}
          <div style={{ display: "flex", background: "var(--surface2)", borderRadius: "var(--radius)", padding: "3px", marginBottom: "1.75rem", border: "1px solid var(--border)" }}>
            {([" login", "register"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "none", background: mode === m ? "var(--red)" : "transparent", color: mode === m ? "#fff" : "var(--text-dim)", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.05em", textTransform: "uppercase", transition: "all 0.15s", cursor: "pointer" }}>
                {m === "login" ? "Access System" : "New Operator"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">Operator Name</label>
                <input className="form-input" type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Identity</label>
              <input className="form-input" type="email" placeholder="email@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            </div>
            <div className="form-group">
              <label className="form-label">Auth Key</label>
              <input className="form-input" type="password" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            </div>

            {error && <p className="error-msg">⚠ {error}</p>}

            <button className="btn btn-red" onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", padding: "0.7rem" }}>
              {loading ? "Authenticating…" : mode === "login" ? "Enter System" : "Create Account"}
            </button>

            {/* Forgot Password and Create Account buttons */}
            {mode === "login" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button 
                  onClick={() => alert("Password reset functionality coming soon")}
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
                  onClick={() => { setMode("register"); setError(""); }}
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
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.72rem", marginTop: "1.5rem", letterSpacing: "0.04em" }}>
          ALL ACTIVITY IS FORENSICALLY LOGGED
        </p>
      </div>
    </div>
  );
}

