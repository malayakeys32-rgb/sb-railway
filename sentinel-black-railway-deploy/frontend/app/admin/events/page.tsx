"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Events() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>📅 My Events</h1>
      <div className="card" style={{ border: "1px solid var(--border)", padding: "2rem" }}>
        <p style={{ color: "var(--text-dim)" }}>Your events will appear here. Create a mission to get started.</p>
      </div>
    </div>
  );
}

