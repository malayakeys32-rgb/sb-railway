"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    if (userData) setUser(JSON.parse(userData));
  }, [router]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", color: "#fff" }}>🏠 Welcome</h1>
      <div style={{ background: "rgba(0, 0, 0, 0.7)", border: "2px solid #fff", borderRadius: "16px", padding: "2rem", marginBottom: "2rem" }}>
        <p style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#fff" }}>Welcome, {user?.name}!</p>
        <p style={{ color: "#aaa" }}>This is your command center. Use the sidebar to navigate.</p>
      </div>
    </div>
  );
}
