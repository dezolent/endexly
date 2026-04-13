"use server";

import { revalidatePath } from "next/cache";
import { environmentService } from "@/lib/services/sites";
import { requireString } from "@/lib/validators/form-data";

export async function listEnvironments(siteId: string) {
  try {
    const data = await environmentService.listBySite(siteId);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to list environments" };
  }
}

export async function createEnvironment(formData: FormData) {
  try {
    const siteId = requireString(formData, "siteId");
    const envCodeRaw = requireString(formData, "envCode");

    // Validate envCode is one of the allowed values
    const validCodes = ["production", "staging", "preview"] as const;
    if (!validCodes.includes(envCodeRaw as typeof validCodes[number])) {
      throw new Error(`Invalid environment code: ${envCodeRaw}`);
    }

    const data = await environmentService.create({
      siteId,
      envCode: envCodeRaw as "production" | "staging" | "preview",
    });
    revalidatePath("/(internal)/admin/sites");
    revalidatePath(`/(internal)/admin/sites/${siteId}`);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to create environment" };
  }
}
