/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// eslint-disable-next-line react/display-name
export default function () {
  return <NoFragment seed="foo" />;
}

export const NoFragment: React.FC<{ seed: string }> = () => {
  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
};
