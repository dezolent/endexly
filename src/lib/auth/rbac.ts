import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { memberships } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export type RoleCode = "platform_admin" | "org_owner" | "org_admin" | "org_member";

export interface AuthContext {
  clerkUserId: string;
  roles: RoleCode[];
  isPlatformAdmin: boolean;
}

/**
 * Get the authenticated user's authorization context.
 * Queries local memberships table for role information.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const userMemberships = await db
    .select({ roleCode: memberships.roleCode })
    .from(memberships)
    .where(
      and(eq(memberships.clerkUserId, userId), eq(memberships.status, "active"))
    );

  const roles = userMemberships.map((m) => m.roleCode) as RoleCode[];
  const isPlatformAdmin = roles.includes("platform_admin");

  return { clerkUserId: userId, roles, isPlatformAdmin };
}

/**
 * Require platform_admin role. Throws if unauthorized.
 */
export async function requirePlatformAdmin(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) {
    throw new Error("Authentication required");
  }
  if (!ctx.isPlatformAdmin) {
    throw new Error("Platform admin access required");
  }
  return ctx;
}

/**
 * Require membership in a specific organization.
 */
export async function requireOrgAccess(
  organizationId: string,
  minRole?: RoleCode
): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) {
    throw new Error("Authentication required");
  }

  // Platform admins always have access
  if (ctx.isPlatformAdmin) return ctx;

  const orgMembership = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.clerkUserId, ctx.clerkUserId),
        eq(memberships.organizationId, organizationId),
        eq(memberships.status, "active")
      )
    )
    .limit(1);

  if (orgMembership.length === 0) {
    throw new Error("Organization access required");
  }

  if (minRole) {
    const hierarchy: RoleCode[] = [
      "platform_admin",
      "org_owner",
      "org_admin",
      "org_member",
    ];
    const requiredLevel = hierarchy.indexOf(minRole);
    const actualLevel = hierarchy.indexOf(
      orgMembership[0].roleCode as RoleCode
    );
    if (actualLevel > requiredLevel) {
      throw new Error(`Minimum role ${minRole} required`);
    }
  }

  return ctx;
}
