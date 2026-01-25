/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { on } from "@triplex/bridge/client";
import { useEffect, useState } from "react";
import { Grid } from "triplex-drei";
import { usePlayState } from "../stores/use-play-state";
import { editorLayer } from "../util/layers";

export function TriplexGrid() {
  const state = usePlayState();
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    return on("extension-point-triggered", (data) => {
      if (data.scope !== "scene") {
        return;
      }

      if (data.id === "toggle_grid") {
        setShowGrid((prev) => !prev);
        return { handled: true };
      }
    });
  }, []);

  const shouldRenderGrid = state !== "play" && showGrid;

  if (window.triplex.config.webgpu) {
    // TODO: Add support for webgpu.
    return null;
  }

  return (
    <Grid
      cellColor="#6f6f6f"
      cellSize={1}
      cellThickness={1.0}
      fadeDistance={100}
      fadeStrength={5}
      followCamera
      infiniteGrid
      layers={editorLayer}
      position={[0, 0.01, 0]}
      sectionColor="#9d4b4b"
      sectionSize={3}
      side={2}
      visible={shouldRenderGrid}
    />
  );
}
