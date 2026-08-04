export default function ThreatFeed() {
  const events = [
    "Parsed 142 events from mobile device logs",
    "Login anomaly detected",
    "New device registered",
    "Location mismatch flagged",
  ];

  return (
    <div
      className="threat-feed"
      style={{
        padding: "20px",
        background: "rgba(15, 15, 30, 0.55)",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(6px)",
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: "12px",
          fontSize: "20px",
          background: "linear-gradient(90deg, #ff4d8d, #ffb3f6)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Threat Activity Feed
      </h2>

      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {events.map((e, i) => (
          <div
            key={i}
            style={{
              padding: "10px 12px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "6px",
              borderLeft: "3px solid #ff4d8d",
              fontSize: "14px",
              opacity: 0.9,
            }}
          >
            {e}
          </div>
        ))}
      </div>
    </div>
  );
}
