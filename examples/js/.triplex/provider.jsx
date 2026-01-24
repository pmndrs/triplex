export default function Provider({ children, color = "" }) {
  return (
    <>
      {color && <color args={[color]} attach="background" />}
      {children}
    </>
  );
}
