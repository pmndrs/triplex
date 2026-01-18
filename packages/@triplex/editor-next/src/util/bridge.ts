/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { on, type ClientSendEventData } from "@triplex/bridge/host";

declare global {
  interface Window {
    acquireVsCodeApi: () => {
      postMessage: (data: unknown) => void;
    };
  }
}

export const vscode = window.acquireVsCodeApi();

export interface FromVSCodeEvent {
  "vscode:play-camera": {
    name: "default" | "editor";
  };
  "vscode:request-blur-element": void;
  "vscode:request-delete-element":
    | {
        astPath: string;
        column: number;
        line: number;
        path: string;
      }
    | undefined;
  "vscode:request-duplicate-element":
    | {
        astPath: string;
        column: number;
        line: number;
        path: string;
      }
    | undefined;
  "vscode:request-focus-element": {
    astPath: string;
    column: number;
    line: number;
    path: string;
  };
  "vscode:request-group-elements":
    | {
        astPath: string;
        column: number;
        line: number;
        path: string;
      }
    | undefined;
  "vscode:request-jump-to-element":
    | {
        astPath: string;
        column: number;
        line: number;
        path: string;
      }
    | undefined;
  "vscode:request-open-component": {
    exportName: string;
    path: string;
  };
  "vscode:request-refresh-scene": undefined;
  "vscode:request-reload-scene": undefined;
  "vscode:state-change": { active: boolean };
}

export interface ToVSCodeEvent extends ClientSendEventData {
  "code-update":
    | {
        code: string;
        fromLineNumber: number;
        id: string;
        path: string;
        toLineNumber: number;
        type: "replace";
      }
    | {
        code: string;
        id: string;
        lineNumber: number;
        path: string;
        type: "add";
      };
  "component-insert": {
    exportName: string;
    insertingExportName: string;
    insertingPath: string;
    path: string;
  };
  "element-delete": {
    astPath: string;
    column: number;
    line: number;
    path: string;
  };
  "element-duplicate": {
    astPath: string;
    column: number;
    line: number;
    path: string;
  };
  "element-group": {
    astPath: string;
    column: number;
    line: number;
    path: string;
  }[];
  "element-move": {
    action: "move-before" | "move-after" | "make-child" | "reparent";
    destination: { astPath: string; column: number; line: number };
    path: string;
    source: { astPath: string; column: number; line: number };
  };
  notification: {
    actions: "View Triplex Config"[];
    message: string;
    type: "info" | "warning" | "error";
  };
  "reload-webviews": undefined;
  terminal: {
    command: string;
  };
}

/**
 * Receives a message from the parent VSCode extension. Should be used in the
 * VSCE webview.
 */
export function onVSCE<TEvent extends keyof FromVSCodeEvent>(
  eventName: TEvent,
  callback: (data: FromVSCodeEvent[TEvent]) => void,
) {
  const cb = async (e: MessageEvent) => {
    if (typeof e.data === "object" && e.data.eventName === eventName) {
      callback(e.data.data);
    }
  };

  window.addEventListener("message", cb);

  return () => {
    window.removeEventListener("message", cb);
  };
}

export function sendVSCE<TEvent extends keyof ToVSCodeEvent>(
  eventName: TEvent,
  data: ToVSCodeEvent[TEvent],
) {
  vscode.postMessage({ data, eventName });
}

export function forwardClientMessages(eventName: keyof ClientSendEventData) {
  return on(eventName, (data) => {
    vscode.postMessage({ data, eventName });
  });
}
