/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readFile } from "node:fs/promises";
import { Application, isHttpError, Router } from "@oakserver/oak";
import { fg, initFeatureGates } from "@triplex/lib/fg";
import { createForkLogger } from "@triplex/lib/log";
import { basename } from "@triplex/lib/path";
import { type FGEnvironment } from "@triplex/lib/types";
import { createWSServer } from "@triplex/websocks-server";
import { watch } from "chokidar";
import { type DetectResult } from "package-manager-detector";
import { detect } from "package-manager-detector/detect";
import {
  createProject,
  getElementFilePath,
  getJsxElementAt,
  getJsxElementProps,
  getJsxTag,
} from "./ast";
import {
  getFunctionProps,
  getJsxElementAtOrThrow,
  getJsxElementFromAstPath,
  getJsxElementFromAstPathOrThrow,
  getJsxElementParentExportNameOrThrow,
} from "./ast/jsx";
import { propGroupsDef } from "./ast/prop-groupings";
import { createAI } from "./services/ai";
import {
  add,
  commentComponent,
  create,
  deleteElement,
  duplicate,
  duplicateElement,
  group,
  groupElements,
  insertCode,
  move,
  rename,
  replaceCode,
  uncommentComponent,
  upsertProp,
} from "./services/component";
import { getAllFiles, getExports, getSceneExport } from "./services/file";
import {
  folderAssets,
  folderComponents,
  foundFolders,
} from "./services/project";
import {
  type ComponentTarget,
  type ComponentType,
  type ProjectAsset,
  type ReconciledTriplexConfig,
  type RendererManifest,
  type SourceFileChangedEvent,
  type TriplexPorts,
} from "./types";
import { checkMissingDependencies } from "./util/deps";
import { resolveGitRepoVisibility } from "./util/git";
import { getParam, getParamOptional } from "./util/params";
import { getThumbnailPath } from "./util/thumbnail";

export * from "./types";
export { type PropGroupDef } from "./ast/prop-groupings";

const log = createForkLogger("triplex:server");

export async function createServer({
  config,
  fgEnvironmentOverride,
  renderer,
  userId,
}: {
  config: ReconciledTriplexConfig;
  fgEnvironmentOverride: FGEnvironment;
  renderer: {
    manifest: RendererManifest;
    path: string;
    root: string;
  };
  userId: string;
}) {
  const viteOverrides = JSON.parse(process.env.VITE_FG_OVERRIDES || "{}");

  await initFeatureGates({
    environment: fgEnvironmentOverride,
    overrides: {
      ...config.experimental,
      ...viteOverrides,
    },
    userId,
  });

  const app = new Application();
  const router = new Router();
  const project = createProject({
    cwd: config.cwd,
    templates: renderer.manifest.templates,
  });
  const tws = createWSServer();
  const ai = createAI(project);

  app.use(async (ctx, next) => {
    try {
      log.debug(`${ctx.request.method} ${ctx.request.url.toString()}`);
      await next();
    } catch (error) {
      const err = error as Error;
      log.error(err.message);

      if (isHttpError(error)) {
        ctx.response.body = { error: error.message };
        ctx.response.status = 500;
      } else {
        throw error;
      }
    }
  });

  tws.UNSAFE_use((ctx, next) => {
    if (ctx.type === "route") {
      log.debug(`WS(route) ${ctx.path}`);
    } else {
      log.debug(`WS(event) ${ctx.name}`);
    }

    return next();
  });

  app.use((ctx, next) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
    ctx.response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,HEAD,OPTIONS,POST,PUT",
    );
    ctx.response.headers.set(
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
    );

    return next();
  });

  router.get("/healthcheck", (context) => {
    context.response.body = { message: "Healthy", status: 200 };
  });

  router.get("/thumbnail/:path/:exportName", async (context) => {
    const { exportName, path } = context.params;

    const thumbnailPath = await getThumbnailPath({ exportName, path });
    const file = await readFile(thumbnailPath);

    context.response.headers.set("Content-Type", "image/png");
    context.response.body = file;
  });

  router.post("/scene/:path/object/group", async (context) => {
    const sourceFile = project.getSourceFile(context.params.path);
    const body = await context.request.body({ type: "json" }).value;

    const [ids, result] = await sourceFile.edit((source) => {
      if (fg("selection_ast_path")) {
        return groupElements(source, {
          elements: body.elements,
          tag: "group",
        });
      } else {
        return group(source, { elements: body.elements, group: "group" });
      }
    });

    context.response.body = { ...ids, ...result };
  });

  router.post("/scene/:path/object/:line/:column/move", async (context) => {
    const destLine = Number(getParam(context, "destLine"));
    const destCol = Number(getParam(context, "destCol"));
    const action = getParam(context, "action") as
      | "move-before"
      | "move-after"
      | "make-child";
    const sourceFile = project.getSourceFile(context.params.path);
    const line = Number(context.params.line);
    const column = Number(context.params.column);

    const [ids] = await sourceFile.edit((source) => {
      move(
        source,
        {
          column,
          line,
        },
        {
          column: destCol,
          line: destLine,
        },
        action,
      );
    });

    context.response.body = { ...ids };
  });

  router.post("/ai/prompt", async (context) => {
    const body = await context.request.body({ type: "json" }).value;

    await ai.prompt({
      context: body.context,
      prompt: body.prompt,
    });

    context.response.body = { message: "success" };
  });

  router.post("/scene/:path/:line/add", async (context) => {
    const { code } = await context.request.body({ type: "json" }).value;
    const line = Number(context.params.line);
    const path = context.params.path;
    const sourceFile = project.getSourceFile(path);

    const [ids] = await sourceFile.edit((sourceFile) => {
      insertCode(sourceFile, { code, line });
    });

    context.response.body = { ...ids };
  });

  router.post("/scene/:path/:lineFrom/:lineTo/replace", async (context) => {
    const { code } = await context.request.body({ type: "json" }).value;
    const lineFrom = Number(context.params.lineFrom);
    const lineTo = Number(context.params.lineTo);
    const path = context.params.path;
    const sourceFile = project.getSourceFile(path);

    const [ids] = await sourceFile.edit((sourceFile) => {
      replaceCode(sourceFile, { code, lineFrom, lineTo });
    });

    context.response.body = { ...ids };
  });

  router.get("/scene/:path/object/:line/:column", async (context) => {
    const line = Number(context.params.line);
    const column = Number(context.params.column);
    const path = context.params.path;
    const sourceFile = project.getSourceFile(path);
    const sceneObject = getJsxElementAtOrThrow(sourceFile.read(), line, column);
    const { props } = getJsxElementProps(sourceFile.read(), sceneObject);
    const propNames = props.map((prop) => prop.name);

    context.response.body = { props: propNames };
  });

  /** Update or add a prop to a jsx element. */
  router.get("/scene/object/:line/:column/prop", async (context) => {
    const path = getParam(context, "path");
    const value = getParam(context, "value");
    const name = getParam(context, "name");
    const astPath = getParamOptional(context, "astPath");
    const line = Number(context.params.line);
    const column = Number(context.params.column);
    const sourceFile = project.getSourceFile(path);

    const [ids, result] = await sourceFile.edit((source) => {
      const jsxElement =
        astPath && fg("selection_ast_path")
          ? getJsxElementFromAstPathOrThrow(source, astPath)[0]
          : getJsxElementAtOrThrow(source, line, column);

      const action = upsertProp(jsxElement, name, value);

      return {
        action,
        node: jsxElement,
      };
    });

    const parentExportName = getJsxElementParentExportNameOrThrow(result.node);
    sourceFile.open(parentExportName);

    context.response.body = {
      ...ids,
      action: result.action,
    };
  });

  router.post("/scene/:path/undo/:id?", (context) => {
    const { id, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    context.response.body = sourceFile.undo(id ? Number(id) : undefined);
  });

  router.post("/scene/:path/redo/:id?", (context) => {
    const { id, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    context.response.body = sourceFile.redo(id ? Number(id) : undefined);
  });

  router.post(
    "/scene/:path/object/:line/:column/duplicate",
    async (context) => {
      const { column, line, path } = context.params;
      const sourceFile = project.getSourceFile(path);
      const astPath = getParamOptional(context, "astPath");

      const [ids, result] = await sourceFile.edit((source) => {
        if (astPath && fg("selection_ast_path")) {
          return duplicateElement(source, astPath);
        } else {
          return duplicate(source, Number(line), Number(column));
        }
      });

      context.response.body = { ...result, ...ids };
    },
  );

  router.post("/scene/:path/object/:line/:column/delete", async (context) => {
    const { column, line, path } = context.params;
    const sourceFile = project.getSourceFile(path);
    const astPath = getParamOptional(context, "astPath");

    const [ids] = await sourceFile.edit((source) => {
      if (astPath && fg("selection_ast_path")) {
        deleteElement(getJsxElementFromAstPathOrThrow(source, astPath)[0]);
      } else {
        commentComponent(source, Number(line), Number(column));
      }
    });

    context.response.body = { ...ids };
  });

  router.post("/scene/new", (context) => {
    const exportName = "Untitled";
    const sourceFile = project.createSourceFile(exportName);

    sourceFile.open(exportName);

    context.response.body = {
      exportName,
      message: "success",
      path: sourceFile.read().getFilePath(),
    };
  });

  router.post("/scene/:path/new", async (context) => {
    const { path } = context.params;
    const sourceFile = project.getSourceFile(path);

    const [ids, { exportName }] = await sourceFile.edit((source) => {
      return create(source, renderer.manifest.templates.newElements);
    });

    context.response.body = {
      exportName,
      path,
      ...ids,
    };
  });

  router.post("/scene/:path/save", async (context) => {
    const { path } = context.params;
    const sourceFile = project.getSourceFile(path);

    const result = await sourceFile.save();

    if (result) {
      context.response.body = { error: result, message: "error" };
    } else {
      context.response.body = { message: "success" };
    }
  });

  router.post("/scene/:path/save-as", async (context) => {
    const { path } = context.params;
    const newPath = getParam(context, "newPath");
    const sourceFile = project.getSourceFile(path);

    await sourceFile.save(newPath);

    context.response.body = { message: "success" };
  });

  router.get("/scene/:path/:exportName/open", async (context) => {
    const { exportName, path } = context.params;
    const index = getParam(context, "index");
    const sourceFile = project.getSourceFile(path);
    const parsedIndex = Number(index);

    sourceFile.open(exportName, parsedIndex);

    context.response.body = { message: "success" };
  });

  router.post("/scene/:path/:exportName", async (context) => {
    const { exportName, path } = context.params;
    const sourceFile = project.getSourceFile(path);
    const body = await context.request.body({ type: "json" }).value;
    const { name: newName } = body as { name: string };

    const [ids] = await sourceFile.edit((source) => {
      rename(source, exportName, newName);
    });

    context.response.body = { ...ids };
  });

  router.post("/scene/:path/object/:line/:column/restore", async (context) => {
    const { column, line, path } = context.params;
    const sourceFile = project.getSourceFile(path);

    const [ids] = await sourceFile.edit((source) => {
      uncommentComponent(source, Number(line), Number(column));
    });

    context.response.body = { ...ids };
  });

  router.post("/scene/:path/:exportName/object", async (context) => {
    const { exportName, path } = context.params;
    const body = await context.request.body({ type: "json" }).value;
    const { target, type } = body as {
      target?: ComponentTarget;
      type: ComponentType;
    };
    const sourceFile = project.getSourceFile(path);

    const [ids, result] = await sourceFile.edit((source) => {
      return add(source, exportName, type, target);
    });

    context.response.body = { ...result, ...ids };
  });

  router.post("/project/save-all", async (context) => {
    await project.saveAll();

    context.response.body = { message: "success" };
  });

  /** Resets the scene to what is currently saved to fs. */
  router.get("/scene/:path/reset", async (context) => {
    const path = context.params.path;
    const sourceFile = await project.getSourceFile(path);

    await sourceFile.reset();

    context.response.body = { message: "success" };
  });

  router.get("/scene/:path/close", async (context) => {
    const path = context.params.path;
    const sourceFile = await project.getSourceFile(path);

    await sourceFile.close();

    context.response.body = { message: "success" };
  });

  router.get("/fs/:path", async (context) => {
    const path = context.params.path;
    const sourceFile = await project.getSourceFile(path);

    context.response.body = sourceFile.read().getFullText();
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  const wsEventsDef = tws.collectTypes([
    tws.event<"fs-change", SourceFileChangedEvent>("fs-change", (sendEvent) => {
      project.onSourceFileChange((e) => {
        sendEvent(e);
      });
    }),
    tws.event<
      "fs-external-change",
      { path: string; redoID: number; undoID: number }
    >("fs-external-change", (sendEvent) => {
      project.onSourceFileExternalChange((e) => {
        sendEvent(e);
      });
    }),
  ]);

  const wsRoutesDef = tws.collectTypes([
    tws.route(
      "/scene",
      async () => {
        const result = await getAllFiles({
          cwd: project.cwd(),
          files: config.files,
        });
        return result;
      },
      (push) => {
        const watcher = watch(config.files, {
          ignoreInitial: true,
          ignored: /node_modules/,
        });
        watcher.on("add", push);
        watcher.on("change", push);
        watcher.on("unlink", push);
      },
    ),
    tws.route(
      "/scene/components",
      async () => {
        const result = await foundFolders(config.components);
        return result;
      },
      (push) => {
        const watcher = watch(config.components, { ignored: /node_modules/ });
        watcher.on("addDir", push);
        watcher.on("unlinkDir", push);
        watcher.on("add", push);
        watcher.on("unlink", push);
      },
    ),
    tws.route(
      "/scene/assets",
      async () => {
        const result = await foundFolders([config.assetsDir]);
        return result;
      },
      (push) => {
        const watcher = watch(config.assetsDir, { ignored: /node_modules/ });
        watcher.on("addDir", push);
        watcher.on("unlinkDir", push);
        watcher.on("add", push);
        watcher.on("unlink", push);
      },
    ),
    tws.route(
      "/scene/assets/:folderPath",
      async ({ folderPath }) => {
        const result = await folderAssets([config.assetsDir], folderPath);

        const parsed: ProjectAsset[] = result.map((asset) =>
          Object.assign(asset, {
            path: asset.path.replace(config.publicDir, ""),
          }),
        );

        return parsed;
      },
      (push, { folderPath }) => {
        const watcher = watch(folderPath, { ignored: /node_modules/ });
        watcher.on("add", push);
        watcher.on("unlink", push);
      },
    ),
    tws.route(
      "/scene/components/:folderPath",
      async ({ folderPath }) => {
        if (folderPath === "host") {
          const result = renderer.manifest.assets.hostElements;
          return result;
        }

        const result = await folderComponents(config.components, folderPath);
        return result;
      },
      (push, { folderPath }) => {
        const watcher = watch(folderPath, { ignored: /node_modules/ });
        watcher.on("add", push);
        watcher.on("unlink", push);
      },
    ),
    tws.route("/folder", async () => {
      return { name: basename(config.cwd) };
    }),
    tws.route("/prop-groups-def", async () => {
      return propGroupsDef;
    }),
    tws.route(
      "/project/state",
      async () => {
        return project.getState();
      },
      async (push) => {
        project.onStateChange(push);
      },
    ),
    tws.route(
      { defer: true, path: "/scene/:path/diagnostics" },
      async ({ path }) => {
        const sourceFile = project.getSourceFile(path);
        return sourceFile.syntaxErrors();
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.onModified(push, { includeInvalidChanges: true });
      },
    ),
    tws.route(
      { defer: true, path: "/scene/:path" },
      async ({ path }) => {
        const result = await getExports({
          components: config.components,
          files: config.files,
          path,
          project,
        });

        return result;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.onModified(push);
      },
    ),
    tws.route(
      { defer: true, path: "/scene/:path/:exportName" },
      async ({ exportName, path }) => {
        const result = await getSceneExport({
          exportName,
          files: config.files,
          path,
          project,
        });
        return result;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.onModified(push);
      },
    ),
    tws.route(
      { defer: true, path: "/scene/:path/:exportName/props" },
      async ({ exportName, path }) => {
        const sourceFile = await project.getSourceFile(path);
        const props = getFunctionProps(sourceFile.read(), exportName);
        return props;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.onModified(push);
        sourceFile.onDependencyModified(push);
      },
    ),
    tws.route(
      {
        defer: true,
        path: "/scene/:path/:exportName{/:exportName1}{/:exportName2}/props",
      },
      async ({ exportName, exportName1, exportName2, path }) => {
        const sourceFile = project.getSourceFile(path).read();

        return [
          getFunctionProps(sourceFile, exportName),
          getFunctionProps(sourceFile, exportName1),
          getFunctionProps(sourceFile, exportName2),
        ] as const;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.onModified(push);
        sourceFile.onDependencyModified(push);
      },
    ),
    tws.route("/project/repo", async () => {
      return await resolveGitRepoVisibility(config.cwd);
    }),
    tws.route(
      { defer: true, path: "/scene/:path/object/:line/:column" },
      (params) => {
        const path = params.path;
        const line = Number(params.line);
        const column = Number(params.column);
        const sourceFile = project.getSourceFile(path);
        const sceneObject = getJsxElementAt(sourceFile.read(), line, column);

        if (!sceneObject) {
          return undefined;
        }

        const tag = getJsxTag(sceneObject);
        const { props, transforms } = getJsxElementProps(
          sourceFile.read(),
          sceneObject,
        );

        if (tag.type === "custom") {
          const elementPath = getElementFilePath(sceneObject);

          return {
            exportName: elementPath.exportName,
            name: tag.tagName,
            path: elementPath.filePath,
            props,
            transforms,
            type: tag.type,
          };
        }

        return {
          name: tag.tagName,
          props,
          transforms,
          type: tag.type,
        } as const;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.onModified(push);
        sourceFile.onDependencyModified(push);
      },
    ),
    tws.route(
      { defer: true, path: "/scene/:path/object/:astPath" },
      ({ astPath, path }) => {
        const sourceFile = project.getSourceFile(path);
        const result = getJsxElementFromAstPath(sourceFile.read(), astPath);

        if (!result) {
          return undefined;
        }

        const [sceneObject] = result;
        const tag = getJsxTag(sceneObject);
        const { props, transforms } = getJsxElementProps(
          sourceFile.read(),
          sceneObject,
        );

        if (tag.type === "custom") {
          const elementPath = getElementFilePath(sceneObject);

          return {
            exportName: elementPath.exportName,
            name: tag.tagName,
            path: elementPath.filePath,
            props,
            transforms,
            type: tag.type,
          };
        }

        return {
          name: tag.tagName,
          props,
          transforms,
          type: tag.type,
        } as const;
      },
      async (push, { path }) => {
        const sourceFile = await project.getSourceFile(path);
        sourceFile.onModified(push);
        sourceFile.onDependencyModified(push);
      },
    ),
    tws.route("/project/dependencies", async () => {
      const pkgManager: null | DetectResult = await detect({
        cwd: config.cwd,
      });
      const missingDependencies = checkMissingDependencies(config.cwd);
      const tool = pkgManager ? pkgManager.name : "npm";

      return {
        args: tool === "deno" ? ["--npm"] : [],
        missingDependencies,
        pkgManager: tool,
      };
    }),
    tws.route(
      "/ai/chat",
      async (_, { type }) => {
        if (type === "pull") {
          return ai.getChat();
        }

        return ai.getChatLastPart();
      },
      (push) => {
        ai.onChatUpdated(push);
      },
    ),
  ]);

  return {
    listen: async (ports: TriplexPorts) => {
      const controller = new AbortController();
      app.listen({
        hostname: "0.0.0.0",
        port: ports.server,
        signal: controller.signal,
      });
      tws.listen(ports.ws, "0.0.0.0");

      const close = () => {
        try {
          controller.abort();
          tws.close();
        } finally {
          process.exit(0);
        }
      };

      process.once("SIGINT", close);
      process.once("SIGTERM", close);

      return close;
    },
    twsDefinition: wsRoutesDef,
    twsEventsDefinition: wsEventsDef,
  };
}

export { getConfig, resolveProjectCwd } from "./util/config";
export { inferExports } from "./util/module";
export { getRendererMeta } from "./util/renderer";
export { type AIChatContext } from "./services/ai";

export type TWSRouteDefinition = Awaited<
  ReturnType<typeof createServer>
>["twsDefinition"];

export type TWSEventDefinition = Awaited<
  ReturnType<typeof createServer>
>["twsEventsDefinition"];
