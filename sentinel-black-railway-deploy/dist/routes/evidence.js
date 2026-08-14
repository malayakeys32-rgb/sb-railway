"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const auth_1 = require("../middleware/auth");
const hash_1 = require("../services/hash");
const audit_1 = require("../services/audit");
const config_1 = require("../config");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Ensure upload dir exists
if (!fs_1.default.existsSync(config_1.config.uploadDir))
    fs_1.default.mkdirSync(config_1.config.uploadDir, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, config_1.config.uploadDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${(0, uuid_1.v4)()}${ext}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: config_1.config.maxFileSizeMb * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = [
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "video/mp4", "video/quicktime", "video/webm",
            "audio/mpeg", "audio/wav", "audio/ogg", "audio/webm",
            "application/pdf",
            "text/plain",
        ];
        if (allowed.includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error(`File type ${file.mimetype} not allowed`));
    },
});
// GET /evidence
router.get("/", async (req, res) => {
    try {
        const { incidentId } = req.query;
        const evidence = await prismaClient_1.default.evidence.findMany({
            where: {
                uploaderId: req.user.userId,
                ...(incidentId ? { incidentId } : {}),
            },
            include: { uploader: { select: { id: true, name: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.json(evidence);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /evidence/:id
router.get("/:id", async (req, res) => {
    try {
        const evidence = await prismaClient_1.default.evidence.findUnique({
            where: { id: req.params.id },
            include: { uploader: { select: { id: true, name: true } } },
        });
        if (!evidence) {
            res.status(404).json({ error: "Evidence not found" });
            return;
        }
        await (0, audit_1.logAudit)(req.user.userId, "VIEW_EVIDENCE", "evidence", evidence.id);
        res.json(evidence);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /evidence/upload
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }
        const { description, incidentId, takenAt } = req.body;
        const fileHash = await (0, hash_1.hashFile)(req.file.path);
        const custodyEntry = {
            timestamp: new Date().toISOString(),
            action: "UPLOADED",
            actor: req.user.email,
            hash: fileHash,
        };
        const evidence = await prismaClient_1.default.evidence.create({
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
                uploaderId: req.user.userId,
                incidentId: incidentId || undefined,
            },
        });
        await (0, audit_1.logAudit)(req.user.userId, "UPLOAD_EVIDENCE", "evidence", evidence.id, { filename: req.file.originalname });
        res.status(201).json(evidence);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /evidence/:id/file — serve the actual file
router.get("/:id/file", async (req, res) => {
    try {
        const evidence = await prismaClient_1.default.evidence.findUnique({ where: { id: req.params.id } });
        if (!evidence) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        await (0, audit_1.logAudit)(req.user.userId, "DOWNLOAD_EVIDENCE", "evidence", evidence.id);
        res.setHeader("Content-Type", evidence.mimeType);
        res.setHeader("Content-Disposition", `inline; filename="${evidence.originalName}"`);
        res.sendFile(path_1.default.resolve(evidence.storagePath));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// DELETE /evidence/:id
router.delete("/:id", async (req, res) => {
    try {
        const evidence = await prismaClient_1.default.evidence.findUnique({ where: { id: req.params.id } });
        if (!evidence) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        if (evidence.uploaderId !== req.user.userId && req.user.role !== "ADMIN") {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        // Add deletion entry to chain of custody before deleting
        await (0, audit_1.logAudit)(req.user.userId, "DELETE_EVIDENCE", "evidence", evidence.id);
        if (fs_1.default.existsSync(evidence.storagePath))
            fs_1.default.unlinkSync(evidence.storagePath);
        await prismaClient_1.default.evidence.delete({ where: { id: req.params.id } });
        res.status(204).end();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
