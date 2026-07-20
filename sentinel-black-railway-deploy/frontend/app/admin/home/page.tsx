"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>🏠 Home</h1>
      <div className="card" style={{ border: "1px solid var(--border)", padding: "2rem" }}>
        <p style={{ fontSize: "1rem", lineHeight: 1.6 }}>
          Welcome to Sentinel Black Mission Control. Start your day by reviewing your daily mission, managing tasks, and coordinating with your team.
        </p>
        <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", marginTop: "1.5rem" }}>
          Quick actions:
        </p>
        <ul style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>
          <li>🎯 <a href="/admin/dashboard" style={{ color: "var(--red)", textDecoration: "none" }}>View Today's Mission</a></li>
          <li>✅ <a href="/admin/tasks" style={{ color: "var(--red)", textDecoration: "none" }}>Manage Tasks</a></li>
          <li>📅 <a href="/admin/events" style={{ color: "var(--red)", textDecoration: "none" }}>View Events</a></li>
          <li>👥 <a href="/admin/team" style={{ color: "var(--red)", textDecoration: "none" }}>Team Collaboration</a></li>
        </ul>
      </div>
    </div>
  );
}

