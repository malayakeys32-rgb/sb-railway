"use client";
import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function SecurityBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("jwt-banner-dismissed")) {
      return;
    }
    api.get<{ jwtConfigured: boolean }>("/health").then((res) => {
      if (!res.data.jwtConfigured) setShow(true);
    }).catch(() => {});
  }, []);

  if (!show || dismissed) return null;

  function dismiss() {
    if (typeof window !== "undefined") sessionStorage.setItem("jwt-banner-dismissed", "1");
    setDismissed(true);
  }

  return (
    <div style={{
      background: "rgba(232,160,32,0.1)",
      border: "1px solid rgba(232,160,32,0.4)",
      borderRadius: "var(--radius)",
      padding: "0.75rem 1rem",
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
    }}>
      <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.05rem" }}>⚠</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--warning)", letterSpacing: "0.04em" }}>
          INSECURE CONFIGURATION — JWT_SECRET NOT SET
        </div>
        <div style={{ fontSize: "0.78rem", color: "var(--text-mid)", marginTop: "0.25rem", lineHeight: 1.5 }}>
          The server is using a fallback signing key. All auth tokens are cryptographically weak.{" "}
          <strong style={{ color: "var(--text)" }}>Set a strong <code style={{ fontFamily: "var(--mono)", background: "var(--surface2)", padding: "0 3px", borderRadius: 3 }}>JWT_SECRET</code> in your environment secrets</strong>{" "}
          before storing real evidence or sensitive data.
        </div>
      </div>
      <button
        onClick={dismiss}
        style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, flexShrink: 0, padding: "0 0.25rem" }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
