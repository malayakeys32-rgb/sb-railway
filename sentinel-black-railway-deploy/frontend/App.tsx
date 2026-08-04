export default function App() {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* NEON ANIMATED BACKGROUND */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(130deg, #0a0a14, #12001f, #001b29)",
          animation: "neonPulse 8s ease-in-out infinite",
          backgroundSize: "300% 300%",
          zIndex: -1,
        }}
      />

      {/* KEYFRAMES */}
      <style>
        {`
          @keyframes neonPulse {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      {/* MAIN CONTENT */}
      <div
        style={{
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          padding: "20px",
        }}
      >
        <Header />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr 1fr",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <SystemStatus />
            <ActionPanel />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <ThreatFeed />
            <NebulaModule />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <AgentsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   HEADER
----------------------------------------------------------- */
function Header() {
  return (
    <header
      style={{
        padding: "20px 28px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(10,10,20,0.55)",
        backdropFilter: "blur(8px)",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "28px",
          fontWeight: "600",
          background: "linear-gradient(90deg, #7f5bff, #00eaff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Sentinel‑Black Dashboard
      </h1>

      <p
        style={{
          marginTop: "6px",
          opacity: 0.7,
          fontSize: "14px",
        }}
      >
        Tactical Intelligence • Nebula AI • Device Forensics
      </p>
    </header>
  );
}

/* -----------------------------------------------------------
   SYSTEM STATUS
----------------------------------------------------------- */
function SystemStatus() {
  const items = [
    { label: "Core Engine", value: "Operational", state: "ok" },
    { label: "AI Sync", value: "Stable", state: "ok" },
    { label: "Threat Monitor", value: "3 Flags", state: "warn" },
  ];

  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(10, 10, 20, 0.55)",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: "12px",
          fontSize: "20px",
          background: "linear-gradient(90deg, #00eaff, #7f5bff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        System Status
      </h2>

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span>{item.label}</span>
          <span
            style={{
              color: item.state === "ok" ? "#00eaff" : "#ff4d8d",
              fontWeight: "600",
            }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* -----------------------------------------------------------
   ACTION PANEL
----------------------------------------------------------- */
function ActionPanel() {
  const actions = [
    "New Case",
    "Upload Evidence",
    "Run Analysis",
    "Device Log Extraction",
  ];

  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(10, 10, 20, 0.55)",
        borderRadius: "10px",
        border: "1px solid rgba(124, 92, 255, 0.25)",
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: "12px",
          fontSize: "20px",
          background: "linear-gradient(90deg, #7f5bff, #00eaff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Actions
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {actions.map((label, i) => (
          <button
            key={i}
            style={{
              padding: "12px 16px",
              borderRadius: "6px",
              background: "rgba(124, 92, 255, 0.15)",
              border: "1px solid rgba(124, 92, 255, 0.4)",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(124, 92, 255, 0.3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(124, 92, 255, 0.15)")
            }
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   THREAT FEED
----------------------------------------------------------- */
function ThreatFeed() {
  const events = [
    "Parsed 142 events from mobile device logs",
    "Login anomaly detected",
    "New device registered",
    "Location mismatch flagged",
  ];

  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(15, 15, 30, 0.55)",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.06)",
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

/* -----------------------------------------------------------
   NEBULA MODULE
----------------------------------------------------------- */
function NebulaModule() {
  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(15, 15, 30, 0.55)",
        borderRadius: "10px",
        border: "1px solid rgba(124, 92, 255, 0.25)",
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: "12px",
          fontSize: "20px",
          background: "linear-gradient(90deg, #7f5bff, #00eaff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Analyst Agent • Nebula Intelligence Module
      </h2>

      <p style={{ opacity: 0.85, marginBottom: "16px" }}>
        Correlation found between login anomaly and device registration.
      </p>

      <button
        style={{
          padding: "10px 16px",
          borderRadius: "6px",
          background: "linear-gradient(90deg, #7f5bff, #00eaff)",
          border: "none",
          color: "#fff",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Ask Nebula
      </button>
    </div>
  );
}

/* -----------------------------------------------------------
   AGENTS PANEL
----------------------------------------------------------- */
function AgentsPanel() {
  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(10, 10, 20, 0.55)",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: "12px",
          fontSize: "20px",
          background: "linear-gradient(90deg, #00eaff, #7f5bff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Nebula Agents
      </h2>

      <p style={{ opacity: 0.75 }}>
        (Agents list will populate here — AI modules, forensic tools, device
        analyzers, threat correlators.)
      </p>
    </div>
  );
}
