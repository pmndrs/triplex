/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = dirname(here);
const distDir = join(pkgRoot, "dist");
mkdirSync(distDir, { recursive: true });

const outfile = join(distDir, "runtime.mjs");

const result = await build({
  alias: {
    "@httptoolkit/httpolyglot": join(pkgRoot, "src/httpolyglot-shim.mjs"),
  },
  banner: {
    js: [
      'import { createRequire as __triplexCreateRequire } from "node:module";',
      'import { fileURLToPath as __triplexFileURLToPath } from "node:url";',
      'import { dirname as __triplexDirname } from "node:path";',
      "const require = __triplexCreateRequire(import.meta.url);",
      "const __filename = __triplexFileURLToPath(import.meta.url);",
      "const __dirname = __triplexDirname(__filename);",
    ].join("\n"),
  },
  bundle: true,
  entryPoints: [join(pkgRoot, "src/cloud-runtime.ts")],
  external: [
    "@babel/core",
    "@babel/plugin-syntax-jsx",
    "@babel/plugin-transform-react-jsx",
    "@babel/preset-react",
    "@babel/preset-typescript",
    "@swc/core",
    "@triplex/bridge",
    "@triplex/bridge/client",
    "@triplex/bridge/host",
    "@triplex/lib",
    "@triplex/lib/fg",
    "@triplex/lib/loader",
    "@triplex/lib/path",
    "@triplex/lib/types",
    "@vitejs/plugin-react",
    "esbuild",
    "fsevents",
    "lightningcss",
    "rollup",
    "vite",
  ],
  format: "esm",
  loader: { ".node": "copy" },
  logLevel: "warning",
  metafile: true,
  minify: process.env.MINIFY !== "false",
  outfile,
  platform: "node",
  target: "node20",
});

writeFileSync(
  join(distDir, "package.json"),
  JSON.stringify({ name: "@triplex/runtime", type: "module" }, null, 2),
);

const bytes = Object.values(result.metafile.outputs).reduce(
  (a, o) => a + o.bytes,
  0,
);
console.log(`[runtime-bundle] wrote ${outfile} (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
