"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const router = (0, express_1.Router)();
// Middleware to verify token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};
// Create a new mission
router.post("/missions", verifyToken, async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.userId;
        const mission = await prismaClient_1.default.mission.create({
            data: {
                title,
                description: description || null,
                createdById: userId,
            },
        });
        // Create empty readiness score
        await prismaClient_1.default.readinessScore.create({
            data: { missionId: mission.id },
        });
        res.json(mission);
    }
    catch (err) {
        console.error("Create mission error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get today's mission
router.get("/missions/today", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const mission = await prismaClient_1.default.mission.findFirst({
            where: {
                createdById: userId,
                status: "ACTIVE",
                missionDate: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                tasks: true,
                timeline: { orderBy: { createdAt: "asc" } },
                logs: { include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
                teamMembers: { include: { user: { select: { name: true, email: true } } } },
                readinessScores: true,
            },
        });
        if (!mission) {
            res.json(null);
            return;
        }
        res.json(mission);
    }
    catch (err) {
        console.error("Get mission error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update mission progress
router.patch("/missions/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, progressPercent, status } = req.body;
        const mission = await prismaClient_1.default.mission.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(progressPercent !== undefined && { progressPercent }),
                ...(status && { status }),
            },
        });
        res.json(mission);
    }
    catch (err) {
        console.error("Update mission error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Add mission task
router.post("/missions/:id/tasks", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority } = req.body;
        const task = await prismaClient_1.default.missionTask.create({
            data: {
                missionId: id,
                title,
                description: description || null,
                priority: priority || "MEDIUM",
            },
        });
        res.json(task);
    }
    catch (err) {
        console.error("Add task error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update task status
router.patch("/missions/:id/tasks/:taskId", verifyToken, async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        const task = await prismaClient_1.default.missionTask.update({
            where: { id: taskId },
            data: { status },
        });
        res.json(task);
    }
    catch (err) {
        console.error("Update task error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Add timeline event
router.post("/missions/:id/timeline", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { time, event } = req.body;
        const timelineEvent = await prismaClient_1.default.missionTimeline.create({
            data: {
                missionId: id,
                time,
                event,
            },
        });
        res.json(timelineEvent);
    }
    catch (err) {
        console.error("Add timeline error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Add mission log entry
router.post("/missions/:id/logs", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { note, timestamp, mediaUrl, mediaType } = req.body;
        const log = await prismaClient_1.default.missionLog.create({
            data: {
                missionId: id,
                userId,
                note,
                timestamp: timestamp || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                mediaUrl: mediaUrl || null,
                mediaType: mediaType || null,
            },
            include: {
                user: { select: { name: true, email: true } },
            },
        });
        res.json(log);
    }
    catch (err) {
        console.error("Add log error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Add team member
router.post("/missions/:id/team", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, task } = req.body;
        const member = await prismaClient_1.default.teamMember.create({
            data: {
                missionId: id,
                userId,
                task,
            },
            include: {
                user: { select: { name: true, email: true } },
            },
        });
        res.json(member);
    }
    catch (err) {
        console.error("Add team member error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update team member status
router.patch("/missions/:id/team/:memberId", verifyToken, async (req, res) => {
    try {
        const { memberId } = req.params;
        const { status } = req.body;
        const member = await prismaClient_1.default.teamMember.update({
            where: { id: memberId },
            data: { status },
            include: {
                user: { select: { name: true, email: true } },
            },
        });
        res.json(member);
    }
    catch (err) {
        console.error("Update team member error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update readiness scores
router.patch("/missions/:id/readiness", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { planning, staffing, logistics, safety, budget } = req.body;
        const scores = await prismaClient_1.default.readinessScore.update({
            where: { missionId: id },
            data: {
                ...(planning !== undefined && { planning }),
                ...(staffing !== undefined && { staffing }),
                ...(logistics !== undefined && { logistics }),
                ...(safety !== undefined && { safety }),
                ...(budget !== undefined && { budget }),
            },
        });
        res.json(scores);
    }
    catch (err) {
        console.error("Update readiness error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
