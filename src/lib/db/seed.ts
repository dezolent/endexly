import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  organizations,
  memberships,
  sites,
  siteEnvironments,
  domains,
  siteSettings,
} from "./schema";

async function seed() {
  // Seed uses the direct connection — same reason as migrations.
  const connectionString =
    process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_DATABASE_URL or DATABASE_URL is required");
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  console.log("Seeding database...\n");

  // 1. Create platform admin membership (no org)
  const ADMIN_CLERK_USER_ID =
    process.env.SEED_ADMIN_CLERK_USER_ID || "user_placeholder_admin";

  const [adminMembership] = await db
    .insert(memberships)
    .values({
      organizationId: null,
      clerkUserId: ADMIN_CLERK_USER_ID,
      roleCode: "platform_admin",
      status: "active",
    })
    .returning();
  console.log("Created platform admin membership:", adminMembership.id);

  // 2. Create sample organization
  const [org] = await db
    .insert(organizations)
    .values({
      name: "Acme Corp",
      slug: "acme-corp",
      status: "active",
      planCode: "pro",
      timezone: "America/New_York",
      region: "us-east-1",
    })
    .returning();
  console.log("Created organization:", org.name, org.id);

  // 3. Create sample site
  const [site] = await db
    .insert(sites)
    .values({
      organizationId: org.id,
      name: "Acme Website",
      slug: "acme-website",
      status: "active",
      platformMode: "managed",
      primaryDomain: "acme-corp.endexly.localhost:3000",
    })
    .returning();
  console.log("Created site:", site.name, site.id);

  // 4. Create production environment
  const [env] = await db
    .insert(siteEnvironments)
    .values({
      siteId: site.id,
      envCode: "production",
      status: "active",
    })
    .returning();
  console.log("Created environment:", env.envCode, env.id);

  // 5. Create subdomain record
  const [domain] = await db
    .insert(domains)
    .values({
      siteId: site.id,
      hostname: "acme-corp.endexly.localhost:3000",
      isPrimary: true,
      dnsStatus: "verified",
      tlsStatus: "active",
    })
    .returning();
  console.log("Created domain:", domain.hostname, domain.id);

  // 6. Create site settings
  const [settings] = await db
    .insert(siteSettings)
    .values({
      siteId: site.id,
      brandName: "Acme Corp",
      primaryColor: "#7c3aed",
      defaultTitle: "Acme Corp — Building the Future",
      defaultDescription:
        "Acme Corp provides innovative solutions for modern businesses. Contact us to learn more.",
      homepageHeading: "Building the Future, One Solution at a Time",
    })
    .returning();
  console.log("Created site settings:", settings.id);

  console.log("\n--- Seed complete! ---");
  console.log("\nTo test tenant routing locally:");
  console.log("  http://acme-corp.endexly.localhost:3000");
  console.log("\nTo access admin:");
  console.log("  http://app.endexly.localhost:3000/admin");
  console.log(
    `\nMake sure your Clerk user ID matches: ${ADMIN_CLERK_USER_ID}`
  );

  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
