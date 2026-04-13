CREATE TYPE "public"."actor_type" AS ENUM('user', 'system', 'api_key');--> statement-breakpoint
CREATE TYPE "public"."dns_status" AS ENUM('pending', 'verified', 'failed');--> statement-breakpoint
CREATE TYPE "public"."env_code" AS ENUM('production', 'staging', 'preview');--> statement-breakpoint
CREATE TYPE "public"."env_status" AS ENUM('active', 'building', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('platform_admin', 'org_owner', 'org_admin', 'org_member');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('active', 'invited', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."org_status" AS ENUM('active', 'suspended', 'archived');--> statement-breakpoint
CREATE TYPE "public"."platform_mode" AS ENUM('managed', 'self_service');--> statement-breakpoint
CREATE TYPE "public"."site_status" AS ENUM('active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."tls_status" AS ENUM('pending', 'provisioning', 'active', 'failed');--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"actor_type" "actor_type" DEFAULT 'user' NOT NULL,
	"actor_id" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" varchar(255) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"hostname" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"dns_status" "dns_status" DEFAULT 'pending' NOT NULL,
	"tls_status" "tls_status" DEFAULT 'pending' NOT NULL,
	"last_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"clerk_user_id" varchar(255) NOT NULL,
	"role_code" "member_role" DEFAULT 'org_member' NOT NULL,
	"status" "member_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" varchar(255),
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "org_status" DEFAULT 'active' NOT NULL,
	"plan_code" varchar(50) DEFAULT 'free',
	"timezone" varchar(100) DEFAULT 'UTC',
	"region" varchar(50) DEFAULT 'us-east-1',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_environments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"env_code" "env_code" DEFAULT 'production' NOT NULL,
	"status" "env_status" DEFAULT 'active' NOT NULL,
	"preview_url" varchar(500),
	"runtime_ref" varchar(255),
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"brand_name" varchar(255),
	"primary_color" varchar(7) DEFAULT '#2563eb',
	"logo_url" varchar(500),
	"default_title" varchar(255),
	"default_description" text,
	"homepage_heading" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_site_id_unique" UNIQUE("site_id")
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"status" "site_status" DEFAULT 'active' NOT NULL,
	"platform_mode" "platform_mode" DEFAULT 'managed' NOT NULL,
	"primary_domain" varchar(255),
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_environments" ADD CONSTRAINT "site_environments_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_org_id_idx" ON "audit_events" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "audit_events_action_idx" ON "audit_events" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_events_resource_idx" ON "audit_events" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_events_created_at_idx" ON "audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "domains_hostname_idx" ON "domains" USING btree ("hostname");--> statement-breakpoint
CREATE INDEX "domains_site_id_idx" ON "domains" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "domains_dns_status_idx" ON "domains" USING btree ("dns_status");--> statement-breakpoint
CREATE INDEX "memberships_clerk_user_id_idx" ON "memberships" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "memberships_org_id_idx" ON "memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_org_user_idx" ON "memberships" USING btree ("organization_id","clerk_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organizations_clerk_org_id_idx" ON "organizations" USING btree ("clerk_org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "site_envs_site_env_idx" ON "site_environments" USING btree ("site_id","env_code");--> statement-breakpoint
CREATE INDEX "site_envs_site_id_idx" ON "site_environments" USING btree ("site_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sites_slug_org_idx" ON "sites" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "sites_org_id_idx" ON "sites" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sites_status_idx" ON "sites" USING btree ("status");