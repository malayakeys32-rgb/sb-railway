import { Router, Response } from "express";
import prisma from "../prismaClient";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patterns = await prisma.pattern.findMany({
      include: {
        incidents: { include: { incident: { select: { id: true, title: true, severity: true, occurredAt: true } } } },
      },
      orderBy: { detectedAt: "desc" },
    });
    res.json(patterns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, severity, incidentIds } = req.body as {
      title?: string; description?: string; severity?: string; incidentIds?: string[];
    };
    if (!title || !description) { res.status(400).json({ error: "title and description are required" }); return; }

    const pattern = await prisma.pattern.create({
      data: {
        title, description,
        severity: (severity as any) ?? "LOW",
        frequency: incidentIds?.length ?? 0,
        incidents: incidentIds?.length
          ? { create: incidentIds.map((id) => ({ incidentId: id })) }
          : undefined,
      },
      include: { incidents: { include: { incident: { select: { id: true, title: true } } } } },
    });
    res.status(201).json(pattern);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, severity, isEscalating } = req.body as Record<string, any>;
    const pattern = await prisma.pattern.update({
      where: { id: req.params.id },
      data: {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(severity ? { severity } : {}),
        ...(isEscalating !== undefined ? { isEscalating } : {}),
      },
    });
    res.json(pattern);
  } catch (err: any) {
    if (err?.code === "P2025") { res.status(404).json({ error: "Not found" }); return; }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.pattern.delete({ where: { id: _req.params.id } });
    res.status(204).end();
  } catch (err: any) {
    if (err?.code === "P2025") { res.status(404).json({ error: "Not found" }); return; }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
