'use client';

import EvidenceCard from '@/components/EvidenceCard';
import { SBButton } from '@/components/ui/Button';
import Timeline from '@/components/Timeline';
import NebulaPanel from '@/components/NebulaPanel';

const timelineEvents = [
  {
    timestamp: '14:32',
    title: 'Case #4821 - New login from unknown device',
    time: '14:32',
    status: 'alert',
  },
  {
    timestamp: '13:18',
    title: 'Case #4799 - Geo-velocity anomaly detected',
    time: '13:18',
    status: 'warning',
  },
  {
    timestamp: '12:05',
    title: 'Case #4763 - Unusual data export pattern',
    time: '12:05',
    status: 'alert',
  },
];

function StatsGrid() {
  const stats = [
    { label: 'Active Processes', value: 128 },
    { label: 'AI Events Today', value: 3421 },
    { label: 'Threat Flags', value: 3 },
    { label: 'System Uptime', value: '99.998%' },
  ];

  return (
    <div className="stats-grid">
      {stats.map((s, i) => (
        <div key={i} className="stats-card">
          <div className="stats-value">{s.value}</div>
          <div className="stats-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sentinel Black</h1>
          <p className="text-sb-textSecondary mt-1">
            Forensic‑intelligence overview across active cases and signals.
          </p>
        </div>

        <div className="flex gap-3">
          <SBButton variant="primary">New Case</SBButton>
          <SBButton variant="ghost">View All Cases</SBButton>
        </div>
      </header>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Top row: Active cases + Threat summary */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <EvidenceCard title="Active Cases" meta="6 open · 2 high priority">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="bg-sb-surfaceAlt rounded-md p-3 border border-sb-border">
                <p className="text-xs text-sb-textSecondary">Case #4821</p>
                <p className="font-semibold mt-1">Account takeover cluster</p>
                <p className="text-xs text-sb-amber mt-1">Priority: High</p>
              </div>
              <div className="bg-sb-surfaceAlt rounded-md p-3 border border-sb-border">
                <p className="text-xs text-sb-textSecondary">Case #4799</p>
                <p className="font-semibold mt-1">Location mismatch pattern</p>
                <p className="text-xs text-sb-blue mt-1">Priority: Medium</p>
              </div>
              <div className="bg-sb-surfaceAlt rounded-md p-3 border border-sb-border">
                <p className="text-xs text-sb-textSecondary">Case #4763</p>
                <p className="font-semibold mt-1">Data exfil anomaly</p>
                <p className="text-xs text-sb-red mt-1">Priority: Critical</p>
              </div>
            </div>
          </EvidenceCard>
        </div>

        <EvidenceCard title="Threat Summary" meta="Last 24 hours">
          <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
            <div>
              <p className="text-sb-textSecondary">Signals processed</p>
              <p className="text-xl font-semibold">14,203</p>
            </div>
            <div>
              <p className="text-sb-textSecondary">Anomalies flagged</p>
              <p className="text-xl font-semibold text-sb-amber">37</p>
            </div>
            <div>
              <p className="text-sb-textSecondary">Critical events</p>
              <p className="text-xl font-semibold text-sb-red">5</p>
            </div>
            <div>
              <p className="text-sb-textSecondary">Cases updated</p>
              <p className="text-xl font-semibold text-sb-blue">9</p>
            </div>
          </div>
        </EvidenceCard>
      </section>

      {/* Middle row: Timeline + Nebula insight */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvidenceCard title="Recent Events Timeline" meta="Correlated across cases">
            <div className="mt-4">
              <Timeline events={timelineEvents} />
            </div>
          </EvidenceCard>
        </div>

        <NebulaPanel agent="Analyst Agent">
          <div className="bg-sb-surface p-3 rounded-md border border-sb-border">
            <p className="text-sm text-sb-textSecondary">
              "Three active cases share overlapping device fingerprints and login patterns.
              Recommend clustering into a single investigation."
            </p>
          </div>
          <div className="bg-sb-surfaceAlt p-3 rounded-md border border-sb-border mt-3">
            <p className="text-xs text-sb-textSecondary mb-1">Suggested action</p>
            <p className="text-sm">
              Merge Case #4821, #4799, and #4763 into a unified 'Account Takeover Cluster'
              workspace.
            </p>
          </div>
        </NebulaPanel>
      </section>
    </div>
  );
}

