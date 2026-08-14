import express from "express";
import cors from "cors";
import path from "path";
import { config } from "./config";

import authRoutes from "./routes/auth";
import adminAuthRoutes from "./routes/adminAuth";
import evidenceRoutes from "./routes/evidence";
import incidentRoutes from "./routes/incidents";
import timelineRoutes from "./routes/timeline";
import patternRoutes from "./routes/patterns";
import sharingRoutes from "./routes/sharing";
import missionRoutes from "./routes/missions";
import caseRoutes from "./routes/cases";
import agentRoutes from "./routes/agents";
import threatRoutes from "./routes/threats";
import systemLogsRoutes from "./routes/systemLogs";
import threatMonitorsRoutes from "./routes/threatMonitors";

const FALLBACK_JWT = "fallback_dev_secret";
const jwtConfigured =
  process.env.JWT_SECRET !== undefined &&
  process.env.JWT_SECRET !== FALLBACK_JWT;

const app = express();

// CORS + JSON
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded files statically (protected by route-level auth in evidence.ts)
app.use("/files", express.static(path.resolve(config.uploadDir)));

// Root + health checks (good for Railway)
app.get("/", (_req, res) => {
  res.json({
    status: "Sentinel Black Backend - Online",
    version: "1.0.0",
    jwtConfigured,
    modules: [
      "Authentication",
      "Cases",
      "Evidence",
      "Agents",
      "Threats",
      "System Logs",
      "Threat Monitoring",
      "Incidents",
      "Missions",
    ],
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    jwtConfigured,
  });
});

// API v1 routes
app.get("/api", (_req, res) => {
  res.json({
    message: "Sentinel Black API v1",
    endpoints: {
      auth: "/auth",
      admin: "/admin",
      cases: "/api/cases",
      evidence: "/api/evidence",
      agents: "/api/agents",
      threats: "/api/threats",
      "system-logs": "/api/system-logs",
      "threat-monitors": "/api/threat-monitors",
      incidents: "/api/incidents",
      missions: "/api/missions",
    },
  });
});

// Auth routes (user + admin)
app.use("/auth", authRoutes);
app.use("/auth", adminAuthRoutes);

// Investigation System Routes (Cases, Evidence, Agents, Threats)
app.use("/api/cases", caseRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/threats", threatRoutes);

// System Monitoring Routes
app.use("/api/system-logs", systemLogsRoutes);
app.use("/api/threat-monitors", threatMonitorsRoutes);

// Incident & Mission Management Routes
app.use("/api/incidents", incidentRoutes);
app.use("/timeline", timelineRoutes);
app.use("/patterns", patternRoutes);
app.use("/sharing", sharingRoutes);
app.use("/missions", missionRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    available_endpoints: [
      "GET /",
      "GET /health",
      "GET /api",
      "POST /auth/login",
      "POST /auth/admin/login",
      "GET /api/cases",
      "GET /api/evidence",
      "GET /api/agents",
      "GET /api/threats",
      "GET /api/system-logs",
      "GET /api/threat-monitors",
    ]
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🔴 Sentinel Black Backend - ONLINE on port ${config.port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔐 JWT Security: ${jwtConfigured ? "ENABLED" : "DISABLED (DEV MODE)"}`);
  if (!jwtConfigured) {
    console.warn(
      "⚠️ WARNING: JWT_SECRET is not set. Using insecure fallback. Set JWT_SECRET in your environment secrets before handling real data."
    );
  }
});

export default app;

