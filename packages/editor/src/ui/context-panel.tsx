/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  CameraIcon,
  Cross2Icon,
  Crosshair1Icon,
  EnterIcon,
  EraserIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useLazySubscription } from "@triplex/ws-client";
import { Suspense, useState } from "react";
import { IconButton } from "../ds/button";
import { ScrollContainer } from "../ds/scroll-container";
import { FocusedObject, useEditor } from "../stores/editor";
import { useScene } from "../stores/scene";
import { useSceneState } from "../stores/scene-state";
import { IDELink } from "../util/ide";
import { ErrorBoundary } from "./error-boundary";
import { PropField } from "./prop-field";
import { PropInput, PropTagContext } from "./prop-input";
import { StringInput } from "./string-input";

function SelectedSceneObjectPanel({ target }: { target: FocusedObject }) {
  const { getPropValue, jumpTo, navigateTo, setPropValue, viewFocusedCamera } =
    useScene();
  const { deleteComponent, persistPropValue } = useEditor();
  const [filter, setFilter] = useState<string | undefined>();

  const data = useLazySubscription("/scene/:path/object/:line/:column", {
    column: target.column,
    line: target.line,
    path: target.parentPath,
  });

  // Most likely a camera component. It might not though be though.
  // A better implementation later would be to traverse this scene objects children
  // And see if a camera exists, if it does enable the button.
  const isCamera = data.name.includes("Camera");

  return (
    <>
      <h2 className="px-4 pt-3 text-xl font-medium text-neutral-300">
        <div className="overflow-hidden text-ellipsis">{data.name}</div>
      </h2>

      <div className="-mt-0.5 mb-2.5 px-4">
        <IDELink
          column={target.column}
          line={target.line}
          path={target.parentPath}
        >
          View usage
        </IDELink>

        {data.type === "custom" && data.path && (
          <>
            <span className="mx-1.5 text-xs text-neutral-400">•</span>

            <IDELink column={1} line={1} path={data.path}>
              View source
            </IDELink>
          </>
        )}
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      <div className="flex px-2 py-1">
        <IconButton
          icon={EnterIcon}
          isDisabled={data.type === "host" || !data.path}
          onClick={() => navigateTo()}
          title="Enter component (⇧ + F)"
        />
        <IconButton
          icon={Crosshair1Icon}
          onClick={jumpTo}
          title="Focus camera (F)"
        />
        {isCamera && (
          <IconButton
            icon={CameraIcon}
            onClick={viewFocusedCamera}
            title="View camera"
          />
        )}
        <IconButton
          className="ml-auto"
          icon={TrashIcon}
          onClick={deleteComponent}
          title="Delete (⌫)"
        />
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      {data.props.length > 0 && (
        <div className="px-3 py-2">
          <StringInput
            label="Filter props..."
            name="prop-filter"
            onChange={setFilter}
          />
        </div>
      )}

      <ScrollContainer>
        {data.props.length === 0 && (
          <div className="px-4 py-3 text-sm italic text-neutral-400">
            This element has no props.
          </div>
        )}

        {data.props.map((prop) => {
          if (!prop.name.toLowerCase().includes(filter?.toLowerCase() || "")) {
            return null;
          }

          const column = "column" in prop ? prop.column : -1;
          const line = "line" in prop ? prop.line : -1;

          return (
            <PropField
              description={prop.description}
              htmlFor={prop.name}
              key={`${prop.name}${column}${line}`}
              label={prop.name}
              tags={prop.tags}
            >
              <PropTagContext.Provider value={prop.tags}>
                <PropInput
                  column={column}
                  line={line}
                  name={prop.name}
                  onChange={(value) => {
                    setPropValue({
                      column: target.column,
                      line: target.line,
                      path: target.parentPath,
                      propName: prop.name,
                      propValue: value,
                    });
                  }}
                  onConfirm={async (value) => {
                    const currentValue = await getPropValue({
                      column: target.column,
                      line: target.line,
                      path: target.parentPath,
                      propName: prop.name,
                    });

                    persistPropValue({
                      column: target.column,
                      currentPropValue: currentValue.value,
                      line: target.line,
                      nextPropValue: value,
                      path: target.parentPath,
                      propName: prop.name,
                    });
                  }}
                  path={target.path}
                  prop={prop}
                  required={prop.required}
                />
              </PropTagContext.Provider>
            </PropField>
          );
        })}
        <div className="h-1" />
      </ScrollContainer>
    </>
  );
}

function ComponentSandboxPanel() {
  const { exportName, path } = useEditor();
  const data = useLazySubscription("/scene/:path/:exportName/props", {
    exportName,
    path,
  });
  const storeKey = path + exportName;
  const { setPropValue } = useScene();
  const values = useSceneState((state) => state.get(storeKey));
  const setValues = useSceneState((state) => state.set);
  const hasValues = useSceneState((state) => state.hasState(storeKey));
  const clearValues = useSceneState((state) => state.clear);
  const [filter, setFilter] = useState<string | undefined>();

  return (
    <>
      <h2 className="px-4 pt-3 text-xl font-medium text-neutral-300">
        <div className="overflow-hidden text-ellipsis">Live Edit Props</div>
      </h2>
      <div className="mt-1 px-4 pb-3 text-sm text-neutral-400">
        Modify props given to {exportName} that only persist for this session.{" "}
        <a
          className="text-blue-400"
          href="#"
          onClick={() =>
            window.triplex.openLink(
              "https://triplex.dev/docs/user-guide/live-edit-props"
            )
          }
        >
          Learn more
        </a>
        .
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      <div className="flex px-2 py-1">
        <IconButton
          icon={EraserIcon}
          isDisabled={!hasValues}
          onClick={() => {
            Object.keys(values).forEach((key) => {
              setPropValue({
                column: -1,
                line: -1,
                path,
                propName: key,
                propValue: undefined,
              });
            });

            clearValues(storeKey);
          }}
          title="Clear props"
        />
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      {data.props.length > 0 && (
        <div className="px-3 py-2">
          <StringInput
            label="Filter props..."
            name="prop-filter"
            onChange={setFilter}
          />
        </div>
      )}

      <ScrollContainer>
        {data.props.length === 0 && (
          <div className="px-4 py-3 text-sm italic text-neutral-400">
            This component has no props.
          </div>
        )}

        {data.props.map((prop) => {
          if (!prop.name.toLowerCase().includes(filter?.toLowerCase() || "")) {
            return null;
          }

          return (
            <PropField
              description={prop.description}
              htmlFor={prop.name}
              key={prop.name}
              label={prop.name}
              tags={prop.tags}
            >
              <PropTagContext.Provider value={prop.tags}>
                <PropInput
                  column={-1}
                  key={String(values[prop.name])}
                  line={-1}
                  name={prop.name}
                  onChange={(value) => {
                    setPropValue({
                      column: -1,
                      line: -1,
                      path,
                      propName: prop.name,
                      propValue: value,
                    });
                  }}
                  onConfirm={(value) => {
                    setValues(storeKey, prop.name, value);
                  }}
                  path={path}
                  prop={Object.assign(
                    {},
                    prop,
                    values[prop.name] ? { value: values[prop.name] } : {}
                  )}
                  required={prop.required}
                />
              </PropTagContext.Provider>
            </PropField>
          );
        })}
        <div className="h-1" />
      </ScrollContainer>
    </>
  );
}

export function ContextPanel() {
  const { target } = useEditor();
  const { blur } = useScene();
  if (!target) {
    return null;
  }

  const isSceneObject = target.column > -1 && target.line > -1;

  return (
    <div className="pointer-events-none flex w-full flex-col gap-3">
      <div className="pointer-events-auto relative flex h-full flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/[97%]">
        <IconButton
          className="absolute right-2 top-3"
          icon={Cross2Icon}
          onClick={blur}
          title="Close (ESC)"
        />

        <ErrorBoundary keys={[target]}>
          <Suspense
            fallback={<div className="p-4 text-neutral-400">Loading...</div>}
          >
            {isSceneObject ? (
              <SelectedSceneObjectPanel
                key={target.path + target.column + target.line}
                target={target}
              />
            ) : (
              <ComponentSandboxPanel />
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
