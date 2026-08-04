import Header from "./components/Header";
import NebulaModule from "./components/NebulaModule";
import AgentsPanel from "./components/AgentsPanel";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #0a0a14, #000)",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        padding: "20px",
      }}
    >
      {/* HEADER */}
      <Header />

      {/* MAIN DASHBOARD GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* LEFT SIDE — AI MODULE */}
        <NebulaModule />

        {/* RIGHT SIDE — AGENTS */}
        <AgentsPanel />
      </div>
    </div>
  );
}
