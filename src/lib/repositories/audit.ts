import { db } from "@/lib/db";
import { auditEvents, organizations } from "@/lib/db/schema";
import type { AuditEvent } from "@/lib/db/schema";
import { desc, sql, eq } from "drizzle-orm";

export const auditRepo = {
  async findAll(opts?: {
    limit?: number;
    offset?: number;
  }): Promise<{
    data: (AuditEvent & { organizationName: string | null })[];
    total: number;
  }> {
    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;

    const [data, countResult] = await Promise.all([
      db
        .select({
          id: auditEvents.id,
          organizationId: auditEvents.organizationId,
          actorType: auditEvents.actorType,
          actorId: auditEvents.actorId,
          action: auditEvents.action,
          resourceType: auditEvents.resourceType,
          resourceId: auditEvents.resourceId,
          metadata: auditEvents.metadata,
          createdAt: auditEvents.createdAt,
          organizationName: organizations.name,
        })
        .from(auditEvents)
        .leftJoin(
          organizations,
          eq(auditEvents.organizationId, organizations.id)
        )
        .orderBy(desc(auditEvents.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditEvents),
    ]);

    return { data, total: countResult[0]?.count ?? 0 };
  },
};
