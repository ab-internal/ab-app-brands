import type { NextConfig } from "next";

import { readFileSync } from "fs";
import { join } from "path";

const packageJson = JSON.parse(
  readFileSync(join(__dirname, "package.json"), "utf8")
);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  basePath    : process.env.NEXT_BASE_PATH ?? "",
  assetPrefix : process.env.NEXT_ASSET_PREFIX ?? "",
  images      : {
    unoptimized: true,
  },
  output      : process.env.NEXT_STATIC_OUTPUT === "true" ? "export" : "standalone",
};

export default nextConfig;
