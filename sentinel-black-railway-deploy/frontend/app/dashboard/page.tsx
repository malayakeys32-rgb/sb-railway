"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, incidentsApi, evidenceApi, patternsApi, Incident, Evidence, Pattern } from "../api/client";
import Sidebar from "../components/Sidebar";
import SecurityBanner from "../components/SecurityBanner";

export default function DashboardPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    Promise.all([incidentsApi.list(), evidenceApi.list(), patternsApi.list()])
      .then(([i, e, p]) => { setIncidents(i.data); setEvidence(e.data); setPatterns(p.data); })
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return null;

  const critical = incidents.filter((i) => i.severity === "CRITICAL").length;
  const open = incidents.filter((i) => i.status === "OPEN").length;
  const escalating = patterns.filter((p) => p.isEscalating).length;

  const stats = [
    { label: "Total Incidents", value: incidents.length, color: "var(--text)", icon: "⚡" },
    { label: "Critical", value: critical, color: "var(--critical)", icon: "🔴" },
    { label: "Open Cases", value: open, color: "var(--high)", icon: "◎" },
    { label: "Evidence Files", value: evidence.length, color: "var(--success)", icon: "🔒" },
    { label: "Patterns", value: patterns.length, color: "var(--medium)", icon: "◈" },
    { label: "Escalating", value: escalating, color: "var(--critical)", icon: "▲" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main className="page-main">
        <SecurityBanner />
        <div className="page-header">
          <div>
            <h1 className="page-title">Command Center</h1>
            <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", marginTop: "0.25rem" }}>
              {user?.maskedMode ? "Identity masked — operating securely" : `Operator: ${user?.name}`}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-dim)" }}>
            <div className="status-dot" />
            LIVE
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.875rem", marginBottom: "2.5rem" }}>
          {stats.map((s) => (
            <div key={s.label} className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{s.icon}</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {loading ? "—" : s.value}
              </div>
              <div style={{ color: "var(--text-dim)", fontSize: "0.72rem", marginTop: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Recent incidents */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)" }}>Recent Incidents</h2>
              <button className="btn btn-ghost" onClick={() => router.push("/incidents")} style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}>View All</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {loading ? <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>Loading…</p> :
                incidents.slice(0, 5).map((inc) => (
                  <div key={inc.id} className="card-sm" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem" }}
                    onClick={() => router.push(`/incidents/${inc.id}`)}>
                    <div style={{ width: 3, alignSelf: "stretch", borderRadius: 2, flexShrink: 0, background: inc.severity === "CRITICAL" ? "var(--critical)" : inc.severity === "HIGH" ? "var(--high)" : inc.severity === "MEDIUM" ? "var(--medium)" : "var(--low)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.1rem" }}>{new Date(inc.occurredAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`badge badge-${inc.status.toLowerCase()}`}>{inc.status}</span>
                  </div>
                ))
              }
              {!loading && incidents.length === 0 && <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>No incidents recorded.</p>}
            </div>
          </div>

          {/* Recent evidence */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)" }}>Evidence Vault</h2>
              <button className="btn btn-ghost" onClick={() => router.push("/evidence")} style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}>View All</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {loading ? <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>Loading…</p> :
                evidence.slice(0, 5).map((ev) => (
                  <div key={ev.id} className="card-sm" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>
                      {ev.mimeType.startsWith("image") ? "🖼" : ev.mimeType.startsWith("video") ? "🎬" : ev.mimeType.startsWith("audio") ? "🎙" : "📄"}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.originalName}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.1rem" }}>{(ev.fileSize / 1024).toFixed(1)} KB · {new Date(ev.createdAt).toLocaleDateString()}</div>
                    </div>
                    {ev.isSealed && <span style={{ fontSize: "0.65rem", color: "var(--success)", fontWeight: 700, letterSpacing: "0.06em" }}>SEALED</span>}
                  </div>
                ))
              }
              {!loading && evidence.length === 0 && <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>No evidence uploaded.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
