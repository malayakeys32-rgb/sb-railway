"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
const prismaClient_1 = __importDefault(require("../prismaClient"));
async function logAudit(userId, action, resource, resourceId, metadata, ipAddress) {
    try {
        await prismaClient_1.default.auditLog.create({
            data: {
                userId,
                action,
                resource,
                resourceId,
                metadata: metadata || {},
                ipAddress,
            },
        });
    }
    catch (err) {
        console.error("Failed to log audit event:", err);
    }
}
exports.default = { logAudit };
