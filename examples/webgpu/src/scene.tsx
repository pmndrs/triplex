import { useNodes, useUniforms } from "@react-three/fiber/webgpu";
import { Fn, positionLocal, sin, time, vec3 } from "three/tsl";

export function Box() {
  const { uIntensity } = useUniforms({ uIntensity: 0.2 });

  const nodes = useNodes(() => ({
    wobble: Fn(() => vec3(sin(time), sin(time.mul(1.3)), sin(time.mul(2)))),
  }));

  return (
    <>
      <mesh>
        <boxGeometry />
        <meshStandardNodeMaterial
          positionNode={positionLocal.add(nodes.wobble().mul(uIntensity))}
        />
      </mesh>

      <pointLight color="white" intensity={10} position={[1, 2, 2]} />
      <ambientLight intensity={0.5} />
    </>
  );
}
