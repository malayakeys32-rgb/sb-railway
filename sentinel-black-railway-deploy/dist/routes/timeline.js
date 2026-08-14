"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/:incidentId", async (req, res) => {
    try {
        const events = await prismaClient_1.default.timelineEvent.findMany({
            where: { incidentId: req.params.incidentId },
            orderBy: { eventAt: "asc" },
        });
        res.json(events);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/:incidentId", async (req, res) => {
    try {
        const { eventAt, description, actor } = req.body;
        if (!eventAt || !description) {
            res.status(400).json({ error: "eventAt and description are required" });
            return;
        }
        const incident = await prismaClient_1.default.incident.findUnique({ where: { id: req.params.incidentId } });
        if (!incident) {
            res.status(404).json({ error: "Incident not found" });
            return;
        }
        const forensicHash = crypto_1.default
            .createHash("sha256")
            .update(`${req.params.incidentId}${eventAt}${description}${Date.now()}`)
            .digest("hex");
        const event = await prismaClient_1.default.timelineEvent.create({
            data: {
                incidentId: req.params.incidentId,
                eventAt: new Date(eventAt),
                description,
                actor: actor ?? req.user.email,
                forensicHash,
                isLocked: true,
            },
        });
        res.status(201).json(event);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.delete("/event/:id", async (req, res) => {
    try {
        await prismaClient_1.default.timelineEvent.delete({ where: { id: req.params.id } });
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
