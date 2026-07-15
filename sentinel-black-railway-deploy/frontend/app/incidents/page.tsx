"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, incidentsApi, Incident } from "../api/client";
import Sidebar from "../components/Sidebar";

export default function IncidentsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("LOW");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16));
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    load();
  }, [token]);

  async function load() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (filterSeverity) params.severity = filterSeverity;
    if (filterStatus) params.status = filterStatus;
    const res = await incidentsApi.list(params);
    setIncidents(res.data);
    setLoading(false);
  }

  async function handleCreate() {
    if (!title || !description) { setFormError("Title and description required"); return; }
    setSaving(true); setFormError("");
    try {
      await incidentsApi.create({ title, description, severity: severity as any, category, location, occurredAt, isAnonymous });
      setShowForm(false);
      setTitle(""); setDescription(""); setCategory(""); setLocation("");
      await load();
    } catch (err: any) {
      setFormError(err?.response?.data?.error ?? "Failed to create");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this incident?")) return;
    await incidentsApi.delete(id);
    setIncidents((prev) => prev.filter((i) => i.id !== id));
  }

  if (!token) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main className="page-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Incident Ledger</h1>
            <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", marginTop: "0.25rem" }}>{incidents.length} documented incidents</p>
          </div>
          <button className="btn btn-red" onClick={() => setShowForm(true)}>+ Report Incident</button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <input className="form-input" style={{ maxWidth: 240 }} placeholder="Search incidents…" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <select className="form-input" style={{ maxWidth: 150 }} value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="">All severities</option>
            {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-input" style={{ maxWidth: 170 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All statuses</option>
            {["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-ghost" onClick={load}>Filter</button>
        </div>

        {loading ? <p style={{ color: "var(--text-dim)" }}>Loading…</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {incidents.length === 0 && (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-dim)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚡</div>
                <p>No incidents found.</p>
              </div>
            )}
            {incidents.map((inc) => (
              <div key={inc.id} className="card-sm" style={{ display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "border-color 0.15s" }}
                onClick={() => router.push(`/incidents/${inc.id}`)}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--red)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}>
                <div style={{ width: 3, alignSelf: "stretch", borderRadius: 2, flexShrink: 0, background: inc.severity === "CRITICAL" ? "var(--critical)" : inc.severity === "HIGH" ? "var(--high)" : inc.severity === "MEDIUM" ? "var(--medium)" : "var(--low)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{inc.isAnonymous ? "● " : ""}{inc.title}</span>
                    <span className={`badge badge-${inc.severity.toLowerCase()}`}>{inc.severity}</span>
                    <span className={`badge badge-${inc.status.toLowerCase()}`}>{inc.status}</span>
                    {inc.category && <span style={{ fontSize: "0.68rem", color: "var(--text-dim)", background: "var(--surface2)", padding: "0.1rem 0.45rem", borderRadius: "999px", border: "1px solid var(--border2)" }}>{inc.category}</span>}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.description}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.2rem", display: "flex", gap: "1rem" }}>
                    <span>{new Date(inc.occurredAt).toLocaleString()}</span>
                    {inc._count && <span>📌 {inc._count.timeline} events · 🔒 {inc._count.evidence} evidence</span>}
                  </div>
                </div>
                <button className="btn btn-danger" style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem", flexShrink: 0 }}
                  onClick={(e) => { e.stopPropagation(); handleDelete(inc.id); }}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* Create incident modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="card" style={{ width: "100%", maxWidth: 520, padding: "2rem", maxHeight: "90vh", overflow: "auto" }}>
              <h2 style={{ fontWeight: 800, marginBottom: "1.5rem", fontSize: "1rem", letterSpacing: "0.04em" }}>REPORT INCIDENT</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief incident title" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full description of what occurred" rows={4} style={{ resize: "vertical" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <div className="form-group">
                    <label className="form-label">Severity</label>
                    <select className="form-input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                      {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Harassment" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where it occurred" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Occurred At</label>
                    <input className="form-input" type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", color: "var(--text-mid)" }}>
                  <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                  File anonymously (name redacted from report)
                </label>
                {formError && <p className="error-msg">⚠ {formError}</p>}
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                  <button className="btn btn-ghost" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
                  <button className="btn btn-red" onClick={handleCreate} disabled={saving}>{saving ? "Sealing…" : "File Incident"}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
