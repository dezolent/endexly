import { db } from "@/lib/db";
import { auditEvents } from "@/lib/db/schema";
import type { AuthContext } from "./rbac";

interface AuditLogParams {
  auth: AuthContext;
  organizationId?: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event. Fire-and-forget — will never throw.
 * Audit failures are logged to stderr but do not block the calling operation.
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(auditEvents).values({
      organizationId: params.organizationId ?? null,
      actorType: "user",
      actorId: params.auth.clerkUserId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    // Audit must never break the caller. Log for ops visibility.
    console.error("[audit] Failed to write audit event", {
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
