"use server";

import { auditRepo } from "@/lib/repositories/audit";
import { requirePlatformAdmin } from "@/lib/auth/rbac";

export async function listAuditEvents(opts?: { limit?: number; offset?: number }) {
  try {
    await requirePlatformAdmin();
    const data = await auditRepo.findAll(opts);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to list audit events" };
  }
}
