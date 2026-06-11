/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type FGEnvironment } from "@triplex/lib/types";
import { type JSX } from "react";
import { compose } from "./compose";
import { createKeyboardEventForwarder } from "./keyboard";
import type {
  ClientSendEventData,
  ClientSendEventName,
  ClientSendEventResponse,
  HostSendEventData,
  HostSendEventName,
  HostSendEventResponse,
} from "./types";

export function broadcastForwardedKeyboardEvents() {
  return compose([
    on("keydown", (data) => {
      window.dispatchEvent(new KeyboardEvent("keydown", data));
    }),
    on("keyup", (data) => {
      window.dispatchEvent(new KeyboardEvent("keyup", data));
    }),
  ]);
}

export function listenForStateChanges() {
  on("request-state-change", (data) => {
    // @ts-ignore — :-) Hacks when using this x-package.
    window.triplex.env.state = data.state;
  });
}

function isCommandPaletteKeyPress(e: KeyboardEvent): boolean {
  return (
    e.key.toLowerCase() === "p" &&
    (e.metaKey || e.ctrlKey) &&
    !e.altKey &&
    e.shiftKey
  );
}

/**
 * Browser-owned ⌘/Ctrl shortcuts that we forward to the host AND want to
 * suppress the native default for (e.g. ⌘S would otherwise open the
 * "Save Page As" dialog inside the cross-origin scene iframe). Forwarding
 * alone isn't enough — `createKeyboardEventForwarder` stops propagation
 * but never prevents default, so we do it inside the predicate.
 */
function isClaimedBrowserShortcut(e: KeyboardEvent): boolean {
  if (!(e.metaKey || e.ctrlKey)) return false;
  if (e.altKey) return false;
  const k = e.key.toLowerCase();
  // Save, undo / redo (both common forms), select-all only when the
  // active scene element isn't a text input. We err on the side of
  // claiming more here: any handler the host registers can re-emit the
  // default via its own logic, but the inverse (claiming back from the
  // browser after the dialog fires) isn't possible.
  return (
    k === "s" ||
    k === "z" ||
    k === "y" ||
    (k === "z" && e.shiftKey) ||
    k === "k" ||
    k === "o" ||
    k === "n"
  );
}

export function forwardKeyboardEvents() {
  return createKeyboardEventForwarder(
    (eventName, data) => {
      send(eventName, data);
    },
    {
      capture: true,
      predicate: (e) => {
        // Suppress the browser's native handler for shortcuts we forward
        // to the host. Without this, ⌘S inside the scene iframe still
        // pops the "Save Page As…" dialog even though the host receives
        // the forwarded event and runs its own save flow.
        if (isClaimedBrowserShortcut(e)) {
          e.preventDefault();
          return "stop-propagation";
        }

        if (
          // @ts-ignore — :-) Hacks when using this x-package.
          window.triplex.env.state !== "play" ||
          isCommandPaletteKeyPress(e)
        ) {
          return "stop-propagation";
        }

        return false;
      },
    },
  );
}

export function on<TEvent extends HostSendEventName>(
  eventName: TEvent,
  callback: (
    data: HostSendEventData[TEvent],
  ) =>
    | void
    | HostSendEventResponse[TEvent]
    | Promise<HostSendEventResponse[TEvent]>,
) {
  // @ts-ignore — hacks sorry.
  if (window.triplex.env.mode === "webxr") {
    // @ts-ignore — hacks sorry.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import.meta.hot?.on(`triplex:${eventName}`, callback);
  }

  const cb = async (e: MessageEvent) => {
    if (typeof e.data === "object" && e.data.eventName === eventName) {
      const value = await callback(e.data.data);

      if (value !== undefined) {
        respond(eventName, value);
        // This type errors when built in other packages. Suppress and move on.
        // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
        // @ts-ignore
      } else if (process.env.NODE_ENV === "test") {
        // Always respond in a test environment so we can assert that the event was called
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        respond(eventName, undefined as any);
      }
    }
  };

  window.addEventListener("message", cb, false);

  return () => {
    window.removeEventListener("message", cb, false);

    // @ts-ignore — hacks sorry.
    if (window.triplex.env.mode === "webxr") {
      // @ts-ignore — hacks sorry.
      import.meta.hot?.off(`triplex:${eventName}`, callback);
    }
  };
}

export function send<TEvent extends ClientSendEventName>(
  eventName: TEvent,
  data: ClientSendEventData[TEvent],
  awaitResponse = false,
): Promise<ClientSendEventResponse[TEvent]> {
  // @ts-ignore — hacks sorry.
  if (window.triplex.env.mode === "webxr") {
    // @ts-ignore — hacks sorry.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import.meta.hot?.send(`triplex:${eventName}`, data as any);
    window.postMessage({ data, eventName }, "*");
  } else if (eventName.startsWith("self:")) {
    window.postMessage({ data, eventName }, "*");
  } else {
    window.parent.postMessage({ data, eventName }, "*");
  }

  if (awaitResponse) {
    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseName = `${eventName}Response` as any;
      const cleanup = on(responseName, (responseValue) => {
        resolve(responseValue as ClientSendEventResponse[TEvent]);
        cleanup();
      });
    });
  }

  return Promise.resolve(undefined as ClientSendEventResponse[TEvent]);
}

function respond<TEvent extends keyof HostSendEventResponse>(
  eventName: TEvent,
  data: HostSendEventResponse[TEvent],
) {
  window.parent.postMessage({ data, eventName: `${eventName}Response` }, "*");
}

export { compose } from "./compose";

export { ClientSendEventData, ClientSendEventName };

export interface SceneComponent {
  (props: unknown): JSX.Element;
}

export interface SceneComponentWithMeta {
  (props: unknown): JSX.Element;
  triplexMeta: SceneMeta;
}

export interface SceneMeta {
  lighting: "default" | "custom";
  root: "react" | "react-three-fiber" | undefined;
}

export type Module = Record<string, SceneComponentWithMeta | undefined>;

export type Modules = Record<string, () => Promise<Module>>;

export type ProviderComponent = (props: {
  children?: React.ReactNode;
}) => JSX.Element;

export interface ProviderModule {
  CanvasProvider: ProviderComponent;
  GlobalProvider: ProviderComponent;
}

export type UnknownComponent = (props: Record<string, unknown>) => JSX.Element;

export type Config = {
  experimental: Record<string, boolean>;
  provider: string;
};

export type BootstrapFunction = (
  container: HTMLElement,
) => (opts: {
  config: Config;
  fgEnvironmentOverride: FGEnvironment;
  files: Modules;
  providers: ProviderModule;
  userId: string;
}) => void;

export type ThumbnailFunction = (
  container: HTMLElement,
) => (opts: {
  component: SceneComponentWithMeta;
  providers: ProviderModule;
}) => void;

export interface EmbeddedMeta {
  astPath: string;
  column: number;
  exportName?: string;
  line: number;
  name: string;
  originExportName?: string;
  originPath?: string;
  path: string;
  rotate?: boolean;
  scale?: boolean;
  translate?: boolean;
}

export interface TriplexMeta extends EmbeddedMeta {
  parents: TriplexMeta[];
  props: { current: Record<string, unknown> };
}

export interface TaggedMeta {
  __triplex: TriplexMeta;
}

export interface RendererElementProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __component: ((props: any) => any) | string;
  __meta: EmbeddedMeta;
  attach?: unknown;
  children?: unknown;
  forceInsideSceneObjectContext?: boolean;
  name?: string;
  position?: unknown;
  rotation?: unknown;
  scale?: unknown;
}

export function init({
  RendererElement,
}: {
  RendererElement: (props: RendererElementProps) => unknown;
}) {
  // @ts-expect-error
  window.SceneObject = RendererElement;
}
