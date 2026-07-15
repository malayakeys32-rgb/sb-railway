"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, evidenceApi, Evidence } from "../api/client";
import Sidebar from "../components/Sidebar";

function fileIcon(mime: string) {
  if (mime.startsWith("image")) return "🖼";
  if (mime.startsWith("video")) return "🎬";
  if (mime.startsWith("audio")) return "🎙";
  if (mime.includes("pdf")) return "📋";
  return "📄";
}

export default function EvidencePage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Evidence | null>(null);
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    load();
  }, [token]);

  async function load() {
    setLoading(true);
    const res = await evidenceApi.list();
    setEvidence(res.data);
    setLoading(false);
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true); setError("");
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        if (desc) fd.append("description", desc);
        await evidenceApi.upload(fd);
      }
      setDesc("");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Upload failed");
    } finally { setUploading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this evidence?")) return;
    await evidenceApi.delete(id);
    setEvidence((prev) => prev.filter((e) => e.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  if (!token) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main className="page-main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Evidence Vault</h1>
            <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", marginTop: "0.25rem" }}>Tamper-proof cryptographic storage</p>
          </div>
          <button className="btn btn-red" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Sealing…" : "+ Upload Evidence"}
          </button>
        </div>

        {/* Hidden file input */}
        <input ref={fileRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf,.txt" style={{ display: "none" }}
          onChange={(e) => handleUpload(e.target.files)} />

        {/* Upload drop zone */}
        <div
          className="card"
          style={{ marginBottom: "1.5rem", border: "2px dashed var(--border2)", background: "var(--surface2)", textAlign: "center", padding: "2rem", cursor: "pointer" }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
          <p style={{ color: "var(--text-mid)", fontSize: "0.85rem" }}>
            Drag & drop files here or click to upload
          </p>
          <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginTop: "0.3rem" }}>
            Photos · Videos · Audio · PDFs — All files are cryptographically sealed on upload
          </p>
          {error && <p className="error-msg" style={{ marginTop: "0.5rem" }}>⚠ {error}</p>}
        </div>

        {/* Evidence grid */}
        {loading ? (
          <p style={{ color: "var(--text-dim)" }}>Loading vault…</p>
        ) : evidence.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-dim)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
            <p>Vault is empty. Upload your first piece of evidence.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.875rem" }}>
            {evidence.map((ev) => (
              <div key={ev.id} className="card" style={{ padding: "1.25rem", cursor: "pointer", transition: "border-color 0.15s", borderColor: selected?.id === ev.id ? "var(--red)" : "var(--border)" }}
                onClick={() => setSelected(selected?.id === ev.id ? null : ev)}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.75rem" }}>{fileIcon(ev.mimeType)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.originalName}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.2rem" }}>
                      {(ev.fileSize / 1024).toFixed(1)} KB · {new Date(ev.createdAt).toLocaleDateString()}
                    </div>
                    {ev.description && <div style={{ fontSize: "0.78rem", color: "var(--text-mid)", marginTop: "0.3rem" }}>{ev.description}</div>}
                  </div>
                </div>

                {/* Chain of custody indicator */}
                <div style={{ marginTop: "0.875rem", padding: "0.5rem 0.75rem", background: "var(--surface2)", borderRadius: "var(--radius)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.68rem", color: "var(--success)", fontWeight: 700, letterSpacing: "0.06em" }}>
                    ✓ SEALED · SHA-256
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-dim)", fontFamily: "var(--mono)" }}>
                    {ev.fileHash.slice(0, 10)}…
                  </span>
                </div>

                {/* Expanded detail */}
                {selected?.id === ev.id && (
                  <div style={{ marginTop: "0.875rem", borderTop: "1px solid var(--border)", paddingTop: "0.875rem" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontFamily: "var(--mono)", wordBreak: "break-all", marginBottom: "0.75rem" }}>
                      SHA-256: {ev.fileHash}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: "0.75rem" }}>
                      Chain of custody: {(ev.chainOfCustody as any[]).length} entries
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <a href={evidenceApi.fileUrl(ev.id)} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem" }}>View File</a>
                      <button className="btn btn-danger" style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem" }} onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
