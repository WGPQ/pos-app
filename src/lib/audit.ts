import { Prisma, PrismaClient } from "@prisma/client";

type AuditClient = PrismaClient | Prisma.TransactionClient;

export type AuditEvent = {
  businessId?: number | null;
  branchId?: number | null;
  actorUserId?: number | null;
  actorMembershipId?: number | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  metadata?: Prisma.InputJsonValue;
};

/** Writes an append-only application audit event. Never pass credentials or tokens. */
export async function writeAuditLog(client: AuditClient, event: AuditEvent) {
  return client.auditLog.create({
    data: {
      businessId: event.businessId ?? null,
      branchId: event.branchId ?? null,
      actorUserId: event.actorUserId ?? null,
      actorMembershipId: event.actorMembershipId ?? null,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId == null ? null : String(event.entityId),
      metadata: event.metadata,
    },
  });
}
