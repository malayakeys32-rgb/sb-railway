"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, patternsApi, incidentsApi, Pattern, Incident } from "../api/client";
import Sidebar from "../components/Sidebar";

export default function PatternsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("LOW");
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    Promise.all([patternsApi.list(), incidentsApi.list()])
      .then(([p, i]) => { setPatterns(p.data); setIncidents(i.data); })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCreate() {
    if (!title || !description) { setFormError("Title and description required"); return; }
    setSaving(true); setFormError("");
    try {
      const res = await patternsApi.create({ title, description, severity, incidentIds: selectedIncidents });
      setPatterns((prev) => [res.data, ...prev]);
      setShowForm(false);
      setTitle(""); setDescription(""); setSelectedIncidents([]);
    } catch (err: any) {
      setFormError(err?.response?.data?.error ?? "Failed");
    } finally { setSaving(false); }
  }

  async function toggleEscalating(p: Pattern) {
    const res = await patternsApi.update(p.id, { isEscalating: !p.isEscalating } as any);
    setPatterns((prev) => prev.map((x) => x.id === p.id ? res.data : x));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this pattern?")) return;
    await patternsApi.delete(id);
    setPatterns((prev) => prev.filter((p) => p.id !== id));
  }

  if (!token) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main className="page-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Pattern Tracker</h1>
            <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", marginTop: "0.25rem" }}>Detect and document recurring behaviors</p>
          </div>
          <button className="btn btn-red" onClick={() => setShowForm(true)}>+ New Pattern</button>
        </div>

        {loading ? <p style={{ color: "var(--text-dim)" }}>Loading…</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {patterns.length === 0 && (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-dim)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>◎</div>
                <p>No patterns detected yet.</p>
              </div>
            )}
            {patterns.map((p) => (
              <div key={p.id} className="card" style={{ borderColor: p.isEscalating ? "rgba(200,0,26,0.4)" : "var(--border)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{p.title}</span>
                      <span className={`badge badge-${p.severity.toLowerCase()}`}>{p.severity}</span>
                      {p.isEscalating && <span style={{ fontSize: "0.68rem", color: "var(--critical)", fontWeight: 700, letterSpacing: "0.06em" }}>▲ ESCALATING</span>}
                      <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>× {p.frequency} incidents</span>
                    </div>
                    <p style={{ color: "var(--text-mid)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{p.description}</p>
                    {p.incidents.length > 0 && (
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {p.incidents.map((link) => (
                          <span key={link.incident.id} style={{ fontSize: "0.72rem", background: "var(--surface2)", color: "var(--text-mid)", padding: "0.15rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border2)", cursor: "pointer" }}
                            onClick={() => router.push(`/incidents/${link.incident.id}`)}>
                            {link.incident.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <button className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem" }} onClick={() => toggleEscalating(p)}>
                      {p.isEscalating ? "▼ De-escalate" : "▲ Escalate"}
                    </button>
                    <button className="btn btn-danger" style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem" }} onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="modal-overlay">
            <div className="card" style={{ width: "100%", maxWidth: 520, padding: "2rem", maxHeight: "90vh", overflow: "auto" }}>
              <h2 style={{ fontWeight: 800, marginBottom: "1.5rem", fontSize: "1rem", letterSpacing: "0.04em" }}>DEFINE PATTERN</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Pattern Title</label>
                  <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Repeated workplace harassment" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the pattern of behavior" rows={3} style={{ resize: "vertical" }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Severity</label>
                  <select className="form-input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                    {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Link Incidents</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: 180, overflow: "auto", background: "var(--surface2)", borderRadius: "var(--radius)", padding: "0.5rem", border: "1px solid var(--border2)" }}>
                    {incidents.map((inc) => (
                      <label key={inc.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", cursor: "pointer", color: "var(--text-mid)" }}>
                        <input type="checkbox" checked={selectedIncidents.includes(inc.id)}
                          onChange={(e) => setSelectedIncidents((prev) => e.target.checked ? [...prev, inc.id] : prev.filter((x) => x !== inc.id))} />
                        {inc.title}
                        <span className={`badge badge-${inc.severity.toLowerCase()}`} style={{ marginLeft: "auto" }}>{inc.severity}</span>
                      </label>
                    ))}
                    {incidents.length === 0 && <p style={{ color: "var(--text-dim)", fontSize: "0.82rem" }}>No incidents available</p>}
                  </div>
                </div>
                {formError && <p className="error-msg">⚠ {formError}</p>}
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
                  <button className="btn btn-red" onClick={handleCreate} disabled={saving}>{saving ? "Saving…" : "Create Pattern"}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
