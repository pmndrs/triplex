/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Canvas } from "@react-three/fiber";

export function Button({
  children,
  color = "red",
}: {
  children: string;
  color?: "red" | "blue";
}) {
  return (
    <button style={{ color, height: "100vh", width: "100vh" }} type="submit">
      {children}
    </button>
  );
}

export function CanvasExample() {
  return (
    <>
      <Canvas>
        <mesh>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </Canvas>
      <div
        style={{
          color: "yellow",
          fontFamily: "sans-serif",
          fontSize: 36,
          fontWeight: 500,
          left: 8,
          position: "fixed",
          top: 36,
        }}
      >
        HTML CONTENT OUTSIDE CANVAS
      </div>
    </>
  );
}
