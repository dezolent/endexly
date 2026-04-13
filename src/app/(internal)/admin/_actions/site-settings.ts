"use server";

import { revalidatePath } from "next/cache";
import { siteSettingsService } from "@/lib/services/sites";
import { requireString, optionalString } from "@/lib/validators/form-data";

export async function getSiteSettings(siteId: string) {
  try {
    const data = await siteSettingsService.getBySiteId(siteId);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to get site settings" };
  }
}

export async function updateSiteSettings(formData: FormData) {
  try {
    const siteId = requireString(formData, "siteId");

    const data = await siteSettingsService.update({
      siteId,
      brandName: optionalString(formData, "brandName"),
      primaryColor: optionalString(formData, "primaryColor"),
      logoUrl: optionalString(formData, "logoUrl"),
      defaultTitle: optionalString(formData, "defaultTitle"),
      defaultDescription: optionalString(formData, "defaultDescription"),
      homepageHeading: optionalString(formData, "homepageHeading"),
    });
    revalidatePath("/(internal)/admin/sites");
    revalidatePath(`/(internal)/admin/sites/${siteId}`);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to update site settings" };
  }
}
