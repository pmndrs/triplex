/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export function GLSLErrorFallback() {
  return (
    <mesh>
      <boxGeometry />
      <shaderMaterial
        fragmentShader={`
varying vec2 v_uv;

void main() {
gl_FragColor = vec4(v_uv, 0.0, 0.0);
}
        `}
      />
    </mesh>
  );
}
