import type { ReactNode } from "react";
import "./admin-layout.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🔴 Sentinel</h2>
          <p>Mission Control</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>Operations</h3>
            <a href="/admin/dashboard" className="nav-item">
              <span>🏠</span> Home
            </a>
            <a href="/admin/dashboard" className="nav-item active">
              <span>🎯</span> Today's Mission
            </a>
            <a href="/admin/events" className="nav-item">
              <span>📅</span> My Events
            </a>
            <a href="/admin/tasks" className="nav-item">
              <span>✅</span> Tasks
            </a>
            <a href="/admin/mission-log" className="nav-item">
              <span>📔</span> Mission Log
            </a>
          </div>

          <div className="nav-section">
            <h3>Collaboration</h3>
            <a href="/admin/team" className="nav-item">
              <span>👥</span> Team
            </a>
            <a href="/admin/documents" className="nav-item">
              <span>📂</span> Documents
            </a>
            <a href="/admin/forms" className="nav-item">
              <span>📋</span> Forms
            </a>
          </div>

          <div className="nav-section">
            <h3>Analytics</h3>
            <a href="/admin/reports" className="nav-item">
              <span>📊</span> Reports
            </a>
            <a href="/admin/ai-assistant" className="nav-item">
              <span>🤖</span> AI Assistant
            </a>
          </div>

          <div className="nav-section">
            <h3>Legacy</h3>
            <a href="/dashboard" className="nav-item">
              <span>🔍</span> Incident Tracker
            </a>
            <a href="/evidence" className="nav-item">
              <span>📸</span> Evidence
            </a>
            <a href="/patterns" className="nav-item">
              <span>🔗</span> Patterns
            </a>
          </div>
        </nav>

        <div className="sidebar-footer">
          <a href="#" className="settings-link">⚙️ Settings</a>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

