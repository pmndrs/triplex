/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { RigidBody } from "@react-three/rapier";
import { Vector3Tuple } from "three";

export default function Sphere({
  position,
  rotation,
  scale,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
}) {
  return (
    <RigidBody
      canSleep={false}
      colliders={"ball"}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <mesh castShadow={true} receiveShadow={true}>
        <sphereGeometry />
        <meshStandardMaterial color={"#84f4ea"} />
      </mesh>
    </RigidBody>
  );
}
