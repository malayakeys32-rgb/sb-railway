"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore, incidentsApi, timelineApi, evidenceApi, Incident, TimelineEvent, Evidence } from "../../api/client";
import Sidebar from "../../components/Sidebar";

export default function IncidentDetailPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventDesc, setEventDesc] = useState("");
  const [eventAt, setEventAt] = useState(new Date().toISOString().slice(0, 16));
  const [actor, setActor] = useState("");
  const [addingEvent, setAddingEvent] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "evidence">("timeline");

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    load();
  }, [token, id]);

  async function load() {
    setLoading(true);
    try {
      const [inc, evts, evid] = await Promise.all([
        incidentsApi.get(id),
        timelineApi.list(id),
        evidenceApi.list(id),
      ]);
      setIncident(inc.data);
      setEvents(evts.data);
      setEvidence(evid.data);
    } finally { setLoading(false); }
  }

  async function addEvent() {
    if (!eventDesc) return;
    setAddingEvent(true);
    try {
      await timelineApi.add(id, { description: eventDesc, eventAt, actor: actor || undefined });
      setEventDesc(""); setActor("");
      const res = await timelineApi.list(id);
      setEvents(res.data);
    } finally { setAddingEvent(false); }
  }

  async function updateStatus(status: string) {
    await incidentsApi.update(id, { status: status as any });
    setIncident((prev) => prev ? { ...prev, status: status as any } : prev);
  }

  if (!token) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main className="page-main">
        <button className="btn btn-ghost" onClick={() => router.push("/incidents")} style={{ marginBottom: "1.5rem", fontSize: "0.78rem" }}>← Back to Incidents</button>

        {loading ? <p style={{ color: "var(--text-dim)" }}>Loading…</p> : !incident ? <p style={{ color: "var(--text-dim)" }}>Not found.</p> : (
          <>
            {/* Header */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <h1 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{incident.isAnonymous ? "● " : ""}{incident.title}</h1>
                    <span className={`badge badge-${incident.severity.toLowerCase()}`}>{incident.severity}</span>
                    <span className={`badge badge-${incident.status.toLowerCase()}`}>{incident.status}</span>
                  </div>
                  <p style={{ color: "var(--text-mid)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>{incident.description}</p>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    <span>📅 {new Date(incident.occurredAt).toLocaleString()}</span>
                    {incident.location && <span>📍 {incident.location}</span>}
                    {incident.category && <span>🏷 {incident.category}</span>}
                    <span>👤 {incident.isAnonymous ? "Anonymous" : incident.reporter.name}</span>
                  </div>
                </div>
                {/* Status update */}
                <div style={{ flexShrink: 0 }}>
                  <div className="form-label" style={{ marginBottom: "0.4rem" }}>Update Status</div>
                  <select className="form-input" style={{ width: "auto" }} value={incident.status} onChange={(e) => updateStatus(e.target.value)}>
                    {["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
              {(["timeline", "evidence"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={activeTab === tab ? "btn btn-red" : "btn btn-ghost"}
                  style={{ fontSize: "0.8rem", textTransform: "capitalize" }}>
                  {tab === "timeline" ? `⏱ Timeline (${events.length})` : `🔒 Evidence (${evidence.length})`}
                </button>
              ))}
            </div>

            {activeTab === "timeline" && (
              <div>
                {/* Timeline events */}
                <div style={{ position: "relative", paddingLeft: "2rem", marginBottom: "1.5rem" }}>
                  <div style={{ position: "absolute", left: "0.55rem", top: 0, bottom: 0, width: 2, background: "var(--border2)" }} />
                  {events.length === 0 && <p style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>No events yet.</p>}
                  {events.map((ev) => (
                    <div key={ev.id} style={{ position: "relative", marginBottom: "1.25rem" }}>
                      <div style={{ position: "absolute", left: "-1.6rem", top: "0.4rem", width: 10, height: 10, borderRadius: "50%", background: "var(--red)", border: "2px solid var(--bg)" }} />
                      <div className="card-sm">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                          <div>
                            <p style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>{ev.description}</p>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", display: "flex", gap: "1rem" }}>
                              <span>🕐 {new Date(ev.eventAt).toLocaleString()}</span>
                              {ev.actor && <span>👤 {ev.actor}</span>}
                              {ev.isLocked && <span style={{ color: "var(--success)" }}>🔒 Locked</span>}
                            </div>
                            {ev.forensicHash && (
                              <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontFamily: "var(--mono)", marginTop: "0.3rem" }}>
                                Hash: {ev.forensicHash.slice(0, 20)}…
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add event */}
                <div className="card" style={{ background: "var(--surface2)" }}>
                  <h4 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-dim)", marginBottom: "0.875rem" }}>Add Timeline Event</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <textarea className="form-input" placeholder="What occurred at this point?" value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} rows={2} style={{ resize: "vertical" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <input className="form-input" placeholder="Actor (optional)" value={actor} onChange={(e) => setActor(e.target.value)} />
                      <input className="form-input" type="datetime-local" value={eventAt} onChange={(e) => setEventAt(e.target.value)} />
                    </div>
                    <button className="btn btn-red" onClick={addEvent} disabled={addingEvent} style={{ alignSelf: "flex-start" }}>
                      {addingEvent ? "Sealing…" : "Add & Seal Event"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "evidence" && (
              <div>
                {evidence.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-dim)" }}>
                    <p>No evidence linked to this incident.</p>
                    <button className="btn btn-ghost" onClick={() => router.push("/evidence")} style={{ marginTop: "1rem" }}>Go to Evidence Vault →</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.875rem" }}>
                    {evidence.map((ev) => (
                      <div key={ev.id} className="card" style={{ padding: "1.25rem" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                          {ev.mimeType.startsWith("image") ? "🖼" : ev.mimeType.startsWith("video") ? "🎬" : ev.mimeType.startsWith("audio") ? "🎙" : "📄"}
                        </div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{ev.originalName}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.25rem" }}>{(ev.fileSize / 1024).toFixed(1)} KB</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--success)", marginTop: "0.4rem", fontWeight: 700 }}>✓ SEALED</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
