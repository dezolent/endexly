"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@/components/shared";
import { createSite } from "@/app/(internal)/admin/_actions/sites";
import { slugify } from "@/lib/utils";

interface Organization {
  id: string;
  name: string;
}

interface CreateSiteFormProps {
  organizations: Organization[];
  defaultOrgId?: string;
}

const PLATFORM_MODE_OPTIONS = [
  { value: "managed", label: "Managed" },
  { value: "self_service", label: "Self Service" },
];

export function CreateSiteForm({
  organizations,
  defaultOrgId,
}: CreateSiteFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [slugValue, setSlugValue] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const orgOptions = organizations.map((org) => ({
    value: org.id,
    label: org.name,
  }));

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

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createSite(formData);

      if (!result.success) {
        setError(result.error ?? "Failed to create site");
        return;
      }

      if (result.data) {
        router.push(`/admin/sites/${result.data.id}`);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Select
        name="organizationId"
        label="Organization"
        options={orgOptions}
        placeholder="Select an organization"
        defaultValue={defaultOrgId ?? ""}
        required
      />

      <Input
        name="name"
        label="Name"
        placeholder="My Site"
        required
        onChange={handleNameChange}
        autoComplete="off"
      />

      <Input
        name="slug"
        label="Slug"
        placeholder="my-site"
        required
        value={slugValue}
        onChange={handleSlugChange}
        hint="Used in URLs. Only lowercase letters, numbers, and hyphens."
        autoComplete="off"
      />

      <Select
        name="platformMode"
        label="Platform Mode"
        options={PLATFORM_MODE_OPTIONS}
        defaultValue="managed"
        required
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" loading={isPending}>
          Create Site
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
