/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type Mutation } from "@triplex/server";
import * as vscode from "vscode";

function toJSONString(value: unknown): string {
  const str = JSON.stringify(value, (_k, v) =>
    v === undefined ? "__UNDEFINED__" : v,
  );

  return str.replaceAll('"__UNDEFINED__"', "undefined");
}

export class TriplexDocument implements vscode.CustomDocument {
  private _onDidChange = new vscode.EventEmitter<{
    label: string;
    redo(): Promise<void>;
    undo(): Promise<void>;
  }>();

  private _context: { ports: { server: number } } = { ports: { server: -1 } };
  private _modifiedPaths: Record<string, true> = {};
  private _skipNextSave = false;
  private _appliedCodeMutations: string[] = [];

  onDidChange = this._onDidChange.event;

  get uri() {
    return this._uri;
  }

  constructor(private readonly _uri: vscode.Uri) {}

  async backup(
    _context: vscode.CustomDocumentBackupContext,
    _cancellation: vscode.CancellationToken,
  ): Promise<vscode.CustomDocumentBackup> {
    return {
      delete() {},
      id: "",
    };
  }

  setContext(serverPort: number) {
    this._context.ports.server = serverPort;
  }

  async save(_cancellation: vscode.CancellationToken) {
    if (this._skipNextSave) {
      this._skipNextSave = false;
      return;
    }

    for (const path in this._modifiedPaths) {
      await fetch(
        `http://localhost:${
          this._context.ports.server
        }/scene/${encodeURIComponent(path)}/save`,
        {
          method: "POST",
        },
      );
    }
  }

  async saveAs(
    destination: vscode.Uri,
    _cancellation: vscode.CancellationToken,
  ) {
    await fetch(
      `http://localhost:${
        this._context.ports.server
      }/scene/${encodeURIComponent(
        this.uri.fsPath,
      )}/save-as?newPath=${encodeURIComponent(destination.fsPath)}`,
      {
        method: "POST",
      },
    );
  }

  async revert(_cancellation: vscode.CancellationToken) {
    for (const path in this._modifiedPaths) {
      await fetch(
        `http://localhost:${
          this._context.ports.server
        }/scene/${encodeURIComponent(path)}/reset`,
      );
    }
  }

  async upsertProp(data: {
    astPath: string;
    column: number;
    line: number;
    path: string;
    propName: string;
    propValue: unknown;
  }) {
    return this.undoableAction("Upsert prop", async () => {
      const result = await fetch(
        `http://localhost:${this._context.ports.server}/scene/object/${
          data.line
        }/${data.column}/prop?value=${encodeURIComponent(
          toJSONString(data.propValue),
        )}&path=${encodeURIComponent(data.path)}&name=${encodeURIComponent(
          data.propName,
        )}&astPath=${encodeURIComponent(data.astPath)}`,
      );

      const response: Mutation = await result.json();

      return { ...response, path: data.path };
    });
  }

  async groupElements(
    elements: { astPath: string; column: number; line: number; path: string }[],
  ) {
    const elementsByPath = Object.groupBy(elements, (e) => e.path);
    const response: {
      astPath: string;
      column: number;
      line: number;
      path: string;
    }[] = [];

    for (const path in elementsByPath) {
      const elements = elementsByPath[path];

      const result = await this.undoableAction("Group elements", async () => {
        const result = await fetch(
          `http://localhost:${
            this._context.ports.server
          }/scene/${encodeURIComponent(path)}/object/group`,
          { body: JSON.stringify({ elements }), method: "POST" },
        );

        const response: Mutation & {
          astPath: string;
          column: number;
          line: number;
        } = await result.json();

        return { ...response, path };
      });

      response.push({
        astPath: result.astPath,
        column: result.column,
        line: result.line,
        path,
      });
    }

    return response;
  }

  async duplicateElement(data: {
    astPath: string;
    column: number;
    line: number;
    path: string;
  }) {
    return this.undoableAction("Duplicate element", async () => {
      const result = await fetch(
        `http://localhost:${
          this._context.ports.server
        }/scene/${encodeURIComponent(data.path)}/object/${data.line}/${
          data.column
        }/duplicate?astPath=${encodeURIComponent(data.astPath)}`,
        { method: "POST" },
      );

      const response: Mutation & {
        astPath: string;
        column: number;
        line: number;
      } = await result.json();

      return { ...response, path: data.path };
    });
  }

  async deleteElement(data: {
    astPath: string;
    column: number;
    line: number;
    path: string;
  }) {
    return this.undoableAction("Delete element", async () => {
      const result = await fetch(
        `http://localhost:${
          this._context.ports.server
        }/scene/${encodeURIComponent(data.path)}/object/${data.line}/${
          data.column
        }/delete?astPath=${encodeURIComponent(data.astPath)}`,
        { method: "POST" },
      );

      const response: Mutation = await result.json();

      return { ...response, path: data.path };
    });
  }

  async insertComponent(data: {
    exportName: string;
    insertingExportName: string;
    insertingPath: string;
    path: string;
  }) {
    return this.undoableAction("Insert component", async () => {
      const result = await fetch(
        `http://localhost:${
          this._context.ports.server
        }/scene/${encodeURIComponent(data.path)}/${data.exportName}/object`,
        {
          body: JSON.stringify({
            type: {
              exportName: data.insertingExportName,
              path: data.insertingPath,
              props: {},
              type: "custom",
            },
            // "target" property can be defined to insert at a specific location.
            // we can add support for this later.
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );

      const response: Mutation = await result.json();

      return { ...response, path: data.path };
    });
  }

  async moveElement(data: {
    action: "move-before" | "move-after" | "make-child" | "reparent";
    destination: { astPath: string; column: number; line: number };
    path: string;
    source: { astPath: string; column: number; line: number };
  }) {
    return this.undoableAction("Move element", async () => {
      const result = await fetch(
        `http://localhost:${
          this._context.ports.server
        }/scene/${encodeURIComponent(data.path)}/object/${data.source.line}/${
          data.source.column
        }/move?destLine=${data.destination.line}&destCol=${
          data.destination.column
        }&action=${data.action}`,
        { method: "POST" },
      );

      const response: Mutation = await result.json();

      return { ...response, path: data.path };
    });
  }

  async updateCode(
    data:
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
        },
  ) {
    if (this._appliedCodeMutations.includes(data.id)) {
      // Skip the code mutation it's already been applied.
      return;
    }

    return this.undoableAction("Update code", async () => {
      this._appliedCodeMutations.push(data.id);

      const result =
        data.type === "replace"
          ? await fetch(
              `http://localhost:${this._context.ports.server}/scene/${encodeURIComponent(data.path)}/${data.fromLineNumber}/${data.toLineNumber}/replace`,
              {
                body: JSON.stringify({ code: data.code }),
                method: "POST",
              },
            )
          : await fetch(
              `http://localhost:${this._context.ports.server}/scene/${encodeURIComponent(data.path)}/${data.lineNumber}/add`,
              {
                body: JSON.stringify({ code: data.code }),
                method: "POST",
              },
            );

      const response: Mutation = await result.json();

      return { ...response, path: data.path };
    });
  }

  async undoableAction<
    TResponse extends
      | {
          path: string;
          redoID: number;
          status: "modified";
          undoID: number;
        }
      | { path: string; status: "unmodified" },
  >(
    label: string,
    callback: () => Promise<TResponse> | TResponse,
    opts?: {
      /**
       * Immediately forces the document to be saved but skips calling the
       * Triplex backend. This is done to get rid of the dirty state inside VS
       * Code when the change originates from outside of Triplex.
       *
       * Only use this if you know what you're doing!
       */
      skipDirtyCheck?: boolean;
    },
  ): Promise<Omit<TResponse, "redoID" | "undoID" | "path" | "status">> {
    const result = await callback();

    if (result.status === "unmodified") {
      return result;
    }

    const { path, redoID, status, undoID, ...response } = result;

    this._modifiedPaths[path] = true;

    this._onDidChange.fire({
      label,
      redo: async () => {
        await fetch(
          `http://localhost:${
            this._context.ports.server
          }/scene/${encodeURIComponent(path)}/redo/${redoID}`,
          {
            method: "POST",
          },
        );
      },
      undo: async () => {
        await fetch(
          `http://localhost:${
            this._context.ports.server
          }/scene/${encodeURIComponent(path)}/undo/${undoID}`,
          {
            method: "POST",
          },
        );
      },
    });

    if (opts?.skipDirtyCheck) {
      this._skipNextSave = true;
      vscode.workspace.save(this.uri);
    }

    return response;
  }

  dispose(): void {
    this._onDidChange.dispose();
  }
}
