"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const auth_1 = __importDefault(require("./routes/auth"));
const adminAuth_1 = __importDefault(require("./routes/adminAuth"));
const evidence_1 = __importDefault(require("./routes/evidence"));
const incidents_1 = __importDefault(require("./routes/incidents"));
const timeline_1 = __importDefault(require("./routes/timeline"));
const patterns_1 = __importDefault(require("./routes/patterns"));
const sharing_1 = __importDefault(require("./routes/sharing"));
const missions_1 = __importDefault(require("./routes/missions"));
const cases_1 = __importDefault(require("./routes/cases"));
const agents_1 = __importDefault(require("./routes/agents"));
const threats_1 = __importDefault(require("./routes/threats"));
const systemLogs_1 = __importDefault(require("./routes/systemLogs"));
const threatMonitors_1 = __importDefault(require("./routes/threatMonitors"));
const FALLBACK_JWT = "fallback_dev_secret";
const jwtConfigured = process.env.JWT_SECRET !== undefined &&
    process.env.JWT_SECRET !== FALLBACK_JWT;
const app = (0, express_1.default)();
// CORS + JSON
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigin,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
// Serve uploaded files statically (protected by route-level auth in evidence.ts)
app.use("/files", express_1.default.static(path_1.default.resolve(config_1.config.uploadDir)));
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
app.use("/auth", auth_1.default);
app.use("/auth", adminAuth_1.default);
// Investigation System Routes (Cases, Evidence, Agents, Threats)
app.use("/api/cases", cases_1.default);
app.use("/api/evidence", evidence_1.default);
app.use("/api/agents", agents_1.default);
app.use("/api/threats", threats_1.default);
// System Monitoring Routes
app.use("/api/system-logs", systemLogs_1.default);
app.use("/api/threat-monitors", threatMonitors_1.default);
// Incident & Mission Management Routes
app.use("/api/incidents", incidents_1.default);
app.use("/timeline", timeline_1.default);
app.use("/patterns", patterns_1.default);
app.use("/sharing", sharing_1.default);
app.use("/missions", missions_1.default);
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
app.listen(config_1.config.port, () => {
    console.log(`🔴 Sentinel Black Backend - ONLINE on port ${config_1.config.port}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔐 JWT Security: ${jwtConfigured ? "ENABLED" : "DISABLED (DEV MODE)"}`);
    if (!jwtConfigured) {
        console.warn("⚠️ WARNING: JWT_SECRET is not set. Using insecure fallback. Set JWT_SECRET in your environment secrets before handling real data.");
    }
});
exports.default = app;
