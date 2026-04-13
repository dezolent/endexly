import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { BarChart3, Bot, Globe, Search } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Professional Websites",
    description:
      "Launch beautiful, fast websites on custom domains with zero infrastructure management. We handle hosting, SSL, and deployments.",
  },
  {
    icon: Search,
    title: "SEO Tools",
    description:
      "Built-in SEO tooling to help your sites rank. Meta management, sitemaps, structured data, and performance insights included.",
  },
  {
    icon: Bot,
    title: "AI Chatbot",
    description:
      "Engage visitors instantly with an AI-powered chatbot trained on your content — no configuration required.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Understand your audience with privacy-respecting analytics. Track traffic, conversions, and engagement across all your sites.",
  },
];

export default async function MarketingPage() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <>
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Endexly
          </h1>
          <p className="mt-4 text-2xl font-medium text-primary">
            Managed websites, built for growth.
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-xl mx-auto">
            The all-in-one platform for launching and scaling professional
            websites. SEO tools, AI chatbots, and analytics — all in one place.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {isSignedIn ? (
              <Link
                href="/admin"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Go to Admin Panel
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign In
              </Link>
            )}
            <a
              href="#features"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-8 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-border bg-muted/30 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Everything your website needs
            </h2>
            <p className="mt-3 text-muted-foreground">
              One platform. Every tool you need to build, launch, and grow.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-border bg-background p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Endexly. All rights reserved.
        </div>
      </footer>
    </>
  );
}
