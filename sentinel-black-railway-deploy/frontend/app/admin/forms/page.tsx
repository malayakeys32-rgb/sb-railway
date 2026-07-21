"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Forms() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/admin/login");
  }, [router]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>📋 Forms</h1>
      <div className="card" style={{ border: "1px solid var(--border)", padding: "2rem" }}>
        <p style={{ color: "var(--text-dim)" }}>Evidence and situation report forms.</p>
      </div>
    </div>
  );
}

