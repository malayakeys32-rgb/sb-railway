import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import prisma from "../prismaClient";
import { authenticate, AuthRequest } from "../middleware/auth";
import { hashFile } from "../services/hash";
import { logAudit } from "../services/audit";
import { config } from "../config";

const router = Router();
router.use(authenticate);

// Ensure upload dir exists
if (!fs.existsSync(config.uploadDir)) fs.mkdirSync(config.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/quicktime", "video/webm",
      "audio/mpeg", "audio/wav", "audio/ogg", "audio/webm",
      "application/pdf",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`File type ${file.mimetype} not allowed`));
  },
});

// GET /evidence
router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { incidentId } = req.query as { incidentId?: string };
    const evidence = await prisma.evidence.findMany({
      where: {
        uploaderId: req.user!.userId,
        ...(incidentId ? { incidentId } : {}),
      },
      include: { uploader: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(evidence);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /evidence/:id
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const evidence = await prisma.evidence.findUnique({
      where: { id: req.params.id },
      include: { uploader: { select: { id: true, name: true } } },
    });
    if (!evidence) { res.status(404).json({ error: "Evidence not found" }); return; }
    await logAudit(req.user!.userId, "VIEW_EVIDENCE", "evidence", evidence.id);
    res.json(evidence);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /evidence/upload
router.post("/upload", upload.single("file"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

    const { description, incidentId, takenAt } = req.body as {
      description?: string;
      incidentId?: string;
      takenAt?: string;
    };

    const fileHash = await hashFile(req.file.path);

    const custodyEntry = {
      timestamp: new Date().toISOString(),
      action: "UPLOADED",
      actor: req.user!.email,
      hash: fileHash,
    };

    const evidence = await prisma.evidence.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        fileHash,
        storagePath: req.file.path,
        description,
        takenAt: takenAt ? new Date(takenAt) : undefined,
        chainOfCustody: [custodyEntry],
        uploaderId: req.user!.userId,
        incidentId: incidentId || undefined,
      },
    });

    await logAudit(req.user!.userId, "UPLOAD_EVIDENCE", "evidence", evidence.id, { filename: req.file.originalname });
    res.status(201).json(evidence);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /evidence/:id/file — serve the actual file
router.get("/:id/file", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const evidence = await prisma.evidence.findUnique({ where: { id: req.params.id } });
    if (!evidence) { res.status(404).json({ error: "Not found" }); return; }
    await logAudit(req.user!.userId, "DOWNLOAD_EVIDENCE", "evidence", evidence.id);
    res.setHeader("Content-Type", evidence.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${evidence.originalName}"`);
    res.sendFile(path.resolve(evidence.storagePath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /evidence/:id
router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const evidence = await prisma.evidence.findUnique({ where: { id: req.params.id } });
    if (!evidence) { res.status(404).json({ error: "Not found" }); return; }
    if (evidence.uploaderId !== req.user!.userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    // Add deletion entry to chain of custody before deleting
    await logAudit(req.user!.userId, "DELETE_EVIDENCE", "evidence", evidence.id);
    if (fs.existsSync(evidence.storagePath)) fs.unlinkSync(evidence.storagePath);
    await prisma.evidence.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
