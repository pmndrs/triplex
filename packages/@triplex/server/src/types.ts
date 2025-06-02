/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export type Type =
  | UnionType
  | TupleType
  | NumberType
  | NumberLiteralType
  | StringType
  | StringLiteralType
  | BooleanType
  | BooleanLiteralType
  | UnhandledType;

export interface UnionType {
  kind: "union";
  shape: Type[];
}

export interface UnionLiteralType {
  kind: "union";
  shape: (StringLiteralType | NumberLiteralType | BooleanLiteralType)[];
}

export interface TupleType {
  kind: "tuple";
  shape: Type[];
}

export interface NumberType {
  kind: "number";
  label?: string;
  required?: boolean;
}

export interface StringType {
  kind: "string";
  label?: string;
  required?: boolean;
}

export interface StringLiteralType {
  kind: "string";
  label?: string;
  literal: string;
  required?: boolean;
}

export interface BooleanLiteralType {
  kind: "boolean";
  label?: string;
  literal: boolean;
  required?: boolean;
}

export interface NumberLiteralType {
  kind: "number";
  label?: string;
  literal: number;
  required?: boolean;
}

export interface BooleanType {
  kind: "boolean";
  label?: string;
  required?: boolean;
}

export interface UnhandledType {
  kind: "unhandled";
}

type TupleValue = string | number | boolean | TupleValue[];

export interface TypeValueMap {
  boolean: { value: boolean };
  number: { value: number };
  string: { value: string };
  tuple: { value: TupleValue[] };
  unhandled: { value: string };
  union: { value: string | number };
}

export type ValueKind =
  | "unhandled"
  | "identifier"
  | "string"
  | "boolean"
  | "number"
  | "undefined"
  | "array";

export type Source = "react" | "three" | "unknown";

export type PropWithValue<TType extends Type> = {
  column: number;
  description: string | undefined;
  group: string;
  line: number;
  name: string;
  required: boolean;
  tags: Record<string, string | number | boolean>;
  valueKind: ValueKind;
} & TType &
  TypeValueMap[TType["kind"]];

export type PropWithoutValue<TType extends Type> = {
  defaultValue?: ExpressionValue;
  description: string | undefined;
  group: string;
  name: string;
  required: boolean;
  tags: Record<string, string | number | boolean>;
} & TType;

export type RemapPropWithValue<TType> = TType extends Type
  ? PropWithValue<TType>
  : never;

export type RemapPropWithoutValue<TType> = TType extends Type
  ? PropWithoutValue<TType>
  : never;

export type DeclaredProp = RemapPropWithValue<Type>;

export type UndeclaredProp = RemapPropWithoutValue<Type>;

export type AttributeValue =
  | number
  | string
  | boolean
  | undefined
  | AttributeValue[];

export type ExpressionValue = {
  kind: ValueKind;
  value: AttributeValue;
};

export interface Transforms {
  rotate: boolean;
  scale: boolean;
  translate: boolean;
}

export type Prop = {
  defaultValue?: ExpressionValue;
  description: string | undefined;
  group: string;
  name: string;
  required: boolean;
  tags: Record<string, string | number | boolean>;
} & Type;

export type ComponentType =
  | {
      exportName: string;
      name: string;
      path: string;
      props: Record<string, unknown>;
      type: "custom";
    }
  | {
      name: string;
      props: Record<string, unknown>;
      type: "host";
    };

export type ComponentRawType =
  | {
      exportName: string;
      path: string;
      props: Record<string, unknown>;
      type: "custom";
    }
  | {
      name: string;
      props: Record<string, unknown>;
      type: "host";
    };

export interface ComponentTarget {
  action: "child";
  column: number;
  exportName: string;
  line: number;
  path: string;
}

export interface ProjectHostComponent {
  category: string;
  name: string;
  type: "host";
}

export interface ProjectCustomComponent {
  category: string;
  exportName: string;
  name: string;
  path: string;
  type: "custom";
}

export interface ProjectAsset {
  extname: string;
  name: string;
  path: string;
  type: "asset";
}

export interface Folder {
  children: Folder[];
  files: number;
  name: string;
  path: string;
}

export type JsxElementPositions =
  | CustomJsxElementPosition
  | HostJsxElementPosition;

export interface CustomJsxElementPosition {
  children: JsxElementPositions[];
  column: number;
  exportName: string;
  line: number;
  name: string;
  parentPath: string;
  /** Path will be defined if the jsx element exists in local source code. */
  path?: string;
  type: "custom";
}

export interface HostJsxElementPosition {
  children: JsxElementPositions[];
  column: number;
  line: number;
  name: string;
  parentPath: string;
  type: "host";
}

export interface SourceFileChangedEvent {
  path: string;
}

export type ReconciledTriplexConfig = Required<
  TriplexConfig & {
    cwd: string;
  } & SecretTriplexConfig
>;

export interface SecretTriplexConfig {
  renderer?: string;
}

export interface TriplexConfig {
  /**
   * Relative path to a custom vite config. Use to define custom bundler
   * configuration that otherwise can't be handled by default values.
   *
   * This is inherently unsafe and its usage can cause upgrading pain when new
   * versions of Triplex are released. Use with caution.
   *
   * See:
   * https://triplex.dev/docs/api-reference/config-options/unsafe-vite-config
   */
  UNSAFE_viteConfig?: string;
  /**
   * Folder inside the {@link publicDir} folder where Triplex maintains static
   * assets such as GLTF and GLB files. Files inside this directory are made
   * available to be added to the open component as a `<primitive>` element.
   *
   * Defaults to `"assets"`.
   *
   * See: https://triplex.dev/docs/api-reference/config-options/assets-dir
   */
  assetsDir?: string;
  /**
   * An array of relative glob paths to select what files can be added to other
   * components. You can define multiple roots.
   *
   * See: https://triplex.dev/docs/api-reference/config-options/components
   */
  components?: string[];
  /**
   * Variables that are replaced when running your scenes. Works exactly the
   * same as the `define` option in Vite or the `DefinePlugin` in Webpack.
   *
   * See: https://triplex.dev/docs/api-reference/config-options/define
   */
  define?: Record<string, string | number | object | Array<unknown>>;
  /**
   * Unstable experimental features that are still in development. Use with
   * caution.
   */
  experimental?: {
    /**
     * Enables Triplex WebXR support for 3D components.
     *
     * See: https://triplex.dev/docs/building-your-scene/webxr
     */
    xr_editing?: boolean;
  };
  /**
   * An array of relative path globs to select what files can be opened by
   * Triplex. You can define multiple roots. Found files will be available to
   * open in the `File` > `Open` menu.
   *
   * See: https://triplex.dev/docs/api-reference/config-options/files
   */
  files?: string[];
  /**
   * Path to a provider component that can hold all React providers needed
   * during runtime. The component must be the default export and return
   * children.
   *
   * See: https://triplex.dev/docs/api-reference/config-options/provider
   */
  provider?: string;
  /**
   * Relative path to a folder used to expose files through the local dev
   * server, such as images, videos, and GLTF/GLB files. For example if the
   * public directory has a `image.png` file then it will be made available at
   * the `"/image.png"` URL.
   *
   * See: https://triplex.dev/docs/api-reference/config-options/public-dir
   */
  publicDir?: string;
}

export interface RendererManifest {
  /** Assets your renderer makes available inside the editor UI. */
  assets: {
    /**
     * Host elements can be added through the assets drawer. For example when
     * writing a DOM based renderer you could expose web elements like "button"
     * and "div".
     *
     * If your renderer has no host elements then define an empty array.
     */
    hostElements: Array<{ category: string; name: string; type: "host" }>;
  };
  /** Configuration for the Triplex bundler. */
  bundler?: {
    /**
     * Glob patterns to match for files that should be considered static assets.
     * This means that when they are imported they are copied to the public
     * folder and the default export is a path to the asset. For example the
     * React Three Fiber renderer declares glb & gltf assets.
     */
    assetsInclude?: string[];
    /**
     * Packages to dedupe between Triplex and the opened project. For example
     * for the React Three Fiber renderer it dedupes `"@react-three/fiber"` and
     * `"three"`.
     */
    dedupe?: string[];
  };
  /** Renderer specific configuration for the canvas stage. */
  stage: {
    /**
     * Initial state of the frame. `"expanded"` means the frame is expanded to
     * fill the entire available area, `"intrinsic"` means the frame is
     * collapsed into a sized area.
     */
    defaultFrame: "expanded" | "intrinsic";
  };
  /** Templates used for different use cases across Triplex. */
  templates: {
    /** The elements returned from a new component. */
    newElements: string;
  };
}

/** Information about a renderer that has been sourced from the file system. */
export interface ReconciledRenderer {
  manifest: RendererManifest;
  path: string;
  root: string;
}

/** Settings for a project that are persisted to the file system. */
export interface ProjectSettings {
  frame: "expanded" | "intrinsic";
}

/** Settings for the editor that are persisted to the file system. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EditorSettings {}

/** Exposed ports used for Triplex. */
export interface TriplexPorts {
  client: number;
  server: number;
  ws: number;
}
