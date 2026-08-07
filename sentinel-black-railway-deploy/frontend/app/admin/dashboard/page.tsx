\"use client\";
import { useState, useEffect } from \"react\";
import { useRouter } from \"next/navigation\";
import \"../neon-theme.css\";

export default function NeonDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(\"token\");
    const userData = localStorage.getItem(\"user\");

    if (!token) {
      router.push(\"/admin/login\");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div style={{ padding: \"2rem\", textAlign: \"center\", color: \"#00ffff\" }}>
        ⚙️ Initializing forensic command center…
      </div>
    );
  }

  // Mock data for demo
  const stats = [
    { label: \"Active Processes\", value: \"847\", change: \"+12% today\" },
    { label: \"AI Events Today\", value: \"2,341\", change: \"+18% this week\" },
    { label: \"Threat Flags\", value: \"3\", change: \"0 critical\" },
    { label: \"System Uptime\", value: \"99.98%\", change: \"45 days online\" },
  ];

  const activities = [
    { time: \"14:23:56\", text: \"Anomaly detected in data stream Alpha-7\" },
    { time: \"13:45:12\", text: \"AI Module Sentinel-X completed analysis\" },
    { time: \"13:12:33\", text: \"System backup routine finished successfully\" },
    { time: \"12:56:44\", text: \"New dataset imported: QuantumShift-9\" },
    { time: \"12:23:19\", text: \"Threat assessment updated for sector 7-B\" },
  ];

  const operationalStatus = [
    { label: \"Database Connection\", status: \"online\", uptime: \"100%\" },
    { label: \"AI Inference Engine\", status: \"online\", uptime: \"99.99%\" },
    { label: \"Data Pipeline\", status: \"online\", uptime: \"99.95%\" },
    { label: \"Security Scan Module\", status: \"warning\", uptime: \"98.2%\" },
    { label: \"Backup System\", status: \"online\", uptime: \"100%\" },
  ];

  return (\n    <div style={{ position: \"relative\" }}>\n      {/* Hologram Grid Background */}\n      <div className=\"hologram-grid-bg\" />\n\n      {/* Neon Top Bar */}\n      <div className=\"neon-topbar\" style={{ top: \"0\", zIndex: 1001 }}>\n        <div className=\"neon-logo\">🔴 SENTINEL BLACK</div>\n        <div className=\"neon-topbar-center\">FORENSIC COMMAND CENTER</div>\n        <div className=\"neon-topbar-right\">\n          <span style={{ color: \"#00ffff\", fontSize: \"0.9rem\" }}>{user?.name}</span>\n          <div className=\"neon-status-indicator\" />\n        </div>\n      </div>\n\n      {/* Main Content */}\n      <div className=\"neon-content\" style={{ position: \"relative\", zIndex: 10, padding: \"2rem\", marginTop: \"20px\" }}>\n        {/* Stats Grid */}\n        <div style={{ marginBottom: \"3rem\" }}>\n          <h2 style={{ color: \"#00ffff\", textShadow: \"0 0 10px #00ffff\", fontSize: \"1.2rem\", marginBottom: \"1.5rem\", textTransform: \"uppercase\", letterSpacing: \"1px\" }}>📊 SYSTEM OVERVIEW</h2>\n          <div className=\"neon-stats-grid\">\n            {stats.map((stat, i) => (\n              <div key={i} className=\"neon-stat-card\">\n                <div className=\"neon-stat-label\">{stat.label}</div>\n                <div className=\"neon-stat-value\">{stat.value}</div>\n                <div className=\"neon-stat-change\">{stat.change}</div>\n              </div>\n            ))}\n          </div>\n        </div>\n\n        <div className=\"neon-divider\" />\n\n        {/* Activity + System Status Row */}\n        <div style={{ display: \"grid\", gridTemplateColumns: \"1fr 1fr\", gap: \"2rem\", marginBottom: \"2rem\" }}>\n          {/* Activity Panel */}\n          <div className=\"neon-panel\">\n            <h3 className=\"neon-panel-title\">📡 RECENT ACTIVITY</h3>\n            <div style={{ maxHeight: \"400px\", overflowY: \"auto\", paddingRight: \"1rem\" }}>\n              {activities.map((activity, i) => (\n                <div key={i} className=\"neon-activity-item\">\n                  <div className=\"neon-activity-time\">{activity.time}</div>\n                  <p className=\"neon-activity-text\">{activity.text}</p>\n                </div>\n              ))}\n            </div>\n          </div>\n\n          {/* System Status Panel */}\n          <div className=\"neon-panel\">\n            <h3 className=\"neon-panel-title\">⚡ OPERATIONAL STATUS</h3>\n            <div style={{ paddingRight: \"1rem\" }}>\n              {operationalStatus.map((item, i) => (\n                <div key={i} className=\"neon-indicator\">\n                  <div className={`neon-indicator-light ${item.status}`} />\n                  <div className=\"neon-indicator-label\">{item.label}</div>\n                  <div className=\"neon-indicator-status\">{item.uptime}</div>\n                </div>\n              ))}\n            </div>\n          </div>\n        </div>\n\n        <div className=\"neon-divider\" />\n\n        {/* AI Hero Module */}\n        <div style={{ textAlign: \"center\", marginTop: \"3rem\", marginBottom: \"2rem\" }}>\n          <h3 style={{ color: \"#00ffff\", textShadow: \"0 0 10px #00ffff\", fontSize: \"1.1rem\", marginBottom: \"1.5rem\", textTransform: \"uppercase\", letterSpacing: \"1px\" }}>🤖 SYSTEM IDENTITY</h3>\n          <div className=\"ai-hero-module\">\n            <div className=\"ai-hero-face\">🔴</div>\n          </div>\n          <p style={{ color: \"#00ffff\", marginTop: \"1rem\", fontSize: \"0.9rem\", textShadow: \"0 0 5px #00ffff\" }}>SENTINEL BLACK AI MODULE</p>\n          <p style={{ color: \"#aaa\", marginTop: \"0.5rem\", fontSize: \"0.85rem\" }}>Advanced Forensic Analysis System</p>\n        </div>\n      </div>\n    </div>\n  );\n}\n
