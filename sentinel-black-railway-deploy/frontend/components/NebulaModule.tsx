export default function NebulaModule() {
  return (
    <div
      className="nebula-module"
      style={{
        padding: "20px",
        background: "rgba(15, 15, 30, 0.55)",
        borderRadius: "10px",
        border: "1px solid rgba(124, 92, 255, 0.25)",
        backdropFilter: "blur(6px)",
        marginTop: "20px",
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
