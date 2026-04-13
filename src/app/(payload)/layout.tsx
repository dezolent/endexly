import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import config from "@payload-config";
import { importMap } from "./cms/importMap.js";
import React from "react";
import "@payloadcms/ui/scss/app.scss";

type Args = {
  children: React.ReactNode;
};

const serverFunction = async function (args: {
  name: string;
  args: Record<string, unknown>;
}) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default async function PayloadRootLayout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
