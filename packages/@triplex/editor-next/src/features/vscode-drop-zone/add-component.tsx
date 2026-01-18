/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useEvent } from "@triplex/lib";
import { Dialog } from "@triplex/ux";
import { useEffect, useState } from "react";
import { useLazySubscription } from "../../hooks/ws";
import { sendVSCE } from "../../util/bridge";
import { useSceneContext } from "../app-root/context";

function filterSameComponent({
  exportName,
  path,
  sourceComponents,
  sourcePath,
}: {
  exportName: string;
  path: string;
  sourceComponents: Array<{ exportName: string; name: string }>;
  sourcePath: string;
}) {
  return sourceComponents.filter(
    (component) =>
      !(component.exportName === exportName && sourcePath === path),
  );
}

export function AddComponentToScene({
  fileUri,
  onComplete,
}: {
  fileUri: string;
  onComplete: () => void;
}) {
  const { exportName, path } = useSceneContext();
  const { exports, matchesComponentsGlob } = useLazySubscription(
    "/scene/:path",
    { path: fileUri },
  );
  const components = filterSameComponent({
    exportName,
    path,
    sourceComponents: exports,
    sourcePath: fileUri,
  });
  const onCompleteEvent = useEvent(onComplete);
  const [selectedExportName, setSelectedExportName] = useState<string>();
  let state: "abort" | "select-first" | "ready" | "outside-components";

  if (components.length === 0) {
    state = "abort";
  } else if (!matchesComponentsGlob) {
    state = "outside-components";
  } else if (components.length > 1) {
    state = "select-first";
  } else {
    state = "ready";
  }

  useEffect(() => {
    if (state === "abort") {
      onCompleteEvent();
      return;
    }

    if (state === "outside-components") {
      sendVSCE("notification", {
        actions: ["View Triplex Config"],
        message:
          "Could not add component as the file is not in the allowed components folders.",
        type: "warning",
      });
      onCompleteEvent();
      return;
    }

    if (state === "ready" || (state === "select-first" && selectedExportName)) {
      const insertingExportName =
        selectedExportName ?? components.at(0)!.exportName!;

      sendVSCE("component-insert", {
        exportName,
        insertingExportName,
        insertingPath: fileUri,
        path,
      });

      onCompleteEvent();
    }
  }, [
    components,
    exportName,
    fileUri,
    onCompleteEvent,
    path,
    selectedExportName,
    state,
  ]);

  if (state === "select-first") {
    return (
      <Dialog onDismiss={onCompleteEvent}>
        <select
          autoFocus
          className="text-input invalid:border-danger bg-input border-input placeholder:text-input-placeholder w-full border p-1.5 [color-scheme:light_dark] focus:outline-none"
          onChange={(e) => {
            setSelectedExportName(e.target.value);
          }}
        >
          <option>Select component</option>
          {components.map((exp) => (
            <option key={exp.exportName} value={exp.exportName}>
              {exp.name ?? exp.exportName}
            </option>
          ))}
        </select>
      </Dialog>
    );
  }

  return null;
}
