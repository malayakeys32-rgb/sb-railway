import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();
const prisma = new PrismaClient();

// Get all system logs
router.get("/", adminAuth, async (req: Request, res: Response) => {
  try {
    const { limit = 100, severity, logType, threatId } = req.query;

    const where: any = {};
    if (severity) where.severity = severity;
    if (logType) where.logType = logType;
    if (threatId) where.threatId = threatId;

    const logs = await prisma.systemLog.findMany({
      where,
      include: { threat: true },
      orderBy: { createdAt: "desc" },
      take: Math.min(parseInt(limit as string) || 100, 500),
    });

    res.json({ logs });
  } catch (error) {
    console.error("Error fetching system logs:", error);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

// Get single log
router.get("/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const log = await prisma.systemLog.findUnique({
      where: { id },
      include: { threat: true },
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.json(log);
  } catch (error) {
    console.error("Error fetching log:", error);
    res.status(500).json({ message: "Failed to fetch log" });
  }
});

// Create system log
router.post("/", async (req: Request, res: Response) => {
  try {
    const { logType, component, message, severity, threatId, metadata, stackTrace } = req.body;

    if (!logType || !component || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const log = await prisma.systemLog.create({
      data: {
        logType,
        component,
        message,
        severity: severity || "INFO",
        threatId: threatId || undefined,
        metadata: metadata || undefined,
        stackTrace: stackTrace || undefined,
      },
      include: { threat: true },
    });

    res.status(201).json(log);
  } catch (error) {
    console.error("Error creating log:", error);
    res.status(500).json({ message: "Failed to create log" });
  }
});

// Get logs by severity
router.get("/by-severity/:severity", adminAuth, async (req: Request, res: Response) => {
  try {
    const { severity } = req.params;
    const { limit = 100 } = req.query;

    const logs = await prisma.systemLog.findMany({
      where: { severity },
      include: { threat: true },
      orderBy: { createdAt: "desc" },
      take: Math.min(parseInt(limit as string) || 100, 500),
    });

    res.json({ logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

// Get logs by component
router.get("/by-component/:component", adminAuth, async (req: Request, res: Response) => {
  try {
    const { component } = req.params;
    const { limit = 100 } = req.query;

    const logs = await prisma.systemLog.findMany({
      where: { component },
      include: { threat: true },
      orderBy: { createdAt: "desc" },
      take: Math.min(parseInt(limit as string) || 100, 500),
    });

    res.json({ logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

export default router;
