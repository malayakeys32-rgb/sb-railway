import express from "express";
import cors from "cors";
import path from "path";

import { config } from "./config";

// ROUTES
import authRoutes from "./routes/auth";
import userAuthRoutes from "./routes/userAuth";   // ← YOUR USER LOGIN ROUTES
import evidenceRoutes from "./routes/evidence";
import incidentRoutes from "./routes/incidents";
import timelineRoutes from "./routes/timeline";
import patternRoutes from "./routes/patterns";
import sharingRoutes from "./routes/sharing";
import userAuthRoutes from "./routes/userAuth";

const FALLBACK_JWT = "fallback_dev_secret";
const jwtConfigured =
  process.env.JWT_SECRET !== undefined &&
  process.env.JWT_SECRET !== FALLBACK_JWT;

const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

app.use(express.json());

// Static files (protected by route-level auth)
app.use("/files", express.static(path.resolve(config.uploadDir)));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    jwtConfigured,
  });
});

// ROUTE REGISTRATION
app.use("/auth", authRoutes);          // ADMIN + SYSTEM AUTH
app.use("/user", userAuthRoutes);      // ← NORMAL USER LOGIN + CREATE ACCOUNT
app.use("/evidence", evidenceRoutes);
app.use("/incidents", incidentRoutes);
app.use("/timeline", timelineRoutes);
app.use("/patterns", patternRoutes);
app.use("/sharing", sharingRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(config.port, () => {
  console.log(
    `🔴 Sentinel Black backend running on http://localhost:${config.port}`
  );

  if (!jwtConfigured) {
    console.warn(
      "⚠️ WARNING: JWT_SECRET is not set. Using insecure fallback. Set JWT_SECRET in your environment secrets before handling real data."
    );
  }
});

export default app;
``
