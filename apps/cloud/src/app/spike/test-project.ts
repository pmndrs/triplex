/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import type { FileSystemTree } from "@webcontainer/api";

export const testProject: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "spike-app",
          private: true,
          type: "module",
          scripts: {
            dev: "vite --host 0.0.0.0 --port 5173",
          },
          dependencies: {
            "@react-three/drei": "^10.1.1",
            "@react-three/fiber": "^9.1.2",
            react: "^19.0.0",
            "react-dom": "^19.0.0",
            three: "^0.172.0",
          },
          devDependencies: {
            "@types/three": "^0.171.0",
            "@vitejs/plugin-react": "^4.4.1",
            vite: "^6.0.7",
          },
        },
        null,
        2,
      ),
    },
  },
  "vite.config.js": {
    file: {
      contents: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: { clientPort: 443 },
  },
});
`,
    },
  },
  "index.html": {
    file: {
      contents: `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Spike</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
  },
  src: {
    directory: {
      "main.tsx": {
        file: {
          contents: `import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
`,
        },
      },
      "App.tsx": {
        file: {
          contents: `import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export function App() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas camera={{ position: [3, 3, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
`,
        },
      },
    },
  },
};
