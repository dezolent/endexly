import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────

export const orgStatusEnum = pgEnum("org_status", [
  "active",
  "suspended",
  "archived",
]);

export const memberRoleEnum = pgEnum("member_role", [
  "platform_admin",
  "org_owner",
  "org_admin",
  "org_member",
]);

export const memberStatusEnum = pgEnum("member_status", [
  "active",
  "invited",
  "disabled",
]);

export const siteStatusEnum = pgEnum("site_status", [
  "active",
  "paused",
  "archived",
]);

export const platformModeEnum = pgEnum("platform_mode", [
  "managed",
  "self_service",
]);

export const envCodeEnum = pgEnum("env_code", [
  "production",
  "staging",
  "preview",
]);

export const envStatusEnum = pgEnum("env_status", [
  "active",
  "building",
  "inactive",
]);

export const dnsStatusEnum = pgEnum("dns_status", [
  "pending",
  "verified",
  "failed",
]);

export const tlsStatusEnum = pgEnum("tls_status", [
  "pending",
  "provisioning",
  "active",
  "failed",
]);

export const actorTypeEnum = pgEnum("actor_type", [
  "user",
  "system",
  "api_key",
]);

// ─── Organizations ───────────────────────────────────────

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: varchar("clerk_org_id", { length: 255 }),
    slug: varchar("slug", { length: 100 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    status: orgStatusEnum("status").notNull().default("active"),
    planCode: varchar("plan_code", { length: 50 }).default("free"),
    timezone: varchar("timezone", { length: 100 }).default("UTC"),
    region: varchar("region", { length: 50 }).default("us-east-1"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("organizations_slug_idx").on(t.slug),
    // Partial unique index: only enforce uniqueness on non-null clerkOrgId values.
    // Drizzle doesn't support partial indexes natively — enforce via application layer
    // and add a raw SQL partial index in a migration when Clerk Orgs are wired.
    index("organizations_clerk_org_id_idx").on(t.clerkOrgId),
  ]
);

// ─── Memberships ─────────────────────────────────────────

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    roleCode: memberRoleEnum("role_code").notNull().default("org_member"),
    status: memberStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("memberships_clerk_user_id_idx").on(t.clerkUserId),
    index("memberships_org_id_idx").on(t.organizationId),
    uniqueIndex("memberships_org_user_idx").on(
      t.organizationId,
      t.clerkUserId
    ),
  ]
);

// ─── Sites ───────────────────────────────────────────────

export const sites = pgTable(
  "sites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    status: siteStatusEnum("status").notNull().default("active"),
    platformMode: platformModeEnum("platform_mode")
      .notNull()
      .default("managed"),
    primaryDomain: varchar("primary_domain", { length: 255 }),
    config: jsonb("config").default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("sites_slug_org_idx").on(t.organizationId, t.slug),
    index("sites_org_id_idx").on(t.organizationId),
    index("sites_status_idx").on(t.status),
  ]
);

// ─── Site Environments ───────────────────────────────────

export const siteEnvironments = pgTable(
  "site_environments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    envCode: envCodeEnum("env_code").notNull().default("production"),
    status: envStatusEnum("status").notNull().default("active"),
    previewUrl: varchar("preview_url", { length: 500 }),
    runtimeRef: varchar("runtime_ref", { length: 255 }),
    config: jsonb("config").default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("site_envs_site_env_idx").on(t.siteId, t.envCode),
    index("site_envs_site_id_idx").on(t.siteId),
  ]
);

// ─── Domains ─────────────────────────────────────────────

export const domains = pgTable(
  "domains",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    hostname: varchar("hostname", { length: 255 }).notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    dnsStatus: dnsStatusEnum("dns_status").notNull().default("pending"),
    tlsStatus: tlsStatusEnum("tls_status").notNull().default("pending"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("domains_hostname_idx").on(t.hostname),
    index("domains_site_id_idx").on(t.siteId),
    index("domains_dns_status_idx").on(t.dnsStatus),
  ]
);

// ─── Site Settings ───────────────────────────────────────

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id")
    .notNull()
    .unique()
    .references(() => sites.id, { onDelete: "cascade" }),
  brandName: varchar("brand_name", { length: 255 }),
  primaryColor: varchar("primary_color", { length: 7 }).default("#2563eb"),
  logoUrl: varchar("logo_url", { length: 500 }),
  defaultTitle: varchar("default_title", { length: 255 }),
  defaultDescription: text("default_description"),
  homepageHeading: varchar("homepage_heading", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Audit Events ────────────────────────────────────────

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    actorType: actorTypeEnum("actor_type").notNull().default("user"),
    actorId: varchar("actor_id", { length: 255 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    resourceType: varchar("resource_type", { length: 100 }).notNull(),
    resourceId: varchar("resource_id", { length: 255 }).notNull(),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_events_org_id_idx").on(t.organizationId),
    index("audit_events_action_idx").on(t.action),
    index("audit_events_resource_idx").on(t.resourceType, t.resourceId),
    index("audit_events_created_at_idx").on(t.createdAt),
  ]
);

// ─── Relations ───────────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  sites: many(sites),
  auditEvents: many(auditEvents),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
}));

export const sitesRelations = relations(sites, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [sites.organizationId],
    references: [organizations.id],
  }),
  environments: many(siteEnvironments),
  domains: many(domains),
  settings: one(siteSettings),
}));

export const siteEnvironmentsRelations = relations(
  siteEnvironments,
  ({ one }) => ({
    site: one(sites, {
      fields: [siteEnvironments.siteId],
      references: [sites.id],
    }),
  })
);

export const domainsRelations = relations(domains, ({ one }) => ({
  site: one(sites, {
    fields: [domains.siteId],
    references: [sites.id],
  }),
}));

export const siteSettingsRelations = relations(siteSettings, ({ one }) => ({
  site: one(sites, {
    fields: [siteSettings.siteId],
    references: [sites.id],
  }),
}));

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditEvents.organizationId],
    references: [organizations.id],
  }),
}));

// ─── Type Exports ────────────────────────────────────────

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type SiteEnvironment = typeof siteEnvironments.$inferSelect;
export type NewSiteEnvironment = typeof siteEnvironments.$inferInsert;
export type Domain = typeof domains.$inferSelect;
export type NewDomain = typeof domains.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;
