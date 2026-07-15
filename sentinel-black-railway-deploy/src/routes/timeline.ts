import { Router, Response } from "express";
import crypto from "crypto";
import prisma from "../prismaClient";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/:incidentId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await prisma.timelineEvent.findMany({
      where: { incidentId: req.params.incidentId },
      orderBy: { eventAt: "asc" },
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:incidentId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventAt, description, actor } = req.body as { eventAt?: string; description?: string; actor?: string };
    if (!eventAt || !description) { res.status(400).json({ error: "eventAt and description are required" }); return; }

    const incident = await prisma.incident.findUnique({ where: { id: req.params.incidentId } });
    if (!incident) { res.status(404).json({ error: "Incident not found" }); return; }

    const forensicHash = crypto
      .createHash("sha256")
      .update(`${req.params.incidentId}${eventAt}${description}${Date.now()}`)
      .digest("hex");

    const event = await prisma.timelineEvent.create({
      data: {
        incidentId: req.params.incidentId,
        eventAt: new Date(eventAt),
        description,
        actor: actor ?? req.user!.email,
        forensicHash,
        isLocked: true,
      },
    });
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/event/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.timelineEvent.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err: any) {
    if (err?.code === "P2025") { res.status(404).json({ error: "Not found" }); return; }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
