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
// Get all agents
router.get("/", adminAuth_1.default, async (req, res) => {
    try {
        const agents = await prisma.agent.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                case: { select: { id: true, caseNumber: true, title: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ agents });
    }
    catch (error) {
        console.error("Error fetching agents:", error);
        res.status(500).json({ message: "Failed to fetch agents" });
    }
});
// Get single agent
router.get("/:id", adminAuth_1.default, async (req, res) => {
    try {
        const { id } = req.params;
        const agent = await prisma.agent.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                case: true,
            },
        });
        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }
        res.json(agent);
    }
    catch (error) {
        console.error("Error fetching agent:", error);
        res.status(500).json({ message: "Failed to fetch agent" });
    }
});
// Deploy agent
router.post("/", adminAuth_1.default, async (req, res) => {
    try {
        const { name, specialization, clearanceLevel, caseId } = req.body;
        if (!name || !clearanceLevel) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        // Generate agent ID
        const agentCount = await prisma.agent.count();
        const agentId = `AG-${new Date().getFullYear()}-${(agentCount + 1).toString().padStart(5, "0")}`;
        const newAgent = await prisma.agent.create({
            data: {
                agentId,
                name,
                specialization: specialization || undefined,
                clearanceLevel: clearanceLevel || "LEVEL_3",
                status: "ACTIVE",
                caseId: caseId || undefined,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                case: true,
            },
        });
        res.status(201).json(newAgent);
    }
    catch (error) {
        console.error("Error deploying agent:", error);
        res.status(500).json({ message: "Failed to deploy agent" });
    }
});
// Update agent
router.put("/:id", adminAuth_1.default, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, specialization, clearanceLevel, status, caseId } = req.body;
        const updatedAgent = await prisma.agent.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(specialization && { specialization }),
                ...(clearanceLevel && { clearanceLevel }),
                ...(status && { status }),
                ...(caseId !== undefined && { caseId: caseId || null }),
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                case: true,
            },
        });
        res.json(updatedAgent);
    }
    catch (error) {
        console.error("Error updating agent:", error);
        res.status(500).json({ message: "Failed to update agent" });
    }
});
// Delete agent
router.delete("/:id", adminAuth_1.default, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.agent.delete({ where: { id } });
        res.json({ message: "Agent removed successfully" });
    }
    catch (error) {
        console.error("Error deleting agent:", error);
        res.status(500).json({ message: "Failed to delete agent" });
    }
});
exports.default = router;
