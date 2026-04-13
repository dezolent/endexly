"use client";

import { useState } from "react";
import { Button } from "@/components/shared";
import { AddDomainForm } from "@/components/admin/add-domain-form";

interface InlineAddDomainProps {
  siteId: string;
}

export function InlineAddDomain({ siteId }: InlineAddDomainProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        + Add Domain
      </Button>
    );
  }

  return (
    <AddDomainForm
      siteId={siteId}
      onSuccess={() => setOpen(false)}
      onCancel={() => setOpen(false)}
    />
  );
}
