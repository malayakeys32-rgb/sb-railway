"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    if (userData) setUser(JSON.parse(userData));
  }, [router]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>🏠 Home</h1>
      <div className="card" style={{ border: "1px solid var(--border)", padding: "2rem" }}>
        <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>Welcome to Sentinel Black, {user?.name}!</p>
        <p style={{ color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "2rem" }}>
          Your command center for mission control, team coordination, and operational intelligence.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <a href="/admin/dashboard" style={{ padding: "1rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--text)", textAlign: "center", fontWeight: 600 }}>
            🎯 Today's Mission
          </a>
          <a href="/admin/tasks" style={{ padding: "1rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--text)", textAlign: "center", fontWeight: 600 }}>
            ✅ Tasks
          </a>
          <a href="/admin/team" style={{ padding: "1rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--text)", textAlign: "center", fontWeight: 600 }}>
            👥 Team
          </a>
          <a href="/admin/reports" style={{ padding: "1rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--text)", textAlign: "center", fontWeight: 600 }}>
            📊 Reports
          </a>
        </div>
      </div>
    </div>
  );
}

