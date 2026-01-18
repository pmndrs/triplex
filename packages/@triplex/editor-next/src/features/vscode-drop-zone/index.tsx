/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { dropTargetForExternal } from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import {
  containsText,
  getText,
} from "@atlaskit/pragmatic-drag-and-drop/external/text";
import { Suspense, useEffect, useState } from "react";
import { AddComponentToScene } from "./add-component";

/** Captures file drop events from the VSCode tree explorer. */
export function VSCodeDropZone() {
  const [fileUri, setFileUri] = useState<string>();

  useEffect(() => {
    return dropTargetForExternal({
      canDrop: containsText,
      element: document.body,
      onDrop({ source }) {
        const text = getText({ source });
        const uri = text?.split("\n").at(0);
        setFileUri(uri);
      },
    });
  }, []);

  if (fileUri) {
    return (
      <Suspense>
        <AddComponentToScene
          fileUri={fileUri}
          onComplete={() => {
            setFileUri(undefined);
          }}
        />
      </Suspense>
    );
  }

  return null;
}
