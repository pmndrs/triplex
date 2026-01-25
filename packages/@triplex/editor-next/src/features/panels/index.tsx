/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { LayersIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { cn } from "@triplex/lib";
import { useScreenView } from "@triplex/ux";
import { Suspense, useEffect, useRef, useState } from "react";
import { IconButton } from "../../components/button";
import { ResizableSurface } from "../../components/resizable-surface";
import { ScrollContainer } from "../../components/scroll-container";
import { SkeletonList, SkeletonText } from "../../components/skeleton";
import { UserMenu } from "../../features/user-menu";
import {
  useSceneContext,
  useSceneEvents,
  useScenePlayState,
  useSceneSelected,
} from "../app-root/context";
import { HasWarningsDot } from "../warnings/warning-has-warnings";
import { WarningRequiredProps } from "../warnings/warning-required-props";
import { DebugPanel } from "./debug-panel";
import { ElementSelect } from "./element-select";
import { ElementsPanel, FilterElements } from "./panel-elements";
import { ProviderControlsPanel } from "./panel-provider";
import { SelectionPanel } from "./panel-selection";

export function Panels() {
  const [shown, setShown] = useState<"elements" | undefined>("elements");
  const play = useScenePlayState();
  const { blurElement, focusElement } = useSceneEvents();
  const context = useSceneContext();
  const selected = useSceneSelected();
  const isComponentControlsShown = selected && "exportName" in selected;
  const ref = useRef<HTMLDivElement>(null);

  useScreenView("scene", "Panel", shown === "elements");

  useEffect(() => {
    ref.current?.scroll({ top: 0 });
  }, [selected]);

  if (play.state === "play") {
    return null;
  }

  return (
    <ResizableSurface
      actionId={{
        resizeEnd: "scenepanel_resize_end",
        resizeStart: "scenepanel_resize_start",
      }}
      className={shown ? "border-r" : undefined}
      isDisabled={!shown}
      splitterPosition="end"
    >
      <div
        className={cn([
          shown
            ? "relative gap-1 p-1.5"
            : "bg-overlay border-overlay absolute left-[5px] top-[5px] rounded border p-0.5",
          "z-20 flex items-start opacity-90",
        ])}
      >
        <IconButton
          actionId={
            shown === "elements"
              ? "scenepanel_elements_close"
              : "scenepanel_elements_open"
          }
          icon={LayersIcon}
          isSelected={!!selected || shown === "elements"}
          label="View Scene Elements"
          onClick={() =>
            setShown(shown === "elements" ? undefined : "elements")
          }
          spacing={shown ? "spacious" : "default"}
        />
        <div className={shown ? "contents" : "hidden"}>
          <ElementSelect />
          <div className="flex">
            <IconButton
              actionId="scenepanel_component_controls"
              icon={Pencil2Icon}
              isSelected={isComponentControlsShown}
              label={
                isComponentControlsShown
                  ? "Close Component Controls"
                  : "Open Component Controls"
              }
              onClick={() => {
                if (isComponentControlsShown) {
                  blurElement();
                } else {
                  focusElement({
                    astPath: "",
                    column: -1,
                    exportName: context.exportName,
                    line: -1,
                    parentPath: "",
                    path: context.path,
                  });
                }
              }}
              spacing="spacious"
            >
              <Suspense>
                <WarningRequiredProps />
              </Suspense>
            </IconButton>
            <FilterElements />
            <UserMenu />
          </div>
        </div>
        {!shown && <HasWarningsDot />}
      </div>

      <div
        className={shown ? "flex h-full flex-col overflow-hidden" : "hidden"}
      >
        <Suspense
          fallback={
            <div className="flex flex-col px-4 py-1.5">
              <SkeletonList>
                <SkeletonText variant="ui" />
                <SkeletonText variant="ui" />
                <SkeletonText variant="ui" />
                <SkeletonText variant="ui" />
                <SkeletonText variant="ui" />
              </SkeletonList>
            </div>
          }
        >
          <ScrollContainer className="h-1/2" overflowIndicators="top">
            <ElementsPanel />
            <div className="h-1.5" />
          </ScrollContainer>
          <ScrollContainer
            className="border-overlay h-1/2 border-t"
            overflowIndicators="top"
            ref={ref}
          >
            {selected && <SelectionPanel />}
            <div className={selected ? "hidden" : undefined}>
              <ProviderControlsPanel />
            </div>
            <div className="h-1.5" />
          </ScrollContainer>
          <DebugPanel />
        </Suspense>
      </div>
    </ResizableSurface>
  );
}
