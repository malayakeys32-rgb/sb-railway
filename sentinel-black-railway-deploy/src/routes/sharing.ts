import { Router, Response, Request } from "express";
import prisma from "../prismaClient";
import { authenticate, AuthRequest } from "../middleware/auth";
import { logAudit } from "../services/audit";

const router = Router();

// Create shared link (auth required)
router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { evidenceId, expiresAt, maxViews } = req.body as {
      evidenceId?: string; expiresAt?: string; maxViews?: number;
    };
    if (!evidenceId) { res.status(400).json({ error: "evidenceId is required" }); return; }

    const link = await prisma.sharedLink.create({
      data: {
        evidenceId,
        createdById: req.user!.userId,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        maxViews: maxViews ?? undefined,
      },
    });
    await logAudit(req.user!.userId, "CREATE_SHARED_LINK", "sharedLink", link.id);
    res.status(201).json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Revoke shared link
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.sharedLink.update({ where: { id: req.params.id }, data: { isRevoked: true } });
    await logAudit(req.user!.userId, "REVOKE_SHARED_LINK", "sharedLink", req.params.id);
    res.status(204).end();
  } catch (err: any) {
    if (err?.code === "P2025") { res.status(404).json({ error: "Not found" }); return; }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Access shared link (no auth)
router.get("/access/:token", async (req: Request, res: Response): Promise<void> => {
  try {
    const link = await prisma.sharedLink.findUnique({
      where: { token: req.params.token },
      include: { evidence: true },
    });
    if (!link || link.isRevoked) { res.status(404).json({ error: "Link not found or revoked" }); return; }
    if (link.expiresAt && link.expiresAt < new Date()) { res.status(410).json({ error: "Link expired" }); return; }
    if (link.maxViews && link.viewCount >= link.maxViews) { res.status(410).json({ error: "Max views reached" }); return; }

    await prisma.sharedLink.update({ where: { id: link.id }, data: { viewCount: { increment: 1 } } });
    res.json({ evidence: link.evidence, viewCount: link.viewCount + 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
