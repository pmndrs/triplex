/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@triplex/lib"],
  // esbuild ships platform-specific binary packages whose folders contain a
  // README.md that Turbopack tries to parse as a module. Keep it out of the
  // bundle and let Node resolve it at runtime.
  serverExternalPackages: ["esbuild"],
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
