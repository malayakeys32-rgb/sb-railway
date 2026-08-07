\"use client\";
import { useEffect, useState } from \"react\";
import { useRouter } from \"next/navigation\";
import axios from \"axios\";
import \"./dashboard.css\";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || \"http://localhost:3001\";

interface MissionData {
  id: string;
  title: string;
  description?: string;
  progressPercent: number;
  tasks: Array<{
    id: string;
    title: string;
    priority: \"CRITICAL\" | \"HIGH\" | \"MEDIUM\" | \"LOW\";
    status: \"PENDING\" | \"IN_PROGRESS\" | \"COMPLETED\" | \"BLOCKED\";
  }>;
  timeline: Array<{ id: string; time: string; event: string }>;
  logs: Array<{ id: string; time: string; note: string; user: { name: string; email: string } }>;
  teamMembers: Array<{ id: string; user: { name: string; email: string }; task: string; status: \"PENDING\" | \"IN_PROGRESS\" | \"COMPLETED\" }>;
  readinessScores: { planning: number; staffing: number; logistics: number; safety: number; budget: number };
}

export default function MissionDashboard() {
  const [mission, setMission] = useState<MissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<\"mission\" | \"team\" | \"docs\">(\"mission\");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(\"token\");
    const user = localStorage.getItem(\"user\");

    if (!token || !user) {
      router.push(\"/admin/login\");
      return;
    }

    setCurrentUser(JSON.parse(user));
    fetchMission(token);
  }, [router]);

  async function fetchMission(token: string) {
    try {
      const res = await axios.get(`${API_BASE}/missions/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMission(res.data);
    } catch (err) {
      console.error(\"Failed to fetch mission:\", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    localStorage.removeItem(\"token\");
    localStorage.removeItem(\"user\");
    router.push(\"/admin/login\");
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case \"COMPLETED\": return \"✅\";
      case \"IN_PROGRESS\": return \"🔄\";
      case \"PENDING\": return \"⏳\";
      default: return \"•\";
    }
  };

  const calculateOverallReadiness = (scores: any) => {
    if (!scores) return 0;
    const values = Object.values(scores) as number[];
    return Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length);
  };

  if (loading) {
    return (
      <div style={{ padding: \"2rem\", textAlign: \"center\", color: \"var(--text-dim)\" }}>
        Initializing mission control…
      </div>
    );
  }

  if (!mission) {
    return (
      <div style={{ padding: \"2rem\" }}>
        <h1 style={{ fontSize: \"2rem\", fontWeight: 700, marginBottom: \"1rem\" }}>🎯 Today's Mission</h1>
        <div className=\"card\" style={{ border: \"1px solid var(--border)\", padding: \"2rem\", textAlign: \"center\" }}>
          <h2 style={{ fontSize: \"1.5rem\", fontWeight: 700, marginBottom: \"1rem\" }}>No Active Mission</h2>
          <p style={{ color: \"var(--text-dim)\", marginBottom: \"2rem\" }}>Create a mission to get started</p>
          <button className=\"btn btn-red\" style={{ padding: \"0.75rem 1.5rem\" }}>
            ➕ Create Mission
          </button>
        </div>
      </div>
    );
  }

  const criticalTasks = mission.tasks.filter(t => t.priority === \"CRITICAL\");
  const highTasks = mission.tasks.filter(t => t.priority === \"HIGH\");
  const completedTasks = mission.tasks.filter(t => t.status === \"COMPLETED\");
  const overall = calculateOverallReadiness(mission.readinessScores);

  return (
    <div style={{ padding: \"2rem\" }}>
      <div style={{ display: \"flex\", justifyContent: \"space-between\", alignItems: \"center\", marginBottom: \"2rem\" }}>
        <div>
          <h1 style={{ fontSize: \"2rem\", fontWeight: 700, margin: 0 }}>🎯 Today's Mission</h1>
          <p style={{ color: \"var(--text-dim)\", margin: \"0.5rem 0 0 0\", fontSize: \"0.9rem\" }}>Good morning, {currentUser?.name}</p>
        </div>
        <button className=\"btn btn-red\" onClick={handleLogout} style={{ padding: \"0.5rem 1rem\" }}>
          Logout
        </button>
      </div>

      <div className=\"card\" style={{ border: \"1px solid var(--border)\", padding: \"2rem\", marginBottom: \"2rem\", background: \"linear-gradient(135deg, rgba(200,0,26,0.05) 0%, rgba(200,0,26,0) 100%)\" }}>
        <h2 style={{ fontSize: \"1.5rem\", fontWeight: 700, margin: \"0 0 1rem 0\" }}>{mission.title}</h2>
        {mission.description && <p style={{ margin: \"0 0 1.5rem 0\", color: \"var(--text-dim)\", fontSize: \"0.9rem\" }}>{mission.description}</p>}
        <div>
          <div style={{ display: \"flex\", justifyContent: \"space-between\", marginBottom: \"0.5rem\" }}>
            <span style={{ color: \"var(--text-dim)\", fontSize: \"0.85rem\" }}>Progress</span>
            <span style={{ fontWeight: 700, fontSize: \"1.1rem\", color: \"var(--red)\" }}>{mission.progressPercent}%</span>
          </div>
          <div style={{ width: \"100%\", height: \"24px\", background: \"var(--surface2)\", borderRadius: \"var(--radius)\", overflow: \"hidden\" }}>
            <div style={{ width: `${mission.progressPercent}%`, height: \"100%\", background: `linear-gradient(90deg, var(--red), #ff6b6b)`, transition: \"width 0.3s ease\" }} />
          </div>
        </div>
      </div>

      <div style={{ display: \"flex\", gap: \"1rem\", marginBottom: \"2rem\", borderBottom: \"1px solid var(--border)\", paddingBottom: \"1rem\" }}>
        {([\"mission\", \"team\", \"docs\"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: \"none\", border: \"none\", padding: \"0.75rem 1.5rem\", color: activeTab === tab ? \"var(--red)\" : \"var(--text-dim)\", fontWeight: activeTab === tab ? 700 : 400, fontSize: \"0.95rem\", cursor: \"pointer\", borderBottom: activeTab === tab ? \"2px solid var(--red)\" : \"none\", transition: \"all 0.15s\" }}>
            {tab === \"mission\" && \"🎯 Mission\"}
            {tab === \"team\" && \"👥 Team\"}
            {tab === \"docs\" && \"📂 Documents\"}
          </button>
        ))}
      </div>

      {activeTab === \"mission\" && (
        <div style={{ display: \"grid\", gridTemplateColumns: \"1fr 1fr\", gap: \"2rem\" }}>
          <div style={{ display: \"flex\", flexDirection: \"column\", gap: \"2rem\" }}>
            <div className=\"card\" style={{ border: \"1px solid var(--border)\", padding: \"1.5rem\" }}>
              <h3 style={{ fontSize: \"1.1rem\", fontWeight: 700, margin: \"0 0 1.5rem 0\" }}>Priority Objectives</h3>
              <div style={{ marginBottom: \"1.5rem\" }}>
                <p style={{ color: \"var(--text-dim)\", fontSize: \"0.75rem\", fontWeight: 700, margin: \"0 0 0.75rem 0\", textTransform: \"uppercase\" }}>🔴 Critical</p>
                {criticalTasks.length === 0 ? <p style={{ fontSize: \"0.85rem\", color: \"var(--text-dim)\" }}>No critical tasks</p> : criticalTasks.map((task) => (<div key={task.id} style={{ padding: \"0.75rem\", background: \"rgba(200,0,26,0.05)\", borderRadius: \"var(--radius)\", marginBottom: \"0.5rem\", borderLeft: \"3px solid var(--red)\", paddingLeft: \"1rem\" }}><p style={{ margin: 0, fontSize: \"0.9rem\" }}>{task.title}</p></div>))}\n              </div>\n              <div style={{ marginBottom: \"1.5rem\" }}>\n                <p style={{ color: \"var(--text-dim)\", fontSize: \"0.75rem\", fontWeight: 700, margin: \"0 0 0.75rem 0\", textTransform: \"uppercase\" }}>🟡 Important</p>\n                {highTasks.length === 0 ? <p style={{ fontSize: \"0.85rem\", color: \"var(--text-dim)\" }}>No important tasks</p> : highTasks.map((task) => (<div key={task.id} style={{ padding: \"0.75rem\", background: \"rgba(255,190,0,0.05)\", borderRadius: \"var(--radius)\", marginBottom: \"0.5rem\", borderLeft: \"3px solid var(--yellow)\", paddingLeft: \"1rem\" }}><p style={{ margin: 0, fontSize: \"0.9rem\" }}>{task.title}</p></div>))}\n              </div>\n              <div>\n                <p style={{ color: \"var(--text-dim)\", fontSize: \"0.75rem\", fontWeight: 700, margin: \"0 0 0.75rem 0\", textTransform: \"uppercase\" }}>🟢 Completed</p>\n                {completedTasks.length === 0 ? <p style={{ fontSize: \"0.85rem\", color: \"var(--text-dim)\" }}>No completed tasks yet</p> : completedTasks.map((task) => (<div key={task.id} style={{ padding: \"0.75rem\", background: \"rgba(76,200,100,0.05)\", borderRadius: \"var(--radius)\", marginBottom: \"0.5rem\", borderLeft: \"3px solid var(--green)\", paddingLeft: \"1rem\", opacity: 0.7 }}><p style={{ margin: 0, fontSize: \"0.9rem\", textDecoration: \"line-through\" }}>{task.title}</p></div>))}\n              </div>\n            </div>\n\n            <div className=\"card\" style={{ border: \"1px solid var(--border)\", padding: \"1.5rem\" }}>\n              <h3 style={{ fontSize: \"1.1rem\", fontWeight: 700, margin: \"0 0 1.5rem 0\" }}>📔 Mission Log</h3>\n              <div style={{ display: \"flex\", flexDirection: \"column\", gap: \"1rem\", maxHeight: \"300px\", overflowY: \"auto\" }}>\n                {mission.logs.length === 0 ? <p style={{ fontSize: \"0.85rem\", color: \"var(--text-dim)\" }}>No log entries yet</p> : mission.logs.map((log) => (<div key={log.id} style={{ borderLeft: \"3px solid var(--red)\", paddingLeft: \"1rem\", paddingTop: \"0.5rem\", paddingBottom: \"0.5rem\" }}><p style={{ margin: 0, color: \"var(--text-dim)\", fontSize: \"0.8rem\", fontWeight: 700 }}>{log.time}</p><p style={{ margin: \"0.25rem 0 0 0\", fontSize: \"0.85rem\" }}>{log.note}</p><p style={{ margin: \"0.25rem 0 0 0\", fontSize: \"0.7rem\", color: \"var(--text-dim)\" }}>— {log.user.name}</p></div>))}\n              </div>\n            </div>\n          </div>\n\n          <div style={{ display: \"flex\", flexDirection: \"column\", gap: \"2rem\" }}>\n            <div className=\"card\" style={{ border: \"1px solid var(--border)\", padding: \"1.5rem\" }}>\n              <h3 style={{ fontSize: \"1.1rem\", fontWeight: 700, margin: \"0 0 1.5rem 0\" }}>📅 Today's Timeline</h3>\n              {mission.timeline.length === 0 ? <p style={{ fontSize: \"0.85rem\", color: \"var(--text-dim)\" }}>No scheduled events</p> : mission.timeline.map((item, i) => (<div key={item.id} style={{ display: \"flex\", marginBottom: i !== mission.timeline.length - 1 ? \"1.5rem\" : 0 }}><div style={{ minWidth: \"80px\", color: \"var(--red)\", fontWeight: 700, fontSize: \"0.9rem\" }}>{item.time}</div><div style={{ flex: 1, paddingLeft: \"1rem\", borderLeft: \"2px solid var(--border)\" }}><p style={{ margin: 0, fontSize: \"0.9rem\" }}>{item.event}</p></div></div>))}\n            </div>\n\n            <div className=\"card\" style={{ border: \"1px solid var(--border)\", padding: \"1.5rem\" }}>\n              <h3 style={{ fontSize: \"1.1rem\", fontWeight: 700, margin: \"0 0 1.5rem 0\" }}>📊 Daily Readiness</h3>\n              {mission.readinessScores && Object.entries(mission.readinessScores).map(([key, value]) => (<div key={key} style={{ marginBottom: \"1.25rem\" }}><div style={{ display: \"flex\", justifyContent: \"space-between\", marginBottom: \"0.5rem\" }}><span style={{ fontSize: \"0.85rem\", fontWeight: 600, textTransform: \"capitalize\" }}>{key}</span><span style={{ fontWeight: 700, color: \"var(--red)\" }}>{value}%</span></div><div style={{ width: \"100%\", height: \"8px\", background: \"var(--surface2)\", borderRadius: \"4px\", overflow: \"hidden\" }}><div style={{ width: `${value}%`, height: \"100%\", background: `linear-gradient(90deg, var(--red), #ff6b6b)` }} /></div></div>))}\n              <div style={{ marginTop: \"1.5rem\", paddingTop: \"1.5rem\", borderTop: \"1px solid var(--border)\", textAlign: \"center\" }}>\n                <p style={{ margin: 0, fontSize: \"0.75rem\", color: \"var(--text-dim)\", fontWeight: 700, marginBottom: \"0.5rem\" }}>OVERALL READINESS</p>\n                <p style={{ margin: 0, fontSize: \"2rem\", fontWeight: 700, color: \"var(--red)\" }}>{overall}%</p>\n              </div>\n            </div>\n          </div>\n        </div>\n      )}\n\n      {activeTab === \"team\" && (\n        <div className=\"card\" style={{ border: \"1px solid var(--border)\", padding: \"1.5rem\" }}>\n          <h3 style={{ fontSize: \"1.1rem\", fontWeight: 700, margin: \"0 0 1.5rem 0\" }}>👥 Team Mission Board</h3>\n          {mission.teamMembers.length === 0 ? <p style={{ fontSize: \"0.9rem\", color: \"var(--text-dim)\" }}>No team members assigned</p> : <div style={{ display: \"grid\", gridTemplateColumns: \"repeat(auto-fit, minmax(250px, 1fr))\", gap: \"1.5rem\" }}>{mission.teamMembers.map((member) => (<div key={member.id} style={{ padding: \"1rem\", background: \"var(--surface2)\", borderRadius: \"var(--radius)\", borderLeft: \"3px solid var(--red)\" }}><p style={{ margin: 0, fontSize: \"1rem\", fontWeight: 700 }}>{member.user.name}</p><p style={{ margin: \"0.5rem 0 0 0\", fontSize: \"0.85rem\", color: \"var(--text-dim)\" }}>{member.task}</p><p style={{ margin: \"0.75rem 0 0 0\", fontSize: \"1.1rem\" }}>{getStatusEmoji(member.status)}</p></div>))}</div>}\n        </div>\n      )}\n\n      {activeTab === \"docs\" && (\n        <div className=\"card\" style={{ border: \"1px solid var(--border)\", padding: \"1.5rem\" }}>\n          <h3 style={{ fontSize: \"1.1rem\", fontWeight: 700, margin: \"0 0 1.5rem 0\" }}>📂 Mission Documents</h3>\n          <div style={{ display: \"grid\", gridTemplateColumns: \"repeat(auto-fit, minmax(180px, 1fr))\", gap: \"1rem\" }}>\n            <button style={{ padding: \"1.25rem\", background: \"var(--surface2)\", border: \"1px solid var(--border)\", borderRadius: \"var(--radius)\", cursor: \"pointer\", fontSize: \"0.9rem\", fontWeight: 600 }}>📄 Event Plan</button>\n            <button style={{ padding: \"1.25rem\", background: \"var(--surface2)\", border: \"1px solid var(--border)\", borderRadius: \"var(--radius)\", cursor: \"pointer\", fontSize: \"0.9rem\", fontWeight: 600 }}>📄 Site Map</button>\n            <button style={{ padding: \"1.25rem\", background: \"var(--surface2)\", border: \"1px solid var(--border)\", borderRadius: \"var(--radius)\", cursor: \"pointer\", fontSize: \"0.9rem\", fontWeight: 600 }}>📄 Contracts</button>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n}

