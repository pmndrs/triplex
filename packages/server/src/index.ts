import {
  Application,
  HttpError,
  isHttpError,
  Router,
  RouterContext,
} from "@oakserver/oak";
import {
  JsxOpeningElement,
  JsxSelfClosingElement,
  SourceFile,
  SyntaxKind,
} from "ts-morph";
import { join } from "path/posix";
import {
  createProject,
  getJsxAttributeValue,
  getJsxElementPropTypes,
} from "@triplex/ts-morph";

export function createServer(_: {}) {
  const app = new Application();
  const router = new Router();
  const project = createProject({
    tempDir: join(process.cwd(), "node_modules", ".triplex"),
  });

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      if (isHttpError(err)) {
        ctx.response.body = { error: err.message };
      } else {
        throw err;
      }
    }
  });

  app.use((ctx, next) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    return next();
  });

  function getParam(context: RouterContext<any, any>, key: string) {
    const path = context.request.url.searchParams.get(key);
    if (!path) {
      throw new HttpError(`Missing [${key}] search param`);
    }

    return path;
  }

  router.get("/scene/open", async (context) => {
    const path = getParam(context, "path");
    const { sourceFile, transformedPath } = project.getSourceFile(path);

    const jsxElements = sourceFile
      .getDescendantsOfKind(SyntaxKind.JsxElement)
      .map((x) => {
        const { column, line } = sourceFile.getLineAndColumnAtPos(x.getPos());

        return {
          name: x.getOpeningElement().getTagNameNode().getText(),
          line: line - 1,
          column: column - 1,
        };
      });

    const jsxSelfClosing = sourceFile
      .getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
      .map((x) => {
        const { column, line } = sourceFile.getLineAndColumnAtPos(x.getPos());

        return {
          name: x.getTagNameNode().getText(),
          line: line - 1,
          column: column - 1,
        };
      });

    context.response.body = {
      transformedPath,
      sceneObjects: jsxElements.concat(jsxSelfClosing),
    };
  });

  function getAllJsxElements(sourceFile: SourceFile) {
    const jsxElements = sourceFile.getDescendantsOfKind(
      SyntaxKind.JsxOpeningElement
    );
    const jsxSelfClosing = sourceFile.getDescendantsOfKind(
      SyntaxKind.JsxSelfClosingElement
    );

    const elements: (JsxSelfClosingElement | JsxOpeningElement)[] = [];
    elements.push(...jsxSelfClosing, ...jsxElements);

    return elements;
  }

  router.get("/scene/object/:line/:column", (context) => {
    const path = getParam(context, "path");
    const { sourceFile } = project.getSourceFile(path);
    const line = Number(context.params.line);
    const column = Number(context.params.column);
    const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(
      line,
      column
    );
    const sceneObject = getAllJsxElements(sourceFile).find(
      (node) => node.getPos() === pos
    );

    if (!sceneObject) {
      context.response.status = 404;
      context.response.body = { message: "Not found" };
      return;
    }

    const props = sceneObject.getAttributes().map((prop) => {
      const { column, line } = sourceFile.getLineAndColumnAtPos(prop.getPos());

      return {
        column: column - 1,
        line: line - 1,
        name: prop.getChildAtIndex(0).getText(),
        value: getJsxAttributeValue(prop),
      };
    });

    const name = sceneObject.getTagNameNode().getText();
    const types = getJsxElementPropTypes(sourceFile, name);

    context.response.body = { name, props, types };
  });

  router.get("/scene/object/:line/:column/prop", (context) => {
    const path = getParam(context, "path");
    const value = getParam(context, "value");
    const name = getParam(context, "name");
    const line = Number(context.params.line);
    const column = Number(context.params.column);
    const { sourceFile } = project.getSourceFile(path);
    const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(
      line,
      column
    );
    const sceneObject = getAllJsxElements(sourceFile).find(
      (node) => node.getPos() === pos
    );

    if (!sceneObject) {
      context.response.status = 404;
      context.response.body = { message: "Not found" };
      return;
    }

    const attribute = sceneObject
      .getDescendantsOfKind(SyntaxKind.JsxAttribute)
      .find((prop) => prop.getName() === name);

    let action = "";

    if (attribute) {
      attribute.setInitializer(`{${value}}`);
      action = "updated";
    } else {
      sceneObject.addAttribute({
        name,
        initializer: `{${value}}`,
      });
      action = "added";
    }

    context.response.body = { message: "success", action };
  });

  router.get("/scene/prop/:line/:column", (context) => {
    const path = getParam(context, "path");
    const value = getParam(context, "value");
    const { sourceFile } = project.getSourceFile(path);
    const line = Number(context.params.line);
    const column = Number(context.params.column);
    const pos = sourceFile.compilerNode.getPositionOfLineAndCharacter(
      line,
      column
    );
    const attribute = sourceFile
      .getDescendantAtPos(pos)
      ?.getParentIfKind(SyntaxKind.JsxAttribute);

    if (!attribute) {
      context.response.status = 404;
      context.response.body = { message: "Not found" };
      return;
    }

    const parsed = JSON.parse(value);

    switch (typeof parsed) {
      case "string":
        attribute.setInitializer(`"${parsed}"`);
        break;

      default:
        attribute.setInitializer(`{${value}}`);
        break;
    }

    context.response.body = { message: "success" };
  });

  router.get("/scene/close", async (context) => {
    const path = getParam(context, "path");

    await project.removeSourceFile(path);

    context.response.body = { message: "success" };
  });

  router.get("/scene/save", async (context) => {
    const path = getParam(context, "path");
    const { sourceFile } = project.getSourceFile(path);
    if (sourceFile) {
      await sourceFile.save();
    }

    context.response.body = { message: "success" };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return {
    listen: (port = 8000) => app.listen({ port }),
  };
}
