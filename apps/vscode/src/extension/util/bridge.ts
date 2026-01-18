/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  type FromVSCodeEvent,
  type ToVSCodeEvent,
} from "@triplex/editor-next/vsce/bridge";
import type * as vscode from "vscode";

/** Sends a message to the webview extension. */
export function sendVSCE<TEventName extends keyof FromVSCodeEvent>(
  webview: vscode.Webview,
  eventName: TEventName,
  data: FromVSCodeEvent[TEventName],
) {
  webview.postMessage({
    data,
    eventName,
  });
}

export function on<TEventName extends keyof ToVSCodeEvent>(
  webview: vscode.Webview,
  eventName: TEventName,
  cb: (data: ToVSCodeEvent[TEventName]) => void,
) {
  const disposable = webview.onDidReceiveMessage((e) => {
    if (
      typeof e === "object" &&
      "eventName" in e &&
      e.eventName === eventName
    ) {
      cb(e.data);
    }
  });

  return () => disposable.dispose();
}
