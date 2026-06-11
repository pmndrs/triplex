/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import type { FileSystemTree } from "@webcontainer/api";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  name?: string;
  scripts?: Record<string, string>;
  type?: string;
  [k: string]: unknown;
}

export interface ScaffoldResult {
  tree: FileSystemTree;
  triplexDeps: string[];
}

// Deps required for @triplex/runtime-bundle to boot inside WC. These are all
// regular npm packages (workspace @triplex/* are mounted separately via
// /api/pkg/[name] after npm install).
const RUNTIME_RUNTIME_DEPS: Record<string, string> = {
  "@babel/core": "^7.27.0",
  "@babel/preset-react": "^7.27.0",
  "@babel/preset-typescript": "^7.27.0",
  "@emotion/react": "^11.14.0",
  "@react-three/handle": "^6.6.16",
  "@statsig/js-client": "^3.17.2",
  "@statsig/js-local-overrides": "^3.17.2",
  "@vitejs/plugin-react": "^4.4.1",
  "bind-event-listener": "^3.0.0",
  debounce: "^2.2.0",
  esbuild: "^0.24.2",
  "raf-schd": "^4.0.3",
  "react-error-boundary": "^3.1.4",
  "suspend-react": "^0.1.3",
  tinycolor2: "^1.6.0",
  "triplex-drei": "npm:@react-three/drei@^10.0.0",
  "triplex-handle": "npm:@react-three/handle@^6.6.16",
  "tunnel-rat": "^0.1.2",
  "use-callback-ref": "^1.3.1",
  vite: "^6.0.7",
  "vite-plugin-glsl": "^1.4.1",
  "vite-tsconfig-paths": "^5.1.4",
  zustand: "^4.3.2",
};

// @triplex/* workspace packages the runtime-bundle expects mounted in
// node_modules after npm install. We don't list these as deps because
// they're not on the npm registry. Stored as full npm names (the page
// derives both the node_modules mount path and the /api/pkg/ URL from
// this).
export const REQUIRED_TRIPLEX_DEPS = [
  "@triplex/renderer",
  "@triplex/bridge",
  "@triplex/lib",
];

// Triplex's getConfig resolves paths via `join(cwd, ".triplex", file)`.
// That means paths in this config are relative to `.triplex/` itself, so
// `./src` would point at `.triplex/src` (wrong). Use `../src` to escape up
// to the project root before descending into src.
const DEFAULT_TRIPLEX_CONFIG = JSON.stringify(
  {
    $schema: "https://triplex.dev/config.schema.json",
    files: ["../src/**/*.tsx"],
    publicDir: "../public",
    renderer: "react-three-fiber",
  },
  null,
  2,
);

export function scaffold(
  userTree: FileSystemTree,
  pkgJsonText: string | null,
): ScaffoldResult {
  const tree: FileSystemTree = { ...userTree };

  let resolvedPkgText = pkgJsonText;
  if (!resolvedPkgText) {
    const entry = tree["package.json"];
    if (
      entry &&
      "file" in entry &&
      typeof entry.file.contents === "string"
    ) {
      resolvedPkgText = entry.file.contents;
    }
  }

  let pkg: PackageJson;
  try {
    pkg = resolvedPkgText ? (JSON.parse(resolvedPkgText) as PackageJson) : {};
  } catch {
    pkg = {};
  }
  pkg.name ??= "triplex-folder-spike-project";
  // Don't force ESM — user configs may be CJS.
  pkg.devDependencies = {
    ...(pkg.devDependencies ?? {}),
    ...RUNTIME_RUNTIME_DEPS,
  };

  // Strip workspace and @triplex/* deps from package.json (registry won't
  // resolve them; we mount the workspace ones into node_modules later).
  const strippedTriplex: string[] = [];
  for (const bucket of ["dependencies", "devDependencies"] as const) {
    const obj = pkg[bucket];
    if (!obj) continue;
    for (const key of Object.keys(obj)) {
      const v = obj[key];
      if (typeof v === "string" && v.startsWith("workspace:")) {
        delete obj[key];
      } else if (key.startsWith("@triplex/")) {
        strippedTriplex.push(key);
        delete obj[key];
      }
    }
  }
  const triplexDeps = Array.from(
    new Set([...strippedTriplex, ...REQUIRED_TRIPLEX_DEPS]),
  );

  tree["package.json"] = {
    file: { contents: JSON.stringify(pkg, null, 2) },
  };

  // Ensure a .triplex/config.json exists. If the user shipped one, leave it.
  let triplexDir = tree[".triplex"];
  if (!triplexDir || !("directory" in triplexDir)) {
    triplexDir = { directory: {} };
    tree[".triplex"] = triplexDir;
  }
  if (!("directory" in triplexDir) || !triplexDir.directory["config.json"]) {
    (triplexDir as { directory: FileSystemTree }).directory["config.json"] = {
      file: { contents: DEFAULT_TRIPLEX_CONFIG },
    };
  } else {
    // Patch renderer to react-three-fiber so the runtime resolves it via
    // npm package alias (the bundled getRendererMeta map). User-shipped
    // configs often point at a workspace path that doesn't exist in WC.
    const cfgNode = (triplexDir as { directory: FileSystemTree }).directory[
      "config.json"
    ];
    if (cfgNode && "file" in cfgNode && typeof cfgNode.file.contents === "string") {
      cfgNode.file.contents = cfgNode.file.contents.replace(
        /"renderer"\s*:\s*"[^"]+"/,
        '"renderer": "react-three-fiber"',
      );
    }
  }

  return { tree, triplexDeps };
}
