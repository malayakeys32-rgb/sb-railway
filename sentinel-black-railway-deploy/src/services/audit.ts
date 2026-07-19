import prisma from "../prismaClient";

export async function logAudit(
  userId: string,
  action: string,
  resource: string,
  resourceId: string | null,
  metadata?: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        metadata: metadata || {},
        ipAddress,
      },
    });
  } catch (err) {
    console.error("Failed to log audit event:", err);
  }
}

export default { logAudit };

