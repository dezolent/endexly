"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/app/(internal)/admin/_actions/organizations";
import { Button, Input } from "@/components/shared";
import { slugify } from "@/lib/utils";

export function CreateOrganizationForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [slugValue, setSlugValue] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) {
      setSlugValue(slugify(e.target.value));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugTouched(true);
    setSlugValue(e.target.value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createOrganization(formData);

      if (!result.success) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      const orgId = (result.data as { id: string } | undefined)?.id;
      if (orgId) {
        router.push(`/admin/organizations/${orgId}`);
      } else {
        router.push("/admin/organizations");
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Input
        label="Organization Name"
        name="name"
        placeholder="Acme Corp"
        required
        disabled={isPending}
        onChange={handleNameChange}
        hint="The display name for this organization."
      />

      <Input
        label="Slug"
        name="slug"
        placeholder="acme-corp"
        required
        disabled={isPending}
        value={slugValue}
        onChange={handleSlugChange}
        hint="Unique URL-safe identifier. Auto-generated from name."
        pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
        title="Lowercase letters, numbers, and hyphens only."
      />

      <Input
        label="Timezone"
        name="timezone"
        placeholder="UTC"
        defaultValue="UTC"
        disabled={isPending}
        hint="IANA timezone identifier, e.g. America/New_York."
      />

      <Input
        label="Region"
        name="region"
        placeholder="us-east-1"
        defaultValue="us-east-1"
        disabled={isPending}
        hint="Deployment region for this organization's resources."
      />

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" loading={isPending} disabled={isPending}>
          {isPending ? "Creating…" : "Create Organization"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
