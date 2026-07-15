"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./api/client";

export default function Home() {
  const { token } = useAuthStore();
  const router = useRouter();
  useEffect(() => { router.replace(token ? "/dashboard" : "/login"); }, [token, router]);
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "var(--text-dim)" }}>Loading…</div></div>;
}
