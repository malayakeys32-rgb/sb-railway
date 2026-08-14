import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import adminAuth from "../middleware/adminAuth";

const router = Router();
const prisma = new PrismaClient();

// Get all threat monitors
router.get("/", adminAuth, async (req: Request, res: Response) => {
  try {
    const monitors = await prisma.threatMonitor.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        alertRules: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ monitors });
  } catch (error) {
    console.error("Error fetching monitors:", error);
    res.status(500).json({ message: "Failed to fetch monitors" });
  }
});

// Get single monitor
router.get("/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const monitor = await prisma.threatMonitor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        alertRules: true,
      },
    });

    if (!monitor) {
      return res.status(404).json({ message: "Monitor not found" });
    }

    res.json(monitor);
  } catch (error) {
    console.error("Error fetching monitor:", error);
    res.status(500).json({ message: "Failed to fetch monitor" });
  }
});

// Create monitor
router.post("/", adminAuth, async (req: Request, res: Response) => {
  try {
    const { name, description, monitorType, threshold } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!name || !monitorType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const monitor = await prisma.threatMonitor.create({
      data: {
        name,
        description: description || undefined,
        monitorType,
        threshold: threshold || undefined,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        alertRules: true,
      },
    });

    res.status(201).json(monitor);
  } catch (error) {
    console.error("Error creating monitor:", error);
    res.status(500).json({ message: "Failed to create monitor" });
  }
});

// Update monitor
router.put("/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, monitorType, threshold, isActive } = req.body;

    const updatedMonitor = await prisma.threatMonitor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(monitorType && { monitorType }),
        ...(threshold !== undefined && { threshold }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        alertRules: true,
      },
    });

    res.json(updatedMonitor);
  } catch (error) {
    console.error("Error updating monitor:", error);
    res.status(500).json({ message: "Failed to update monitor" });
  }
});

// Add alert rule
router.post("/:id/rules", adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { condition, action } = req.body;

    if (!condition || !action) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const rule = await prisma.alertRule.create({
      data: {
        monitorId: id,
        condition,
        action,
      },
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error("Error creating rule:", error);
    res.status(500).json({ message: "Failed to create rule" });
  }
});

// Delete rule
router.delete("/rules/:ruleId", adminAuth, async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;

    await prisma.alertRule.delete({ where: { id: ruleId } });

    res.json({ message: "Rule deleted" });
  } catch (error) {
    console.error("Error deleting rule:", error);
    res.status(500).json({ message: "Failed to delete rule" });
  }
});

// Delete monitor
router.delete("/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.threatMonitor.delete({ where: { id } });

    res.json({ message: "Monitor deleted successfully" });
  } catch (error) {
    console.error("Error deleting monitor:", error);
    res.status(500).json({ message: "Failed to delete monitor" });
  }
});

export default router;
