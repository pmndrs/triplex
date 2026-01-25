# @triplex/server

## 0.72.5

### Patch Changes

- b070ab9: Triplex WebXR is now available for everyone, see: https://triplex.dev/docs/building-your-scene/webxr.
- b2edcb4: Cleanup stale feature gates.
- b070ab9: The debug panel is now available for everyone, see: https://triplex.dev/docs/building-your-scene/console-logs/debug-panel.

## 0.72.4

## 0.72.3

### Patch Changes

- 642aede: Fix files being not able to be dragged onto the scene when the `components` config field was not defined.

## 0.72.2

## 0.71.24

### Patch Changes

- fbd4c8a: Fixed React.FC components not displaying their default prop values in the editor UI. Components declared with `React.FC` will now correctly show default values when the element is active in the editor.
- d9adc31: Prevent maximum call stack exceeded errors by limiting TypeScript import resolution depth. Added `skipLibCheck` and `maxNodeModuleJsDepth` compiler options to prevent infinite loops when resolving complex import graphs.

## 0.71.23

### Patch Changes

- 46b8c74: The selection system now keeps hold of your selected element across file changes. This fix will be rolled out incrementally across Triplex for VS Code users. Want early access? Reach out on Discord.

## 0.71.22

### Patch Changes

- e1575ed: Fix an internal error where a function that should have been defined wasn't.

## 0.71.21

### Patch Changes

- 299a02e: Errors are no longer thrown if a components name could not be resolved.
- 299a02e: Untyped host elements no-longer throw an exception when selecting through the elements panel.

## 0.71.20

### Patch Changes

- e1153b6: Changes that result in no code change are no longer added to the undo/redo stack.

## 0.71.19

### Patch Changes

- 4500a5f: Deno projects that are missing critical dependencies to run Triplex now have the install prompt set with the `--npm` arg.
- 0cbd424: Components that are no longer exported are now gracefully handled. Instead of an error being thrown the UI remains available prompting you to export the component again.

## 0.71.18

### Patch Changes

- 48d7e85: Add group element action in the element panel action menu.

## 0.71.17

### Patch Changes

- 56b125d: Add debug_api to experimental options.
- 4546b3e: Upgrade three.js deps.
- 55feda2: Add experimental option to the Triplex config. The first available option is "xr_editing".

## 0.71.16

### Patch Changes

- 030ed16: Add logging around APIs / messages.

## 0.71.15

### Patch Changes

- ff67cb2: Fix function props being marked as required when they actually were optional.

## 0.71.14

### Patch Changes

- 8c82aca: Upgrade react-three dependencies.
- ae60a8f: Upgrade typescript.
- 8c82aca: Upgrade vite dependencies.

## 0.71.13

### Patch Changes

- 3fd23e3: Add support for custom component transforms in WebXR.

## 0.71.12

### Patch Changes

- 839e91e: A new config option "UNSAFE_viteConfig" is now available. Use it to declare custom bundler behavior that otherwise can't be handled by default behavior. See the docs here: https://triplex.dev/docs/api-reference/config-options/unsafe-vite-config.
- 42b03ff: Inline default exported components can now be opened in Triplex.

## 0.71.11

### Patch Changes

- a480636: Testing webxr capabilities.

## 0.71.10

### Patch Changes

- 2301fd1: Drop unwanted files when publishing.

## 0.71.9

### Patch Changes

- c06f199: All paths now have their drive casing normalized.

## 0.71.8

### Patch Changes

- eca2202: Deno projects that exclusively use deno.json instead of package.json can now be opened inside Triplex.

## 0.71.7

### Patch Changes

- b6ef6c2: The default global provider has been deprecated and replaced with two named exports: CanvasProvider which is a 1:1 replacement, and GlobalProvider, which is placed at the root of the component tree.
- 863de7b: GlobalProvider and CanvasProvider exports from the declared provider module now show up in the provider panel.

## 0.71.6

### Patch Changes

- 088c699: Loading a React component that doesn't have React imported in the module graph now open as expected.
- 088c699: React Three Fiber dependencies are no longer needed to be installed when loading a project that doesn't use them.

## 0.71.5

### Patch Changes

- 0137088: Upgrade to latest React Three Fiber dependencies.

## 0.71.4

### Patch Changes

- a5d2390: Fixed literal union type labels not being resolved for some scenarios.
- a5d2390: React 19 / Three Fiber 9 are now supported.

## 0.71.3

### Patch Changes

- fe84ca9: Syntax errors are now recoverable.

## 0.71.2

### Patch Changes

- 84a2615: JavaScript based projects no-longer have a tsconfig.json generated when starting up in Triplex.
- 98ee32b: An error screen is now shown when dependencies needed to start the editor scene are missing.

## 0.71.1

### Patch Changes

- 8574af1: Three.js elements props are no longer erroneously marked as required.
- fe8f650: Props are now grouped or excluded depending on data collected when analyzing an elements props. This includes: the element name, and where the prop type declarations live. If any data points to Three.js the component will have its props grouped for a Three.js component, else if it points to React it will be grouped as a React component, otherwise the props will not be grouped.

## 0.71.0

### Minor Changes

- 25daa3d: The `rendererAttributes` config option has been removed. If you were relying on this instead declare a Canvas component from `@react-three/fiber` in your component and set the props as desired.

### Patch Changes

- 0866bda: The `children` prop can now be edited inside the element panel for all supported types.
- 9b67742: Upgrade three.js dependencies.
- 7a75eed: Host elements such as "mesh" and "div" now have their props logically grouped to remove the laundry list shock.
- b9b1b62: Upgrade vite and all related dependencies to latest.
- 04deea9: Shorthand jsx fragments are now supported.
- 0866bda: The `attach` prop for React Three Fiber elements is now visible in the elements panel.
- e4db0c2: Upgrade TypeScript to latest.
- 7a75eed: Fix tuple prop types from appearing in the selection panel if there are no values defined.
- c896b64: Remove experimental react renderer.
- 7a75eed: Union props that have all unsupported args are now shown as a single unsupported input in the selection panel rather than just not rendering anything at all.

## 0.70.1

### Patch Changes

- 08f61b5: Fix initial undo ID being set to length - 1 instead of 0 resulting in unexpected behavior when undo/redoing.
- 0393dfd: Fix threejs host elements having required props unexpectedly.
- b11fe78: Union literal props are no longer sorted resulting in stable options in the UI.
- 84f8a37: Saves are now synchronously applied.

## 0.70.0

### Minor Changes

- a1a782c: Triplex now respects the name prop set on custom components in the Scene Panel. E.g. given a component Box, if it has a name prop statically set to "foo" it will appear as "foo (Box)" in the Scene Panel.

### Patch Changes

- 2412af5: Remove outside cwd invariant.
- 31e7812: The config is now runtime checked for the correct schema.

## 0.69.3

### Patch Changes

- 96c8cb1: TypeScript module resolution is now always forced to use the "bundler" algorithm. There should be no noticeable change.
- 96c8cb1: Userland tsconfig.json files no longer need to set React Three Fiber types.
- 652c1cc: Update package json meta.

## 0.69.2

### Patch Changes

- 967bfbd0: Upgrade vite to v5.

## 0.69.1

### Patch Changes

- 50c28c96: Upgrade tsc.

## 0.69.0

## 0.68.8

### Patch Changes

- 54a59b63: Changes originating from outside of Triplex for VS Code are now added to the undo/redo stack in the editor.

## 0.68.7

## 0.68.6

## 0.68.5

## 0.68.4

### Patch Changes

- d78010e0: Fix redo state being lost after saving.
- d78010e0: The undo stack is no longer modified during an edit if nothing changed.

## 0.68.3

## 0.68.2

## 0.68.1

## 0.68.0

## 0.67.9

## 0.67.8

## 0.67.7

### Patch Changes

- e958b697: Remove error thrown during save when searching for prettier module.

## 0.67.6

### Patch Changes

- 050e5845: Formatting on save now uses the userland prettier module. If none is found it falls back to tsc formatting.

## 0.67.5

### Patch Changes

- 1ba572ca: Undo/redo now are triggered using explicit ids.
- a1121431: Vsce element controls.

## 0.67.4

## 0.67.3

## 0.67.2

### Patch Changes

- 506ba7e: Triplex configs no longer has any required properties.
- 264dca9: Remove get config invariant when opening a project.
- 264dca9: Ignore node modules from watchers.

## 0.67.1

## 0.67.0

### Patch Changes

- 6f3d8de: Upgrade three deps (r3f/drei/three).
- 2ca7cbe: Remove expand/collapse editor panels logic. Always collapsed now.

## 0.66.0

## 0.65.2

## 0.65.1

## 0.65.0

## 0.64.4

### Patch Changes

- 50dc97a: Fix resolving union labels throwing unexpectedly for some elements.
- 6ed3037: allowJs tsconfig option is now always set to `true` internally.

## 0.64.3

### Patch Changes

- 1d9c390: Fix user land modules being forcibly invalidated during HMR causing unexpected behaviour.

## 0.64.2

## 0.64.1

## 0.64.0

### Minor Changes

- 8712a12: Add renderer attributes. Refer to docs.
- 0868337: Add support for SharedBufferArray.
- 0868337: Add `define` variables support.
- f0444d6: Component controls, provider controls, and component prop controls now show default props when no value has been set.

### Patch Changes

- 0868337: Prevent throwing an exception if a component resolves to `any` when resolving its path.
- dca6003: Fix inferring jsx element locations for certain scenarios.
- 6a65504: Fix adding elements to a component without a top level fragment.
- f0444d6: Fix default prop parsing from fc component.

## 0.63.0

### Minor Changes

- 0b5fb14: Add manifest to renderers.
- 4c48d66: Add host element declarations to renderer manifest.

### Patch Changes

- 480866f: Upgrade TypeScript.

## 0.62.0

### Minor Changes

- 3612434: Add thumbnail support for renderers.

### Patch Changes

- bad0a57: Triplex now finds random open ports every time a project is opened instead of using hardcoded ones.
- 490aaf1: New files and components now display a box.
- c2a0640: Editing children elements now opens the elements file if not yet open.

## 0.61.2

### Patch Changes

- 4a40243: Source files now have events initialized when first explicitly loaded — previously they would be skipped over when implicitly loaded.
- 4a40243: Source files updates originating from the file system now work with undo/redo.

## 0.61.1

### Patch Changes

- 8e565d9: Tabs now re-open in their last known index.

## 0.61.0

### Minor Changes

- 3920fd3: Scene elements can now be moved before/after/into other scene elements with drag and drop.
- b407820: Add file tabs.
- 3091229: Add new undo/redo system. Any edits are now flushed through this.

### Patch Changes

- b407820: Save is now correctly scoped to the currently opened file. Save all replaces the original functionality.
- 5efeea0: Normalize paths using upath instead of node built-in.
- ab35f91: Refactor modified to be a different state to new file. New files now shown as italic and not initially modified.

## 0.60.1

## 0.60.0

### Minor Changes

- 7a250ba: Adds duplicate scene

### Patch Changes

- 0cce596: Fix adding custom components to a new file.

## 0.59.1

## 0.59.0

### Minor Changes

- 26bd068: Add `onSourceFileChange` api to project.
- 26bd068: Scene modules are now loaded remotely instead of from the fs. This is going to raise the ceiling on features we can implement as now everything becomes a mutation to the remote source instead of that AND also trying to handle the intermediate state in the scene prior to it being flushed to the fs. Super excited about this.

### Patch Changes

- 2194c85: Triplex now warns you when the file you have open is outside where your project has defined files should be.
- f2d612b: Editor now shows union literal labels where possible.
- 8dd7cd1: Scene/client pkgs now bundled with vite.
- f6e068c: Packages have been moved into namedspaced folders.

## 0.58.2

### Patch Changes

- 85447c2: Upgrade three.js.
- b5247c2: Apply lint and prettier fixes.

## 0.58.1

### Patch Changes

- e645e5c: Fix provider ui not respecting default props.

## 0.58.0

### Patch Changes

- 3e1e081: Modified marker is now reset when changes from the file system occur.
- 221e6a7: Fix default export module names not being inferred correctly when called in a function.
- 37849fe: Upsert prop no longer shifts sibling elements line numbers if the prop value was smaller than the current value.

## 0.57.2

### Patch Changes

- f5bbeda: Fix server throwing when symbols for jsx elements were not resolved.

## 0.57.1

## 0.57.0

### Minor Changes

- 5c1fc3d: Add editing child jsx elements through the Triplex UI.
- 6da8bae: Adds context provider support using the `provider` config property.
- 2b61384: Adding an asset is now contextual, the original button adds to the open component, while the add buttons on each element in the left scene panel add to it as a child.

### Patch Changes

- bcf7cae: Default export component names are now displayed correctly in the open component drawer.
- 730fa7c: Transform controls are now disabled when controlled by code.

## 0.56.1

### Patch Changes

- baf33b9: Exports that export a call expression now resolve correctly when opened.

## 0.56.0

### Minor Changes

- 3724bf9: Name props declared on host elements now take precedence over the element name.
- 463789f: Adds end-to-end typesafe ws router.
- 32a110f: Add top-level scene component to the scene panel. When selected users can modify the props during their seession to see what happens.
- 47483b9: The data that powers the context panel props is now sourced from types first instead of defined props first, resulting in tuple type data no longer being lost after a prop has been set.

### Patch Changes

- 5f7e78f: Undefined values are now preseved across the websocket server.
- 2e53a2e: Turn off type declaration maps.

## 0.55.3

## 0.55.2

### Patch Changes

- ed3ef0a: Fixes the editor losing track of an inserted jsx element as a child.

## 0.55.1

### Patch Changes

- ea86fdc: Add license banner.

## 0.55.0

### Minor Changes

- 3be2782: Add support for adding a gltf static asset to the scene.
- ab909b4: Static assets are now available through the assets drawer.
- 44faed1: Jsdoc tags are now returned in the jsx element type response.

### Patch Changes

- ab909b4: Consoldate config into a single module.
- f7d2d9a: Fix adding jsx elements to arrow function components.

## 0.54.2

### Patch Changes

- a060d2c: Fix websocket server connection listener being called on every router handler setup.
- 9100a37: Revert remove unused on save as it was causing issues.

## 0.54.1

### Patch Changes

- 76fd3f3: Fixes a bug on Windows where it would throw assuming you were opening a file out of the open project.
- cdd6234: On save unused identifiers are now removed.
- 76fd3f3: Adding custom components to a scene no longer results in mismatches causing the context panel to error.
- f77c830: Fix prop upsert affecting children jsx elements unexpectedly.

## 0.54.0

## 0.53.1

## 0.53.0

### Patch Changes

- 049ac2c: Changes to prop types are now correctly propagating to all referencing modules that import them, previously you would have to restart triplex for the change to be applied.

## 0.52.0

## 0.51.1

## 0.51.0

### Patch Changes

- c97e359: Fixes tuple types inside union types not being marked as required when declared as a prop on a component.

## 0.50.1

### Patch Changes

- a101545: The fs watcher used for the save indicator endpoint now uses polling to work around a timing bug.

## 0.50.0

### Minor Changes

- 8ea575b: Built output is now mangled.

## 0.49.0

## 0.48.0

### Minor Changes

- 6fe34af: Windows support is here. Now Triplex cli and electron can be ran on Windows, as well as the local dev loop now being functional.

## 0.47.0

### Minor Changes

- 1fc7657: Window title now uses both the folder name and file name if open.

## 0.46.4

## 0.46.3

## 0.46.2

## 0.46.1

## 0.46.0

## 0.45.1

## 0.45.0

## 0.44.0

### Minor Changes

- 0242833: Scene now removes intermediate state when resetting.
- 5039e39: Adds `cwd` to servers to allow setting it to a new location.
- 4d8d9cc: Builds are now minified.

## 0.43.0

### Minor Changes

- 6dfb22d: Create a component in the current open file through the component switcher.
- 6dfb22d: A component switcher is now available in the left panel, use it to quickly switch between components in the open file.
- b7bbeba: String and numbers in props now can have undefined default values.
- 6dfb22d: Saving is now skipped if there are no changes to save.
- de54812: Context panel tuple props now show labels when available.
- b7bbeba: When adding a new element to the scene if you have a selection it will be added as a child. If you have no selection it will be added to the root component.
- 6dfb22d: The scene ws listener now pushes when the file its interested in is saved to source.
- b7bbeba: Geometry and material built-in elements are now exposed in the add component drawer.
- facc6aa: Saving a new component now prompts for a component name.
- 01cd388: Element pos returned after adding a child element is now correct.

## 0.42.0

## 0.41.0

### Minor Changes

- c399ed8: Fixes timing bug by using specific insert and set functions on the import declaration node instead of the generic set.

## 0.40.0

### Minor Changes

- bfb0f7a: When initializing a websocket loader it now catches any errors thrown and returns them to the client.
- 7aa2ead: Shadowed types, interfaces, and imports are now excluded when reading an exports name.

## 0.39.0

### Minor Changes

- ca9807e: Save now supports passing in an option arg to copy the file to another location.
- ca9807e: New files can now be created through the file menu.

## 0.38.0

## 0.37.0

### Minor Changes

- 23fe64a: Adds delete scene object. Access through the context panel when focusing on a scene object.
- e480446: Exclude isLight propeties from scene object context panel.
- 1a2ecea: Adds new endpoint for adding a component to a file.

## 0.36.0

### Minor Changes

- f24f2fd: Fixes conditional throwing when extracting types.

## 0.35.0

### Minor Changes

- e53a703: `isBufferGeometry` now excluded from the context panel.
- e53a703: Context panel now correctly orders props from a-z.

## 0.34.0

### Minor Changes

- 2a64658: The context panel now displays all available props on a component even if they aren't yet declared thanks to the TypeScript compiler and ts-morph. Not all prop types are supported currently, if you have one that you expected to be available but isn't please reach out.

## 0.33.0

## 0.32.0

### Minor Changes

- c87a5f3: Undo/redo now available. When manipulating the scene through transform controls or the context panel each persisted manipulation will be able to be undone (and redone) using hotkeys and the edit menu actions.
- 3a190f1: API response for prop types now returns an object and works with strict compiler option.
- c87a5f3: Adds reset command. Use this to throw away all unsaved changes in the scene.

## 0.31.0

### Minor Changes

- dad975f: Watchers have been replaced with ts-morph events where appropriate to prevent race conditions when changing from source.
- 6e9b119: Paths passed to globs are now normalized to use POSIX separators.

## 0.30.0

### Minor Changes

- 0bb6119: Fixed server errors not returning with status code 500.

## 0.29.0

## 0.28.0

### Minor Changes

- aa1aa8c: Scene transformation using ts-morph has been replaced with Babel significantly speeding up initial load and saving. The need for the `.triplex/tmp` folder is now gone and thus no longer used.
- aa1aa8c: Line and column numbers for scene objects have been corrected and are now consistent across editor, scene, and server.

## 0.27.0

### Minor Changes

- fa35cde: JSX element type inference has been re-written to be more resilient.
- fa35cde: JSX element type inference has been removed from the critical path of the scene transform.
- e5a3419: Context panel now supports more prop types.

## 0.26.0

### Minor Changes

- 785050d: Adds unsaved indicator to the editor.
- 440d427: Server now pings every 30s awaiting a pong from connected clients.
- b77438d: During transformation any leading trivia found is now stripped from cloned jsx elements.

## 0.25.0

### Minor Changes

- 1be56fe: Scene transform now correctly handles props with dashes.
- ed6349b: Extracting prop types now returns early instead of throwing for unhandled nodes.
- aaac9cc: Fix type extraction for jsx elements to handle arrow function components.
- 5736992: Server now throws when accessing files outside of cwd.
- e694cf2: Now override userland config for preserveSymlinks to false to prevent 100% CPU utilization.

## 0.24.0

### Minor Changes

- 4f468f6: The server project [ts-morph] now skips adding files from ts config on instantiation.

## 0.23.0

## 0.22.0

### Minor Changes

- aa9c9ae: Fixes scene transform to handle exported component edge cases.
- 837ef90: Consolidates `ts-morph` pkg into the `server` pkg.

## 0.21.0

### Patch Changes

- @triplex/ts-morph@0.21.0

## 0.20.0

### Minor Changes

- 1c9771d: Named exports are now able to be opened by the editor.
- 1c9771d: Scene drawer now shows named exports from scenes.

### Patch Changes

- Updated dependencies [1c9771d]
  - @triplex/ts-morph@0.20.0

## 0.19.0

### Patch Changes

- @triplex/ts-morph@0.19.0

## 0.18.0

### Patch Changes

- @triplex/ts-morph@0.18.0

## 0.17.0

### Patch Changes

- @triplex/ts-morph@0.17.0

## 0.16.0

### Minor Changes

- 7ff35f3: Context panel no longer throws when navigating between scene and a scene object is selected.
- 2fa7c45: Adds triplex config and files option, an array of globs for triplex to find scenes with.
- 926359a: Server now gracefully exits when closed.
- 2fa7c45: Adds author field to package.json.
- 926359a: The temp folder is now located in .triplex/tmp.

### Patch Changes

- Updated dependencies [e7c026b]
- Updated dependencies [7ff35f3]
- Updated dependencies [2fa7c45]
  - @triplex/ts-morph@0.16.0

## 0.15.0

### Patch Changes

- @triplex/ts-morph@0.15.0

## 0.14.0

### Minor Changes

- 7a8083c: The open rpc has been added back to prevent the "flash of no scene" when transitioning between scenes for the first time.

### Patch Changes

- @triplex/ts-morph@0.14.0

## 0.9.0

### Minor Changes

- a4d6882: Adds scene object ws request.
- 969feab: Adds websocket server and replaces scene and scene components endpoints with it.
- cc917d7: Removes unused apis.

### Patch Changes

- Updated dependencies [99075ff]
- Updated dependencies [969feab]
- Updated dependencies [a4d6882]
  - @triplex/ts-morph@0.8.0

## 0.8.0

### Minor Changes

- 55f0206: Scene components now appear nested when children of other components in the UI.

### Patch Changes

- Updated dependencies [55f0206]
  - @triplex/ts-morph@0.7.0

## 0.7.0

### Minor Changes

- 3c725bc: Force release all packages.

### Patch Changes

- Updated dependencies [3c725bc]
  - @triplex/ts-morph@0.6.0

## 0.6.0

### Minor Changes

- 55e8a52: On save the source file will be formatted with prettier if a prettierrc file was found, else it will be formatted by the TypeScript compiler.
- 7db42bd: Adds /scene route to return all available files in the cwd.

### Patch Changes

- Updated dependencies [55e8a52]
  - @triplex/ts-morph@0.5.0

## 0.5.0

### Minor Changes

- dea65bf: The temp folder is not outside of node_modules.

## 0.4.0

### Minor Changes

- b144bb1: Package `build` now use `swc` and `tsc` directly.

### Patch Changes

- Updated dependencies [b144bb1]
  - @triplex/ts-morph@0.4.0

## 0.3.0

### Minor Changes

- bbc457e: Fixes some bugs preventing triplex from being able to be ran via cli.

### Patch Changes

- Updated dependencies [bbc457e]
  - @triplex/ts-morph@0.3.0

## 0.2.0

### Minor Changes

- 08a03af: Fixes publish to build before pushing.

### Patch Changes

- Updated dependencies [08a03af]
  - @triplex/ts-morph@0.2.0

## 0.1.0

### Minor Changes

- 9c120b4: Initial release.

### Patch Changes

- Updated dependencies [9c120b4]
  - @triplex/ts-morph@0.1.0
