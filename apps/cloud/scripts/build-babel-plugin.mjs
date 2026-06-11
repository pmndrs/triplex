/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// Bundles the @triplex/client Babel plugin into a single standalone CJS file
// that the folder-spike scaffold drops into the WebContainer so vite.config
// can `require()` it. Externalizes @babel/* (resolved at runtime from the WC
// node_modules via @vitejs/plugin-react's transitive dep on @babel/core).
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const entry = resolve(
  root,
  "../../packages/@triplex/client/src/plugins/babel-plugin.ts",
);
const outfile = resolve(root, "public/triplex-babel-plugin.cjs");

const result = await build({
  bundle: true,
  entryPoints: [entry],
  external: ["@babel/core", "@babel/types"],
  footer: {
    // Unwrap esbuild's namespace export so require() returns the plugin
    // factory directly. Also tolerate being called with no options
    // object — @vitejs/plugin-react's react-refresh pass appears to
    // invoke registered plugins without forwarding our options on at
    // least one pass, so defaults prevent a TypeError.
    js: [
      "var __triplexInner = module.exports.default || module.exports;",
      "module.exports = function (opts) {",
      "  var o = opts || {};",
      "  if (!o.exclude) o.exclude = ['node_modules'];",
      "  return __triplexInner(o);",
      "};",
    ].join("\n"),
  },
  format: "cjs",
  loader: { ".ts": "ts" },
  outfile,
  platform: "node",
  target: "node20",
});

console.log(
  `built ${outfile} (${result.warnings.length} warnings, ${result.errors.length} errors)`,
);
for (const w of result.warnings) console.warn(w.text);
for (const e of result.errors) console.error(e.text);
