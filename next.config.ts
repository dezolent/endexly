import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to accept requests from *.endexly.localhost subdomains.
  allowedDevOrigins: ["*.endexly.localhost"],
  // Silence the sass @import deprecation warnings from Payload's SCSS.
  // Payload's app.scss uses the legacy @import syntax; without this,
  // sass 1.80+ throws "import deprecation" errors that break CMS styling.
  sassOptions: {
    silenceDeprecations: ["import", "legacy-js-api"],
  },
};

export default withPayload(nextConfig);
