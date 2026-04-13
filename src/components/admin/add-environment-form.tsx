"use client";

import { useState, useTransition } from "react";
import { Button, Select } from "@/components/shared";
import { createEnvironment } from "@/app/(app)/(internal)/admin/_actions/environments";

interface AddEnvironmentFormProps {
  siteId: string;
  existingEnvCodes?: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ALL_ENV_CODES = [
  { value: "production", label: "Production" },
  { value: "staging", label: "Staging" },
  { value: "preview", label: "Preview" },
];

export function AddEnvironmentForm({
  siteId,
  existingEnvCodes = [],
  onSuccess,
  onCancel,
}: AddEnvironmentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableOptions = ALL_ENV_CODES.filter(
    (opt) => !existingEnvCodes.includes(opt.value)
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("siteId", siteId);

    startTransition(async () => {
      const result = await createEnvironment(formData);

      if (!result.success) {
        setError(result.error ?? "Failed to add environment");
        return;
      }

      form.reset();
      onSuccess?.();
    });
  }

  if (availableOptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground pt-2">
        All environment types have already been created for this site.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
      <Select
        name="envCode"
        label="Environment"
        options={availableOptions}
        placeholder="Select environment type"
        required
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" loading={isPending}>
          Add Environment
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
