"use server";

import { revalidatePath } from "next/cache";
import { organizationService } from "@/lib/services/organizations";
import { requireString, optionalString } from "@/lib/validators/form-data";

const REVALIDATE_PATH = "/(internal)/admin/organizations";

export async function listOrganizations(search?: string) {
  try {
    const data = await organizationService.list({ search });
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to list organizations" };
  }
}

export async function getOrganization(id: string) {
  try {
    const data = await organizationService.getById(id);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to get organization" };
  }
}

export async function createOrganization(formData: FormData) {
  try {
    const data = await organizationService.create({
      name: requireString(formData, "name"),
      slug: requireString(formData, "slug"),
      timezone: optionalString(formData, "timezone") ?? "UTC",
      region: optionalString(formData, "region") ?? "us-east-1",
    });
    revalidatePath(REVALIDATE_PATH);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to create organization" };
  }
}

export async function updateOrganization(id: string, formData: FormData) {
  try {
    const input: Record<string, string> = {};
    const name = optionalString(formData, "name");
    const slug = optionalString(formData, "slug");
    const timezone = optionalString(formData, "timezone");
    const region = optionalString(formData, "region");
    const status = optionalString(formData, "status");
    const planCode = optionalString(formData, "planCode");

    if (name) input.name = name;
    if (slug) input.slug = slug;
    if (timezone) input.timezone = timezone;
    if (region) input.region = region;
    if (planCode) input.planCode = planCode;

    const data = await organizationService.update(id, {
      ...input,
      ...(status && { status: status as "active" | "suspended" | "archived" }),
    });
    revalidatePath(REVALIDATE_PATH);
    return { success: true as const, data };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "Failed to update organization" };
  }
}
