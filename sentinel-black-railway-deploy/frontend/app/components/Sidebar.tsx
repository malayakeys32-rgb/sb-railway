"use client";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../api/client";

const NAV = [
  { label: "Command Center", href: "/dashboard", icon: "◈" },
  { label: "Evidence Vault", href: "/evidence", icon: "🔒" },
  { label: "Incidents", href: "/incidents", icon: "⚡" },
  { label: "Patterns", href: "/patterns", icon: "◎" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem", padding: "0 0.25rem", cursor: "pointer" }} onClick={() => router.push("/dashboard")}>
        <Image src="/logo-black.png" alt="Sentinel Black" width={36} height={36} style={{ objectFit: "contain" }} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.04em", color: "var(--text)" }}>SENTINEL</div>
          <div style={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.06em", color: "var(--red-bright)" }}>BLACK</div>
        </div>
      </div>

      {/* Status indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", marginBottom: "1.5rem", background: "var(--surface2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
        <div className="status-dot" />
        <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>System Active</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV.map((n) => (
          <button
            key={n.href}
            className={`nav-item ${pathname === n.href ? "active" : ""}`}
            onClick={() => router.push(n.href)}
          >
            <span style={{ fontSize: "0.9rem" }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
        {user && (
          <div style={{ padding: "0.5rem 0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>
              {user.maskedMode ? "● MASKED" : user.name}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "0.1rem" }}>{user.role}</div>
          </div>
        )}
        <button
          className="nav-item"
          onClick={() => { logout(); router.push("/login"); }}
          style={{ color: "var(--red)", width: "100%" }}
        >
          <span>⎋</span> Secure Exit
        </button>
      </div>
    </aside>
  );
}
