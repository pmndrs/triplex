/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type KeyboardEventObject } from "./keyboard";

export type ClientSendEventName = keyof ClientSendEventData;

type Icon =
  | "all-sides"
  | "angle"
  | "camera"
  | "cursor"
  | "exit"
  | "exit"
  | "grid-perspective"
  | "grid"
  | "height"
  | "local"
  | "moon"
  | "move"
  | "size"
  | "sun"
  | "transform"
  | "world";

export interface ButtonGroupControl {
  buttons: {
    accelerator?: string;
    icon?: Icon;
    id: string;
    label: string;
  }[];
  defaultSelected?: string;
  groupId: string;
  type: "button-group";
}

export interface MenuControl {
  groupId: string;
  icon?: Icon;
  label: string;
  options: (
    | {
        group?: string;
        id: string;
        label: string;
      }
    | { type: "separator" }
  )[];
  type: "menu";
}

export interface ToggleButtonControl {
  accelerator?: string;
  buttons: [
    {
      icon?: Icon;
      id: string;
      isSelected?: boolean;
      label: string;
    },
    {
      icon?: Icon;
      id: string;
      isSelected?: boolean;
      label: string;
    },
  ];
  groupId: string;
  type: "toggle-button";
}

export interface ButtonControl {
  accelerator?: string;
  icon?: Icon;
  id: string;
  label: string;
  type: "button";
}

export interface SeparatorControl {
  type: "separator";
}

export type Controls = (
  | ButtonControl
  | ButtonGroupControl
  | ToggleButtonControl
  | SeparatorControl
)[];

export type Actions = ((
  | ButtonControl
  | ButtonGroupControl
  | ToggleButtonControl
) & { filter: string })[];

export interface ClientSendEventData {
  "api-debug": {
    channel: string;
    data: string | number | object;
  };
  "component-opened": {
    encodedProps: string;
    entered?: boolean;
    exportName: string;
    path: string;
  };
  "component-rendered": void;
  "element-blurred": undefined;
  "element-focused": {
    astPath: string;
    column: number;
    line: number;
    parentPath: string;
    path: string;
  };
  "element-hint": {
    astPath: string;
    column: number;
    line: number;
    parentPath: string;
    path: string;
  } | null;
  "element-preview-prop": {
    astPath: string;
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  };
  "element-set-prop": {
    astPath: string;
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  };
  error: {
    col?: number;
    id?: string;
    line?: number;
    message: string;
    source?: string;
    stack?: string;
    subtitle: string;
    title: string;
    type?: "default" | "unrecoverable";
  };
  "extension-point-triggered": { id: string };
  keydown: KeyboardEventObject;
  keyup: KeyboardEventObject;
  ready: undefined;
  "set-extension-points":
    | {
        area: "elements";
        controls: Actions;
      }
    | {
        area: "scene";
        controls: Controls;
      }
    | { area: "settings"; options: MenuControl["options"] };
  track: { actionId: string };
}

export interface ClientSendEventResponse {
  "api-debug": void;
  "component-insert": void;
  "component-opened": void;
  "component-rendered": void;
  "element-blurred": void;
  "element-focused": void;
  "element-hint": void;
  "element-preview-prop": void;
  "element-set-prop": void;
  error: void;
  "extension-point-triggered": void;
  keydown: void;
  keyup: void;
  ready: void;
  "set-extension-points": void;
  track: void;
}

export type HostSendEventName = keyof HostSendEventData;

export interface ExtensionPointElement {
  column: number;
  line: number;
  parentPath: string;
}

export interface HostSendEventData {
  "element-focused-props": {
    props: string[];
  };
  "element-hint": {
    astPath: string;
    column: number;
    line: number;
    parentPath: string;
    path: string;
  } | null;
  "extension-point-triggered":
    | {
        id: string;
        scope: "scene";
      }
    | {
        data: ExtensionPointElement;
        id: string;
        scope: "element";
      };
  keydown: KeyboardEventObject;
  keyup: KeyboardEventObject;
  "request-blur-element": undefined;
  "request-delete-element": {
    astPath: string;
    column: number;
    line: number;
    path: string;
  };
  "request-focus-element": {
    astPath: string;
    column: number;
    exportName?: string;
    line: number;
    parentPath: string;
    path: string;
  };
  "request-jump-to-element":
    | {
        astPath: string;
        column: number;
        line: number;
        path: string;
      }
    | undefined;
  "request-open-component":
    | {
        encodedProps: string;
        exportName: string;
        path: string;
      }
    | undefined;
  "request-refresh-scene": { hard: true } | undefined;
  "request-reset-prop": {
    astPath: string;
    column: number;
    line: number;
    path: string;
    propName: string;
  };
  "request-reset-scene": undefined;
  "request-restore-element": {
    astPath: string;
    column: number;
    line: number;
    parentPath: string;
  };
  "request-set-element-prop": {
    astPath: string;
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  };
  "request-state-change": {
    camera: "default" | "editor";
    state: "play" | "pause" | "edit";
  };
  "self:request-reset-error-boundary": undefined;
  "self:request-reset-file": { path: string };
}

export interface HostSendEventResponse {
  "element-focused-props": void;
  "element-hint": void;
  "extension-point-triggered": { handled: boolean };
  keydown: void;
  keyup: void;
  "request-blur-element": void;
  "request-delete-element": void;
  "request-focus-element": void;
  "request-jump-to-element": void;
  "request-open-component": void;
  "request-refresh-scene": void;
  "request-reset-prop": void;
  "request-reset-scene": void;
  "request-restore-element": void;
  "request-set-element-prop": void;
  "request-state-change": void;
  "self:request-reset-error-boundary": void;
  "self:request-reset-file": void;
}
