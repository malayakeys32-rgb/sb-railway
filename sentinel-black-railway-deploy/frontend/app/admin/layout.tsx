"use client";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeProvider } from "@/app/theme-context";
import "./admin-layout.css";
import "./glass-effects.css";

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !pathname.includes("/admin/login")) {
      router.push("/admin/login");
    }
  }, [router, pathname]);

  useEffect(() => {
    setIsActive(pathname);
  }, [pathname]);

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 style={{
            color: "#ff0000",
            textShadow: "0 0 15px #ff0000, 0 0 30px #ffffff",
            margin: 0,
          }}>
            🔴 Sentinel Black
          </h2>
          <p>Command Center</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Operations</h3>
            <a href="/admin/home" className={`nav-item ${isActive === '/admin/home' ? 'active' : ''}`}>
              <span>🏠</span> Home
            </a>
            <a href="/admin/dashboard" className={`nav-item ${isActive === '/admin/dashboard' ? 'active' : ''}`}>
              <span>🎯</span> Dashboard
            </a>
            <a href="/admin/events" className={`nav-item ${isActive === '/admin/events' ? 'active' : ''}`}>
              <span>📅</span> Events
            </a>
            <a href="/admin/tasks" className={`nav-item ${isActive === '/admin/tasks' ? 'active' : ''}`}>
              <span>✅</span> Tasks
            </a>
          </div>

          <div className="nav-section">
            <h3>Collaboration</h3>
            <a href="/admin/team" className={`nav-item ${isActive === '/admin/team' ? 'active' : ''}`}>
              <span>👥</span> Team
            </a>
            <a href="/admin/documents" className={`nav-item ${isActive === '/admin/documents' ? 'active' : ''}`}>
              <span>📂</span> Documents
            </a>
          </div>

          <div className="nav-section">
            <h3>Analytics</h3>
            <a href="/admin/reports" className={`nav-item ${isActive === '/admin/reports' ? 'active' : ''}`}>
              <span>📊</span> Reports
            </a>
          </div>
        </nav>

        <div className="sidebar-footer">
          <a href="/admin/settings" className={`settings-link ${isActive === '/admin/settings' ? 'active' : ''}`}>⚙️ Settings</a>
          <a href="/admin/login" className="settings-link" style={{ marginTop: "0.5rem" }}>🚪 Logout</a>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ThemeProvider>
  );
}

