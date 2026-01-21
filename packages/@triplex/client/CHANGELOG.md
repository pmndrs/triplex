# @triplex/client

## 0.70.48

### Patch Changes

- @triplex/renderer@0.72.2

## 0.70.47

### Patch Changes

- @triplex/renderer@0.72.1

## 0.70.46

### Patch Changes

- 46b8c74: The selection system now keeps hold of your selected element across file changes. This fix will be rolled out incrementally across Triplex for VS Code users. Want early access? Reach out on Discord.
- Updated dependencies [46b8c74]
- Updated dependencies [66e723d]
  - @triplex/renderer@0.72.0
  - @triplex/bridge@0.70.12

## 0.70.45

### Patch Changes

- Updated dependencies [b14a832]
- Updated dependencies [b14a832]
- Updated dependencies [b14a832]
- Updated dependencies [9add655]
  - @triplex/renderer@0.71.36

## 0.70.44

### Patch Changes

- b229047: Fix userland keyboard events being triggered outside of play state.
- b229047: Fix @react-three/viverse requiring @react-three/xr to be installed before running in Triplex.
- Updated dependencies [b229047]
- Updated dependencies [b229047]
- Updated dependencies [b229047]
- Updated dependencies [b229047]
- Updated dependencies [b229047]
- Updated dependencies [b229047]
- Updated dependencies [a72f57f]
- Updated dependencies [a9a707f]
- Updated dependencies [a72f57f]
- Updated dependencies [b229047]
  - @triplex/renderer@0.71.35
  - @triplex/bridge@0.70.11

## 0.70.43

### Patch Changes

- Updated dependencies [e1153b6]
  - @triplex/renderer@0.71.34

## 0.70.42

### Patch Changes

- Updated dependencies [0cbd424]
- Updated dependencies [6d8af23]
  - @triplex/renderer@0.71.33
  - @triplex/bridge@0.70.10

## 0.70.41

### Patch Changes

- Updated dependencies [8fb5533]
  - @triplex/renderer@0.71.32

## 0.70.40

### Patch Changes

- Updated dependencies [e63360f]
  - @triplex/renderer@0.71.31

## 0.70.39

### Patch Changes

- 77ebf08: Add error screen when Vite failed to load a module.

## 0.70.38

### Patch Changes

- @triplex/renderer@0.71.30

## 0.70.37

### Patch Changes

- Updated dependencies [b458870]
  - @triplex/renderer@0.71.29

## 0.70.36

### Patch Changes

- Updated dependencies [7dc937f]
- Updated dependencies [f50d251]
  - @triplex/renderer@0.71.28

## 0.70.35

### Patch Changes

- e447108: Add experimental debug data api behind a feature gate.
- 212ae79: Fix component environment check using `@react-three/drei` hooks to prevent accidentally loading a three fiber environment when a react dom environment should have been loaded.
- Updated dependencies [e447108]
  - @triplex/bridge@0.70.9
  - @triplex/renderer@0.71.27

## 0.70.34

### Patch Changes

- 8c82aca: Upgrade react-three dependencies.
- ae60a8f: Upgrade typescript.
- 8c82aca: Upgrade vite dependencies.
- Updated dependencies [8c82aca]
- Updated dependencies [3a45b69]
- Updated dependencies [ae60a8f]
- Updated dependencies [e6f7288]
- Updated dependencies [8c82aca]
  - @triplex/renderer@0.71.26
  - @triplex/bridge@0.70.8

## 0.70.33

### Patch Changes

- 3f92cd3: Fix react-router route components not working with Triplex.
- Updated dependencies [5bb5654]
- Updated dependencies [d3b7090]
  - @triplex/renderer@0.71.25

## 0.70.32

### Patch Changes

- Updated dependencies [6bfbbf2]
  - @triplex/renderer@0.71.24

## 0.70.31

### Patch Changes

- Updated dependencies [482f25b]
  - @triplex/renderer@0.71.23

## 0.70.30

### Patch Changes

- f420d2e: Fix modules that have no React components being flagged as HMR boundaries breaking updates being flushed to owning components.

## 0.70.29

### Patch Changes

- 3fd23e3: Add support for custom component transforms in WebXR.
- Updated dependencies [3fd23e3]
  - @triplex/renderer@0.71.22
  - @triplex/bridge@0.70.7

## 0.70.28

### Patch Changes

- 839e91e: A new config option "UNSAFE_viteConfig" is now available. Use it to declare custom bundler behavior that otherwise can't be handled by default behavior. See the docs here: https://triplex.dev/docs/api-reference/config-options/unsafe-vite-config.
- 42b03ff: Inline default exported components can now be opened in Triplex.
  - @triplex/renderer@0.71.21

## 0.70.27

### Patch Changes

- Updated dependencies [733b63a]
- Updated dependencies [ffc7076]
- Updated dependencies [88738b8]
- Updated dependencies [acc5fbf]
- Updated dependencies [ffc7076]
- Updated dependencies [1853b4c]
  - @triplex/renderer@0.71.20

## 0.70.26

### Patch Changes

- @triplex/renderer@0.71.19

## 0.70.25

### Patch Changes

- 302081f: Forward errors to VS Code output for WebXR sessions.
- Updated dependencies [f97183e]
- Updated dependencies [b11acae]
- Updated dependencies [b11acae]
  - @triplex/renderer@0.71.18

## 0.70.24

### Patch Changes

- b97cd77: IPs are now capped to 3000 range.
- a480636: Testing webxr capabilities.
- Updated dependencies [b97cd77]
  - @triplex/renderer@0.71.17

## 0.70.23

### Patch Changes

- Updated dependencies [cfd4a6f]
- Updated dependencies [4e148d7]
- Updated dependencies [3338a50]
- Updated dependencies [b3a0420]
- Updated dependencies [83d2a62]
  - @triplex/bridge@0.70.6
  - @triplex/renderer@0.71.16

## 0.70.22

### Patch Changes

- Updated dependencies [f61dd89]
  - @triplex/renderer@0.71.15

## 0.70.21

### Patch Changes

- 2301fd1: Drop unwanted files when publishing.
- Updated dependencies [2301fd1]
  - @triplex/bridge@0.70.5
  - @triplex/renderer@0.71.14

## 0.70.20

### Patch Changes

- c06f199: All paths now have their drive casing normalized.
  - @triplex/renderer@0.71.13

## 0.70.19

### Patch Changes

- f6b8df6: Fix code transform exclusions not applying on Windows.

## 0.70.18

### Patch Changes

- 8fce951: Fix component meta being generated for components outside of module scope.

## 0.70.17

### Patch Changes

- 4dbf621: Fix root analysis edge case where it would throw a "can't access root of undefined" error.

## 0.70.16

### Patch Changes

- b6ef6c2: The default global provider has been deprecated and replaced with two named exports: CanvasProvider which is a 1:1 replacement, and GlobalProvider, which is placed at the root of the component tree.
- Updated dependencies [a0c62f8]
- Updated dependencies [b6ef6c2]
- Updated dependencies [4db2055]
  - @triplex/renderer@0.71.12
  - @triplex/bridge@0.70.4

## 0.70.15

### Patch Changes

- 088c699: React Three Fiber dependencies are no longer needed to be installed when loading a project that doesn't use them.
- Updated dependencies [dfa0f39]
- Updated dependencies [09cb447]
- Updated dependencies [088c699]
  - @triplex/renderer@0.71.11
  - @triplex/bridge@0.70.3

## 0.70.14

### Patch Changes

- Updated dependencies [99daee6]
- Updated dependencies [e32739a]
- Updated dependencies [99daee6]
- Updated dependencies [eda7e0c]
  - @triplex/renderer@0.71.10

## 0.70.13

### Patch Changes

- 0137088: Upgrade to latest React Three Fiber dependencies.
- 711322a: Testing a new camera system under a feature gate. This gives you more control over what Canvas camera to view through, while also changing the default behavior for React DOM components to view through the default camera instead of the editor camera when initially opening.
- b4f482a: Fix scene resolving to bundled renderer instead of local renderer when running local renderers.
- Updated dependencies [0137088]
- Updated dependencies [3ad4196]
- Updated dependencies [711322a]
  - @triplex/renderer@0.71.9

## 0.70.12

### Patch Changes

- 6f01882: Fix jsconfig paths not being respected by the scene environment.

## 0.70.11

### Patch Changes

- Updated dependencies [fb2bad8]
- Updated dependencies [9a611b0]
- Updated dependencies [9a611b0]
- Updated dependencies [fb2bad8]
- Updated dependencies [9a611b0]
  - @triplex/renderer@0.71.8

## 0.70.10

### Patch Changes

- edba305: Fix root analysis using locally defined components sourced from inside components, which are now ignored. This is because the component isn't in the module scope and can't be statically used prior to the component rendering.
- edba305: Fix edgecase where the Fragment named import wouldn't be imported when using shorthand fragments.
- edba305: Add edge case support for assuming a react-three-fiber root if a custom component was found that starts with "object3d".

## 0.70.9

### Patch Changes

- 37eb94d: Add exportName to element meta.
- Updated dependencies [37eb94d]
- Updated dependencies [37eb94d]
  - @triplex/renderer@0.71.7
  - @triplex/bridge@0.70.2

## 0.70.8

### Patch Changes

- a5d2390: React 19 / Three Fiber 9 are now supported.
- Updated dependencies [a5d2390]
  - @triplex/renderer@0.71.6
  - @triplex/bridge@0.70.1

## 0.70.7

### Patch Changes

- Updated dependencies [62ae87f]
- Updated dependencies [9a211ee]
- Updated dependencies [95156aa]
  - @triplex/renderer@0.71.5

## 0.70.6

### Patch Changes

- 6422c5f: Userland createRoot calls are now stubbed out to prevent undefined behavior when opening.
- Updated dependencies [fe84ca9]
  - @triplex/renderer@0.71.4

## 0.70.5

### Patch Changes

- 7977da7: Fix Vite bundler running the scene in production mode breaking HMR.

## 0.70.4

### Patch Changes

- b2079fd: Fixed a long standing bug where rotation transforms weren't correctly marked where statically used as the code analysis was looking for "rotate" instead of "rotation".
- 095c729: A new loading indicator has been implemented.
- Updated dependencies [b2079fd]
- Updated dependencies [b2079fd]
- Updated dependencies [095c729]
  - @triplex/renderer@0.71.3

## 0.70.3

### Patch Changes

- 84a2615: JavaScript based projects no-longer have a tsconfig.json generated when starting up in Triplex.

## 0.70.2

### Patch Changes

- 1922407: Using a Canvas component from `@react-three/fiber` along with other custom components are now correctly flagged as a "react" root instead of a "three-fiber" root.
- Updated dependencies [bc6e2ba]
  - @triplex/renderer@0.71.2

## 0.70.1

### Patch Changes

- Updated dependencies [b9b220a]
  - @triplex/renderer@0.71.1

## 0.70.0

### Minor Changes

- 4e8c285: How components are loaded has been restructured to support opening components with mixed JSX elements from different reconcilers.
- 25daa3d: The `rendererAttributes` config option has been removed. If you were relying on this instead declare a Canvas component from `@react-three/fiber` in your component and set the props as desired.
- 4e8c285: Triplex can now open components that have both DOM and Three Fiber JSX elements.

### Patch Changes

- 9b67742: Upgrade three.js dependencies.
- b9b1b62: Upgrade vite and all related dependencies to latest.
- 4e8c285: Fixed edge cases where transform props wouldn't be picked up as used inside spread props.
- fbe725f: Fixed an edge case where nested object3ds were being translated by transform controls in unexpected ways, caused by props being flagged as used when they weren't identifiers.
- e4db0c2: Upgrade TypeScript to latest.
- c896b64: Remove experimental react renderer.
- Updated dependencies [9b67742]
- Updated dependencies [b9b1b62]
- Updated dependencies [2f36ed7]
- Updated dependencies [e00d37a]
- Updated dependencies [2f36ed7]
- Updated dependencies [aa3bec6]
- Updated dependencies [4e8c285]
- Updated dependencies [e4db0c2]
- Updated dependencies [25daa3d]
- Updated dependencies [1f0ef15]
- Updated dependencies [4106062]
- Updated dependencies [4e8c285]
- Updated dependencies [130d4b3]
- Updated dependencies [93761c7]
  - @triplex/renderer@0.71.0
  - @triplex/bridge@0.70.0

## 0.69.8

### Patch Changes

- 51d16cd: Errors thrown when rendering, initializing modules, importing dependencies, interacting with scene objects, and GLSL compilation are now all captured and notifies you of the error. Where possible the errors are now also recoverable, meaning you can update your code, save, and continue right where you leftoff.
- 8752e68: Duplicated elements are now focused.
- b1b39e7: The global provider infrastructure has been refactored to not cause jarring hot module reloads when its contents change.
- 91ae968: Initialization errors are now caught in the renderer when starting up Triplex.
- 7493473: Add refresh for the scene via CommandOrCtrl+R.
- dbab960: Loading spinner has moved to the top right of the scene.
- 9255c16: Remove forced key set on transformed scene objects.
- Updated dependencies [7c49f9f]
- Updated dependencies [51d16cd]
- Updated dependencies [8752e68]
- Updated dependencies [5be8d67]
- Updated dependencies [b1b39e7]
- Updated dependencies [a871eb9]
- Updated dependencies [097f148]
- Updated dependencies [57ca5bc]
- Updated dependencies [9f689b7]
- Updated dependencies [097f148]
- Updated dependencies [74b3de8]
- Updated dependencies [7493473]
- Updated dependencies [a89da48]
- Updated dependencies [51d16cd]
- Updated dependencies [7493473]
- Updated dependencies [dbab960]
  - @triplex/renderer@0.70.2
  - @triplex/bridge@0.69.5

## 0.69.7

### Patch Changes

- @triplex/renderer@0.70.1

## 0.69.6

### Patch Changes

- d38608f: Camera modifiers are now correctly triggered when focused in the parent editor.
- Updated dependencies [be3bae6]
- Updated dependencies [ecbb1d7]
- Updated dependencies [d38608f]
  - @triplex/renderer@0.70.0
  - @triplex/bridge@0.69.4

## 0.69.5

### Patch Changes

- 652c1cc: Update package json meta.
- Updated dependencies [652c1cc]

  - @triplex/renderer@0.69.5
  - @triplex/bridge@0.69.3

## 0.69.4

### Patch Changes

- c6630d2: Fix Vite instance being unable to reconnect when OS wakes from sleep.
- Updated dependencies [b73ba38]
  - @triplex/renderer@0.69.4

## 0.69.3

### Patch Changes

- @triplex/renderer@0.69.3

## 0.69.2

### Patch Changes

- 967bfbd0: Upgrade vite to v5.
- Updated dependencies [967bfbd0]

  - @triplex/renderer@0.69.2
  - @triplex/bridge@0.69.2

## 0.69.1

### Patch Changes

- 50c28c96: Upgrade tsc.
- Updated dependencies [50c28c96]

  - @triplex/renderer@0.69.1
  - @triplex/bridge@0.69.1

## 0.69.0

### Patch Changes

- Updated dependencies [fd4fa16f]
- Updated dependencies [740ff8f2]

  - @triplex/renderer@0.69.0
  - @triplex/bridge@0.69.0

## 0.68.8

### Patch Changes

- @triplex/renderer@0.68.8
- @triplex/bridge@0.68.8

## 0.68.7

### Patch Changes

- Updated dependencies [909bed1a]
  - @triplex/renderer@0.68.7
  - @triplex/bridge@0.68.7

## 0.68.6

### Patch Changes

- @triplex/bridge@0.68.6
- @triplex/renderer@0.68.6

## 0.68.5

### Patch Changes

- Updated dependencies [ea7e0420]
  - @triplex/renderer@0.68.5
  - @triplex/bridge@0.68.5

## 0.68.4

### Patch Changes

- @triplex/renderer@0.68.4
- @triplex/bridge@0.68.4

## 0.68.3

### Patch Changes

- Updated dependencies [11c2cb65]
  - @triplex/renderer@0.68.3
  - @triplex/bridge@0.68.3

## 0.68.2

### Patch Changes

- Updated dependencies [16117f1a]
- Updated dependencies [16117f1a]
  - @triplex/renderer@0.68.2
  - @triplex/bridge@0.68.2

## 0.68.1

### Patch Changes

- Updated dependencies [b2a850fb]
  - @triplex/renderer@0.68.1
  - @triplex/bridge@0.68.1

## 0.68.0

### Patch Changes

- Updated dependencies [5b6671c2]
- Updated dependencies [60ee4011]
  - @triplex/renderer@0.68.0
  - @triplex/bridge@0.68.0

## 0.67.9

### Patch Changes

- @triplex/bridge@0.67.9
- @triplex/renderer@0.67.9

## 0.67.8

### Patch Changes

- Updated dependencies [3952a1c8]
  - @triplex/bridge@0.67.8
  - @triplex/renderer@0.67.8

## 0.67.7

### Patch Changes

- Updated dependencies [23eaef8a]

  - @triplex/renderer@0.67.7

  - @triplex/bridge@0.67.7

## 0.67.6

### Patch Changes

- @triplex/renderer@0.67.6
- @triplex/bridge@0.67.6

## 0.67.5

### Patch Changes

- Updated dependencies [201367eb]

  - @triplex/renderer@0.67.5

  - @triplex/bridge@0.67.5

## 0.67.4

### Patch Changes

- cde561dc: Clear triplex cache every version.
- Updated dependencies [ce57e0d6]
- Updated dependencies [b2bf1662]
- Updated dependencies [88198788]
- Updated dependencies [b8e0ee3a]
- Updated dependencies [cba1c8db]

  - @triplex/renderer@0.67.4

  - @triplex/bridge@0.67.4

## 0.67.3

### Patch Changes

- b8b97458: Forward keypress events to the parent document.
- Updated dependencies [b8b97458]
- Updated dependencies [cb41e650]
- Updated dependencies [c9c2bd90]
- Updated dependencies [b8b97458]
  - @triplex/renderer@0.67.3
  - @triplex/bridge@0.67.3

## 0.67.2

### Patch Changes

- @triplex/renderer@0.67.2
- @triplex/bridge@0.67.2

## 0.67.1

### Patch Changes

- Updated dependencies [e841a67]
  - @triplex/renderer@0.67.1
  - @triplex/bridge@0.67.1

## 0.67.0

### Patch Changes

- 3343fad: Hard refresh now reloads the entire editor.
- Updated dependencies [a7b3058]
- Updated dependencies [f14b92b]
- Updated dependencies [55ecc10]
- Updated dependencies [b4886f6]
- Updated dependencies [2e0acc7]
- Updated dependencies [6f3d8de]
- Updated dependencies [1d415ae]
- Updated dependencies [3343fad]
  - @triplex/renderer@0.67.0
  - @triplex/bridge@0.67.0

## 0.66.0

### Minor Changes

- 625e23a: The selection system has been reimplemented, removing the need for intermediate group elements powering scene lookups.

### Patch Changes

- 3179ed6: Add support for automatic runtime for scene selection system.
- Updated dependencies [79a2c59]
- Updated dependencies [625e23a]
  - @triplex/renderer@0.66.0
  - @triplex/bridge@0.66.0

## 0.65.2

### Patch Changes

- c1a986d: Fix node modules check on scene elements using the triplex default cwd instead of the opened project cwd.
  - @triplex/bridge@0.65.2
  - @triplex/renderer@0.65.2

## 0.65.1

### Patch Changes

- Updated dependencies [983b5d9]
- Updated dependencies [763f2a1]
  - @triplex/renderer@0.65.1
  - @triplex/bridge@0.65.1

## 0.65.0

### Patch Changes

- Updated dependencies [29c9d95]
  - @triplex/renderer@0.65.0
  - @triplex/bridge@0.65.0

## 0.64.4

### Patch Changes

- Updated dependencies [399713d]
- Updated dependencies [1df7cc9]
- Updated dependencies [44a0156]
- Updated dependencies [343a7e4]

  - @triplex/renderer@0.64.4

  - @triplex/bridge@0.64.4

## 0.64.3

### Patch Changes

- 1d9c390: Fix user land modules being forcibly invalidated during HMR causing unexpected behaviour.

  - @triplex/renderer@0.64.3

  - @triplex/bridge@0.64.3

## 0.64.2

### Patch Changes

- 26ac612: Fix thumbnail renderer throwing when no provider was configured.
  - @triplex/bridge@0.64.2
  - @triplex/renderer@0.64.2

## 0.64.1

### Patch Changes

- 835639f: Fix scene object not being transformed when provider wasn't set.
  - @triplex/bridge@0.64.1
  - @triplex/renderer@0.64.1

## 0.64.0

### Minor Changes

- 8712a12: Add renderer attributes. Refer to docs.
- 0868337: Add support for SharedBufferArray.
- 0868337: Add `define` variables support.

### Patch Changes

- a153ee8: Error handler now set up before bootstrapping renderer.
- 777b2f5: Get random port for the ws server on Vite start.
- Updated dependencies [8712a12]
- Updated dependencies [a153ee8]
- Updated dependencies [a153ee8]
  - @triplex/renderer@0.64.0
  - @triplex/bridge@0.64.0

## 0.63.0

### Minor Changes

- 0b5fb14: Add manifest to renderers.
- 4c48d66: Add host element declarations to renderer manifest.

### Patch Changes

- 480866f: Upgrade TypeScript.
- Updated dependencies [0b5fb14]
- Updated dependencies [4c48d66]
- Updated dependencies [480866f]

  - @triplex/renderer@0.63.0
  - @triplex/bridge@0.63.0

## 0.62.0

### Minor Changes

- 3612434: Add thumbnail support for renderers.

### Patch Changes

- bad0a57: Triplex now finds random open ports every time a project is opened instead of using hardcoded ones.
- cea76c2: Simplify bridge event names.
- 7313788: Internal refactor.
- fe7c5f9: Config now passed to renderer func.
- Updated dependencies [cea76c2]
- Updated dependencies [99b97cf]
- Updated dependencies [cdbdc16]
- Updated dependencies [3612434]
- Updated dependencies [99b97cf]
- Updated dependencies [7313788]
- Updated dependencies [fe7c5f9]
  - @triplex/renderer@0.62.0
  - @triplex/bridge@0.62.0

## 0.61.2

### Patch Changes

- 273b644: Fix HMR error when Object namespace has been taken in the module scope.
  - @triplex/scene@0.61.2

## 0.61.1

### Patch Changes

- @triplex/scene@0.61.1

## 0.61.0

### Minor Changes

- b407820: Add file tabs.

### Patch Changes

- 5efeea0: Normalize paths using upath instead of node built-in.
- Updated dependencies [3091229]
- Updated dependencies [d583e42]
- Updated dependencies [d583e42]
- Updated dependencies [b407820]
- Updated dependencies [5e22a9a]
- Updated dependencies [5efeea0]
- Updated dependencies [d583e42]
- Updated dependencies [cba2b47]
  - @triplex/scene@0.61.0

## 0.60.1

### Patch Changes

- 13964df: Importing gltf/glb assets directly no longer errors.
  - @triplex/scene@0.60.1

## 0.60.0

### Patch Changes

- 000008d: Fix regression on Windows where the scene would never load.
- 0cce596: Fix adding custom components to a new file.
- Updated dependencies [0cce596]
- Updated dependencies [7a250ba]
  - @triplex/scene@0.60.0

## 0.59.1

### Patch Changes

- @triplex/scene@0.59.1

## 0.59.0

### Minor Changes

- 26bd068: Scene modules are now loaded remotely instead of from the fs. This is going to raise the ceiling on features we can implement as now everything becomes a mutation to the remote source instead of that AND also trying to handle the intermediate state in the scene prior to it being flushed to the fs. Super excited about this.

### Patch Changes

- 8dd7cd1: Scene/client pkgs now bundled with vite.
- f6e068c: Packages have been moved into namedspaced folders.
- Updated dependencies [ce8a108]
- Updated dependencies [ce8a108]
- Updated dependencies [8dd7cd1]
- Updated dependencies [ce8a108]
- Updated dependencies [26bd068]
- Updated dependencies [f6e068c]
  - @triplex/scene@0.59.0

## 0.58.2

### Patch Changes

- b5247c2: Apply lint and prettier fixes.
- Updated dependencies [85447c2]
- Updated dependencies [250c9ab]
- Updated dependencies [85447c2]
- Updated dependencies [85447c2]
- Updated dependencies [250c9ab]
- Updated dependencies [b5247c2]
  - @triplex/scene@0.58.2

## 0.58.1

### Patch Changes

- Updated dependencies [e645e5c]
  - @triplex/scene@0.58.1

## 0.58.0

### Patch Changes

- 3e1e081: Changes to provider are now flushed throughout the scene during hmr.
- 3e1e081: Components sourced from node modules now can be flagged as transformed.
- Updated dependencies [37bf36d]
- Updated dependencies [3e1e081]
- Updated dependencies [3e1e081]
- Updated dependencies [3e1e081]
  - @triplex/scene@0.58.0

## 0.57.2

### Patch Changes

- Updated dependencies [f5bbeda]
  - @triplex/scene@0.57.2

## 0.57.1

### Patch Changes

- d32cf94: Fixes bugs with the new Triplex provider, previously it would be rendered outside the Canvas element as well as being unintentionally transformed into a scene object.
- Updated dependencies [d32cf94]
  - @triplex/scene@0.57.1

## 0.57.0

### Minor Changes

- 6da8bae: Adds context provider support using the `provider` config property.

### Patch Changes

- 5c7ba21: Windows no longer throws when opening projects that have escape characters in them.
- Updated dependencies [5c1fc3d]
- Updated dependencies [046cf78]
- Updated dependencies [2b61384]
  - @triplex/scene@0.57.0

## 0.56.1

### Patch Changes

- Updated dependencies [e4345ef]
  - @triplex/scene@0.56.1

## 0.56.0

### Patch Changes

- 2e53a2e: Turn off type declaration maps.
- Updated dependencies [463789f]
- Updated dependencies [32a110f]
- Updated dependencies [2e53a2e]
- Updated dependencies [47483b9]
  - @triplex/scene@0.56.0

## 0.55.3

### Patch Changes

- @triplex/scene@0.55.3

## 0.55.2

### Patch Changes

- @triplex/scene@0.55.2

## 0.55.1

### Patch Changes

- ea86fdc: Add license banner.
- Updated dependencies [ea86fdc]
  - @triplex/scene@0.55.1

## 0.55.0

### Minor Changes

- 3be2782: Add support for packages when adding components to scene.

### Patch Changes

- Updated dependencies [3be2782]
- Updated dependencies [111a1f2]
- Updated dependencies [44faed1]
  - @triplex/scene@0.55.0

## 0.54.2

### Patch Changes

- @triplex/scene@0.54.2

## 0.54.1

### Patch Changes

- ad66cc8: Add support for scene objects to be passed transform props (`position`, `rotation`, and `scale`) via spread props.
- Updated dependencies [3711009]
  - @triplex/scene@0.54.1

## 0.54.0

### Patch Changes

- Updated dependencies [36c2d9c]
- Updated dependencies [d2d40f6]
- Updated dependencies [36c2d9c]
- Updated dependencies [8fad65a]
- Updated dependencies [e0038f6]
  - @triplex/scene@0.54.0

## 0.53.1

### Patch Changes

- Updated dependencies [4ddb52e]
  - @triplex/scene@0.53.1

## 0.53.0

### Patch Changes

- Updated dependencies [aa3a982]
- Updated dependencies [c71412b]
  - @triplex/scene@0.53.0

## 0.52.0

### Minor Changes

- 8d532f5: Editor now shows build time and runtime errors in an error overlay.

### Patch Changes

- Updated dependencies [8d532f5]
  - @triplex/scene@0.52.0

## 0.51.1

### Patch Changes

- Updated dependencies [753dba5]
  - @triplex/scene@0.51.1

## 0.51.0

### Patch Changes

- Updated dependencies [6179fef]
  - @triplex/scene@0.51.0

## 0.50.1

### Patch Changes

- Updated dependencies [b7c966c]
- Updated dependencies [3c19632]
  - @triplex/scene@0.50.1

## 0.50.0

### Minor Changes

- 8ea575b: Built output is now mangled.

### Patch Changes

- Updated dependencies [8ea575b]
  - @triplex/scene@0.50.0

## 0.49.0

### Patch Changes

- @triplex/scene@0.49.0

## 0.48.0

### Minor Changes

- 6fe34af: Windows support is here. Now Triplex cli and electron can be ran on Windows, as well as the local dev loop now being functional.

### Patch Changes

- Updated dependencies [6fe34af]
  - @triplex/scene@0.48.0

## 0.47.0

### Minor Changes

- 4164026: Add support for the scene to know what environment it is running in (either web or electron).

### Patch Changes

- 1fc7657: The client has had its CSP removed.
- 1fc7657: Log level now set to error.
- Updated dependencies [4164026]
  - @triplex/scene@0.47.0

## 0.46.4

### Patch Changes

- @triplex/scene@0.46.4

## 0.46.3

### Patch Changes

- @triplex/scene@0.46.3

## 0.46.2

### Patch Changes

- @triplex/scene@0.46.2

## 0.46.1

### Patch Changes

- @triplex/scene@0.46.1

## 0.46.0

### Minor Changes

- d67f998: Three package resolutions in the client server now are forcibly resolved from the cwd.
- c808957: Removes redundant package alias for `three`.

### Patch Changes

- Updated dependencies [d67f998]
  - @triplex/scene@0.46.0

## 0.45.1

### Patch Changes

- @triplex/scene@0.45.1

## 0.45.0

### Patch Changes

- @triplex/scene@0.45.0

## 0.44.0

### Minor Changes

- 0242833: Scene now removes intermediate state when resetting.
- 5039e39: Adds `cwd` to servers to allow setting it to a new location.
- 4d8d9cc: Builds are now minified.
- 5039e39: Adds CSP meta tag to client HTML.
- 557648e: Editor has been extracted out of the client dev server and now is bundled when published to npm.

### Patch Changes

- Updated dependencies [0242833]
- Updated dependencies [4d8d9cc]
  - @triplex/scene@0.44.0

## 0.43.0

### Minor Changes

- 01cd388: Adds transparent checker bg to color picker when no value is defined.
- 01cd388: Editor is now flushed when a scene adds or removes lights.
- 6dfb22d: Fixes a HMR bug when a modules exports change and the editor wasn't being flushed with the new exports.

### Patch Changes

- Updated dependencies [6dfb22d]
- Updated dependencies [6dfb22d]
- Updated dependencies [6dfb22d]
- Updated dependencies [6dfb22d]
- Updated dependencies [de54812]
- Updated dependencies [b7bbeba]
- Updated dependencies [6dfb22d]
- Updated dependencies [6dfb22d]
- Updated dependencies [b7bbeba]
- Updated dependencies [6dfb22d]
- Updated dependencies [de54812]
- Updated dependencies [01cd388]
- Updated dependencies [de54812]
- Updated dependencies [de54812]
- Updated dependencies [b7bbeba]
- Updated dependencies [01cd388]
- Updated dependencies [facc6aa]
- Updated dependencies [de54812]
- Updated dependencies [01cd388]
  - @triplex/scene@0.43.0
  - @triplex/editor@0.43.0

## 0.42.0

### Patch Changes

- @triplex/editor@0.42.0
- @triplex/scene@0.42.0

## 0.41.0

### Minor Changes

- 5d161d8: Move to using system fonts.

### Patch Changes

- Updated dependencies [5d161d8]
  - @triplex/editor@0.41.0
  - @triplex/scene@0.41.0

## 0.40.0

### Minor Changes

- a2a2f4b: When unapplying a prop to a component such as performing an undo it is now applied as expected in the scene. Previously only the context panel would be updated with the new value.

### Patch Changes

- Updated dependencies [a2a2f4b]
- Updated dependencies [a2a2f4b]
- Updated dependencies [dac7c76]
- Updated dependencies [dac7c76]
- Updated dependencies [a2a2f4b]
- Updated dependencies [bfb0f7a]
- Updated dependencies [ee2494b]
  - @triplex/editor@0.40.0
  - @triplex/scene@0.40.0

## 0.39.0

### Patch Changes

- Updated dependencies [ca9807e]
- Updated dependencies [ca9807e]
- Updated dependencies [ca9807e]
  - @triplex/editor@0.39.0
  - @triplex/scene@0.39.0

## 0.38.0

### Minor Changes

- 06471f6: The components virtual module has been removed in favor of passing down as props instead.

### Patch Changes

- Updated dependencies [06471f6]
  - @triplex/scene@0.38.0
  - @triplex/editor@0.38.0

## 0.37.0

### Minor Changes

- 1a2ecea: Components can now be added to the scene through the add component button in the scene panel.
- 1a2ecea: The triplex config now has a new property called `components` - use to mark files that are able to be added to scenes.

### Patch Changes

- Updated dependencies [0e781ac]
- Updated dependencies [23fe64a]
- Updated dependencies [1a2ecea]
- Updated dependencies [1a2ecea]
  - @triplex/scene@0.37.0
  - @triplex/editor@0.37.0

## 0.36.0

### Patch Changes

- Updated dependencies [f24f2fd]
  - @triplex/scene@0.36.0
  - @triplex/editor@0.36.0

## 0.35.0

### Patch Changes

- Updated dependencies [e53a703]
- Updated dependencies [e53a703]
  - @triplex/editor@0.35.0
  - @triplex/scene@0.35.0

## 0.34.0

### Minor Changes

- 2a64658: The context panel now displays all available props on a component even if they aren't yet declared thanks to the TypeScript compiler and ts-morph. Not all prop types are supported currently, if you have one that you expected to be available but isn't please reach out.

### Patch Changes

- Updated dependencies [2a64658]
- Updated dependencies [2a64658]
  - @triplex/editor@0.34.0
  - @triplex/scene@0.34.0

## 0.33.0

### Patch Changes

- Updated dependencies [1067d23]
- Updated dependencies [1067d23]
  - @triplex/editor@0.33.0
  - @triplex/scene@0.33.0

## 0.32.0

### Patch Changes

- Updated dependencies [73d9e8c]
- Updated dependencies [c87a5f3]
- Updated dependencies [c87a5f3]
- Updated dependencies [c87a5f3]
  - @triplex/editor@0.32.0
  - @triplex/scene@0.32.0

## 0.31.0

### Patch Changes

- Updated dependencies [48002a7]
- Updated dependencies [5ac3a26]
- Updated dependencies [a1e3127]
- Updated dependencies [48002a7]
  - @triplex/scene@0.31.0
  - @triplex/editor@0.31.0

## 0.30.0

### Minor Changes

- 0bb6119: Adds support for updating scene objects through the context panel.

### Patch Changes

- Updated dependencies [0bb6119]
- Updated dependencies [0bb6119]
- Updated dependencies [0bb6119]
  - @triplex/editor@0.30.0
  - @triplex/scene@0.30.0

## 0.29.0

### Minor Changes

- 0d83ef2: The babel plugin now forwards key prop to the wrapping group element.

### Patch Changes

- Updated dependencies [0d83ef2]
- Updated dependencies [0d83ef2]
- Updated dependencies [0d83ef2]
  - @triplex/scene@0.29.0
  - @triplex/editor@0.29.0

## 0.28.0

### Minor Changes

- aa1aa8c: Scene transformation using ts-morph has been replaced with Babel significantly speeding up initial load and saving. The need for the `.triplex/tmp` folder is now gone and thus no longer used.

### Patch Changes

- Updated dependencies [aa1aa8c]
- Updated dependencies [aa1aa8c]
- Updated dependencies [aa1aa8c]
  - @triplex/editor@0.28.0
  - @triplex/scene@0.28.0

## 0.27.0

### Minor Changes

- 9b1d135: Adds out-of-the-box support for `.gtlf`, `.vert`, and `.frag` files.
- e5a3419: Context panel now supports more prop types.

### Patch Changes

- Updated dependencies [fa35cde]
- Updated dependencies [9b1d135]
- Updated dependencies [56f2b3e]
- Updated dependencies [fa35cde]
- Updated dependencies [246217f]
- Updated dependencies [1e405c3]
- Updated dependencies [fa35cde]
- Updated dependencies [e5a3419]
- Updated dependencies [9b1d135]
  - @triplex/editor@0.27.0
  - @triplex/scene@0.27.0

## 0.26.0

### Patch Changes

- Updated dependencies [785050d]
- Updated dependencies [71374c9]
- Updated dependencies [9d400e4]
- Updated dependencies [e532920]
  - @triplex/editor@0.26.0
  - @triplex/scene@0.26.0

## 0.25.0

### Minor Changes

- 9c807ac: When running r3f is now deduped and forced to [use the version from project root](https://vitejs.dev/config/shared-options.html#resolve-dedupe).

### Patch Changes

- Updated dependencies [aaac9cc]
  - @triplex/scene@0.25.0
  - @triplex/editor@0.25.0

## 0.24.0

### Patch Changes

- @triplex/editor@0.24.0
- @triplex/scene@0.24.0

## 0.23.0

### Minor Changes

- 0aa8b4a: Adds tsconfig-paths plugin to resolve absolute paths.

### Patch Changes

- @triplex/editor@0.23.0
- @triplex/scene@0.23.0

## 0.22.0

### Patch Changes

- Updated dependencies [aa9c9ae]
  - @triplex/editor@0.22.0
  - @triplex/scene@0.22.0

## 0.21.0

### Minor Changes

- 633e309: Adds export-name option to editor command.

### Patch Changes

- @triplex/editor@0.21.0
- @triplex/scene@0.21.0

## 0.20.0

### Patch Changes

- Updated dependencies [1c9771d]
- Updated dependencies [1c9771d]
- Updated dependencies [1c9771d]
  - @triplex/editor@0.20.0
  - @triplex/scene@0.20.0

## 0.19.0

### Minor Changes

- 70b3365: Adds `publicDir` to config.

### Patch Changes

- @triplex/editor@0.19.0
- @triplex/scene@0.19.0

## 0.18.0

### Patch Changes

- @triplex/editor@0.18.0
- @triplex/scene@0.18.0

## 0.17.0

### Patch Changes

- @triplex/editor@0.17.0
- @triplex/scene@0.17.0

## 0.16.0

### Minor Changes

- c8ab78b: Scene no longer uses its own copied HMR library and instead leans on the vite react plugin offering.
- 2fa7c45: Adds author field to package.json.
- 926359a: The temp folder is now located in .triplex/tmp.

### Patch Changes

- Updated dependencies [d8e1602]
- Updated dependencies [e7c026b]
- Updated dependencies [7ff35f3]
- Updated dependencies [7ff35f3]
- Updated dependencies [e7c026b]
- Updated dependencies [e7c026b]
- Updated dependencies [7ff35f3]
- Updated dependencies [e7c026b]
- Updated dependencies [7ff35f3]
- Updated dependencies [2fa7c45]
  - @triplex/scene@0.16.0
  - @triplex/editor@0.16.0

## 0.15.0

### Patch Changes

- Updated dependencies [e54e0f8]
- Updated dependencies [e54e0f8]
  - @triplex/editor@0.15.0
  - @triplex/scene@0.15.0

## 0.14.0

### Patch Changes

- Updated dependencies [7a8083c]
  - @triplex/editor@0.14.0
  - @triplex/scene@0.14.0

## 0.6.0

### Minor Changes

- a4d6882: Adds extra font weights for karla font.

### Patch Changes

- Updated dependencies [99075ff]
- Updated dependencies [99075ff]
- Updated dependencies [cfbd47b]
- Updated dependencies [969feab]
- Updated dependencies [cc917d7]
- Updated dependencies [969feab]
- Updated dependencies [a4d6882]
- Updated dependencies [a4d6882]
- Updated dependencies [99075ff]
- Updated dependencies [7bebe67]
- Updated dependencies [cfbd47b]
- Updated dependencies [969feab]
- Updated dependencies [99075ff]
- Updated dependencies [cfbd47b]
  - @triplex/scene@0.12.0
  - @triplex/editor@0.13.0

## 0.5.1

### Patch Changes

- Updated dependencies [55f0206]
- Updated dependencies [55f0206]
  - @triplex/editor@0.12.0
  - @triplex/scene@0.11.0

## 0.5.0

### Minor Changes

- 3c725bc: Force release all packages.

### Patch Changes

- Updated dependencies [3c725bc]
  - @triplex/editor@0.11.0
  - @triplex/scene@0.10.0

## 0.4.0

### Minor Changes

- a32c72e: Removes silent logging for now.

### Patch Changes

- Updated dependencies [a32c72e]
  - @triplex/editor@0.10.0

## 0.3.0

### Minor Changes

- 12ecbc4: Adds --open command to the editor command. Optionally pass in a filepath to open that file initially.
- 7db42bd: Adds slide in animation.

### Patch Changes

- Updated dependencies [ac9624f]
- Updated dependencies [7db42bd]
  - @triplex/editor@0.9.0
  - @triplex/scene@0.9.0

## 0.2.0

### Minor Changes

- 387f6cd: Adds a menu bar to the editor.

### Patch Changes

- Updated dependencies [387f6cd]
- Updated dependencies [387f6cd]
  - @triplex/editor@0.8.0
  - @triplex/scene@0.8.0

## 0.1.1

### Patch Changes

- Updated dependencies [56dde00]
  - @triplex/editor@0.7.0

## 0.1.0

### Minor Changes

- c84a8ca: Frontend server is now extracted to the client package.

### Patch Changes

- Updated dependencies [c84a8ca]
  - @triplex/editor@0.6.0
  - @triplex/scene@0.7.0
