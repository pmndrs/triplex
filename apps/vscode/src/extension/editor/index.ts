/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readFileSync } from "node:fs";
import { dirname, normalize } from "@triplex/lib/path";
import { type FGEnvironment } from "@triplex/lib/types";
import {
  inferExports,
  resolveProjectCwd,
  type TWSEventDefinition,
} from "@triplex/server";
import { createWSEvents } from "@triplex/websocks-client/events";
import * as vscode from "vscode";
import { logger } from "../../util/log/vscode";
import { on, sendVSCE } from "../util/bridge";
import { TriplexDocument } from "./document";
import { initializeWebviewPanel } from "./panel";
import { type TriplexProjectResolver } from "./project";

const log = logger("scene");
const logWebXR = logger("webxr");

function getFallbackExportName(filepath: string): string {
  const code = readFileSync(filepath, "utf8");
  const exports = inferExports(code);
  const lastExport = exports.at(-1);

  if (!lastExport) {
    throw new Error("invariant: export not found");
  }

  return lastExport.exportName;
}

export class TriplexEditorProvider
  implements vscode.CustomEditorProvider<TriplexDocument>
{
  private static readonly viewType = "triplex.editor";
  private static readonly panelCache = new Map<string, vscode.WebviewPanel>();
  private static readonly projectCache = new Map<
    string,
    TriplexProjectResolver
  >();
  private constructor(
    private readonly _context: vscode.ExtensionContext,
    private readonly _fgEnvironmentOverride: FGEnvironment,
  ) {}

  backupCustomDocument(
    document: TriplexDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken,
  ) {
    return document.backup(context, cancellation);
  }

  saveCustomDocument(
    document: TriplexDocument,
    cancellation: vscode.CancellationToken,
  ) {
    return document.save(cancellation);
  }

  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
    vscode.CustomDocumentEditEvent<TriplexDocument>
  >();

  onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

  openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken,
  ) {
    const document = new TriplexDocument(uri);

    document.onDidChange((event) => {
      this._onDidChangeCustomDocument.fire({
        document,
        label: event.label,
        redo: event.redo,
        undo: event.undo,
      });
    });

    return document;
  }

  async resolveCustomEditor(
    document: TriplexDocument,
    panel: vscode.WebviewPanel,
    _token: vscode.CancellationToken,
  ) {
    const scopedFileName = document.uri.fsPath;
    const triplexProjectCwd = resolveProjectCwd(dirname(scopedFileName));

    if (!triplexProjectCwd) {
      return;
    }

    const query = new URLSearchParams(document.uri.query);
    const exportName = query.get("exportName");
    if (!exportName) {
      // Missing initial data.
      return;
    }

    // We deliberately don't await the initialization so vscode can show the Triplex loading screen immediately.
    initializeWebviewPanel(panel, {
      context: this._context,
      exportName,
      fgEnvironmentOverride: this._fgEnvironmentOverride,
      panelCache: TriplexEditorProvider.panelCache,
      path: scopedFileName,
      projectCache: TriplexEditorProvider.projectCache,
      triplexProjectCwd,
    }).then((initialized) => {
      document.setContext(initialized.ports.server);

      const { on: onWS } = createWSEvents<TWSEventDefinition>({
        url: `ws://127.0.0.1:${initialized.ports.ws}`,
      });

      const disposables = [
        // TODO: This will bleed across all panels resulting in unexpected behavior.
        // Before going into production we'll want to fix this.
        initialized.on("sync:element-set-prop", (e) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          document.upsertProp(e as any);
        }),
        initialized.on("sync:error", (e) => {
          logWebXR.error(e.message + "\n" + e.stack);
        }),
        onWS("fs-external-change", (data) => {
          if (data.path !== scopedFileName) {
            // We're only interested in changes that were made to this document.
            return;
          }

          document.undoableAction(
            "Sync from filesystem",
            () => ({ ...data, status: "modified" }),
            {
              skipDirtyCheck: true,
            },
          );
        }),
        on(panel.webview, "reload-webviews", () => {
          vscode.commands.executeCommand(
            "workbench.action.webview.reloadWebviewAction",
          );
        }),
        on(panel.webview, "code-update", (prop) => {
          document.updateCode(prop);
        }),
        on(panel.webview, "element-move", (data) => {
          document.moveElement(data);
        }),
        on(panel.webview, "element-set-prop", (prop) => {
          document.upsertProp(prop);
        }),
        on(panel.webview, "error", (error) => {
          if (error.type !== "unrecoverable") {
            vscode.window.showErrorMessage(`${error.title}: ${error.message}`);
            log.error(error.message);
          }
        }),
        on(panel.webview, "element-duplicate", async (element) => {
          const newElement = await document.duplicateElement(element);
          sendVSCE(panel.webview, "vscode:request-focus-element", {
            ...element,
            ...newElement,
          });
        }),
        on(panel.webview, "element-group", async (elements) => {
          const groups = await document.groupElements(elements);
          const firstGroup = groups.at(0);

          if (firstGroup && firstGroup.astPath) {
            sendVSCE(panel.webview, "vscode:request-focus-element", firstGroup);
          }
        }),
        on(panel.webview, "element-delete", async (element) => {
          sendVSCE(panel.webview, "vscode:request-blur-element", undefined);
          await document.deleteElement(element);
        }),
        on(panel.webview, "component-insert", async (data) => {
          return document.insertComponent(data);
        }),
        on(panel.webview, "notification", async (data) => {
          let promise: Thenable<(typeof data)["actions"][number] | undefined>;

          switch (data.type) {
            case "info":
              promise = vscode.window.showInformationMessage(
                data.message,
                ...data.actions,
              );
              break;

            case "warning":
              promise = vscode.window.showWarningMessage(
                data.message,
                ...data.actions,
              );
              break;

            case "error":
              promise = vscode.window.showErrorMessage(
                data.message,
                ...data.actions,
              );
              break;
          }

          const result = await promise;

          if (result === "View Triplex Config") {
            const configUri = vscode.Uri.joinPath(
              vscode.Uri.file(triplexProjectCwd),
              ".triplex",
              "config.json",
            );
            await vscode.window.showTextDocument(configUri, {
              preview: true,
              viewColumn: vscode.ViewColumn.Beside,
            });
          }
        }),
        on(panel.webview, "terminal", (data) => {
          const terminal = vscode.window.createTerminal({
            cwd: triplexProjectCwd,
            isTransient: true,
          });

          terminal.show(true);
          terminal.sendText(data.command);
        }),
      ];

      panel.onDidDispose(() => {
        disposables.forEach((dispose) => dispose());
      });
    });
  }

  revertCustomDocument(
    document: TriplexDocument,
    cancellation: vscode.CancellationToken,
  ) {
    return document.revert(cancellation);
  }

  saveCustomDocumentAs(
    document: TriplexDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken,
  ) {
    return document.saveAs(destination, cancellation);
  }

  public static register(
    context: vscode.ExtensionContext,
    { fgEnvironmentOverride }: { fgEnvironmentOverride: FGEnvironment },
  ): vscode.Disposable {
    const resolveActivePanel = (cb: (p: vscode.WebviewPanel) => void) => {
      const panel = Array.from(this.panelCache.values()).find(
        (panel) => panel.active,
      );

      if (panel) {
        cb(panel);
      }
    };

    const disposables = [
      vscode.commands.registerCommand("triplex.element-delete", (args) => {
        resolveActivePanel((panel) => {
          sendVSCE(
            panel.webview,
            "vscode:request-delete-element",
            args
              ? {
                  astPath: args.astPath,
                  column: args.column,
                  line: args.line,
                  path: args.path,
                }
              : undefined,
          );
        });
      }),
      vscode.commands.registerCommand("triplex.open-file", async (args) => {
        const uri = vscode.Uri.file(args.path);
        const position = new vscode.Position(args.line - 1, args.column - 1);

        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(
          document,
          vscode.ViewColumn.One,
        );

        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position));
      }),
      vscode.commands.registerCommand("triplex.element-duplicate", (args) => {
        resolveActivePanel((panel) => {
          sendVSCE(
            panel.webview,
            "vscode:request-duplicate-element",
            args
              ? {
                  astPath: args.astPath,
                  column: args.column,
                  line: args.line,
                  path: args.path,
                }
              : undefined,
          );
        });
      }),
      vscode.commands.registerCommand("triplex.element-group", (args) => {
        resolveActivePanel((panel) => {
          sendVSCE(panel.webview, "vscode:request-group-elements", args);
        });
      }),
      vscode.commands.registerCommand("triplex.element-jump-to", (args) => {
        resolveActivePanel((panel) => {
          sendVSCE(
            panel.webview,
            "vscode:request-jump-to-element",
            args
              ? {
                  astPath: args.astPath,
                  column: args.column,
                  line: args.line,
                  path: args.path,
                }
              : undefined,
          );
        });
      }),
      vscode.commands.registerCommand("triplex.set-camera-default", () => {
        resolveActivePanel((panel) => {
          sendVSCE(panel.webview, "vscode:play-camera", {
            name: "default",
          });
        });
      }),
      vscode.commands.registerCommand("triplex.set-camera-editor", () => {
        resolveActivePanel((panel) => {
          sendVSCE(panel.webview, "vscode:play-camera", {
            name: "editor",
          });
        });
      }),
      vscode.commands.registerCommand("triplex.refresh-scene", () => {
        resolveActivePanel((panel) => {
          sendVSCE(panel.webview, "vscode:request-refresh-scene", undefined);
        });
      }),
      vscode.commands.registerCommand("triplex.reload-scene", () => {
        resolveActivePanel((panel) => {
          sendVSCE(panel.webview, "vscode:request-reload-scene", undefined);
        });
      }),
      vscode.commands.registerCommand("triplex.open-in-triplex", (args) => {
        if (!args) {
          return;
        }

        vscode.commands.executeCommand("triplex.start", {
          exportName: args.originExportName,
          path: args.originPath,
          viewColumn: "replace",
        });
      }),
      vscode.commands.registerCommand(
        "triplex.start",
        async (ctx?: {
          exportName?: string;
          path?: string;
          viewColumn?: "beside" | "replace";
        }) => {
          const scopedFileName = normalize(
            ctx?.path ||
              vscode.window.activeTextEditor?.document.fileName ||
              "",
          );

          if (!scopedFileName) {
            return;
          }

          const existingPanel =
            TriplexEditorProvider.panelCache.get(scopedFileName);
          const nextExportName =
            ctx?.exportName || getFallbackExportName(scopedFileName);
          const viewColumn =
            ctx?.viewColumn === "replace"
              ? vscode.ViewColumn.Active
              : vscode.ViewColumn.Beside;

          if (existingPanel) {
            sendVSCE(existingPanel.webview, "vscode:request-open-component", {
              exportName: nextExportName,
              path: scopedFileName,
            });
            existingPanel.reveal();
          } else {
            vscode.commands.executeCommand(
              "vscode.openWith",
              // We set an extra to the file path to have vscode consider it a unique file.
              // This means when we perform undo/redo/save actions it's isolated to the triplex
              // editor rather than shared with the default editor.
              // NOTE: Breadcrumbs get messed up when supplying the query.
              // See: https://github.com/microsoft/vscode/issues/213633
              vscode.Uri.file(scopedFileName).with({
                query: `triplex&exportName=${nextExportName}`,
              }),
              TriplexEditorProvider.viewType,
              viewColumn,
            );
          }
        },
      ),
      vscode.window.registerCustomEditorProvider(
        TriplexEditorProvider.viewType,
        new TriplexEditorProvider(context, fgEnvironmentOverride),
        {
          supportsMultipleEditorsPerDocument: false,
          webviewOptions: {
            retainContextWhenHidden: false,
          },
        },
      ),
    ];

    return {
      dispose() {
        disposables.forEach((d) => d.dispose());
      },
    };
  }
}
