/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export function GLSLErrorAll() {
  return (
    <mesh>
      <boxGeometry />
      <shaderMaterial fragmentShader="{invalid(" vertexShader="(invalid{" />
    </mesh>
  );
}

export function GLSLErrorVertex() {
  return (
    <mesh>
      <boxGeometry />
      <shaderMaterial vertexShader="(invalid{" />
    </mesh>
  );
}

export function GLSLErrorFragment() {
  return (
    <mesh>
      <boxGeometry />
      <shaderMaterial fragmentShader="{invalid(" />
    </mesh>
  );
}
