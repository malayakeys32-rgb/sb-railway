"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const adminAuth_1 = __importDefault(require("../middleware/adminAuth"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all threats
router.get("/", adminAuth_1.default, async (req, res) => {
    try {
        const threats = await prisma.threat.findMany({
            include: {
                cases: { include: { case: true } },
                logs: true,
            },
            orderBy: { detectedAt: "desc" },
        });
        res.json({ threats });
    }
    catch (error) {
        console.error("Error fetching threats:", error);
        res.status(500).json({ message: "Failed to fetch threats" });
    }
});
// Get single threat
router.get("/:id", adminAuth_1.default, async (req, res) => {
    try {
        const { id } = req.params;
        const threat = await prisma.threat.findUnique({
            where: { id },
            include: {
                cases: { include: { case: true } },
                logs: true,
            },
        });
        if (!threat) {
            return res.status(404).json({ message: "Threat not found" });
        }
        res.json(threat);
    }
    catch (error) {
        console.error("Error fetching threat:", error);
        res.status(500).json({ message: "Failed to fetch threat" });
    }
});
// Create threat
router.post("/", adminAuth_1.default, async (req, res) => {
    try {
        const { name, description, threatType, severity, source, intel } = req.body;
        if (!name || !description || !threatType) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        // Generate threat ID
        const threatCount = await prisma.threat.count();
        const threatId = `THR-${new Date().getFullYear()}-${(threatCount + 1).toString().padStart(6, "0")}`;
        const newThreat = await prisma.threat.create({
            data: {
                threatId,
                name,
                description,
                threatType,
                severity: severity || "LOW",
                status: "DETECTED",
                source: source || undefined,
                intel: intel || undefined,
            },
            include: {
                cases: { include: { case: true } },
                logs: true,
            },
        });
        res.status(201).json(newThreat);
    }
    catch (error) {
        console.error("Error creating threat:", error);
        res.status(500).json({ message: "Failed to create threat" });
    }
});
// Update threat
router.put("/:id", adminAuth_1.default, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, threatType, severity, status, source, intel, resolvedAt } = req.body;
        const updatedThreat = await prisma.threat.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(threatType && { threatType }),
                ...(severity && { severity }),
                ...(status && { status }),
                ...(source && { source }),
                ...(intel && { intel }),
                ...(resolvedAt && { resolvedAt: new Date(resolvedAt) }),
            },
            include: {
                cases: { include: { case: true } },
                logs: true,
            },
        });
        res.json(updatedThreat);
    }
    catch (error) {
        console.error("Error updating threat:", error);
        res.status(500).json({ message: "Failed to update threat" });
    }
});
// Link threat to case
router.post("/:threatId/link/:caseId", adminAuth_1.default, async (req, res) => {
    try {
        const { threatId, caseId } = req.params;
        const link = await prisma.caseThreat.create({
            data: { threatId, caseId },
        });
        res.status(201).json(link);
    }
    catch (error) {
        console.error("Error linking threat:", error);
        res.status(500).json({ message: "Failed to link threat" });
    }
});
// Delete threat
router.delete("/:id", adminAuth_1.default, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.threat.delete({ where: { id } });
        res.json({ message: "Threat deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting threat:", error);
        res.status(500).json({ message: "Failed to delete threat" });
    }
});
exports.default = router;
