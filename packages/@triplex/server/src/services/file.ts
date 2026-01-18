/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readFile } from "node:fs/promises";
import { extname, normalize } from "@triplex/lib/path";
import anymatch from "anymatch";
import parent from "glob-parent";
import readdirp from "readdirp";
import { getJsxElementsPositions, type TRIPLEXProject } from "../ast";
import { inferExports } from "../util/module";
import { matchFile } from "../util/path";

export function getSceneExport({
  exportName,
  files,
  path,
  project,
}: {
  exportName: string;

  files: string[];
  path: string;
  project: TRIPLEXProject;
}) {
  const sourceFile = project.getSourceFile(path).read();
  const positions = getJsxElementsPositions(sourceFile, exportName);
  const foundExports = inferExports(sourceFile.getText());
  const foundExport = foundExports.find((exp) => exp.exportName === exportName);

  if (!foundExport || !positions) {
    return undefined;
  }

  const pos = sourceFile.getLineAndColumnAtPos(
    positions.declaration.getStart(),
  );

  return {
    column: pos.column,
    exports: foundExports,
    line: pos.line,
    matchesFilesGlob: matchFile(path, files),
    name: foundExport.name,
    path,
    sceneObjects: positions.elements,
  };
}

export function getExports({
  components,
  files,
  path,
  project,
}: {
  components: string[];
  files: string[];
  path: string;
  project: TRIPLEXProject;
}) {
  const sourceFile = project.getSourceFile(path).read();
  const foundExports = inferExports(sourceFile.getText());

  return {
    exports: foundExports,
    matchesComponentsGlob: matchFile(path, components),
    matchesFilesGlob: matchFile(path, files),
    path,
  };
}

export async function getAllFiles({
  cwd = process.cwd(),
  files,
}: {
  cwd?: string;
  files: string[];
}) {
  const foundFiles: {
    exports: { exportName: string; name: string }[];
    name: string;
    path: string;
  }[] = [];
  // Handle Windows separators being invalid in globs.
  const roots = files.map((glob) => parent(glob));

  for (let i = 0; i < files.length; i++) {
    const glob = files[i];
    const root = roots[i];
    const match = anymatch(glob);

    for await (const entry of readdirp(root)) {
      if (match(entry.fullPath)) {
        const file = await readFile(entry.fullPath, "utf8");
        const foundExports = inferExports(file);

        foundFiles.push({
          exports: foundExports,
          name: entry.basename.replace(extname(entry.path), ""),
          path: normalize(entry.fullPath),
        });
      }
    }
  }

  return {
    cwd,
    scenes: foundFiles,
  };
}
