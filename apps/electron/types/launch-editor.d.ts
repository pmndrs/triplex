/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
declare module "launch-editor" {
  export default function launch(
    path: string,
    optionalEditor?: string,
    err?: (fileName: string, errMsg: string) => void,
  );
}
