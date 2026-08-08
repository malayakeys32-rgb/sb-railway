"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/theme-context";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, updateTheme, resetTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [customBgUrl, setCustomBgUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    if (userData) setUser(JSON.parse(userData));
  }, [router]);

  const handleThemeChange = (mode: "dark" | "light") => {
    updateTheme({ mode });
  };

  const handleAccentColorChange = (color: string) => {
    updateTheme({ accentColor: color });
  };

  const handlePrimaryColorChange = (color: string) => {
    updateTheme({ primaryColor: color });
  };

  const handleCustomBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomBgUrl(url);
    if (url) {
      updateTheme({ backgroundImage: url });
    }
  };

  const handleRemoveBackground = () => {
    setCustomBgUrl("");
    updateTheme({ backgroundImage: undefined });
  };

  const presetAccents = [
    { name: "Red", color: "#ff0000" },
    { name: "Blue", color: "#0099ff" },
    { name: "Green", color: "#00ff00" },
    { name: "Purple", color: "#b84d97" },
    { name: "Orange", color: "#ff6600" },
    { name: "Pink", color: "#ff4d8d" },
  ];

  const presetPrimary = [
    { name: "White", color: "#ffffff" },
    { name: "Cyan", color: "#00ffff" },
    { name: "Yellow", color: "#ffff00" },
    { name: "Lime", color: "#00ff00" },
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: "800px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem", color: theme.primaryColor, textShadow: `0 0 10px ${theme.primaryColor}` }}>⚙️ Settings</h1>

      {/* Theme Mode */}
      <div style={{ background: theme.mode === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.9)", border: `2px solid ${theme.accentColor}`, borderRadius: "16px", padding: "2rem", marginBottom: "2rem", boxShadow: `0 0 20px ${theme.accentColor}40` }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem", color: theme.accentColor }}>🌓 Theme Mode</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => handleThemeChange("dark")} style={{ flex: 1, padding: "0.75rem", background: theme.mode === "dark" ? theme.accentColor : "transparent", color: theme.mode === "dark" ? "#000" : theme.primaryColor, border: `2px solid ${theme.primaryColor}`, borderRadius: "8px", cursor: "pointer", fontWeight: 700, transition: "all 0.3s" }}>
            🌙 Dark Mode
          </button>
          <button onClick={() => handleThemeChange("light")} style={{ flex: 1, padding: "0.75rem", background: theme.mode === "light" ? theme.primaryColor : "transparent", color: theme.mode === "light" ? "#000" : theme.primaryColor, border: `2px solid ${theme.primaryColor}`, borderRadius: "8px", cursor: "pointer", fontWeight: 700, transition: "all 0.3s" }}>
            ☀️ Light Mode
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div style={{ background: theme.mode === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.9)", border: `2px solid ${theme.primaryColor}`, borderRadius: "16px", padding: "2rem", marginBottom: "2rem", boxShadow: `0 0 20px ${theme.primaryColor}40` }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem", color: theme.primaryColor }}>🎨 Accent Color</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
          {presetAccents.map((preset) => (
            <button key={preset.color} onClick={() => handleAccentColorChange(preset.color)} style={{ padding: "1rem", background: preset.color, border: theme.accentColor === preset.color ? `3px solid ${theme.primaryColor}` : "2px solid transparent", borderRadius: "12px", cursor: "pointer", fontWeight: 700, color: "#fff", boxShadow: `0 0 15px ${preset.color}80`, transition: "all 0.3s" }}>
              {preset.name}
            </button>
          ))}
        </div>
        <input type="color" value={theme.accentColor} onChange={(e) => handleAccentColorChange(e.target.value)} style={{ width: "100%", height: "50px", border: "none", borderRadius: "8px", cursor: "pointer" }} />
      </div>

      {/* Primary Color */}
      <div style={{ background: theme.mode === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.9)", border: `2px solid ${theme.accentColor}`, borderRadius: "16px", padding: "2rem", marginBottom: "2rem", boxShadow: `0 0 20px ${theme.accentColor}40` }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem", color: theme.accentColor }}>✨ Primary Glow Color</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
          {presetPrimary.map((preset) => (
            <button key={preset.color} onClick={() => handlePrimaryColorChange(preset.color)} style={{ padding: "1rem", background: "transparent", border: theme.primaryColor === preset.color ? `3px solid ${preset.color}` : `2px solid ${preset.color}`, borderRadius: "12px", cursor: "pointer", fontWeight: 700, color: preset.color, textShadow: `0 0 10px ${preset.color}`, boxShadow: theme.primaryColor === preset.color ? `0 0 20px ${preset.color}` : `0 0 10px ${preset.color}40`, transition: "all 0.3s" }}>
              {preset.name}
            </button>
          ))}
        </div>
        <input type="color" value={theme.primaryColor} onChange={(e) => handlePrimaryColorChange(e.target.value)} style={{ width: "100%", height: "50px", border: "none", borderRadius: "8px", cursor: "pointer" }} />
      </div>

      {/* Custom Background */}
      <div style={{ background: theme.mode === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.9)", border: `2px solid ${theme.primaryColor}`, borderRadius: "16px", padding: "2rem", marginBottom: "2rem", boxShadow: `0 0 20px ${theme.primaryColor}40` }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem", color: theme.primaryColor }}>🖼️ Custom Background</h2>
        <p style={{ fontSize: "0.9rem", color: theme.mode === "dark" ? "#aaa" : "#666", marginBottom: "1rem" }}>Paste an image URL to use as background</p>
        <input type="text" value={customBgUrl} onChange={handleCustomBackground} placeholder="https://example.com/image.jpg" style={{ width: "100%", padding: "0.75rem", background: theme.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)", border: `1px solid ${theme.accentColor}`, borderRadius: "8px", color: theme.primaryColor, marginBottom: "1rem", fontSize: "0.9rem" }} />
        {customBgUrl && (
          <button onClick={handleRemoveBackground} style={{ width: "100%", padding: "0.75rem", background: theme.accentColor, color: theme.mode === "dark" ? "#000" : "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, transition: "all 0.3s" }}>
            ❌ Remove Background
          </button>
        )}
      </div>

      {/* Reset */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <button onClick={resetTheme} style={{ flex: 1, padding: "0.75rem", background: "transparent", border: `2px solid ${theme.primaryColor}`, color: theme.primaryColor, borderRadius: "8px", cursor: "pointer", fontWeight: 700, transition: "all 0.3s", textShadow: `0 0 5px ${theme.primaryColor}` }}>
          🔄 Reset to Default
        </button>
        <button onClick={() => router.back()} style={{ flex: 1, padding: "0.75rem", background: theme.accentColor, color: theme.mode === "dark" ? "#000" : "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700, transition: "all 0.3s" }}>
          ← Back
        </button>
      </div>
    </div>
  );
}

