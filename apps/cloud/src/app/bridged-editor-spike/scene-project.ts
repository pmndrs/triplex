/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import type { FileSystemTree } from "@webcontainer/api";

// Vite project that serves a single R3F Canvas rendering box.tsx (the
// geometry example). Acts as the scene runtime for the bridged editor while
// we don't have a browser-native Vite-equivalent.
export const sceneProject: FileSystemTree = {
  "index.html": {
    file: {
      contents: `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Scene</title>
    <style>html,body,#root{margin:0;height:100%;background:#1a1a1a;}canvas{outline:none;}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
  },
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
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
          name: "bridged-scene",
          private: true,
          scripts: { dev: "vite --host 0.0.0.0 --port 5173" },
          type: "module",
        },
        null,
        2,
      ),
    },
  },
  src: {
    directory: {
      "App.tsx": {
        file: {
          contents: `import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import Box from "./box";

export function App() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas camera={{ position: [4, 4, 4] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Grid args={[10, 10]} cellColor="#444" sectionColor="#666" />
        <Box />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
`,
        },
      },
      "box.tsx": {
        file: {
          contents: `import { type Vector3Tuple } from "three";

function Box({
  color = "orange",
  position,
  rotation,
  scale,
  size = 1,
}: {
  color?: "red" | "green" | "blue" | "orange";
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple | number;
  size?: number;
}) {
  return (
    <group scale={scale} visible={true}>
      <mesh
        name="hello-world"
        position={position}
        rotation={rotation}
        userData={{ hello: true }}
        visible={true}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} key={color} />
      </mesh>
    </group>
  );
}

export default Box;
`,
        },
      },
      "main.tsx": {
        file: {
          contents: `import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
`,
        },
      },
    },
  },
  "vite.config.js": {
    file: {
      contents: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { hmr: { clientPort: 443 } },
});
`,
    },
  },
};
