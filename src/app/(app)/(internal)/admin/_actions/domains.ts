"use server";

import { revalidatePath } from "next/cache";
import { domainService } from "@/lib/services/sites";
import { requireString, optionalBoolean } from "@/lib/validators/form-data";

export async function listDomains(siteId?: string) {
  try {
    const data = await domainService.list({ siteId });
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to list domains" };
  }
}

export async function createDomain(formData: FormData) {
  try {
    const siteId = requireString(formData, "siteId");

    const data = await domainService.create({
      siteId,
      hostname: requireString(formData, "hostname"),
      isPrimary: optionalBoolean(formData, "isPrimary"),
    });
    revalidatePath("/(internal)/admin/sites");
    revalidatePath(`/(internal)/admin/sites/${siteId}`);
    revalidatePath("/(internal)/admin/domains");
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to create domain" };
  }
}
