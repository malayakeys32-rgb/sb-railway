"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const auth_1 = require("../middleware/auth");
const audit_1 = require("../services/audit");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", async (req, res) => {
    try {
        const { severity, status, search } = req.query;
        const incidents = await prismaClient_1.default.incident.findMany({
            where: {
                reporterId: req.user.userId,
                ...(severity ? { severity: severity } : {}),
                ...(status ? { status: status } : {}),
                ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }] } : {}),
            },
            include: {
                reporter: { select: { id: true, name: true, email: true } },
                _count: { select: { timeline: true, evidence: true } },
            },
            orderBy: { occurredAt: "desc" },
        });
        res.json(incidents);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const incident = await prismaClient_1.default.incident.findUnique({
            where: { id: req.params.id },
            include: {
                reporter: { select: { id: true, name: true, email: true } },
                timeline: { orderBy: { eventAt: "asc" } },
                evidence: { orderBy: { createdAt: "desc" } },
                patterns: { include: { pattern: true } },
            },
        });
        if (!incident) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        await (0, audit_1.logAudit)(req.user.userId, "VIEW_INCIDENT", "incident", incident.id);
        res.json(incident);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/", async (req, res) => {
    try {
        const { title, description, severity, category, location, occurredAt, isAnonymous } = req.body;
        if (!title || !description || !occurredAt) {
            res.status(400).json({ error: "title, description, and occurredAt are required" });
            return;
        }
        const incident = await prismaClient_1.default.incident.create({
            data: {
                title, description,
                severity: severity ?? "LOW",
                category, location,
                occurredAt: new Date(occurredAt),
                isAnonymous: isAnonymous ?? false,
                reporterId: req.user.userId,
            },
            include: { reporter: { select: { id: true, name: true, email: true } } },
        });
        // Auto-create opening timeline event
        await prismaClient_1.default.timelineEvent.create({
            data: {
                incidentId: incident.id,
                eventAt: new Date(occurredAt),
                description: "Incident reported",
                actor: isAnonymous ? "Anonymous" : req.user.email,
                forensicHash: require("crypto").createHash("sha256").update(`${incident.id}${occurredAt}`).digest("hex"),
            },
        });
        await (0, audit_1.logAudit)(req.user.userId, "CREATE_INCIDENT", "incident", incident.id);
        res.status(201).json(incident);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.patch("/:id", async (req, res) => {
    try {
        const { title, description, severity, status, category, location, occurredAt, resolvedAt } = req.body;
        const incident = await prismaClient_1.default.incident.update({
            where: { id: req.params.id },
            data: {
                ...(title ? { title } : {}),
                ...(description ? { description } : {}),
                ...(severity ? { severity: severity } : {}),
                ...(status ? { status: status } : {}),
                ...(category !== undefined ? { category } : {}),
                ...(location !== undefined ? { location } : {}),
                ...(occurredAt ? { occurredAt: new Date(occurredAt) } : {}),
                ...(resolvedAt ? { resolvedAt: new Date(resolvedAt) } : {}),
            },
            include: { reporter: { select: { id: true, name: true, email: true } } },
        });
        await (0, audit_1.logAudit)(req.user.userId, "UPDATE_INCIDENT", "incident", incident.id);
        res.json(incident);
    }
    catch (err) {
        if (err?.code === "P2025") {
            res.status(404).json({ error: "Not found" });
            return;
        }
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        await prismaClient_1.default.incident.delete({ where: { id: req.params.id } });
        await (0, audit_1.logAudit)(req.user.userId, "DELETE_INCIDENT", "incident", req.params.id);
        res.status(204).end();
    }
    catch (err) {
        if (err?.code === "P2025") {
            res.status(404).json({ error: "Not found" });
            return;
        }
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
