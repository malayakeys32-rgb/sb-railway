"use client";

import EvidenceCard from "@/components/EvidenceCard";
import Timeline from "@/components/Timeline";
import NebulaPanel from "@/components/NebulaPanel";
import { SBButton } from "@/components/ui/Button";

export default function CaseWorkspace({ params }) {
  const caseId = params.id;

  const timelineEvents = [
    { title: "Suspicious login detected", time: "08:14 AM" },
    { title: "Device fingerprint mismatch", time: "08:09 AM" },
    { title: "Unusual IP cluster activity", time: "07:55 AM" },
    { title: "Account recovery attempt", time: "07:41 AM" }
  ];

  return (
    <div className="space-y-10">

      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case #{caseId}</h1>
          <p className="text-sb-textSecondary mt-1">
            Forensic workspace · Active investigation
          </p>
        </div>

        <div className="flex gap-3">
          <SBButton variant="primary">Add Evidence</SBButton>
          <SBButton variant="secondary">Run Analysis</SBButton>
          <SBButton variant="ghost">Export Case</SBButton>
        </div>
      </header>

      {/* Case Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EvidenceCard title="Case Summary" meta="Auto‑generated">
          <p className="text-sb-textSecondary text-sm leading-relaxed">
            This case involves a cluster of suspicious login attempts originating
            from mismatched device fingerprints and inconsistent geolocation data.
            Multiple anomalies correlate with known account takeover patterns.
          </p>
        </EvidenceCard>

        <EvidenceCard title="Case Stats" meta="Live">
          <div className="grid grid-cols-2 gap-4 text-sm mt-3">
            <div>
              <p className="text-sb-textSecondary">Evidence items</p>
              <p className="text-xl font-semibold">12</p>
            </div>
            <div>
              <p className="text-sb-textSecondary">Anomalies</p>
              <p className="text-xl font-semibold text-sb-amber">7</p>
            </div>
            <div>
              <p className="text-sb-textSecondary">Critical signals</p>
              <p className="text-xl font-semibold text-sb-red">3</p>
            </div>
            <div>
              <p className="text-sb-textSecondary">Linked cases</p>
              <p className="text-xl font-semibold text-sb-blue">2</p>
            </div>
          </div>
        </EvidenceCard>

        <EvidenceCard title="Entities" meta="Auto‑extracted">
          <ul className="text-sm space-y-2 mt-3">
            <li>• Device ID: A9‑F2‑C1‑X8</li>
            <li>• IP Cluster: 192.44.12.x</li>
            <li>• User: j.mendoza</li>
            <li>• Region: Pacific Northwest</li>
          </ul>
        </EvidenceCard>
      </section>

      {/* Timeline + Nebula */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvidenceCard title="Event Timeline" meta="Chronological">
            <div className="mt-4">
              <Timeline events={timelineEvents} />
            </div>
          </EvidenceCard>
        </div>

        <NebulaPanel agent="Investigator Agent">
          <div className="bg-sb-surface p-3 rounded-md border border-sb-border">
            <p className="text-sm text-sb-textSecondary">
              “Multiple anomalies correlate with known takeover clusters.
              Recommend deeper analysis of device fingerprint mismatches.”
            </p>
          </div>

          <div className="bg-sb-surfaceAlt p-3 rounded-md border border-sb-border mt-3">
            <p className="text-xs text-sb-textSecondary mb-1">Suggested action</p>
            <p className="text-sm">
              Cross‑reference IP cluster with historical login anomalies.
            </p>
          </div>
        </NebulaPanel>
      </section>

      {/* Evidence Grid */}
      <section>
        <EvidenceCard title="Evidence Grid" meta="12 items">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-sb-surfaceAlt border border-sb-border rounded-md p-4 hover:border-sb-blue hover:shadow-neon transition-all"
              >
                <p className="text-xs text-sb-textSecondary">Evidence #{i + 1}</p>
                <p className="font-medium mt-1">Log extract</p>
              </div>
            ))}
          </div>
        </EvidenceCard>
      </section>

      {/* Actions */}
      <section className="flex flex-wrap gap-3">
        <SBButton variant="primary">Add New Evidence</SBButton>
        <SBButton variant="secondary">Run Full Analysis</SBButton>
        <SBButton variant="ghost">Return to Dashboard</SBButton>
      </section>
    </div>
  );
}
