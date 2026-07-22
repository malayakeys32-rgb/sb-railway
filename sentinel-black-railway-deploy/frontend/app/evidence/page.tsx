"use client";

import { useState } from "react";

export default function EvidencePage() {
  const [section, setSection] = useState<"vault" | "add" | "situations" | "uploads" | "journal">("vault");

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-red-900/40 p-6 bg-black">
        <h1 className="text-xl font-bold mb-6 tracking-wide">Evidence Vault</h1>

        <nav className="space-y-2">
          {[
            ["vault", "Evidence Vault"],
            ["add", "Add Evidence"],
            ["situations", "Situation Reports"],
            ["uploads", "Voice Notes & Photos"],
            ["journal", "Secure Journal"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSection(key as any)}
              className={`w-full text-left px-3 py-2 rounded-md border 
                ${
                  section === key
                    ? "border-red-600 bg-red-600/20 shadow-red-600/40 shadow-md"
                    : "border-white/10 hover:border-red-600 hover:bg-red-600/10"
                }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 space-y-8">

        {/* HEADER */}
        <header>
          <h2 className="text-2xl font-bold">
            {section === "vault" && "Evidence Vault"}
            {section === "add" && "Add Evidence"}
            {section === "situations" && "Situation Reports"}
            {section === "uploads" && "Voice Notes & Photos"}
            {section === "journal" && "Secure Journal Vault"}
          </h2>
          <p className="text-white/70 border-l-2 border-red-600 pl-3 mt-2">
            {section === "vault" &&
              "Review and manage evidence, situation reports, and mission‑linked uploads."}
            {section === "add" &&
              "Log new evidence with attachments and chain‑of‑custody notes."}
            {section === "situations" &&
              "Track active situations, risks, and operational updates."}
            {section === "uploads" &&
              "Upload audio, images, and documents linked to evidence."}
            {section === "journal" &&
              "Write encrypted mission notes stored securely in the vault."}
          </p>
        </header>

        {/* SECTION: EVIDENCE VAULT */}
        {section === "vault" && (
          <div className="grid grid-cols-2 gap-6">
            {/* Evidence List */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-lg backdrop-blur-sm">
              <h3 className="font-semibold mb-3">Evidence Entries</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {[
                  {
                    id: "EV-001",
                    title: "Entry gate damage",
                    type: "Photo",
                    location: "Sector A‑3",
                    time: "2026‑07‑22 00:14",
                    status: "Logged",
                  },
                  {
                    id: "EV-002",
                    title: "Operator incident report",
                    type: "Audio",
                    location: "Control room",
                    time: "2026‑07‑22 00:18",
                    status: "Pending",
                  },
                ].map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-md border border-white/10 bg-white/5"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{ev.title}</span>
                      <span className="text-red-500 text-xs border border-red-600 px-2 py-0.5 rounded-full">
                        {ev.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      {ev.id} • {ev.type} • {ev.location}
                    </p>
                    <p className="text-xs text-white/60">{ev.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Situation Reports */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-lg backdrop-blur-sm">
              <h3 className="font-semibold mb-3">Situation Reports</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {[
                  {
                    id: "SR-014",
                    summary: "Overflow detected in wash bay",
                    status: "Active",
                    risk: "Medium",
                  },
                  {
                    id: "SR-015",
                    summary: "Electrical fault flagged on dryer unit",
                    status: "Investigating",
                    risk: "High",
                  },
                ].map((sr) => (
                  <div
                    key={sr.id}
                    className="p-3 rounded-md border border-white/10 bg-white/5"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{sr.summary}</span>
                      <span className="text-red-500 text-xs border border-red-600 px-2 py-0.5 rounded-full">
                        {sr.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      {sr.id} • Risk: {sr.risk}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: ADD EVIDENCE */}
        {section === "add" && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-sm space-y-4">
            <h3 className="font-semibold">New Evidence Entry</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70">Evidence Type</label>
                <select className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md">
                  <option>Photo</option>
                  <option>Audio</option>
                  <option>Document</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-white/70">Title</label>
                <input
                  className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md"
                  placeholder="Short title"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Location</label>
                <input
                  className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md"
                  placeholder="Zone or area"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Description</label>
                <textarea
                  className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md"
                  placeholder="Describe what was observed"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Attachments</label>
                <input type="file" className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md" />
              </div>

              <div>
                <label className="text-sm text-white/70">Chain of Custody</label>
                <textarea
                  className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md"
                  placeholder="Record handling details"
                />
              </div>

              <button className="px-4 py-2 bg-red-600 rounded-md font-medium hover:bg-red-700">
                Save Evidence
              </button>
            </div>
          </div>
        )}

        {/* SECTION: SITUATION REPORTS */}
        {section === "situations" && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-sm space-y-4">
            <h3 className="font-semibold">New Situation Report</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70">Summary</label>
                <input
                  className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md"
                  placeholder="Brief summary"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Status</label>
                <select className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md">
                  <option>Active</option>
                  <option>Investigating</option>
                  <option>Resolved</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-white/70">Risk Level</label>
                <select className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-white/70">Actions Taken</label>
                <textarea
                  className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md"
                  placeholder="Describe actions taken"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Required Actions</label>
                <textarea
                  className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md"
                  placeholder="List required actions"
                />
              </div>

              <button className="px-4 py-2 bg-red-600 rounded-md font-medium hover:bg-red-700">
                Save Situation Report
              </button>
            </div>
          </div>
        )}

        {/* SECTION: UPLOADS */}
        {section === "uploads" && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-sm space-y-4">
            <h3 className="font-semibold">Upload Audio / Images</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70">Upload Type</label>
                <select className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md">
                  <option>Audio</option>
                  <option>Image</option>
                  <option>Document</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-white/70">Linked Evidence ID</label>
                <input
                  className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">File</label>
                <input type="file" className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md" />
              </div>

              <button className="px-4 py-2 bg-red-600 rounded-md font-medium hover:bg-red-700">
                Upload File
              </button>
            </div>
          </div>
        )}

        {/* SECTION: JOURNAL */}
        {section === "journal" && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-sm space-y-4">
            <h3 className="font-semibold">Encrypted Journal Entry</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70">Entry Title</label>
                <input
                  className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md"
                  placeholder="Title"
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Entry Text</label>
                <textarea
                  className="w-full mt-1 p-2 bg-black border border-white/20 rounded-md"
                  placeholder="Begin your entry..."
                />
              </div>

              <p className="text-xs text-white/60 border-l-2 border-white/20 pl-3">
                This entry will be encrypted and stored securely in the Sentinel‑Black journal vault.
              </p>

              <button className="px-4 py-2 bg-red-600 rounded-md font-medium hover:bg-red-700">
                Save Journal Entry
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
