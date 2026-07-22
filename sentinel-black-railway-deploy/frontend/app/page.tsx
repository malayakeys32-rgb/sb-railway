"use client";

import { useState } from "react";

export default function EvidencePage() {
  const [section, setSection] = useState("vault");

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold">Evidence Vault</h2>
        <p className="text-white/70 border-l-2 border-red-600 pl-3 mt-2">
          Secure evidence storage, situation reports, uploads, and chain‑of‑custody logs.
        </p>
      </header>

      {/* SECTION SWITCHER */}
      <div className="flex gap-4">
        {["vault", "add", "situations", "uploads", "journal"].map((key) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`px-4 py-2 rounded-md border ${
              section === key
                ? "border-red-600 bg-red-600/20"
                : "border-white/20 hover:border-red-600 hover:bg-red-600/10"
            }`}
          >
            {key === "vault" && "Evidence"}
            {key === "add" && "Add Evidence"}
            {key === "situations" && "Situation Reports"}
            {key === "uploads" && "Uploads"}
            {key === "journal" && "Journal"}
          </button>
        ))}
      </div>

      {/* EVIDENCE LIST */}
      {section === "vault" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Evidence Entries</h3>
            <p className="text-white/60 text-sm mb-4">All logged evidence.</p>

            <div className="space-y-3">
              <div className="p-3 border border-white/10 bg-white/5 rounded-md">
                <div className="flex justify-between">
                  <span className="font-medium">Entry gate damage</span>
                  <span className="text-red-500 text-xs border border-red-600 px-2 py-0.5 rounded-full">
                    Logged
                  </span>
                </div>
                <p className="text-xs text-white/60">EV‑001 • Photo • Sector A‑3</p>
                <p className="text-xs text-white/60">2026‑07‑22 00:14</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Situation Reports</h3>
            <p className="text-white/60 text-sm mb-4">Active operational situations.</p>

            <div className="space-y-3">
              <div className="p-3 border border-white/10 bg-white/5 rounded-md">
                <div className="flex justify-between">
                  <span className="font-medium">Overflow detected in wash bay</span>
                  <span className="text-red-500 text-xs border border-red-600 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-xs text-white/60">SR‑014 • Risk: Medium</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD EVIDENCE */}
      {section === "add" && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4">
          <h3 className="font-semibold">Add Evidence</h3>

          <input className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Title" />
          <input className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Location" />
          <textarea className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Description" />
          <input type="file" className="w-full p-2 bg-black border border-white/20 rounded-md" />

          <button className="px-4 py-2 bg-red-600 rounded-md">Save Evidence</button>
        </div>
      )}

      {/* SITUATIONS */}
      {section === "situations" && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4">
          <h3 className="font-semibold">New Situation Report</h3>

          <input className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Summary" />
          <select className="w-full p-2 bg-black border border-white/20 rounded-md">
            <option>Active</option>
            <option>Investigating</option>
            <option>Resolved</option>
          </select>
          <select className="w-full p-2 bg-black border border-white/20 rounded-md">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <textarea className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Actions Taken" />

          <button className="px-4 py-2 bg-red-600 rounded-md">Save Report</button>
        </div>
      )}

      {/* UPLOADS */}
      {section === "uploads" && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4">
          <h3 className="font-semibold">Upload File</h3>

          <select className="w-full p-2 bg-black border border-white/20 rounded-md">
            <option>Audio</option>
            <option>Image</option>
            <option>Document</option>
          </select>

          <input type="file" className="w-full p-2 bg-black border border-white/20 rounded-md" />

          <button className="px-4 py-2 bg-red-600 rounded-md">Upload</button>
        </div>
      )}

      {/* JOURNAL */}
      {section === "journal" && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4">
          <h3 className="font-semibold">Journal Entry</h3>

          <input className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Entry Title" />
          <textarea className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Begin your entry..." />

          <button className="px-4 py-2 bg-red-600 rounded-md">Save Entry</button>
        </div>
      )}
    </div>
  );
}
