"use client";
import { useTheme } from "@/app/lib/theme-context";

export const dynamic = "force-dynamic";

const ACCENT_COLORS = [
  { name: "Red", value: "#ff4d8d" },
  { name: "Blue", value: "#00a8ff" },
  { name: "Green", value: "#4cc864" },
  { name: "Purple", value: "#d946ef" },
  { name: "Orange", value: "#ff9500" },
  { name: "Pink", value: "#ff2d55" },
];

const GLOW_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Cyan", value: "#00ffff" },
  { name: "Yellow", value: "#ffff00" },
  { name: "Lime", value: "#00ff00" },
];

export default function Settings() {
  const { theme, setTheme, resetTheme } = useTheme();

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", marginBottom: "2rem" }}>
        ⚙️ Theme Settings
      </h1>

      {/* Theme Mode */}
      <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "rgba(0, 0, 0, 0.5)", borderRadius: "12px", border: "1px solid #333" }}>
        <h2 style={{ fontSize: "1.2rem", color: "#fff", marginBottom: "1rem" }}>🌓 Theme Mode</h2>
        <button
          onClick={() => setTheme({ mode: theme.mode === "dark" ? "light" : "dark" })}
          style={{
            padding: "0.75rem 1.5rem",
            background: theme.accentColor,
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          {theme.mode === "dark" ? "☀️ Switch to Light Mode" : "🌙 Switch to Dark Mode"}
        </button>
      </div>

      {/* Accent Color */}
      <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "rgba(0, 0, 0, 0.5)", borderRadius: "12px", border: "1px solid #333" }}>
        <h2 style={{ fontSize: "1.2rem", color: "#fff", marginBottom: "1rem" }}>🎨 Accent Color</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setTheme({ accentColor: color.value })}
              style={{
                padding: "1rem",
                background: color.value,
                border: theme.accentColor === color.value ? "3px solid #fff" : "1px solid #666",
                borderRadius: "8px",
                color: "#000",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {color.name}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <label style={{ color: "#fff" }}>Custom Hex:</label>
          <input
            type="color"
            value={theme.accentColor}
            onChange={(e) => setTheme({ accentColor: e.target.value })}
            style={{ width: "60px", height: "40px", cursor: "pointer", border: "none", borderRadius: "4px" }}
          />
          <input
            type="text"
            value={theme.accentColor}
            onChange={(e) => setTheme({ accentColor: e.target.value })}
            style={{
              padding: "0.5rem",
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid #666",
              borderRadius: "4px",
              fontFamily: "monospace",
            }}
          />
        </div>
      </div>

      {/* Glow Color */}
      <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "rgba(0, 0, 0, 0.5)", borderRadius: "12px", border: "1px solid #333" }}>
        <h2 style={{ fontSize: "1.2rem", color: "#fff", marginBottom: "1rem" }}>✨ Glow Color</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          {GLOW_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setTheme({ glowColor: color.value })}
              style={{
                padding: "1rem",
                background: color.value,
                border: theme.glowColor === color.value ? "3px solid #000" : "1px solid #666",
                borderRadius: "8px",
                color: "#000",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {color.name}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <label style={{ color: "#fff" }}>Custom Hex:</label>
          <input
            type="color"
            value={theme.glowColor}
            onChange={(e) => setTheme({ glowColor: e.target.value })}
            style={{ width: "60px", height: "40px", cursor: "pointer", border: "none", borderRadius: "4px" }}
          />
          <input
            type="text"
            value={theme.glowColor}
            onChange={(e) => setTheme({ glowColor: e.target.value })}
            style={{
              padding: "0.5rem",
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid #666",
              borderRadius: "4px",
              fontFamily: "monospace",
            }}
          />
        </div>
      </div>

      {/* Background Image */}
      <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "rgba(0, 0, 0, 0.5)", borderRadius: "12px", border: "1px solid #333" }}>
        <h2 style={{ fontSize: "1.2rem", color: "#fff", marginBottom: "1rem" }}>🖼️ Background Image</h2>
        <input
          type="text"
          placeholder="Paste image URL here..."
          value={theme.backgroundImage}
          onChange={(e) => setTheme({ backgroundImage: e.target.value })}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid #666",
            borderRadius: "8px",
            fontFamily: "monospace",
            marginBottom: "1rem",
          }}
        />
        {theme.backgroundImage && (
          <img
            src={theme.backgroundImage}
            alt="Preview"
            style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "8px", marginTop: "1rem" }}
          />
        )}
      </div>

      {/* Reset */}
      <div style={{ padding: "1.5rem", background: "rgba(255, 0, 0, 0.1)", borderRadius: "12px", border: "1px solid #ff0000" }}>
        <h2 style={{ fontSize: "1.2rem", color: "#ff4d8d", marginBottom: "1rem" }}>🔄 Reset</h2>
        <button
          onClick={resetTheme}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#ff0000",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Reset to Sentinel Black Defaults
        </button>
      </div>
    </div>
  );
}
