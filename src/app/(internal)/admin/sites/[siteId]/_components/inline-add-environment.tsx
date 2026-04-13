"use client";

import { useState } from "react";
import { Button } from "@/components/shared";
import { AddEnvironmentForm } from "@/components/admin/add-environment-form";

interface InlineAddEnvironmentProps {
  siteId: string;
  existingEnvCodes: string[];
}

export function InlineAddEnvironment({
  siteId,
  existingEnvCodes,
}: InlineAddEnvironmentProps) {
  const [open, setOpen] = useState(false);

  const allCreated = ["production", "staging", "preview"].every((code) =>
    existingEnvCodes.includes(code)
  );

  if (allCreated) {
    return (
      <p className="text-sm text-muted-foreground">
        All environment types have been created.
      </p>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        + Add Environment
      </Button>
    );
  }

  return (
    <AddEnvironmentForm
      siteId={siteId}
      existingEnvCodes={existingEnvCodes}
      onSuccess={() => setOpen(false)}
      onCancel={() => setOpen(false)}
    />
  );
}
