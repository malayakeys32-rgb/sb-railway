import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();
const prisma = new PrismaClient();

// Get all agents
router.get("/", adminAuth, async (req: Request, res: Response) => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ agents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Failed to fetch agents" });
  }
});

// Get single agent
router.get("/:id", adminAuth, async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error fetching agent:", error);
    res.status(500).json({ message: "Failed to fetch agent" });
  }
});

// Deploy agent
router.post("/", adminAuth, async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error deploying agent:", error);
    res.status(500).json({ message: "Failed to deploy agent" });
  }
});

// Update agent
router.put("/:id", adminAuth, async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ message: "Failed to update agent" });
  }
});

// Delete agent
router.delete("/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.agent.delete({ where: { id } });

    res.json({ message: "Agent removed successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ message: "Failed to delete agent" });
  }
});

export default router;
