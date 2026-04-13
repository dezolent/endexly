import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import type { NewOrganization, Organization } from "@/lib/db/schema";
import { eq, ilike, desc, sql } from "drizzle-orm";

export const organizationRepo = {
  async findAll(opts?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Organization[]; total: number }> {
    const limit = opts?.limit ?? 50;
    const offset = opts?.offset ?? 0;

    const conditions = opts?.search
      ? ilike(organizations.name, `%${opts.search}%`)
      : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(organizations)
        .where(conditions)
        .orderBy(desc(organizations.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(organizations)
        .where(conditions),
    ]);

    return { data, total: countResult[0]?.count ?? 0 };
  },

  async findById(id: string): Promise<Organization | null> {
    const result = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async findBySlug(slug: string): Promise<Organization | null> {
    const result = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    return result[0] ?? null;
  },

  async create(data: NewOrganization): Promise<Organization> {
    const result = await db.insert(organizations).values(data).returning();
    return result[0];
  },

  async update(
    id: string,
    data: Partial<NewOrganization>
  ): Promise<Organization> {
    const result = await db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return result[0];
  },
};
