"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface MissionData {
  greeting: string;
  missionTitle: string;
  progressPercent: number;
  criticalTasks: string[];
  importantTasks: string[];
  completedTasks: string[];
  timeline: Array<{ time: string; event: string }>;
  missionIntelligence: string;
  missionLog: Array<{ time: string; note: string }>;
  teamStatus: Array<{ name: string; task: string; status: "completed" | "in_progress" | "pending" }>;
  readinessScore: { planning: number; staffing: number; logistics: number; safety: number; budget: number };
  documents: string[];
  motivationCard: string;
}

export default function MissionDashboard() {
  const [missionData, setMissionData] = useState<MissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"mission" | "team" | "docs">("mission");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/admin/login");
      return;
    }

    setCurrentUser(JSON.parse(user));
    fetchMissionData(token);
  }, [router]);

  async function fetchMissionData(token: string) {
    try {
      // For now, return mock data. In production, this would come from the backend.
      const mockData: MissionData = {
        greeting: "Good Morning, Sarah",
        missionTitle: "Prepare for the Downtown Business Expo",
        progressPercent: 72,
        criticalTasks: [
          "Confirm venue booking",
          "Submit insurance documents",
          "Approve final event budget",
        ],
        importantTasks: [
          "Send attendee reminders",
          "Confirm catering numbers",
          "Review volunteer assignments",
        ],
        completedTasks: [
          "Vendor contracts signed",
          "Marketing materials approved",
        ],
        timeline: [
          { time: "9:00 AM", event: "Vendor coordination call" },
          { time: "11:00 AM", event: "Venue walkthrough" },
          { time: "2:00 PM", event: "Staff briefing" },
          { time: "4:00 PM", event: "Budget review" },
        ],
        missionIntelligence:
          "You have 3 high-priority tasks remaining. Based on current progress, the event is on schedule. The venue walkthrough at 11:00 AM is your most important task today.",
        missionLog: [
          { time: "08:15 AM", note: "Received updated guest count from organizer." },
          { time: "10:32 AM", note: "Catering confirmed delivery schedule." },
          { time: "1:45 PM", note: "Security staffing increased from 6 to 8 personnel." },
        ],
        teamStatus: [
          { name: "John", task: "Venue Setup", status: "completed" },
          { name: "Sarah", task: "Catering Review", status: "in_progress" },
          { name: "Mike", task: "Security Check", status: "pending" },
        ],
        readinessScore: {
          planning: 100,
          staffing: 90,
          logistics: 70,
          safety: 85,
          budget: 95,
        },
        documents: [
          "Event Plan",
          "Site Map",
          "Contracts",
          "Contact List",
          "Emergency Procedures",
        ],
        motivationCard:
          "Mission Focus: Complete all venue preparations before end of day to ensure a smooth event launch tomorrow.",
      };

      setMissionData(mockData);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin/login");
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "var(--green)";
      case "in_progress":
        return "var(--yellow)";
      case "pending":
        return "var(--text-dim)";
      default:
        return "var(--text)";
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "completed":
        return "✅";
      case "in_progress":
        return "🔄";
      case "pending":
        return "⏳";
      default:
        return "•";
    }
  };

  const calculateOverallReadiness = (scores: any) => {
    const values = Object.values(scores) as number[];
    return Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ color: "var(--text-dim)" }}>Initializing mission control…</div>
      </div>
    );
  }

  if (!missionData) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ color: "var(--red)" }}>Failed to load mission data</div>
      </div>
    );
  }

  const overall = calculateOverallReadiness(missionData.readinessScore);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Header */}
      <div style={{ background: "var(--surface1)", borderBottom: "1px solid var(--border)", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>🎯 Today's Mission</h1>
            <p style={{ color: "var(--text-dim)", margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>{missionData.greeting}</p>
          </div>
          <button className="btn btn-red" onClick={handleLogout} style={{ padding: "0.5rem 1rem" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
        {/* Mission Title & Progress */}
        <div className="card" style={{ border: "1px solid var(--border)", padding: "2rem", marginBottom: "2rem", background: "linear-gradient(135deg, rgba(200,0,26,0.05) 0%, rgba(200,0,26,0) 100%)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 1rem 0" }}>{missionData.missionTitle}</h2>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>Progress</span>
              <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--red)" }}>{missionData.progressPercent}%</span>
            </div>
            <div style={{ width: "100%", height: "24px", background: "var(--surface2)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${missionData.progressPercent}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, var(--red), #ff6b6b)`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
          {(["mission", "team", "docs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                padding: "0.75rem 1.5rem",
                color: activeTab === tab ? "var(--red)" : "var(--text-dim)",
                fontWeight: activeTab === tab ? 700 : 400,
                fontSize: "0.95rem",
                cursor: "pointer",
                borderBottom: activeTab === tab ? "2px solid var(--red)" : "none",
                transition: "all 0.15s",
              }}
            >
              {tab === "mission" && "🎯 Mission"}
              {tab === "team" && "👥 Team"}
              {tab === "docs" && "📂 Documents"}
            </button>
          ))}
        </div>

        {/* Mission Tab */}
        {activeTab === "mission" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Priority Objectives */}
              <div className="card" style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1.5rem 0" }}>Priority Objectives</h3>

                {/* Critical */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontWeight: 700, margin: "0 0 0.75rem 0", textTransform: "uppercase" }}>🔴 Critical</p>
                  {missionData.criticalTasks.map((task, i) => (
                    <div key={i} style={{ padding: "0.75rem", background: "rgba(200,0,26,0.05)", borderRadius: "var(--radius)", marginBottom: "0.5rem", borderLeft: "3px solid var(--red)", paddingLeft: "1rem" }}>
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>{task}</p>
                    </div>
                  ))}
                </div>

                {/* Important */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontWeight: 700, margin: "0 0 0.75rem 0", textTransform: "uppercase" }}>🟡 Important</p>
                  {missionData.importantTasks.map((task, i) => (
                    <div key={i} style={{ padding: "0.75rem", background: "rgba(255,190,0,0.05)", borderRadius: "var(--radius)", marginBottom: "0.5rem", borderLeft: "3px solid var(--yellow)", paddingLeft: "1rem" }}>
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>{task}</p>
                    </div>
                  ))}
                </div>

                {/* Completed */}
                <div>
                  <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", fontWeight: 700, margin: "0 0 0.75rem 0", textTransform: "uppercase" }}>🟢 Completed</p>
                  {missionData.completedTasks.map((task, i) => (
                    <div key={i} style={{ padding: "0.75rem", background: "rgba(76,200,100,0.05)", borderRadius: "var(--radius)", marginBottom: "0.5rem", borderLeft: "3px solid var(--green)", paddingLeft: "1rem", opacity: 0.7 }}>
                      <p style={{ margin: 0, fontSize: "0.9rem", textDecoration: "line-through" }}>{task}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission Log */}
              <div className="card" style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1.5rem 0" }}>📔 Mission Log</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {missionData.missionLog.map((log, i) => (
                    <div key={i} style={{ borderLeft: "3px solid var(--red)", paddingLeft: "1rem", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
                      <p style={{ margin: 0, color: "var(--text-dim)", fontSize: "0.8rem", fontWeight: 700 }}>{log.time}</p>
                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>{log.note}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                  <button style={{ flex: 1, padding: "0.5rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>➕ Add Update</button>
                  <button style={{ flex: 1, padding: "0.5rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>🎤 Voice</button>
                  <button style={{ flex: 1, padding: "0.5rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>📷 Photo</button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Timeline */}
              <div className="card" style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1.5rem 0" }}>📅 Today's Timeline</h3>
                {missionData.timeline.map((item, i) => (
                  <div key={i} style={{ display: "flex", marginBottom: i !== missionData.timeline.length - 1 ? "1.5rem" : 0 }}>
                    <div style={{ minWidth: "80px", color: "var(--red)", fontWeight: 700, fontSize: "0.9rem" }}>{item.time}</div>
                    <div style={{ flex: 1, paddingLeft: "1rem", borderLeft: "2px solid var(--border)", paddingBottom: "0" }}>
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mission Intelligence */}
              <div className="card" style={{ border: "1px solid var(--border)", padding: "1.5rem", background: "linear-gradient(135deg, rgba(100,150,200,0.05) 0%, rgba(100,150,200,0) 100%)" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0" }}>🤖 Mission Intelligence</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text)" }}>{missionData.missionIntelligence}</p>
              </div>

              {/* Daily Readiness */}
              <div className="card" style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1.5rem 0" }}>📊 Daily Readiness</h3>
                {Object.entries(missionData.readinessScore).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "capitalize" }}>{key}</span>
                      <span style={{ fontWeight: 700, color: "var(--red)" }}>{value}%</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "var(--surface2)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${value}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, var(--red), #ff6b6b)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 700, marginBottom: "0.5rem" }}>OVERALL READINESS</p>
                  <p style={{ margin: 0, fontSize: "2rem", fontWeight: 700, color: "var(--red)" }}>{overall}%</p>
                </div>
              </div>

              {/* Motivation Card */}
              <div className="card" style={{ border: "2px solid var(--red)", padding: "1.5rem", background: "linear-gradient(135deg, rgba(200,0,26,0.1) 0%, rgba(200,0,26,0) 100%)" }}>
                <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6, fontWeight: 600, color: "var(--red)" }}>{missionData.motivationCard}</p>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === "team" && (
          <div className="card" style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1.5rem 0" }}>👥 Team Mission Board</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
              {missionData.teamStatus.map((member, i) => (
                <div key={i} style={{ padding: "1rem", background: "var(--surface2)", borderRadius: "var(--radius)", borderLeft: "3px solid " + getStatusColor(member.status) }}>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{member.name}</p>
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem", color: "var(--text-dim)" }}>{member.task}</p>
                  <p style={{ margin: "0.75rem 0 0 0", fontSize: "1.1rem" }}>{getStatusEmoji(member.status)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "docs" && (
          <div className="card" style={{ border: "1px solid var(--border)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1.5rem 0" }}>📂 Mission Documents</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              {missionData.documents.map((doc, i) => (
                <button
                  key={i}
                  style={{
                    padding: "1.25rem",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--red)";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "var(--red)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--surface2)";
                    e.currentTarget.style.color = "var(--text)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  📄 {doc}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

