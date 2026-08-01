"use client";

import EvidenceCard from "@/components/EvidenceCard";
import NebulaPanel from "@/components/NebulaPanel";
import Timeline from "@/components/Timeline";
import { SBButton } from "@/components/ui/Button";

export default function Page() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Sentinel Black Dashboard</h1>
        <p className="text-sb-textSecondary mt-1">
          Neon‑forensic intelligence interface is active.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <SBButton variant="primary">New Case</SBButton>
        <SBButton variant="secondary">Upload Evidence</SBButton>
        <SBButton variant="ghost">Run Analysis</SBButton>
      </div>

      {/* Evidence Example */}
      <EvidenceCard title="Device Log Extraction" meta="3 mins ago">
        <p className="text-sb-textSecondary">
          Parsed 142 events from mobile device logs.
        </p>
      </EvidenceCard>

      {/* Timeline Example */}
      <Timeline
        events={[
          { title: "Login anomaly detected", time: "12:04 PM" },
          { title: "New device registered", time: "11:52 AM" },
          { title: "Location mismatch flagged", time: "11:47 AM" }
        ]}
      />

      {/* Nebula Example */}
      <div className="mt-10">
        <NebulaPanel agent="Analyst Agent">
          <div className="bg-sb-surface p-3 rounded-md border border-sb-border">
            <p className="text-sb-textSecondary">
              “Correlation found between login anomaly and device registration.”
            </p>
          </div>
        </NebulaPanel>
      </div>

    </div>
  );
}
