"use server";

import { revalidatePath } from "next/cache";
import { siteService } from "@/lib/services/sites";
import { requireString, optionalString } from "@/lib/validators/form-data";

const REVALIDATE_PATH = "/(internal)/admin/sites";

export async function listSites(organizationId?: string) {
  try {
    const data = await siteService.list({ organizationId });
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to list sites" };
  }
}

export async function getSite(id: string) {
  try {
    const data = await siteService.getById(id);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to get site" };
  }
}

export async function createSite(formData: FormData) {
  try {
    const platformModeRaw = optionalString(formData, "platformMode");
    const data = await siteService.create({
      organizationId: requireString(formData, "organizationId"),
      name: requireString(formData, "name"),
      slug: requireString(formData, "slug"),
      platformMode: platformModeRaw === "self_service" ? "self_service" : "managed",
    });
    revalidatePath(REVALIDATE_PATH);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to create site" };
  }
}

export async function updateSite(id: string, formData: FormData) {
  try {
    const name = optionalString(formData, "name");
    const slug = optionalString(formData, "slug");
    const status = optionalString(formData, "status");
    const platformMode = optionalString(formData, "platformMode");

    const data = await siteService.update(id, {
      ...(name && { name }),
      ...(slug && { slug }),
      ...(status && { status: status as "active" | "paused" | "archived" }),
      ...(platformMode && { platformMode: platformMode as "managed" | "self_service" }),
    });
    revalidatePath(REVALIDATE_PATH);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to update site" };
  }
}
