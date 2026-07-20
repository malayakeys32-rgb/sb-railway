"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Documents() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>📂 Documents</h1>
      <div className="card" style={{ border: "1px solid var(--border)", padding: "2rem" }}>
        <p style={{ color: "var(--text-dim)" }}>Your mission documents and files will appear here.</p>
      </div>
    </div>
  );
}

