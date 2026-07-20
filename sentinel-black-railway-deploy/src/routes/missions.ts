import { Router, Request, Response } from "express";
import prisma from "../prismaClient";
import jwt from "jsonwebtoken";
import { config } from "../config";

const router = Router();

// Middleware to verify token
const verifyToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    (req as any).userId = decoded.userId;
    (req as any).userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Create a new mission
router.post("/missions", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    const userId = (req as any).userId;

    const mission = await prisma.mission.create({
      data: {
        title,
        description: description || null,
        createdById: userId,
      },
    });

    // Create empty readiness score
    await prisma.readinessScore.create({
      data: { missionId: mission.id },
    });

    res.json(mission);
  } catch (err) {
    console.error("Create mission error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get today's mission
router.get("/missions/today", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const mission = await prisma.mission.findFirst({
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
  } catch (err) {
    console.error("Get mission error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update mission progress
router.patch("/missions/:id", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, progressPercent, status } = req.body;

    const mission = await prisma.mission.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(progressPercent !== undefined && { progressPercent }),
        ...(status && { status }),
      },
    });

    res.json(mission);
  } catch (err) {
    console.error("Update mission error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add mission task
router.post("/missions/:id/tasks", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;

    const task = await prisma.missionTask.create({
      data: {
        missionId: id,
        title,
        description: description || null,
        priority: priority || "MEDIUM",
      },
    });

    res.json(task);
  } catch (err) {
    console.error("Add task error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update task status
router.patch("/missions/:id/tasks/:taskId", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await prisma.missionTask.update({
      where: { id: taskId },
      data: { status },
    });

    res.json(task);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add timeline event
router.post("/missions/:id/timeline", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { time, event } = req.body;

    const timelineEvent = await prisma.missionTimeline.create({
      data: {
        missionId: id,
        time,
        event,
      },
    });

    res.json(timelineEvent);
  } catch (err) {
    console.error("Add timeline error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add mission log entry
router.post("/missions/:id/logs", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { note, timestamp, mediaUrl, mediaType } = req.body;

    const log = await prisma.missionLog.create({
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
  } catch (err) {
    console.error("Add log error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add team member
router.post("/missions/:id/team", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, task } = req.body;

    const member = await prisma.teamMember.create({
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
  } catch (err) {
    console.error("Add team member error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update team member status
router.patch("/missions/:id/team/:memberId", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { memberId } = req.params;
    const { status } = req.body;

    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    res.json(member);
  } catch (err) {
    console.error("Update team member error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update readiness scores
router.patch("/missions/:id/readiness", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { planning, staffing, logistics, safety, budget } = req.body;

    const scores = await prisma.readinessScore.update({
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
  } catch (err) {
    console.error("Update readiness error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

