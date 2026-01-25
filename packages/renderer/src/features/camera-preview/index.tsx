/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { type Camera } from "three";
import { useFBO } from "triplex-drei";
import { Tunnel } from "../../components/tunnel";
import { hash } from "../../util/hash";
import { HIDDEN_LAYER_INDEX } from "../../util/layers";
import frag from "./frag.glsl";
import vert from "./vert.glsl";

export function CameraPreview({ camera }: { camera: Camera }) {
  const renderTarget = useFBO();
  const scene = useThree((state) => state.scene);

  useFrame((state) => {
    state.gl.setRenderTarget(renderTarget);
    state.gl.render(
      state.scene,
      camera,
      // @ts-expect-error — This is crammed in as an extra argument so we can check it
      // in {@link ../camera-new/cameras.tsx} and ensure we don't override the camera.
      "triplex_ignore",
    );
    state.gl.setRenderTarget(null);
  });

  if (window.triplex.config.webgpu) {
    // TODO: Add support for webgpu.
    return null;
  }

  return (
    <>
      {import.meta.env.VITE_TRIPLEX_ENV === "test" && (
        <Tunnel.In>
          <span
            data-testid="CameraPreview"
            style={{
              height: 1,
              left: 0,
              opacity: 0,
              position: "absolute",
              top: 0,
              width: 1,
            }}
          >
            {camera.name}
          </span>
        </Tunnel.In>
      )}

      {createPortal(
        <mesh frustumCulled={false} layers={HIDDEN_LAYER_INDEX}>
          <planeGeometry />
          <shaderMaterial
            fragmentShader={frag}
            key={hash(frag + vert)}
            uniforms={{
              u_texture: { value: renderTarget.texture },
            }}
            vertexShader={vert}
          />
        </mesh>,
        scene,
      )}
    </>
  );
}
