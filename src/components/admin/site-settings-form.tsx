"use client";

import { useState, useTransition } from "react";
import { Button, Input } from "@/components/shared";
import { updateSiteSettings } from "@/app/(app)/(internal)/admin/_actions/site-settings";
import { cn } from "@/lib/utils";

interface SiteSettingsData {
  siteId: string;
  brandName?: string | null;
  primaryColor?: string | null;
  logoUrl?: string | null;
  defaultTitle?: string | null;
  defaultDescription?: string | null;
  homepageHeading?: string | null;
}

interface SiteSettingsFormProps {
  settings: SiteSettingsData;
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await updateSiteSettings(formData);

      if (!result.success) {
        setError(result.error ?? "Failed to update settings");
        return;
      }

      setSuccess(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input type="hidden" name="siteId" value={settings.siteId} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          name="brandName"
          label="Brand Name"
          placeholder="Acme Inc."
          defaultValue={settings.brandName ?? ""}
          autoComplete="off"
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="primaryColor"
            className="text-sm font-medium text-foreground"
          >
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="primaryColor"
              name="primaryColor"
              defaultValue={settings.primaryColor ?? "#2563eb"}
              className={cn(
                "h-9 w-14 cursor-pointer rounded-md border border-border bg-background p-1",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              )}
            />
            <span className="text-xs text-muted-foreground">
              {settings.primaryColor ?? "#2563eb"}
            </span>
          </div>
        </div>
      </div>

      <Input
        name="logoUrl"
        label="Logo URL"
        placeholder="https://example.com/logo.png"
        defaultValue={settings.logoUrl ?? ""}
        type="url"
        autoComplete="off"
      />

      <Input
        name="defaultTitle"
        label="Default Title"
        placeholder="My Site"
        defaultValue={settings.defaultTitle ?? ""}
        autoComplete="off"
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="defaultDescription"
          className="text-sm font-medium text-foreground"
        >
          Default Description
        </label>
        <textarea
          id="defaultDescription"
          name="defaultDescription"
          placeholder="A short description of your site."
          defaultValue={settings.defaultDescription ?? ""}
          rows={3}
          className={cn(
            "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
            "placeholder:text-muted-foreground resize-none",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </div>

      <Input
        name="homepageHeading"
        label="Homepage Heading"
        placeholder="Welcome to our platform"
        defaultValue={settings.homepageHeading ?? ""}
        autoComplete="off"
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {success && (
        <p className="text-sm text-success">Settings saved successfully.</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" loading={isPending}>
          Save Settings
        </Button>
      </div>
    </form>
  );
}
