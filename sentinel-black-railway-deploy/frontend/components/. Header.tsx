export default function Header() {
  return (
    <header
      className="sb-header"
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
