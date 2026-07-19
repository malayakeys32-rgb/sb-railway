"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface DashboardData {
  stats: {
    totalUsers: number;
    totalIncidents: number;
    totalEvidence: number;
  };
  recentAuditLogs: Array<{
    id: string;
    action: string;
    resource: string;
    userId: string;
    user: { email: string; name: string };
    createdAt: string;
  }>;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  mfaEnabled: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "logs">("overview");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/admin/login");
      return;
    }

    setCurrentUser(JSON.parse(user));
    fetchDashboardData(token);
  }, [router]);

  async function fetchDashboardData(token: string) {
    try {
      const [dashRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/auth/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/auth/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDashboardData(dashRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ color: "var(--text-dim)" }}>Loading admin panel…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "2rem", color: "var(--text)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Admin Dashboard</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>{currentUser?.email}</span>
          <button className="btn btn-red" onClick={handleLogout} style={{ padding: "0.5rem 1rem" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
        {(["overview", "users", "logs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.75rem 1.5rem",
              background: "none",
              border: "none",
              borderBottom: tab === t ? "2px solid var(--red)" : "none",
              color: tab === t ? "var(--red)" : "var(--text-dim)",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: tab === t ? 700 : 400,
              transition: "all 0.15s",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && dashboardData && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div className="card" style={{ padding: "1.5rem", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>TOTAL USERS</p>
            <p style={{ fontSize: "2rem", fontWeight: 700 }}>{dashboardData.stats.totalUsers}</p>
          </div>
          <div className="card" style={{ padding: "1.5rem", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>INCIDENTS</p>
            <p style={{ fontSize: "2rem", fontWeight: 700 }}>{dashboardData.stats.totalIncidents}</p>
          </div>
          <div className="card" style={{ padding: "1.5rem", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>EVIDENCE ITEMS</p>
            <p style={{ fontSize: "2rem", fontWeight: 700 }}>{dashboardData.stats.totalEvidence}</p>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="card" style={{ border: "1px solid var(--border)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "var(--text-dim)", fontSize: "0.85rem" }}>EMAIL</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "var(--text-dim)", fontSize: "0.85rem" }}>NAME</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "var(--text-dim)", fontSize: "0.85rem" }}>ROLE</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "var(--text-dim)", fontSize: "0.85rem" }}>MFA</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "var(--text-dim)", fontSize: "0.85rem" }}>JOINED</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem" }}>{user.email}</td>
                  <td style={{ padding: "1rem" }}>{user.name}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ background: user.role === "ADMIN" ? "rgba(200,0,26,0.2)" : "rgba(100,150,200,0.2)", padding: "0.25rem 0.75rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600 }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>{user.mfaEnabled ? "✓" : "–"}</td>
                  <td style={{ padding: "1rem", color: "var(--text-dim)", fontSize: "0.85rem" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "logs" && dashboardData && (
        <div className="card" style={{ border: "1px solid var(--border)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "var(--text-dim)", fontSize: "0.85rem" }}>ACTION</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "var(--text-dim)", fontSize: "0.85rem" }}>USER</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "var(--text-dim)", fontSize: "0.85rem" }}>RESOURCE</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700, color: "var(--text-dim)", fontSize: "0.85rem" }}>TIME</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentAuditLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>{log.action}</td>
                  <td style={{ padding: "1rem" }}>{log.user?.email || "–"}</td>
                  <td style={{ padding: "1rem", color: "var(--text-dim)", fontSize: "0.85rem" }}>{log.resource}</td>
                  <td style={{ padding: "1rem", color: "var(--text-dim)", fontSize: "0.85rem" }}>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

