"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", async (_req, res) => {
    try {
        const patterns = await prismaClient_1.default.pattern.findMany({
            include: {
                incidents: { include: { incident: { select: { id: true, title: true, severity: true, occurredAt: true } } } },
            },
            orderBy: { detectedAt: "desc" },
        });
        res.json(patterns);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/", async (req, res) => {
    try {
        const { title, description, severity, incidentIds } = req.body;
        if (!title || !description) {
            res.status(400).json({ error: "title and description are required" });
            return;
        }
        const pattern = await prismaClient_1.default.pattern.create({
            data: {
                title, description,
                severity: severity ?? "LOW",
                frequency: incidentIds?.length ?? 0,
                incidents: incidentIds?.length
                    ? { create: incidentIds.map((id) => ({ incidentId: id })) }
                    : undefined,
            },
            include: { incidents: { include: { incident: { select: { id: true, title: true } } } } },
        });
        res.status(201).json(pattern);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.patch("/:id", async (req, res) => {
    try {
        const { title, description, severity, isEscalating } = req.body;
        const pattern = await prismaClient_1.default.pattern.update({
            where: { id: req.params.id },
            data: {
                ...(title ? { title } : {}),
                ...(description ? { description } : {}),
                ...(severity ? { severity } : {}),
                ...(isEscalating !== undefined ? { isEscalating } : {}),
            },
        });
        res.json(pattern);
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
router.delete("/:id", async (_req, res) => {
    try {
        await prismaClient_1.default.pattern.delete({ where: { id: _req.params.id } });
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
