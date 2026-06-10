/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import type { FileSystemTree } from "@webcontainer/api";

// Overlays a Vite-runnable scaffold onto the user-mirrored tree. Their files
// always win; we only inject what is missing. This is enough for the spike to
// boot a dev server; later we'll lift the @triplex/client Vite config wholesale.

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  name?: string;
  scripts?: Record<string, string>;
  type?: string;
  [k: string]: unknown;
}

const VITE_CONFIG = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: { clientPort: 443 },
  },
});
`;

const INDEX_HTML = (entry: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Triplex Scene</title>
    <style>html,body,#root{margin:0;height:100%;background:#1a1a1a;}canvas{outline:none;}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/${entry}"></script>
  </body>
</html>
`;

// Default scene host: dynamic-import whatever the editor tells us to.
const SCENE_HOST = `import { createRoot } from "react-dom/client";
import { useEffect, useState, Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";

const modules = import.meta.glob("/src/**/*.{tsx,jsx}");

function resolve(path) {
  // Editor sends paths like "/src/scene.tsx"; our glob keys match.
  return modules[path];
}

function SceneHost() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    function onMessage(e) {
      const d = e.data;
      if (d && d.eventName === "request-open-component") {
        setTarget({ exportName: d.data.exportName, path: d.data.path });
      }
    }
    window.addEventListener("message", onMessage);
    // Editor's app-root/context.tsx waits for a "ready" event before sending
    // request-open-component. The bridge protocol is { eventName, data }.
    window.parent.postMessage({ data: undefined, eventName: "ready" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!target) {
    return (
      <div style={{ color: "#888", padding: 24 }}>
        Waiting for editor to send request-open-component…
      </div>
    );
  }

  const loader = resolve(target.path);
  if (!loader) {
    return (
      <div style={{ color: "#f77", padding: 24 }}>
        No module at {target.path}. Known: {Object.keys(modules).slice(0, 5).join(", ")}…
      </div>
    );
  }

  const LazyTarget = lazy(async () => {
    const mod = await loader();
    const Cmp = target.exportName === "default" ? mod.default : mod[target.exportName];
    return { default: Cmp };
  });

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas camera={{ position: [4, 4, 4] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Grid args={[10, 10]} cellColor="#444" sectionColor="#666" />
        <Suspense fallback={null}>
          <LazyTarget />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<SceneHost />);
`;

export function scaffold(
  userTree: FileSystemTree,
  pkgJsonText: string | null,
): FileSystemTree {
  const tree: FileSystemTree = { ...userTree };

  // If no explicit pkgJsonText was passed, try to read package.json out of the
  // user's tree (a common case for picked project folders).
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
  pkg.type ??= "module";
  pkg.scripts = { ...(pkg.scripts ?? {}), dev: "vite --host 0.0.0.0 --port 5173" };
  pkg.devDependencies = {
    ...(pkg.devDependencies ?? {}),
    "@vitejs/plugin-react": "^4.4.1",
    vite: "^6.0.7",
  };
  // Strip workspace-pinned deps WebContainer can't resolve from npm.
  for (const bucket of ["dependencies", "devDependencies"] as const) {
    const obj = pkg[bucket];
    if (!obj) continue;
    for (const key of Object.keys(obj)) {
      const v = obj[key];
      if (typeof v === "string" && v.startsWith("workspace:")) {
        delete obj[key];
      }
    }
  }
  tree["package.json"] = {
    file: { contents: JSON.stringify(pkg, null, 2) },
  };

  if (!tree["vite.config.js"] && !tree["vite.config.ts"]) {
    tree["vite.config.js"] = { file: { contents: VITE_CONFIG } };
  }

  const sceneHostEntry = "__triplex_scene_host.jsx";
  // Always overwrite the scene host so we can iterate without re-picking.
  tree[sceneHostEntry] = { file: { contents: SCENE_HOST } };

  if (!tree["index.html"]) {
    tree["index.html"] = { file: { contents: INDEX_HTML(sceneHostEntry) } };
  } else {
    // Replace the user's index.html so /__triplex_scene_host.jsx is the entry.
    // The original tree was meant for a different runtime anyway.
    tree["index.html"] = { file: { contents: INDEX_HTML(sceneHostEntry) } };
  }

  return tree;
}
