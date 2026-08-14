"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const auth_1 = require("../middleware/auth");
const audit_1 = require("../services/audit");
const router = (0, express_1.Router)();
// Create shared link (auth required)
router.post("/", auth_1.authenticate, async (req, res) => {
    try {
        const { evidenceId, expiresAt, maxViews } = req.body;
        if (!evidenceId) {
            res.status(400).json({ error: "evidenceId is required" });
            return;
        }
        const link = await prismaClient_1.default.sharedLink.create({
            data: {
                evidenceId,
                createdById: req.user.userId,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                maxViews: maxViews ?? undefined,
            },
        });
        await (0, audit_1.logAudit)(req.user.userId, "CREATE_SHARED_LINK", "sharedLink", link.id);
        res.status(201).json(link);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Revoke shared link
router.delete("/:id", auth_1.authenticate, async (req, res) => {
    try {
        await prismaClient_1.default.sharedLink.update({ where: { id: req.params.id }, data: { isRevoked: true } });
        await (0, audit_1.logAudit)(req.user.userId, "REVOKE_SHARED_LINK", "sharedLink", req.params.id);
        res.status(204).end();
    }
    catch (err) {
        if (err?.code === "P2025") {
            res.status(404).json({ error: "Not found" });
            return;
        }
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Access shared link (no auth)
router.get("/access/:token", async (req, res) => {
    try {
        const link = await prismaClient_1.default.sharedLink.findUnique({
            where: { token: req.params.token },
            include: { evidence: true },
        });
        if (!link || link.isRevoked) {
            res.status(404).json({ error: "Link not found or revoked" });
            return;
        }
        if (link.expiresAt && link.expiresAt < new Date()) {
            res.status(410).json({ error: "Link expired" });
            return;
        }
        if (link.maxViews && link.viewCount >= link.maxViews) {
            res.status(410).json({ error: "Max views reached" });
            return;
        }
        await prismaClient_1.default.sharedLink.update({ where: { id: link.id }, data: { viewCount: { increment: 1 } } });
        res.json({ evidence: link.evidence, viewCount: link.viewCount + 1 });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
