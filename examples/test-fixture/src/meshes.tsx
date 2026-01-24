/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { Cloud } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import { BoxGeometry, type BatchedMesh } from "three";

export function InstancedMeshScene() {
  return <Cloud />;
}

export function BatchedMeshScene() {
  const ref = useRef<BatchedMesh>(null);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const mesh = ref.current;
    const box = new BoxGeometry(1, 1, 1);
    const geometryId = mesh.addGeometry(box);
    const instanceId = mesh.addInstance(geometryId);

    return () => {
      mesh.deleteInstance(instanceId);
    };
  }, []);

  return (
    <batchedMesh args={[10, 5000, 10_000]} ref={ref}>
      <meshBasicMaterial color="lime" />
    </batchedMesh>
  );
}
