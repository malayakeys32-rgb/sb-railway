export default function StatsGrid() {
  const stats = [
    { label: "Active Processes", value: 128 },
    { label: "AI Events Today", value: 3421 },
    { label: "Threat Flags", value: 3 },
    { label: "System Uptime", value: "99.998%" },
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
