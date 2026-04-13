import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to accept requests from *.endexly.localhost subdomains.
  allowedDevOrigins: ["*.endexly.localhost"],
};

export default withPayload(nextConfig);
