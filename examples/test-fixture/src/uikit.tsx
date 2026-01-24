/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Container, Portal, Root } from "@react-three/uikit";

export function UIKitExample() {
  return (
    <Root>
      <Container>
        <Portal height={400} width={400}>
          <mesh>
            <boxGeometry />
          </mesh>
        </Portal>
      </Container>
    </Root>
  );
}
