"use client";

import { useState, useTransition } from "react";
import { Button, Input } from "@/components/shared";
import { createDomain } from "@/app/(app)/(internal)/admin/_actions/domains";

interface AddDomainFormProps {
  siteId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddDomainForm({ siteId, onSuccess, onCancel }: AddDomainFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("siteId", siteId);

    startTransition(async () => {
      const result = await createDomain(formData);

      if (!result.success) {
        setError(result.error ?? "Failed to add domain");
        return;
      }

      form.reset();
      onSuccess?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      <Input
        name="hostname"
        label="Hostname"
        placeholder="example.com"
        required
        autoComplete="off"
        hint="Enter the full hostname (e.g. www.example.com)"
      />

      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
        <input
          type="checkbox"
          name="isPrimary"
          value="on"
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Set as primary domain
      </label>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" loading={isPending}>
          Add Domain
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
