"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div style={{ padding: "2rem", color: "#fff" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#fff" }}>🎯 Dashboard</h1>
      <div style={{ background: "rgba(0, 0, 0, 0.7)", border: "2px solid #fff", borderRadius: "12px", padding: "2rem", marginTop: "1rem" }}>
        <p style={{ color: "#fff", fontSize: "1.1rem" }}>Welcome to Sentinel Black Command Center</p>
        <p style={{ color: "#aaa" }}>Select an option from the sidebar to continue.</p>
      </div>
    </div>
  );
}
