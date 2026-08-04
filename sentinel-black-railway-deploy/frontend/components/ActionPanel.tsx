export default function ActionPanel() {
  const actions = [
    "New Case",
    "Upload Evidence",
    "Run Analysis",
    "Device Log Extraction",
  ];

  return (
    <div
      className="action-panel"
      style={{
        padding: "20px",
        background: "rgba(10, 10, 20, 0.55)",
        borderRadius: "10px",
        border: "1px solid rgba(124, 92, 255, 0.25)",
        backdropFilter: "blur(6px)",
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

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(124, 92, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(124, 92, 255, 0.15)";
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
