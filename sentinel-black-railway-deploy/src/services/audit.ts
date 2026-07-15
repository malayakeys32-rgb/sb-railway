import prisma from "../prismaClient";

export async function logAudit(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: object,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, resource, resourceId, metadata, ipAddress },
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}
