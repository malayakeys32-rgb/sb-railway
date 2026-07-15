import { Router, Response } from "express";
import prisma from "../prismaClient";
import { authenticate, AuthRequest } from "../middleware/auth";
import { logAudit } from "../services/audit";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { severity, status, search } = req.query as Record<string, string | undefined>;
    const incidents = await prisma.incident.findMany({
      where: {
        reporterId: req.user!.userId,
        ...(severity ? { severity: severity as any } : {}),
        ...(status ? { status: status as any } : {}),
        ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }] } : {}),
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        _count: { select: { timeline: true, evidence: true } },
      },
      orderBy: { occurredAt: "desc" },
    });
    res.json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        timeline: { orderBy: { eventAt: "asc" } },
        evidence: { orderBy: { createdAt: "desc" } },
        patterns: { include: { pattern: true } },
      },
    });
    if (!incident) { res.status(404).json({ error: "Not found" }); return; }
    await logAudit(req.user!.userId, "VIEW_INCIDENT", "incident", incident.id);
    res.json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, severity, category, location, occurredAt, isAnonymous } = req.body as {
      title?: string; description?: string; severity?: string;
      category?: string; location?: string; occurredAt?: string; isAnonymous?: boolean;
    };
    if (!title || !description || !occurredAt) {
      res.status(400).json({ error: "title, description, and occurredAt are required" }); return;
    }
    const incident = await prisma.incident.create({
      data: {
        title, description,
        severity: (severity as any) ?? "LOW",
        category, location,
        occurredAt: new Date(occurredAt),
        isAnonymous: isAnonymous ?? false,
        reporterId: req.user!.userId,
      },
      include: { reporter: { select: { id: true, name: true, email: true } } },
    });
    // Auto-create opening timeline event
    await prisma.timelineEvent.create({
      data: {
        incidentId: incident.id,
        eventAt: new Date(occurredAt),
        description: "Incident reported",
        actor: isAnonymous ? "Anonymous" : req.user!.email,
        forensicHash: require("crypto").createHash("sha256").update(`${incident.id}${occurredAt}`).digest("hex"),
      },
    });
    await logAudit(req.user!.userId, "CREATE_INCIDENT", "incident", incident.id);
    res.status(201).json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, severity, status, category, location, occurredAt, resolvedAt } = req.body as Record<string, string | undefined>;
    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(severity ? { severity: severity as any } : {}),
        ...(status ? { status: status as any } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(occurredAt ? { occurredAt: new Date(occurredAt) } : {}),
        ...(resolvedAt ? { resolvedAt: new Date(resolvedAt) } : {}),
      },
      include: { reporter: { select: { id: true, name: true, email: true } } },
    });
    await logAudit(req.user!.userId, "UPDATE_INCIDENT", "incident", incident.id);
    res.json(incident);
  } catch (err: any) {
    if (err?.code === "P2025") { res.status(404).json({ error: "Not found" }); return; }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.incident.delete({ where: { id: req.params.id } });
    await logAudit(req.user!.userId, "DELETE_INCIDENT", "incident", req.params.id);
    res.status(204).end();
  } catch (err: any) {
    if (err?.code === "P2025") { res.status(404).json({ error: "Not found" }); return; }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
