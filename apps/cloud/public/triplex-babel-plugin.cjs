"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../packages/@triplex/client/src/plugins/babel-plugin.ts
var babel_plugin_exports = {};
__export(babel_plugin_exports, {
  default: () => triplexBabelPlugin
});
module.exports = __toCommonJS(babel_plugin_exports);
var t2 = __toESM(require("@babel/types"));

// ../../packages/lib/src/path.ts
var nodePath = __toESM(require("node:path"));
function toUnix(p) {
  p = p.replaceAll("\\", "/");
  p = p.replaceAll(/(?<!^)\/+/g, "/");
  p = p.replace(/^\/[A-z]:\//, (match) => match.slice(1));
  if (p.match(/^[A-z]:\//)) {
    p = p[0].toUpperCase() + p.slice(1);
  }
  return p;
}
function resolve2(...paths) {
  return toUnix(nodePath.resolve(...paths.map(toUnix)));
}
function dirname2(p) {
  return toUnix(nodePath.dirname(p));
}
function normalize2(p) {
  return toUnix(nodePath.normalize(toUnix(p)));
}
function extname2(p) {
  return nodePath.extname(p);
}

// ../../packages/@triplex/client/src/util/babel.ts
var t = __toESM(require("@babel/types"));
var ignoredJSXElements = {
  Route: "react-router",
  Routes: "react-router"
};
function isIgnoredJSXElement(path) {
  const identifier3 = path.get("openingElement").get("name");
  if (!identifier3.isJSXIdentifier()) {
    return false;
  }
  const isPossiblyIgnoredElement = ignoredJSXElements[identifier3.node.name];
  if (!isPossiblyIgnoredElement) {
    return false;
  }
  const importSpecifierPath = resolveIdentifierImportSpecifier(identifier3);
  if (!importSpecifierPath || !importSpecifierPath.parentPath.isImportDeclaration()) {
    return false;
  }
  const modulePath = importSpecifierPath.parentPath.node.source.value;
  const isIgnoredElement = isPossiblyIgnoredElement === modulePath;
  if (isIgnoredElement) {
    return true;
  }
  return false;
}
function isIdentifierFromModule(path, moduleName) {
  const importSpecifier2 = resolveIdentifierImportSpecifier(path);
  if (importSpecifier2 && importSpecifier2.parentPath.isImportDeclaration() && importSpecifier2.parentPath.node.source.value === moduleName) {
    return true;
  }
  return false;
}
function resolveIdentifierImportSpecifier(path) {
  const name = path.node.name;
  const binding = path.scope.getBinding(name);
  if (!binding?.path.isImportSpecifier() && !binding?.path.isImportDefaultSpecifier()) {
    return void 0;
  }
  return binding.path;
}
function isJSXIdentifierFromNodeModules(path, cwd) {
  const identifier3 = path.get("openingElement").get("name");
  if (!identifier3.isJSXIdentifier()) {
    return false;
  }
  const importSpecifierPath = resolveIdentifierImportSpecifier(identifier3);
  if (!importSpecifierPath || !importSpecifierPath.parentPath.isImportDeclaration()) {
    return false;
  }
  try {
    const location = require.resolve(
      importSpecifierPath.parentPath.node.source.value,
      {
        paths: [cwd]
      }
    );
    return location.includes("node_modules");
  } catch {
  }
  return false;
}
function isChildOf(path, predicate) {
  if (path.findParent((parent) => predicate(parent))) {
    return true;
  }
  return false;
}
function isChildOfReturnStatement(path) {
  if (path.findParent((parent) => parent.isReturnStatement())) {
    return true;
  }
  if (path.findParent(
    (parent) => parent.isArrowFunctionExpression() && !parent.get("body").isBlockStatement()
  )) {
    return true;
  }
  return false;
}
function extractFunctionArgs(args) {
  const destructured = [];
  let spreadIdentifier = void 0;
  switch (args?.type) {
    case "Identifier":
      spreadIdentifier = args.name;
      break;
    case "ObjectPattern":
      args.properties.forEach((prop) => {
        if (prop.type === "ObjectProperty" && prop.key.type === "Identifier") {
          destructured.push(prop.key.name);
        } else if (prop.type === "RestElement" && prop.argument.type === "Identifier") {
          spreadIdentifier = prop.argument.name;
        }
      });
      break;
  }
  return { destructured, spreadIdentifier };
}
function importIfMissing(pass, module2, namedImport) {
  if (pass.scope.hasBinding(namedImport)) {
    return;
  }
  pass.node.body.unshift(
    t.importDeclaration(
      [t.importSpecifier(t.identifier(namedImport), t.identifier(namedImport))],
      t.stringLiteral(module2)
    )
  );
}
function resolveIdentifierExportName(path, identifierName) {
  const foundExport = path.scope.getBinding(identifierName)?.referencePaths.map((path2) => {
    if (path2.parentPath?.isExportDeclaration() || path2.parentPath?.isExportDefaultDeclaration() || path2.parentPath?.isExportSpecifier() || path2.parentPath?.isExportDefaultSpecifier()) {
      return path2.parentPath;
    }
    return path2;
  }).find(
    (path2) => path2.isExportDefaultDeclaration() || path2.isExportDeclaration() || path2.isExportSpecifier() || path2.isExportDefaultSpecifier()
  );
  if (!foundExport) {
    return "";
  }
  if (foundExport.isExportDefaultDeclaration() || foundExport.isExportDefaultSpecifier()) {
    return "default";
  } else if (foundExport.isExportDeclaration() || foundExport.isExportSpecifier()) {
    return identifierName;
  }
  return "";
}
function resolvePath(root, path) {
  if (path.startsWith(".")) {
    return resolve2(dirname2(root || "/"), path) + extname2(root || "");
  } else if (path.startsWith("/")) {
    return path;
  }
  return "";
}
function resolveIdentifierOrigin(pass, path, identifierName) {
  const exportName = resolveIdentifierExportName(path, identifierName);
  const filename = normalize2(pass.filename || "");
  if (exportName) {
    return {
      exportName,
      path: filename
    };
  }
  const binding = path.scope.getBinding(identifierName);
  if (binding?.path.isImportSpecifier() && binding.path.node.imported.type === "Identifier" && binding.path.parentPath.isImportDeclaration()) {
    return {
      exportName: binding.path.node.imported.name,
      path: resolvePath(filename, binding.path.parentPath.node.source.value)
    };
  }
  if (binding?.path.isImportDefaultSpecifier() && binding.path.parentPath.isImportDeclaration()) {
    return {
      exportName: "default",
      path: resolvePath(filename, binding.path.parentPath.node.source.value)
    };
  }
  return void 0;
}

// ../../packages/@triplex/client/src/util/is-react-element.ts
var elements = {
  a: true,
  abbr: true,
  address: true,
  animate: true,
  animateMotion: true,
  animateTransform: true,
  area: true,
  article: true,
  aside: true,
  audio: true,
  b: true,
  base: true,
  bdi: true,
  bdo: true,
  big: true,
  blockquote: true,
  body: true,
  br: true,
  button: true,
  canvas: true,
  caption: true,
  center: true,
  circle: true,
  cite: true,
  clipPath: true,
  code: true,
  col: true,
  colgroup: true,
  data: true,
  datalist: true,
  dd: true,
  defs: true,
  del: true,
  desc: true,
  details: true,
  dfn: true,
  dialog: true,
  div: true,
  dl: true,
  dt: true,
  ellipse: true,
  em: true,
  embed: true,
  feBlend: true,
  feColorMatrix: true,
  feComponentTransfer: true,
  feComposite: true,
  feConvolveMatrix: true,
  feDiffuseLighting: true,
  feDisplacementMap: true,
  feDistantLight: true,
  feDropShadow: true,
  feFlood: true,
  feFuncA: true,
  feFuncB: true,
  feFuncG: true,
  feFuncR: true,
  feGaussianBlur: true,
  feImage: true,
  feMerge: true,
  feMergeNode: true,
  feMorphology: true,
  feOffset: true,
  fePointLight: true,
  feSpecularLighting: true,
  feSpotLight: true,
  feTile: true,
  feTurbulence: true,
  fieldset: true,
  figcaption: true,
  figure: true,
  filter: true,
  footer: true,
  foreignObject: true,
  form: true,
  g: true,
  h1: true,
  h2: true,
  h3: true,
  h4: true,
  h5: true,
  h6: true,
  head: true,
  header: true,
  hgroup: true,
  hr: true,
  html: true,
  i: true,
  iframe: true,
  image: true,
  img: true,
  input: true,
  ins: true,
  kbd: true,
  keygen: true,
  label: true,
  legend: true,
  li: true,
  line: true,
  linearGradient: true,
  link: true,
  main: true,
  map: true,
  mark: true,
  marker: true,
  mask: true,
  menu: true,
  menuitem: true,
  meta: true,
  metadata: true,
  meter: true,
  mpath: true,
  nav: true,
  noindex: true,
  noscript: true,
  object: true,
  ol: true,
  optgroup: true,
  option: true,
  output: true,
  p: true,
  param: true,
  path: true,
  pattern: true,
  picture: true,
  polygon: true,
  polyline: true,
  pre: true,
  progress: true,
  q: true,
  radialGradient: true,
  rect: true,
  rp: true,
  rt: true,
  ruby: true,
  s: true,
  samp: true,
  script: true,
  search: true,
  section: true,
  select: true,
  set: true,
  slot: true,
  small: true,
  source: true,
  span: true,
  stop: true,
  strong: true,
  style: true,
  sub: true,
  summary: true,
  sup: true,
  svg: true,
  switch: true,
  symbol: true,
  table: true,
  tbody: true,
  td: true,
  template: true,
  text: true,
  textPath: true,
  textarea: true,
  tfoot: true,
  th: true,
  thead: true,
  time: true,
  title: true,
  tr: true,
  track: true,
  tspan: true,
  u: true,
  ul: true,
  use: true,
  var: true,
  video: true,
  view: true,
  wbr: true,
  webview: true
};
function isReactDOMElement(elementName) {
  return elements[elementName] ?? false;
}

// ../../packages/@triplex/client/src/util/is-three-element.ts
var elements2 = {
  ambientLight: true,
  ambientLightProbe: true,
  arrayCamera: true,
  arrowHelper: true,
  audioListener: true,
  axesHelper: true,
  batchedMesh: true,
  bone: true,
  box3Helper: true,
  boxBufferGeometry: true,
  boxGeometry: true,
  boxHelper: true,
  bufferAttribute: true,
  bufferGeometry: true,
  camera: true,
  cameraHelper: true,
  canvasTexture: true,
  capsuleGeometry: true,
  circleBufferGeometry: true,
  circleGeometry: true,
  color: true,
  compressedTexture: true,
  coneBufferGeometry: true,
  coneGeometry: true,
  cubeCamera: true,
  cubeTexture: true,
  cylinderBufferGeometry: true,
  cylinderGeometry: true,
  dataTexture: true,
  dataTexture3D: true,
  depthTexture: true,
  directionalLight: true,
  directionalLightHelper: true,
  directionalLightShadow: true,
  dodecahedronBufferGeometry: true,
  dodecahedronGeometry: true,
  edgesGeometry: true,
  euler: true,
  extrudeBufferGeometry: true,
  extrudeGeometry: true,
  float16BufferAttribute: true,
  float32BufferAttribute: true,
  float64BufferAttribute: true,
  fog: true,
  fogExp2: true,
  gridHelper: true,
  group: true,
  hemisphereLight: true,
  hemisphereLightHelper: true,
  hemisphereLightProbe: true,
  icosahedronBufferGeometry: true,
  icosahedronGeometry: true,
  instancedBufferAttribute: true,
  instancedBufferGeometry: true,
  instancedMesh: true,
  int16BufferAttribute: true,
  int32BufferAttribute: true,
  int8BufferAttribute: true,
  lOD: true,
  latheBufferGeometry: true,
  latheGeometry: true,
  light: true,
  lightProbe: true,
  lightShadow: true,
  lineBasicMaterial: true,
  lineDashedMaterial: true,
  lineLoop: true,
  lineSegments: true,
  material: true,
  matrix3: true,
  matrix4: true,
  mesh: true,
  meshBasicMaterial: true,
  meshDepthMaterial: true,
  meshDistanceMaterial: true,
  meshLambertMaterial: true,
  meshMatcapMaterial: true,
  meshNormalMaterial: true,
  meshPhongMaterial: true,
  meshPhysicalMaterial: true,
  meshStandardMaterial: true,
  meshToonMaterial: true,
  object3D: true,
  octahedronBufferGeometry: true,
  octahedronGeometry: true,
  orthographicCamera: true,
  perspectiveCamera: true,
  planeBufferGeometry: true,
  planeGeometry: true,
  planeHelper: true,
  pointLight: true,
  pointLightHelper: true,
  points: true,
  pointsMaterial: true,
  polarGridHelper: true,
  polyhedronBufferGeometry: true,
  polyhedronGeometry: true,
  positionalAudio: true,
  primitive: true,
  quaternion: true,
  rawShaderMaterial: true,
  raycaster: true,
  rectAreaLight: true,
  ringBufferGeometry: true,
  ringGeometry: true,
  scene: true,
  shaderMaterial: true,
  shadowMaterial: true,
  shape: true,
  shapeBufferGeometry: true,
  shapeGeometry: true,
  skeleton: true,
  skeletonHelper: true,
  skinnedMesh: true,
  sphereBufferGeometry: true,
  sphereGeometry: true,
  spotLight: true,
  spotLightHelper: true,
  spotLightShadow: true,
  sprite: true,
  spriteMaterial: true,
  tetrahedronBufferGeometry: true,
  tetrahedronGeometry: true,
  texture: true,
  torusBufferGeometry: true,
  torusGeometry: true,
  torusKnotBufferGeometry: true,
  torusKnotGeometry: true,
  tubeBufferGeometry: true,
  tubeGeometry: true,
  uint16BufferAttribute: true,
  uint32BufferAttribute: true,
  uint8BufferAttribute: true,
  vector2: true,
  vector3: true,
  vector4: true,
  videoTexture: true,
  wireframeGeometry: true
};
var THREE_FIBER_MODULES = /(^@react-three\/)|(^ecctrl$)/;
var IGNORED_HOOKS_MODULES = ["@react-three/drei"];
var PROBABLY_THREE_FIBER = ["object3d"];
function isReactThreeElement(elementName) {
  return elements2[elementName] ?? false;
}
function isCanvasFromThreeFiber(path) {
  const identifierPath = path.get("openingElement").get("name");
  if (!identifierPath.isJSXIdentifier()) {
    return false;
  }
  const importSpecifierPath = resolveIdentifierImportSpecifier(identifierPath);
  if (!importSpecifierPath || !importSpecifierPath.isImportSpecifier()) {
    return false;
  }
  return importSpecifierPath.get("imported").isIdentifier({ name: "Canvas" }) && importSpecifierPath.parentPath.isImportDeclaration() && importSpecifierPath.parentPath.get("source").isStringLiteral({ value: "@react-three/fiber" });
}
function isComponentFromThreeFiber(path) {
  const identifierPath = path.get("openingElement").get("name");
  if (!identifierPath.isJSXIdentifier()) {
    return false;
  }
  const elementName = identifierPath.node.name;
  if (PROBABLY_THREE_FIBER.some(
    (name) => elementName.toLowerCase().includes(name)
  )) {
    return true;
  }
  const importSpecifierPath = resolveIdentifierImportSpecifier(identifierPath);
  if (!importSpecifierPath || !importSpecifierPath.parentPath.isImportDeclaration()) {
    return false;
  }
  const source = importSpecifierPath.parentPath.get("source");
  if (!source.isStringLiteral()) {
    return false;
  }
  return THREE_FIBER_MODULES.test(source.node.value);
}
function isHookFromThreeFiber(path) {
  if (path.node.name.startsWith("use")) {
    const importSpecifier2 = resolveIdentifierImportSpecifier(path);
    const moduleName = importSpecifier2?.parentPath.isImportDeclaration() && importSpecifier2?.parentPath.node.source.value || "";
    if (THREE_FIBER_MODULES.test(moduleName) && // Ignore hooks from @react-three/drei as some of them can be used outside of three fiber.
    IGNORED_HOOKS_MODULES.every((module2) => moduleName !== module2)) {
      return true;
    }
  }
  return false;
}

// ../../packages/@triplex/client/src/plugins/babel-plugin.ts
var AUTOMATIC_JSX_RUNTIME = ["jsx", "jsxs", "_jsx", "_jsxs"];
var SCENE_OBJECT_COMPONENT_NAME = "SceneObject";
function resolveOrderingFromMap(dependencyMap) {
  const order = [];
  const visited = /* @__PURE__ */ new Set();
  function visit(name) {
    if (visited.has(name)) {
      return;
    }
    visited.add(name);
    const dependency = dependencyMap.get(name);
    if (dependency) {
      visit(dependency);
    }
    order.push(name);
  }
  dependencyMap.forEach((_, name) => visit(name));
  return order;
}
function triplexBabelPlugin({
  cwd = process.cwd(),
  exclude: excludeDirs,
  skipFunctionMeta
}) {
  const cache = /* @__PURE__ */ new WeakSet();
  const componentsFoundInPass = /* @__PURE__ */ new Map();
  const componentMetaDependencyMap = /* @__PURE__ */ new Map();
  const exclude = excludeDirs.filter(Boolean);
  const locationPointer = [];
  function pushLocation(elementName, exportName) {
    if (locationPointer.length === 0) {
      locationPointer.push({
        children: [],
        name: exportName,
        parent: null
      });
    } else if (locationPointer.at(0)?.name !== exportName) {
      locationPointer.length = 0;
      locationPointer.push({
        children: [],
        name: exportName,
        parent: null
      });
    }
    const pointer = locationPointer.at(-1);
    const newLocation = {
      children: [],
      name: elementName,
      parent: locationPointer.at(-1) || null
    };
    if (!pointer) {
      throw new Error("invariant: pointer should be defined (push)");
    }
    pointer.children.push(newLocation);
    locationPointer.push(newLocation);
  }
  function popLocation() {
    if (locationPointer.length > 1) {
      locationPointer.pop();
    }
  }
  function buildLocation() {
    const path = [];
    const pointer = locationPointer.at(-1);
    if (!pointer) {
      throw new Error("invariant: pointer should be defined (build)");
    }
    let parent = pointer;
    while (parent) {
      const siblingCounts = {};
      const grandparent = parent.parent;
      if (grandparent) {
        for (let i = 0; i < grandparent.children.length; i++) {
          const child = grandparent.children[i];
          siblingCounts[child.name] = (siblingCounts[child.name] || 0) + 1;
        }
      }
      const count = siblingCounts[parent.name];
      const suffix = count > 1 ? `.${count - 1}` : "";
      path.push(`${parent.name}${suffix}`);
      parent = parent.parent;
    }
    return path.reverse().join("/");
  }
  function resetLocation() {
    locationPointer.length = 0;
  }
  let shouldSkip = false;
  let shouldImportFragment = false;
  let currentFunction = void 0;
  function initializeMetaForCurrentFunction() {
    if (!skipFunctionMeta && currentFunction && !componentsFoundInPass.has(currentFunction.name)) {
      componentsFoundInPass.set(currentFunction.name, {
        lighting: "default",
        root: void 0
      });
    }
  }
  function resetCurrentFunction(path) {
    if (path.node.id?.type === "Identifier" && path.node.id.name === currentFunction?.name && !skipFunctionMeta) {
      const meta = componentsFoundInPass.get(currentFunction.name);
      if (currentFunction.canvasComponent) {
        meta.root = "react";
      } else if (currentFunction.firstFoundHookSource) {
        meta.root = "react-three-fiber";
      } else if (currentFunction.firstFoundHostElementSource && currentFunction.firstFoundCustomComponentName) {
        meta.root = t2.logicalExpression(
          "||",
          t2.optionalMemberExpression(
            t2.optionalMemberExpression(
              t2.identifier(currentFunction.firstFoundCustomComponentName),
              t2.identifier("triplexMeta"),
              false,
              true
            ),
            t2.identifier("root"),
            false,
            true
          ),
          t2.stringLiteral(currentFunction.firstFoundHostElementSource)
        );
      } else if (currentFunction.firstFoundHostElementSource) {
        meta.root = currentFunction.firstFoundHostElementSource;
      } else if (currentFunction.firstFoundCustomComponentName) {
        meta.root = t2.optionalMemberExpression(
          t2.optionalMemberExpression(
            t2.identifier(currentFunction.firstFoundCustomComponentName),
            t2.identifier("triplexMeta"),
            false,
            true
          ),
          t2.identifier("root"),
          false,
          true
        );
      } else if (currentFunction.returnsJSX) {
        meta.root = "react";
      }
      if (currentFunction.firstFoundCustomComponentName) {
        componentMetaDependencyMap.set(
          currentFunction.name,
          currentFunction.firstFoundCustomComponentName
        );
      }
      currentFunction = void 0;
    }
  }
  const plugin = {
    visitor: {
      CallExpression(path) {
        const callee = path.get("callee");
        if (!shouldSkip && callee.isIdentifier() && callee.node.name === "createRoot" && isIdentifierFromModule(callee, "react-dom/client")) {
          path.replaceWith(
            t2.objectExpression([
              t2.objectProperty(
                t2.identifier("render"),
                t2.arrowFunctionExpression([], t2.blockStatement([]))
              ),
              t2.objectProperty(
                t2.identifier("unmount"),
                t2.arrowFunctionExpression([], t2.blockStatement([]))
              )
            ])
          );
          return;
        }
        if (currentFunction) {
          if (callee.isIdentifier() && isHookFromThreeFiber(callee)) {
            currentFunction.firstFoundHookSource ??= "react-three-fiber";
          }
        }
        if (path.node.callee.type === "MemberExpression" && path.node.callee.object.type === "Identifier" && path.node.callee.object.name !== "document" && path.node.callee.property.type === "Identifier" && path.node.callee.property.name === "createElement" && path.node.arguments.length >= 2 && t2.isExpression(path.node.arguments[0]) && !cache.has(path.node)) {
          const elementName = path.node.arguments[0].type === "StringLiteral" ? path.node.arguments[0].value : "unknown";
          const props = path.node.arguments[1];
          const componentArg = path.node.arguments[0];
          const newNode = t2.callExpression(path.node.callee, [
            t2.identifier(SCENE_OBJECT_COMPONENT_NAME),
            t2.objectExpression([
              // Since the current props can be manually created it could be anything.
              // We spread it in instead of taking its properties.
              t2.spreadElement(
                t2.isExpression(props) ? props : t2.identifier("undefined")
              ),
              t2.objectProperty(t2.identifier("__component"), componentArg),
              t2.objectProperty(
                t2.identifier("__meta"),
                t2.objectExpression([
                  t2.objectProperty(
                    t2.stringLiteral("path"),
                    t2.stringLiteral("")
                  ),
                  t2.objectProperty(
                    t2.stringLiteral("name"),
                    t2.stringLiteral(elementName)
                  ),
                  t2.objectProperty(
                    t2.stringLiteral("line"),
                    t2.numericLiteral(-2)
                  ),
                  t2.objectProperty(
                    t2.stringLiteral("column"),
                    t2.numericLiteral(-2)
                  )
                ])
              )
            ]),
            ...path.node.arguments.slice(2)
          ]);
          cache.add(newNode);
          path.replaceWith(newNode);
        }
        if (
          // Basic jsx() calls
          (path.node.callee.type === "Identifier" && AUTOMATIC_JSX_RUNTIME.includes(path.node.callee.name) || // OR basic jsxRuntime.jsx() calls.
          path.node.callee.type === "MemberExpression" && path.node.callee.property.type === "Identifier" && AUTOMATIC_JSX_RUNTIME.includes(path.node.callee.property.name) || // OR mangled (0, jsxRuntime.jsx) calls.
          path.node.callee.type === "SequenceExpression" && path.node.callee.expressions[1].type === "MemberExpression" && path.node.callee.expressions[1].property.type === "Identifier" && AUTOMATIC_JSX_RUNTIME.includes(
            path.node.callee.expressions[1].property.name
          )) && t2.isExpression(path.node.arguments[0]) && !cache.has(path.node)
        ) {
          const elementName = path.node.arguments[0].type === "StringLiteral" ? path.node.arguments[0].value : "unknown";
          const props = path.node.arguments[1];
          const componentArg = path.node.arguments[0];
          const newNode = t2.callExpression(path.node.callee, [
            t2.identifier(SCENE_OBJECT_COMPONENT_NAME),
            t2.objectExpression([
              ...t2.isObjectExpression(props) ? props.properties : [],
              t2.objectProperty(t2.identifier("__component"), componentArg),
              t2.objectProperty(
                t2.identifier("__meta"),
                t2.objectExpression([
                  t2.objectProperty(
                    t2.stringLiteral("path"),
                    t2.stringLiteral("")
                  ),
                  t2.objectProperty(
                    t2.stringLiteral("name"),
                    t2.stringLiteral(elementName)
                  ),
                  t2.objectProperty(
                    t2.stringLiteral("line"),
                    t2.numericLiteral(-2)
                  ),
                  t2.objectProperty(
                    t2.stringLiteral("column"),
                    t2.numericLiteral(-2)
                  )
                ])
              )
            ]),
            ...path.node.arguments.slice(2)
          ]);
          cache.add(newNode);
          path.replaceWith(newNode);
        }
      },
      ExportDefaultDeclaration(path) {
        if (path.node.declaration.type === "CallExpression") {
          const variableName = "T" + path.scope.generateUid("Hoisted");
          const variableDeclaration2 = t2.variableDeclaration("const", [
            t2.variableDeclarator(
              t2.identifier(variableName),
              path.node.declaration
            )
          ]);
          path.insertBefore(variableDeclaration2);
          path.set("declaration", t2.identifier(variableName));
        }
      },
      FunctionDeclaration: {
        enter(path) {
          if (shouldSkip || !path.node.id || !/^[A-Z]/.exec(path.node.id.name) || isChildOf(
            path,
            (parent) => parent.isFunctionDeclaration() || parent.isArrowFunctionExpression()
          )) {
            return;
          }
          const propsArg = path.node.params[0];
          const { destructured, spreadIdentifier } = extractFunctionArgs(propsArg);
          currentFunction = {
            exportName: resolveIdentifierExportName(path, path.node.id.name),
            name: path.node.id.name,
            props: { destructured, spreadIdentifier },
            returnsJSX: false
          };
          initializeMetaForCurrentFunction();
        },
        exit(path) {
          resetCurrentFunction(path);
        }
      },
      JSXElement: {
        enter(path, pass) {
          if (shouldSkip) {
            return;
          }
          if (cache.has(path.node) || path.node.openingElement.name.type !== "JSXIdentifier" || !path.node.loc || isIgnoredJSXElement(path)) {
            return;
          }
          const elementName = path.node.openingElement.name.name;
          const elementType = /^[A-Z]/.exec(elementName) ? "custom" : "host";
          const functionMeta = currentFunction && componentsFoundInPass.get(currentFunction.name);
          pushLocation(
            elementName,
            currentFunction && currentFunction.exportName || "root"
          );
          cache.add(path.node);
          if (functionMeta && currentFunction) {
            currentFunction.returnsJSX = true;
            if (elementName.endsWith("Light")) {
              functionMeta.lighting = "custom";
            }
            if (isChildOfReturnStatement(path)) {
              if (elementType === "custom") {
                if (isCanvasFromThreeFiber(path)) {
                  currentFunction.canvasComponent = true;
                } else if (isComponentFromThreeFiber(path)) {
                  currentFunction.firstFoundHostElementSource ??= "react-three-fiber";
                } else if (!isJSXIdentifierFromNodeModules(path, cwd) && elementName !== currentFunction.name && !!pass.file.scope.getBinding(elementName)) {
                  currentFunction.firstFoundCustomComponentName = elementName;
                }
              } else if (isReactDOMElement(elementName)) {
                currentFunction.firstFoundHostElementSource ??= "react";
              } else if (isReactThreeElement(elementName)) {
                currentFunction.firstFoundHostElementSource ??= "react-three-fiber";
              }
            }
          }
          const line = path.node.loc.start.line;
          const column = path.node.loc.start.column + 1;
          const transformsFound = {
            rotate: false,
            scale: false,
            translate: false
          };
          const attributes = path.node.openingElement.attributes.filter(
            (attr) => {
              if (attr.type === "JSXAttribute") {
                if (elementType === "host" || isJSXIdentifierFromNodeModules(path, cwd)) {
                  const isIdentifierFromDestructuredProps = attr.value?.type === "JSXExpressionContainer" && attr.value.expression.type === "Identifier" && currentFunction?.props.destructured.includes(
                    attr.value.expression.name
                  );
                  const isPropsMemberExpression = attr.value?.type === "JSXExpressionContainer" && attr.value.expression.type === "MemberExpression" && attr.value.expression.object.type === "Identifier" && attr.value.expression.object.name === currentFunction?.props.spreadIdentifier;
                  if (isIdentifierFromDestructuredProps || isPropsMemberExpression) {
                    if (attr.name.name === "position") {
                      transformsFound.translate = true;
                    }
                    if (attr.name.name === "rotation") {
                      transformsFound.rotate = true;
                    }
                    if (attr.name.name === "scale") {
                      transformsFound.scale = true;
                    }
                  }
                }
              } else {
                if (attr.argument.type === "Identifier" && attr.argument.name === currentFunction?.props.spreadIdentifier) {
                  if (!currentFunction.props.destructured.includes("position")) {
                    transformsFound.translate = true;
                  }
                  if (!currentFunction.props.destructured.includes("rotation")) {
                    transformsFound.rotate = true;
                  }
                  if (!currentFunction.props.destructured.includes("scale")) {
                    transformsFound.scale = true;
                  }
                }
              }
              return true;
            }
          );
          const elementOrigin = resolveIdentifierOrigin(
            pass,
            path,
            elementName
          );
          const newNode = t2.jsxElement(
            t2.jsxOpeningElement(t2.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME), [
              ...attributes,
              t2.jsxAttribute(
                t2.jsxIdentifier("__component"),
                t2.jsxExpressionContainer(
                  elementType === "custom" ? t2.identifier(elementName) : t2.stringLiteral(elementName)
                )
              ),
              t2.jsxAttribute(
                t2.jsxIdentifier("__meta"),
                t2.jsxExpressionContainer(
                  t2.objectExpression([
                    t2.objectProperty(
                      t2.stringLiteral("astPath"),
                      t2.stringLiteral(buildLocation())
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("originExportName"),
                      t2.stringLiteral(elementOrigin?.exportName || "")
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("originPath"),
                      t2.stringLiteral(elementOrigin?.path || "")
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("exportName"),
                      t2.stringLiteral(currentFunction?.exportName || "")
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("path"),
                      t2.stringLiteral(
                        pass.filename ? normalize2(pass.filename) : ""
                      )
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("name"),
                      t2.stringLiteral(elementName)
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("line"),
                      t2.numericLiteral(line)
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("column"),
                      t2.numericLiteral(column)
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("translate"),
                      t2.booleanLiteral(transformsFound.translate)
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("rotate"),
                      t2.booleanLiteral(transformsFound.rotate)
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("scale"),
                      t2.booleanLiteral(transformsFound.scale)
                    )
                  ])
                )
              )
            ]),
            t2.jsxClosingElement(t2.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME)),
            path.node.children
          );
          path.replaceWith(newNode);
        },
        exit() {
          popLocation();
        }
      },
      JSXFragment: {
        enter(path, pass) {
          if (shouldSkip) {
            return;
          }
          if (cache.has(path.node) || !path.node.loc) {
            return;
          }
          pushLocation(
            "Fragment",
            currentFunction && currentFunction.exportName || "root"
          );
          shouldImportFragment = true;
          cache.add(path.node);
          const line = path.node.loc.start.line;
          const column = path.node.loc.start.column + 1;
          const newNode = t2.jsxElement(
            t2.jsxOpeningElement(t2.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME), [
              t2.jsxAttribute(
                t2.jsxIdentifier("__component"),
                t2.jsxExpressionContainer(t2.identifier("Fragment"))
              ),
              t2.jsxAttribute(
                t2.jsxIdentifier("__meta"),
                t2.jsxExpressionContainer(
                  t2.objectExpression([
                    t2.objectProperty(
                      t2.stringLiteral("astPath"),
                      t2.stringLiteral(buildLocation())
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("path"),
                      t2.stringLiteral(
                        pass.filename ? normalize2(pass.filename) : ""
                      )
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("name"),
                      t2.stringLiteral("Fragment")
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("line"),
                      t2.numericLiteral(line)
                    ),
                    t2.objectProperty(
                      t2.stringLiteral("column"),
                      t2.numericLiteral(column)
                    )
                  ])
                )
              )
            ]),
            t2.jsxClosingElement(t2.jsxIdentifier(SCENE_OBJECT_COMPONENT_NAME)),
            path.node.children
          );
          path.replaceWith(newNode);
        },
        exit() {
          popLocation();
        }
      },
      Program: {
        enter(_, state) {
          const normalizedPath = normalize2(state.filename || "");
          const exclusions = exclude.map(
            (dir) => dir.replace(/(^[A-z]:\/)/, "")
          );
          if (exclusions.some((exclusion) => normalizedPath.includes(exclusion))) {
            shouldSkip = true;
          }
        },
        exit(path) {
          if (!shouldSkip) {
            const importDeclarations = path.get("body").filter((path2) => path2.isImportDeclaration());
            importDeclarations.forEach((path2) => {
              const isReactThreeFiberImport = path2.node.source.value === "@react-three/fiber";
              if (!isReactThreeFiberImport) {
                return;
              }
              const [canvasImportSpecifier] = path2.get("specifiers").filter(
                (spec) => spec.node.type === "ImportSpecifier" && spec.node.imported.type === "Identifier" && spec.node.imported.name === "Canvas"
              );
              if (canvasImportSpecifier) {
                path2.insertAfter(
                  t2.importDeclaration(
                    [canvasImportSpecifier.node],
                    t2.stringLiteral("triplex:canvas")
                  )
                );
                canvasImportSpecifier.remove();
              }
            });
          }
          const componentMetaOrder = resolveOrderingFromMap(
            componentMetaDependencyMap
          );
          Array.from(componentsFoundInPass.entries()).sort(([nameA], [nameB]) => {
            return componentMetaOrder.indexOf(nameA) - componentMetaOrder.indexOf(nameB);
          }).forEach(([componentName, meta]) => {
            path.pushContainer(
              "body",
              t2.expressionStatement(
                t2.assignmentExpression(
                  "=",
                  t2.memberExpression(
                    t2.identifier(componentName),
                    t2.identifier("triplexMeta")
                  ),
                  t2.objectExpression(
                    Object.entries(meta).map(([key, value]) => {
                      return t2.objectProperty(
                        t2.stringLiteral(key),
                        typeof value === "string" ? t2.stringLiteral(value) : value === void 0 ? t2.identifier("undefined") : value
                      );
                    })
                  )
                )
              )
            );
          });
          if (shouldImportFragment) {
            importIfMissing(path, "react", "Fragment");
          }
          shouldSkip = false;
          shouldImportFragment = false;
          componentsFoundInPass.clear();
          componentMetaDependencyMap.clear();
          resetLocation();
        }
      },
      VariableDeclarator: {
        enter(path) {
          if (shouldSkip || path.node.id.type !== "Identifier" || !/^[A-Z]/.exec(path.node.id.name) || isChildOf(
            path,
            (parent) => parent.isFunctionDeclaration() || parent.isArrowFunctionExpression()
          )) {
            return;
          }
          let destructured = [];
          let spreadIdentifier = void 0;
          let isFunction = false;
          path.traverse({
            ArrowFunctionExpression(innerPath) {
              const propsArg = innerPath.node.params[0];
              ({ destructured, spreadIdentifier } = extractFunctionArgs(propsArg));
              isFunction = true;
              innerPath.stop();
            },
            FunctionExpression(innerPath) {
              const propsArg = innerPath.node.params[0];
              ({ destructured, spreadIdentifier } = extractFunctionArgs(propsArg));
              isFunction = true;
              innerPath.stop();
            }
          });
          if (isFunction) {
            currentFunction = {
              exportName: resolveIdentifierExportName(path, path.node.id.name),
              name: path.node.id.name,
              props: { destructured, spreadIdentifier },
              returnsJSX: false
            };
            initializeMetaForCurrentFunction();
          }
        },
        exit(path) {
          resetCurrentFunction(path);
        }
      }
    }
  };
  return plugin;
}
var __triplexInner = module.exports.default || module.exports;
module.exports = function (opts) {
  var o = opts || {};
  if (!o.exclude) o.exclude = ['node_modules'];
  return __triplexInner(o);
};
