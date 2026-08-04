export default function SystemStatus() {
  return (
    <div className="panel status-panel">
      <h2 className="panel-title">System Status</h2>

      <div className="status-item">
        <span className="status-label">Core Engine</span>
        <span className="status-value ok">Operational</span>
      </div>

      <div className="status-item">
        <span className="status-label">AI Sync</span>
        <span className="status-value ok">Stable</span>
      </div>

      <div className="status-item">
        <span className="status-label">Threat Monitor</span>
        <span className="status-value warn">3 Flags</span>
      </div>
    </div>
  );
}
