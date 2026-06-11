/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { posix as posixPath } from "node:path";
import { transform } from "esbuild";

export type FileNode = { file: { contents: string | { base64: string } } };
export type DirectoryNode = { directory: FileSystemTree };
export type FileSystemTree = Record<string, FileNode | DirectoryNode>;

export const PACKAGES_ROOT = resolve(process.cwd(), "../../packages");

// Source-mtime → compiled output cache. Avoids re-running esbuild on every
// page reload / watch event for files that haven't changed.
const transformCache = new Map<string, { mtimeMs: number; output: string }>();

const IGNORED_DIRS = new Set([
  "__examples__",
  "__tests__",
  ".git",
  "node_modules",
]);

export function placeIntoTree(
  tree: FileSystemTree,
  relPath: string,
  contents: string,
): void {
  const parts = relPath.split(/[\\/]/).filter(Boolean);
  let cursor: FileSystemTree = tree;
  for (let i = 0; i < parts.length - 1; i++) {
    const seg = parts[i];
    const existing = cursor[seg];
    if (existing && "directory" in existing) {
      cursor = existing.directory;
    } else {
      const child: FileSystemTree = {};
      cursor[seg] = { directory: child };
      cursor = child;
    }
  }
  cursor[parts[parts.length - 1]] = { file: { contents } };
}

export async function transformTsToJs(
  filePath: string,
  source: string,
  mtimeMs: number,
): Promise<string> {
  const cached = transformCache.get(filePath);
  if (cached && cached.mtimeMs === mtimeMs) return cached.output;
  const isTsx = filePath.endsWith(".tsx");
  const result = await transform(source, {
    format: "esm",
    jsx: "automatic",
    loader: isTsx ? "tsx" : "ts",
    target: "es2022",
  });
  transformCache.set(filePath, { mtimeMs, output: result.code });
  return result.code;
}

export function collectFiles(
  node: FileSystemTree,
  prefix: string,
  out: Set<string>,
): void {
  for (const [name, n] of Object.entries(node)) {
    if ("file" in n) out.add(prefix + name);
    else collectFiles(n.directory, `${prefix}${name}/`, out);
  }
}

/**
 * Build a synthetic package.json that maps every top-level `dist/<file>.{js,mjs}`
 * to a subpath export so Node ESM can resolve it. Used by both the JIT and
 * prebuilt code paths because the on-disk package.json points at `./src/*.ts`
 * by default (developer convenience for in-repo imports). Hash-suffixed
 * chunk files (`index-CpdQtSaw.mjs`) are kept on disk but excluded from the
 * exports map — they're internal chunks pulled in by their owning entry.
 */
export function buildPackageJson(
  pkgJsonRaw: string,
  distFiles: string[],
): string {
  const original = JSON.parse(pkgJsonRaw);
  const exports: Record<string, string> = {};
  const moduleFiles = distFiles.filter(
    (f) => f.endsWith(".js") || f.endsWith(".mjs"),
  );
  let mainFile: string | undefined;
  for (const file of moduleFiles) {
    const dot = file.lastIndexOf(".");
    const base = file.slice(0, dot);
    // Skip hash-suffixed chunk files. A real hash always contains an
    // uppercase letter or digit, which lets us distinguish `-CpdQtSaw`
    // (hash) from `-revivables` (a regular kebab-case word).
    const tail = base.slice(base.lastIndexOf("-") + 1);
    if (
      tail.length >= 6 &&
      tail.length <= 12 &&
      /[A-Z0-9]/.test(tail) &&
      base.includes("-")
    )
      continue;
    const sub = base === "index" ? "." : `./${base}`;
    exports[sub] = `./dist/${file}`;
    if (sub === ".") mainFile = `./dist/${file}`;
  }
  const out: Record<string, unknown> = {
    name: original.name,
    version: original.version,
    type: "module",
    exports,
    dependencies: original.dependencies ?? {},
    peerDependencies: original.peerDependencies ?? {},
  };
  if (mainFile) out.main = mainFile;
  return JSON.stringify(out, null, 2);
}

/**
 * Tree-aware import rewriter. esbuild's TS→JS output keeps extensionless
 * relative specifiers (`./features/app`). Node ESM in the WC needs a real
 * file path, which may be `./features/app.js` OR `./features/app/index.js`.
 * Pick whichever actually exists in the compiled tree.
 */
export function rewriteJitImports(
  source: string,
  currentFileRel: string,
  fileSet: Set<string>,
): string {
  const currentDir = posixPath.dirname(currentFileRel);
  const withExtensions = source.replace(
    /(from\s*|import\s+|import\s*\()["'](\.\.?\/[^"']*?)["']/g,
    (match, prefix, spec) => {
      if (/\.(js|mjs|cjs|json|css)$/.test(spec)) return match;
      const base = posixPath.normalize(posixPath.join(currentDir, spec));
      if (fileSet.has(base)) return match;
      const candidates = [`${base}.js`, `${base}/index.js`];
      for (const c of candidates) {
        if (fileSet.has(c)) {
          let rel = posixPath.relative(currentDir, c);
          if (!rel.startsWith(".")) rel = `./${rel}`;
          return `${prefix}"${rel}"`;
        }
      }
      return `${prefix}"${spec}.js"`;
    },
  );
  return ensureJsonImportAttributes(withExtensions);
}

/**
 * Two JSON-import patches Node ESM requires that esbuild's transform doesn't
 * make on its own:
 *   1) Every JSON import needs `with { type: "json" }`.
 *   2) Named imports (`import { version } from "./pkg.json"`) aren't allowed
 *      — only default. Rewrite to `import __j from "./pkg.json"; const { … }
 *      = __j;`.
 */
function ensureJsonImportAttributes(source: string): string {
  let counter = 0;
  let next = source.replace(
    /import\s*\{([^}]+)\}\s*from\s*(["'][^"']+\.json["'])\s*(with\s*\{[^}]*\})?\s*;?/g,
    (_match, named, spec) => {
      const id = `__triplexJson${counter++}`;
      const names = named.trim();
      return `import ${id} from ${spec} with { type: "json" }; const {${names}} = ${id};`;
    },
  );
  // Anything still missing an attribute (default imports) gets one tacked on.
  next = next.replace(
    /(from\s*["'][^"']+\.json["'])(?!\s*with)/g,
    `$1 with { type: "json" }`,
  );
  return next;
}

/**
 * Walks `<pkg>/src/` and returns the set of dist-relative file paths it would
 * produce (e.g. `index.js`, `features/app/index.js`, `features/foo/frag.glsl.js`).
 * Used by single-file compiles so the rewriter can resolve directory-vs-file
 * imports without compiling the whole tree.
 */
export async function buildPkgFileSet(srcDir: string): Promise<Set<string>> {
  const out = new Set<string>();
  async function walk(absDir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(absDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (entry.isDirectory() && /^__tests?__$/.test(entry.name)) continue;
      const abs = join(absDir, entry.name);
      if (entry.isDirectory()) {
        await walk(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      const relFromSrc = relative(srcDir, abs);
      const lower = entry.name.toLowerCase();
      if (lower.endsWith(".test.ts") || lower.endsWith(".test.tsx")) continue;
      const distPath = toDistPath(relFromSrc);
      if (distPath) out.add(distPath.replace(/\\/g, "/"));
    }
  }
  await walk(srcDir);
  return out;
}

/**
 * Map a src-relative path to its dist-relative output path. Returns null if
 * the file isn't a JIT output (e.g. test files). Keep this and the
 * compile-walk's per-extension branching in sync.
 */
export function toDistPath(srcRelPath: string): string | null {
  const lower = srcRelPath.toLowerCase();
  if (lower.endsWith(".test.ts") || lower.endsWith(".test.tsx")) return null;
  if (lower.endsWith(".d.ts")) return srcRelPath;
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) {
    return srcRelPath.replace(/\.tsx?$/, ".js");
  }
  if (/\.(glsl|frag|vert|wgsl)$/.test(lower)) {
    return `${srcRelPath}.js`;
  }
  return srcRelPath;
}

/**
 * Compile one source file to its dist representation. Returns {distPath,
 * contents} ready to write to the WC FS, or null if the file shouldn't be
 * emitted (test files).
 */
export async function compileSingleSrcFile(
  srcDir: string,
  absFile: string,
  fileSet: Set<string>,
): Promise<{ distPath: string; contents: string } | null> {
  const relFromSrc = relative(srcDir, absFile);
  const lower = absFile.toLowerCase();
  if (lower.endsWith(".test.ts") || lower.endsWith(".test.tsx")) return null;
  if (lower.endsWith(".d.ts")) {
    const text = await readFile(absFile, "utf8");
    return { contents: text, distPath: relFromSrc };
  }
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) {
    const source = await readFile(absFile, "utf8");
    const fileStat = await stat(absFile);
    const compiled = await transformTsToJs(absFile, source, fileStat.mtimeMs);
    const distPath = relFromSrc.replace(/\.tsx?$/, ".js");
    const rewritten = rewriteJitImports(
      compiled,
      distPath.replace(/\\/g, "/"),
      fileSet,
    );
    return { contents: rewritten, distPath };
  }
  if (/\.(glsl|frag|vert|wgsl)$/.test(lower)) {
    const text = await readFile(absFile, "utf8");
    return {
      contents: `export default ${JSON.stringify(text)};\n`,
      distPath: `${relFromSrc}.js`,
    };
  }
  // CSS, JSON, etc. — pass through as text.
  const text = await readFile(absFile, "utf8");
  return { contents: text, distPath: relFromSrc };
}

/**
 * JIT-compile every src file under <pkg>/src/ and place outputs into a tree.
 */
export async function compilePkgSrc(srcDir: string): Promise<FileSystemTree> {
  const compiledDist: FileSystemTree = {};
  async function compileWalk(absDir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(absDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (entry.isDirectory() && /^__tests?__$/.test(entry.name)) continue;
      const abs = join(absDir, entry.name);
      if (entry.isDirectory()) {
        await compileWalk(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      const lower = entry.name.toLowerCase();
      if (lower.endsWith(".test.ts") || lower.endsWith(".test.tsx")) continue;
      const relFromSrc = relative(srcDir, abs);
      if (lower.endsWith(".ts") || lower.endsWith(".tsx")) {
        if (lower.endsWith(".d.ts")) {
          const text = await readFile(abs, "utf8");
          placeIntoTree(compiledDist, relFromSrc, text);
          continue;
        }
        const source = await readFile(abs, "utf8");
        const fileStat = await stat(abs);
        const compiled = await transformTsToJs(abs, source, fileStat.mtimeMs);
        const outRel = relFromSrc.replace(/\.tsx?$/, ".js");
        placeIntoTree(compiledDist, outRel, compiled);
      } else if (/\.(glsl|frag|vert|wgsl)$/.test(lower)) {
        const text = await readFile(abs, "utf8");
        const js = `export default ${JSON.stringify(text)};\n`;
        placeIntoTree(compiledDist, `${relFromSrc}.js`, js);
      } else {
        const text = await readFile(abs, "utf8");
        placeIntoTree(compiledDist, relFromSrc, text);
      }
    }
  }
  await compileWalk(srcDir);
  // Second pass: tree-aware import rewriting.
  const fileSet = new Set<string>();
  collectFiles(compiledDist, "", fileSet);
  function rewritePass(node: FileSystemTree, prefix: string): void {
    for (const [name, n] of Object.entries(node)) {
      if ("file" in n) {
        const rel = prefix + name;
        if (
          typeof n.file.contents === "string" &&
          (name.endsWith(".js") || name.endsWith(".mjs"))
        ) {
          n.file.contents = rewriteJitImports(n.file.contents, rel, fileSet);
        }
      } else {
        rewritePass(n.directory, `${prefix}${name}/`);
      }
    }
  }
  rewritePass(compiledDist, "");
  return compiledDist;
}
