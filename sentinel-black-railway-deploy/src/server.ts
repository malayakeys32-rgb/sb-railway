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
app.use(express.json());

// Serve uploaded files statically (protected by route-level auth in evidence.ts)
app.use("/files", express.static(path.resolve(config.uploadDir)));

// Root + health checks (good for Railway)
app.get("/", (_req, res) => {
  res.json({
    status: "SB Railway Backend Running",
    jwtConfigured,
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    jwtConfigured,
  });
});

// Auth routes (user + admin)
app.use("/auth", authRoutes);
app.use("/auth", adminAuthRoutes);

// Domain routes
app.use("/evidence", evidenceRoutes);
app.use("/incidents", incidentRoutes);
app.use("/timeline", timelineRoutes);
app.use("/patterns", patternRoutes);
app.use("/sharing", sharingRoutes);

// Mission routes
app.use("/", missionRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(config.port, () => {
  console.log(`🔴 Sentinel Black backend running on http://localhost:${config.port}`);
  if (!jwtConfigured) {
    console.warn(
      "⚠️ WARNING: JWT_SECRET is not set. Using insecure fallback. Set JWT_SECRET in your environment secrets before handling real data."
    );
  }
});

export default app;

