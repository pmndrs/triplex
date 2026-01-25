export function Box() {
  return (
    <>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>

      <pointLight color="white" intensity={10} position={[1, 2, 2]} />
      <ambientLight intensity={0.5} />
    </>
  );
}
