/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, normalize, resolve } from "@triplex/lib/path";
import { array, object, optional, parse, string } from "valibot";
import {
  type ReconciledTriplexConfig,
  type SecretTriplexConfig,
  type TriplexConfig,
} from "../types";

const STATIC_ASSETS: string[] = ["glb", "gltf"];
const DEFAULT_FILES: string[] = ["../**/*.{jsx,tsx}"];
const DEFAULT_COMPONENTS: string[] = ["../**/*.{jsx,tsx}"];
const DEFAULT_RENDERER = "react-three-fiber";
const DEFAULT_PROVIDER = "triplex:empty-provider.jsx";
const DEFAULT_PUBLIC_DIR = "../public";
const DEFAULT_ASSETS_DIR = "assets";

const schema = object({
  UNSAFE_viteConfig: optional(string()),
  assetsDir: optional(string()),
  components: optional(array(string())),
  define: optional(object({})),
  experimental: optional(object({})),
  files: optional(array(string())),
  provider: optional(string()),
  publicDir: optional(string()),
  renderer: optional(string()),
});

export function getConfig(_cwd: string): ReconciledTriplexConfig {
  const cwd = normalize(_cwd);
  let config: TriplexConfig & SecretTriplexConfig;

  try {
    const configString = readFileSync(
      join(cwd, ".triplex/config.json"),
      "utf8",
    );
    config = parse(schema, JSON.parse(configString));
  } catch {
    config = {};
  }

  const publicDir: string = join(
    cwd,
    ".triplex",
    config.publicDir || DEFAULT_PUBLIC_DIR,
  );

  const provider: string = config.provider
    ? join(cwd, ".triplex", config.provider)
    : DEFAULT_PROVIDER;

  const files: string[] = (config.files || DEFAULT_FILES).map((file: string) =>
    join(cwd, ".triplex", file),
  );

  const components: string[] = (config.components || DEFAULT_COMPONENTS).map(
    (file: string) => join(cwd, ".triplex", file),
  );

  const assetsDir = normalize(
    join(
      publicDir,
      config.assetsDir || DEFAULT_ASSETS_DIR,
      `/**/*.(${STATIC_ASSETS.join("|")})`,
    ),
  );

  const renderer: string =
    config.renderer && config.renderer.startsWith(".")
      ? join(cwd, ".triplex", config.renderer)
      : config.renderer || DEFAULT_RENDERER;

  const UNSAFE_viteConfig: string =
    config.UNSAFE_viteConfig && config.UNSAFE_viteConfig.startsWith(".")
      ? join(cwd, ".triplex", config.UNSAFE_viteConfig)
      : config.UNSAFE_viteConfig || "";

  return {
    UNSAFE_viteConfig,
    assetsDir,
    components,
    cwd,
    define: config.define || {},
    experimental: config.experimental || {},
    files,
    provider,
    publicDir,
    renderer,
  };
}

function _resolveProjectCwd(
  startPath: string,
  __fallbackPkgJsonPath?: string,
): string | undefined {
  const next = resolve(startPath, "..");

  if (startPath === next) {
    // We've traversed all the way up the folder path and found nothing. Bail out!
    return __fallbackPkgJsonPath || undefined;
  }

  const dir = readdirSync(startPath);
  if (dir.includes(".triplex")) {
    const triplexDir = readdirSync(join(startPath, ".triplex"));
    if (triplexDir.includes("config.json")) {
      return startPath;
    }
  }

  const isNodeOrDenoProject =
    dir.includes("package.json") || dir.includes("deno.json");

  if (isNodeOrDenoProject && !__fallbackPkgJsonPath) {
    // Keep track of the first found package.json just in case as a fallback cwd.
    return _resolveProjectCwd(next, startPath);
  }

  return _resolveProjectCwd(next, __fallbackPkgJsonPath);
}

export function resolveProjectCwd(startPath: string): string | undefined {
  return _resolveProjectCwd(startPath);
}
