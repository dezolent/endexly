import { db } from "@/lib/db";
import { memberships } from "@/lib/db/schema";
import type { Membership, NewMembership } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const membershipRepo = {
  async findByClerkUserId(clerkUserId: string): Promise<Membership[]> {
    return db
      .select()
      .from(memberships)
      .where(eq(memberships.clerkUserId, clerkUserId));
  },

  async findPlatformAdmin(clerkUserId: string): Promise<Membership | null> {
    const result = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.clerkUserId, clerkUserId),
          eq(memberships.roleCode, "platform_admin"),
          eq(memberships.status, "active")
        )
      )
      .limit(1);
    return result[0] ?? null;
  },

  async create(data: NewMembership): Promise<Membership> {
    const result = await db.insert(memberships).values(data).returning();
    return result[0];
  },
};
