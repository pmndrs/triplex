/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Decal, useTexture } from "@react-three/drei";

export function Decals() {
  const texture = useTexture("/images/triplex.png");

  return (
    <>
      <mesh rotation={[1.588, 0, 0]}>
        <cylinderGeometry args={[1, 1, 1, 64]} />
        <meshStandardMaterial color="black" />
        <Decal debug position={[-0.64, 0, 0]} scale={0.7}>
          <meshBasicMaterial
            map={texture}
            polygonOffset
            polygonOffsetFactor={-1}
            transparent
          />
        </Decal>
      </mesh>
    </>
  );
}
