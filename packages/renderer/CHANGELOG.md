# @triplex/renderer

## 0.72.2

## 0.72.1

### Patch Changes

- Updated dependencies [a7a0138]
  - @triplex/lib@0.69.19

## 0.72.0

### Minor Changes

- 66e723d: Added grid toggle feature to scene controls. Users can now show/hide the grid using the "Toggle Visibility" option in the scene settings.

### Patch Changes

- 46b8c74: The selection system now keeps hold of your selected element across file changes. This fix will be rolled out incrementally across Triplex for VS Code users. Want early access? Reach out on Discord.
- Updated dependencies [46b8c74]
  - @triplex/bridge@0.70.12

## 0.71.36

### Patch Changes

- b14a832: The camera preview no longer has the selection outline of the camera visible.
- b14a832: Switching from default to editor camera now correctly fits the scene to it on the first switch.
- b14a832: Switching the canvas camera between editor and defaul no longer bleeds state between each other.
- 9add655: Resetting a component that renders a canvas now persists the camera settings.
- Updated dependencies [9add655]
  - @triplex/lib@0.69.18

## 0.71.35

### Patch Changes

- b229047: The scene graph is now reset when entering play state from edit state.
- b229047: Fixed an edge case where stale scene objects could stick around when resetting the scene.
- b229047: The editor grid has now been positioned slightly above y=0 so it doesn't z-fight with other objects placed on y=0.
- b229047: Duplicate entries found in during hit testing for selecting elements in the scene are now removed, fixing an edge case where cycle selection would not work as expected.
- b229047: Fixed an edge case where some elements were unable to be selected through the editor scene.
- b229047: The canvas is now immediately focused when entering play state.
- a72f57f: The editor camera now behaves the same on initial load, interacting with the axis controls, and using the "zoom to element" action.
- a9a707f: Transform controls are no longer rendered in the scene if the selected scene element takes no transform props.
- a72f57f: The editor camera now ignores very large objects when reorienting to scene objects.
- b229047: Fix userland keyboard events being triggered outside of play state.
- Updated dependencies [b229047]
  - @triplex/bridge@0.70.11

## 0.71.34

### Patch Changes

- e1153b6: Fix provider data being preloaded when it hasn't been set by users yet.

## 0.71.33

### Patch Changes

- 0cbd424: Components that are no longer exported are now gracefully handled. Instead of an error being thrown the UI remains available prompting you to export the component again.
- 6d8af23: The editor camera is no longer repositioned if the scene suspends after initially loading, eliminating some user jank.
- Updated dependencies [0cbd424]
  - @triplex/bridge@0.70.10

## 0.71.32

### Patch Changes

- 8fb5533: The selection outline in 3D components now ignores transparency from textures, instead outlining the entire mesh. This gives a less distracting outline.

## 0.71.31

### Patch Changes

- e63360f: The editor camera can now be set as the "default" camera by using the "Toggle Editor As Default" action using the floating scene controls. This makes the default camera be the editor one when looking through the editor camera, useful for debugging camera related features when appropriate.

## 0.71.30

### Patch Changes

- Updated dependencies [82103a4]
- Updated dependencies [55feda2]
  - @triplex/lib@0.69.17

## 0.71.29

### Patch Changes

- b458870: Add skeleton helper for skinned mesh.

## 0.71.28

### Patch Changes

- 7dc937f: Transform controls now reads the initial state from props instead of the scene fixing some edge cases affecting Triplex users, such as transforming decal meshes.
- f50d251: Elements that have associated helpers now also render children when the helper is rendered.

## 0.71.27

### Patch Changes

- Updated dependencies [e447108]
  - @triplex/bridge@0.70.9

## 0.71.26

### Patch Changes

- 8c82aca: Upgrade react-three dependencies.
- 3a45b69: Add an XROrigin helper.
- ae60a8f: Upgrade typescript.
- e6f7288: The XROrigin component is now disabled when in edit state or looking through the editor camera.
- 8c82aca: Upgrade vite dependencies.
- Updated dependencies [8c82aca]
- Updated dependencies [ae60a8f]
- Updated dependencies [8c82aca]
  - @triplex/bridge@0.70.8
  - @triplex/lib@0.69.16

## 0.71.25

### Patch Changes

- 5bb5654: Cleanup camera_pp_fix feature gate.
- d3b7090: Cleanup camera_helper_original feature gate.

## 0.71.24

### Patch Changes

- 6bfbbf2: Guard transform controls to only render if there is an available object.

## 0.71.23

### Patch Changes

- 482f25b: Replace custom camera helper with the original one.

## 0.71.22

### Patch Changes

- 3fd23e3: Add support for custom component transforms in WebXR.
- Updated dependencies [3fd23e3]
  - @triplex/bridge@0.70.7

## 0.71.21

### Patch Changes

- Updated dependencies [839e91e]
  - @triplex/lib@0.69.15

## 0.71.20

### Patch Changes

- 733b63a: Add selection lock when transforming in WebXR.
- ffc7076: Triplex now releases control of rendering back to default behavior when the "default" camera is active in the editor.
- 88738b8: Add button events to cycle through space / transform modes in WebXR.
- acc5fbf: Add WebXR transform handles when an object is selected.
- ffc7076: Fix regression to camera previews caused by feature gate camera_pp_fix.
- 1853b4c: Fix selection outline in WebXR not updating during transforms.

## 0.71.19

### Patch Changes

- Updated dependencies [abf48b9]
  - @triplex/lib@0.69.14

## 0.71.18

### Patch Changes

- f97183e: Add hover/selection indicators to WebXR exploration.
- b11acae: Add haptic feedback to WebXR interactions.
- b11acae: Add pointer cursor to Triplex WebXR.

## 0.71.17

### Patch Changes

- b97cd77: IPs are now capped to 3000 range.

## 0.71.16

### Patch Changes

- 4e148d7: Cleanup selection_postprocessing feature gate.
- 3338a50: Update transform controls to not mutate the Three.js scene. This will be slowly tested and rolled out.
- b3a0420: Cleanup camera_reconciler_refactor feature gate.
- 83d2a62: Cleanup camera_axis_helper feature gate.
- Updated dependencies [cfd4a6f]
  - @triplex/bridge@0.70.6

## 0.71.15

### Patch Changes

- f61dd89: Testing a fix for running postprocessing, it will be gradually rolled out.

## 0.71.14

### Patch Changes

- 2301fd1: Drop unwanted files when publishing.
- Updated dependencies [2301fd1]
  - @triplex/bridge@0.70.5
  - @triplex/lib@0.69.13

## 0.71.13

### Patch Changes

- Updated dependencies [c06f199]
  - @triplex/lib@0.69.12

## 0.71.12

### Patch Changes

- a0c62f8: Fix delete element bleeding deleted state onto unexpecting sibling elements.
- b6ef6c2: The default global provider has been deprecated and replaced with two named exports: CanvasProvider which is a 1:1 replacement, and GlobalProvider, which is placed at the root of the component tree.
- 4db2055: Fix state changes clearing the camera unexpectedly.
- Updated dependencies [b6ef6c2]
  - @triplex/bridge@0.70.4

## 0.71.11

### Patch Changes

- dfa0f39: Screenshots have been disabled in editor and will be re-enabled at a later date.
- 09cb447: Fix React DOM components not being able to be reset when pressing the reset button or entering edit state.
- 088c699: React Three Fiber dependencies are no longer needed to be installed when loading a project that doesn't use them.
- Updated dependencies [088c699]
  - @triplex/bridge@0.70.3

## 0.71.10

### Patch Changes

- 99daee6: The scene now remains interactive even when the editor panel is not active inside Visual Studio Code.
- e32739a: Fix React DOM outline selections missing scroll offset.
- 99daee6: Fixed camera previews to only show through the editor camera.
- eda7e0c: Fix three fiber selections selecting unexpected objects when hovered outside of the canvas.

## 0.71.9

### Patch Changes

- 0137088: Upgrade to latest React Three Fiber dependencies.
- 3ad4196: Remove object helper affecting camera fit scene behavior.
- 711322a: Testing a new camera system under a feature gate. This gives you more control over what Canvas camera to view through, while also changing the default behavior for React DOM components to view through the default camera instead of the editor camera when initially opening.
- Updated dependencies [711322a]
  - @triplex/lib@0.69.11

## 0.71.8

### Patch Changes

- fb2bad8: The selection system now harmoniously works between reconcilers, exactly as you'd expect.
- 9a611b0: Fix React 19 warnings for using inert prop with strings.
- 9a611b0: Fix React 19 warnings for accessing refs on Fragments.
- fb2bad8: Canvas components no longer take up the entire space when rendered in userland but instead applying the default behaviour.
- 9a611b0: Fix scene panel flashing between hovered -> idle -> selected state when selecting a object through the scene.

## 0.71.7

### Patch Changes

- 37eb94d: Remove rpc call usage in the renderer with static values from element meta.
- Updated dependencies [37eb94d]
  - @triplex/bridge@0.70.2

## 0.71.6

### Patch Changes

- a5d2390: React 19 / Three Fiber 9 are now supported.
- Updated dependencies [a5d2390]
  - @triplex/bridge@0.70.1
  - @triplex/websocks-client@0.0.3
  - @triplex/lib@0.69.10

## 0.71.5

### Patch Changes

- 62ae87f: Add settings extension point.
- 9a211ee: Revert disabling selecting when transform is enabled as it's annoying.
- 95156aa: Scene controld and options will now be contextually shown depending if there is a Three Fiber canvas mounted to the scene.
- Updated dependencies [1ba6783]
  - @triplex/websocks-client@0.0.2

## 0.71.4

### Patch Changes

- fe84ca9: Syntax errors are now recoverable.
- Updated dependencies [9b15541]
- Updated dependencies [fe84ca9]
  - @triplex/lib@0.69.9
  - @triplex/websocks@0.0.1

## 0.71.3

### Patch Changes

- b2079fd: Hover selection indicators are now disabled when transform controls are visible.
- b2079fd: Fixed regression where transforms were affecting more than one scene object. This primarily affected custom components that had multiple child meshes.
- 095c729: A new loading indicator has been implemented.
- Updated dependencies [095c729]
  - @triplex/lib@0.69.8

## 0.71.2

### Patch Changes

- bc6e2ba: Fix sprite not being selectable.

## 0.71.1

### Patch Changes

- b9b220a: Fix `dy` not being used in the outline shader.

## 0.71.0

### Minor Changes

- 4e8c285: How components are loaded has been restructured to support opening components with mixed JSX elements from different reconcilers.
- 25daa3d: The `rendererAttributes` config option has been removed. If you were relying on this instead declare a Canvas component from `@react-three/fiber` in your component and set the props as desired.
- 4e8c285: Triplex can now open components that have both DOM and Three Fiber JSX elements.

### Patch Changes

- 9b67742: Upgrade three.js dependencies.
- b9b1b62: Upgrade vite and all related dependencies to latest.
- 2f36ed7: Selecting a fragment now highlights all child elements in the scene.
- e00d37a: Internal refactor of the selection system.
- 2f36ed7: Jump to element on fragments now focuses the camera on all of the child elements instead of the first child element.
- aa3bec6: Selection state is now retained when entering and exiting play state with the play controls.
- e4db0c2: Upgrade TypeScript to latest.
- 1f0ef15: The outline for Three Fiber objects has been fixed to be evenly drawn around objects.
- 4106062: The Three Fiber scene now shows an outline on selectable object3ds when hovering over them.
- 130d4b3: Fix selecting a host element and it resolving to an unexpected parent element.
- 93761c7: Element selection hints are now shown when hovering over elements in the scene, and elements in the element panel.
- Updated dependencies [bcccc4f]
- Updated dependencies [4e8c285]
- Updated dependencies [e4db0c2]
- Updated dependencies [4e8c285]
- Updated dependencies [93761c7]
  - @triplex/ws@0.69.4
  - @triplex/bridge@0.70.0
  - @triplex/lib@0.69.7

## 0.70.2

### Patch Changes

- 7c49f9f: Fix pressing escape not blurring the selected scene object after performing a transform with transform controls.
- 51d16cd: Errors thrown when rendering, initializing modules, importing dependencies, interacting with scene objects, and GLSL compilation are now all captured and notifies you of the error. Where possible the errors are now also recoverable, meaning you can update your code, save, and continue right where you leftoff.
- 8752e68: Duplicated elements are now focused.
- 5be8d67: Transform steps have been rounded to whole decimals.
- b1b39e7: The global provider infrastructure has been refactored to not cause jarring hot module reloads when its contents change.
- a871eb9: Selection cycle now correctly works with custom components and groups.
- 097f148: The selection outline post processing effect no longer unintentionally turns on all layers for the camera now, instead only turning on what was initially turned on.
- 57ca5bc: Fix camera modifiers not being applied when initially focused inside editor controls.
- 9f689b7: Remove unstable subsequent suspense boundary that was causing instability.
- 097f148: Selecting helper objects such as cameras and lights now participate in the mesh based selection system enabling selection cylcing and selection outlines.
- 74b3de8: Progressively testing axis helper.
- a89da48: Internal file restructure.
- 51d16cd: Shader material elements now automatically recompile when their fragment or vertex shader prop changes.
- 7493473: Add hard reload for the scene via CommandOrCtrl+Shift+R.
- dbab960: Loading spinner has moved to the top right of the scene.
- Updated dependencies [51d16cd]
- Updated dependencies [b1b39e7]
- Updated dependencies [7493473]
- Updated dependencies [7493473]
  - @triplex/bridge@0.69.5
  - @triplex/lib@0.69.6

## 0.70.1

### Patch Changes

- Updated dependencies [d0cddb1]
  - @triplex/lib@0.69.5

## 0.70.0

### Minor Changes

- ecbb1d7: Cycling through selections is now possible when clicking multiple times. This will cycle between all scene objects that are captured by the raycast.

### Patch Changes

- be3bae6: Resetting the scene no longer loses the selected scene object transform controls.
- d38608f: Camera modifiers are now correctly triggered when focused in the parent editor.
- Updated dependencies [d38608f]
  - @triplex/bridge@0.69.4

## 0.69.5

### Patch Changes

- 652c1cc: Update package json meta.
- Updated dependencies [652c1cc]
  - @triplex/bridge@0.69.3
  - @triplex/lib@0.69.4
  - @triplex/ws@0.69.3

## 0.69.4

### Patch Changes

- b73ba38: When selecting a camera element a preview is displayed in the bottom left of the scene.

## 0.69.3

### Patch Changes

- Updated dependencies [6dca038]
  - @triplex/lib@0.69.3

## 0.69.2

### Patch Changes

- 967bfbd0: Upgrade vite to v5.
  - @triplex/ws@0.69.2
  - @triplex/bridge@0.69.2
  - @triplex/lib@0.69.2

## 0.69.1

### Patch Changes

- 50c28c96: Upgrade tsc.
- Updated dependencies [50c28c96]
  - @triplex/bridge@0.69.1
  - @triplex/lib@0.69.1
  - @triplex/ws@0.69.1

## 0.69.0

### Minor Changes

- 740ff8f2: Default editor lights can now be turned on or off through the floating controls panel. Previously they would either be always on (if you had no lights in your component) or always off (if you did have lights). Now you can choose.

### Patch Changes

- fd4fa16f: Internal refactor to consolidate extension points to use a common implementation.
- Updated dependencies [fd4fa16f]
- Updated dependencies [740ff8f2]
  - @triplex/bridge@0.69.0
  - @triplex/ws@0.69.0
  - @triplex/lib@0.69.0

## 0.68.8

### Patch Changes

- @triplex/ws@0.68.8
- @triplex/bridge@0.68.8
- @triplex/lib@0.68.8

## 0.68.7

### Patch Changes

- 909bed1a: Fix ScrollControls throwing errors when opened inside Triplex.
  - @triplex/bridge@0.68.7
  - @triplex/lib@0.68.7
  - @triplex/ws@0.68.7

## 0.68.6

### Patch Changes

- @triplex/bridge@0.68.6
- @triplex/lib@0.68.6
- @triplex/ws@0.68.6

## 0.68.5

### Patch Changes

- ea7e0420: Renderer now hides scene helpers when playing the scene.
  - @triplex/bridge@0.68.5
  - @triplex/lib@0.68.5
  - @triplex/ws@0.68.5

## 0.68.4

### Patch Changes

- @triplex/ws@0.68.4
- @triplex/bridge@0.68.4
- @triplex/lib@0.68.4

## 0.68.3

### Patch Changes

- 11c2cb65: uikit@0.4.0+ scene objects can now be selected through the scene.
- Updated dependencies [1c9c343a]
  - @triplex/lib@0.68.3
  - @triplex/bridge@0.68.3
  - @triplex/ws@0.68.3

## 0.68.2

### Patch Changes

- 16117f1a: Invisible scene objects can no longer be selected in the scene.
- 16117f1a: You can now unselect by clicking on empty space.
  - @triplex/bridge@0.68.2
  - @triplex/lib@0.68.2
  - @triplex/ws@0.68.2

## 0.68.1

### Patch Changes

- b2a850fb: Add selection outline postprocessing under a feature gate. This feature will become available to everyone through a gradual rollout.
- Updated dependencies [a5df6744]
  - @triplex/lib@0.68.1
  - @triplex/bridge@0.68.1
  - @triplex/ws@0.68.1

## 0.68.0

### Minor Changes

- 60ee4011: Add none transform option. The renderer now defaults to this.

### Patch Changes

- 5b6671c2: Bootstrap statsig.
- Updated dependencies [5b6671c2]
- Updated dependencies [60ee4011]
  - @triplex/lib@0.68.0
  - @triplex/bridge@0.68.0
  - @triplex/ws@0.68.0

## 0.67.9

### Patch Changes

- @triplex/bridge@0.67.9
- @triplex/lib@0.67.9
- @triplex/ws@0.67.9

## 0.67.8

### Patch Changes

- Updated dependencies [3952a1c8]
  - @triplex/bridge@0.67.8
  - @triplex/ws@0.67.8
  - @triplex/lib@0.67.8

## 0.67.7

### Patch Changes

- 23eaef8a: Fix compound hotkeys in electron not being functional.
  - @triplex/ws@0.67.7
  - @triplex/bridge@0.67.7
  - @triplex/lib@0.67.7

## 0.67.6

### Patch Changes

- @triplex/ws@0.67.6
- @triplex/bridge@0.67.6
- @triplex/lib@0.67.6

## 0.67.5

### Patch Changes

- 201367eb: Reset scene when entering edit mode.
- Updated dependencies [a1121431]
  - @triplex/lib@0.67.5
  - @triplex/ws@0.67.5
  - @triplex/bridge@0.67.5

## 0.67.4

### Patch Changes

- ce57e0d6: Focusing the scene of opened components now ignores huge objects like transform controls.
- b2bf1662: Reset rotation when switching between components.
- 88198788: Remove intermediate group introduced during the viewcube focus refactor.
- b8e0ee3a: Controls are now unmounted when the active camera is not owned by triplex.
- cba1c8db: Internal pkg refactor.
- Updated dependencies [08f3d647]
- Updated dependencies [cba1c8db]
  - @triplex/ws@0.67.4
  - @triplex/lib@0.67.4
  - @triplex/bridge@0.67.4

## 0.67.3

### Patch Changes

- b8b97458: Fix camera being stuck in a modifier state when document loses focus.
- cb41e650: Viewcube now only focuses on the user land scene instead of the entire scene.
- b8b97458: Forward keypress events to the parent document.
- Updated dependencies [c9c2bd90]
- Updated dependencies [ba66926c]
- Updated dependencies [c9c2bd90]
- Updated dependencies [b8b97458]
  - @triplex/ux@0.67.3
  - @triplex/ws@0.67.3
  - @triplex/bridge@0.67.3

## 0.67.2

### Patch Changes

- @triplex/ws@0.67.2
- @triplex/bridge@0.67.2

## 0.67.1

### Patch Changes

- e841a67: Fix camera dev tools being visible.
  - @triplex/bridge@0.67.1
  - @triplex/ws@0.67.1

## 0.67.0

### Minor Changes

- a7b3058: Add viewcube to the viewport.
- f14b92b: Scene selection is now powered by an out-of-band raycaster. By default scenes no-longer receive events when in edit mode.
- 55ecc10: Add camera switcher for play state.
- b4886f6: Add play/pause scene states.
- 2e0acc7: Left click with ctrl modifier now dollys the camera.

### Patch Changes

- 6f3d8de: Upgrade three deps (r3f/drei/three).
- 1d415ae: Controls are now enabled when playing the scene through the default camera.
- 3343fad: Hard refresh now reloads the entire editor.
- Updated dependencies [55ecc10]
- Updated dependencies [b4886f6]
- Updated dependencies [3343fad]
  - @triplex/bridge@0.67.0
  - @triplex/ws@0.67.0

## 0.66.0

### Minor Changes

- 625e23a: The selection system has been reimplemented, removing the need for intermediate group elements powering scene lookups.

### Patch Changes

- 79a2c59: Scene now shows a loading indicator when appropriate.
- Updated dependencies [625e23a]
  - @triplex/bridge@0.66.0
  - @triplex/ws@0.66.0

## 0.65.2

### Patch Changes

- @triplex/bridge@0.65.2
- @triplex/ws@0.65.2

## 0.65.1

### Patch Changes

- 983b5d9: Turn on shadows.
- 763f2a1: Fix triplex camera not being default on initial render.
  - @triplex/bridge@0.65.1
  - @triplex/ws@0.65.1

## 0.65.0

### Minor Changes

- 29c9d95: Add support for local/world transforms.

### Patch Changes

- Updated dependencies [29c9d95]
  - @triplex/bridge@0.65.0
  - @triplex/ws@0.65.0

## 0.64.4

### Patch Changes

- 399713d: Exclude Canvas elements from being rendered to the scene.
- 1df7cc9: Fix non-camera scene objects having an enter camera action.
- 44a0156: Fix userland controls affecting transform controls.
- 343a7e4: Fix camera changes affecting transform controls by no-longer disabling controls on transform controls drag.
  - @triplex/ws@0.64.4
  - @triplex/bridge@0.64.4

## 0.64.3

### Patch Changes

- @triplex/ws@0.64.3
- @triplex/bridge@0.64.3

## 0.64.2

### Patch Changes

- @triplex/bridge@0.64.2
- @triplex/ws@0.64.2

## 0.64.1

### Patch Changes

- @triplex/bridge@0.64.1
- @triplex/ws@0.64.1

## 0.64.0

### Minor Changes

- 8712a12: Add renderer attributes. Refer to docs.

### Patch Changes

- a153ee8: Fix error resolution for the provider component. Now when any errors inside it get fixed the scene successfully re-renders.
- a153ee8: Errors thrown during the initial render are now visible as an error notification.
- Updated dependencies [8712a12]
  - @triplex/bridge@0.64.0
  - @triplex/ws@0.64.0

## 0.63.0

### Minor Changes

- 0b5fb14: Add manifest to renderers.
- 4c48d66: Add host element declarations to renderer manifest.

### Patch Changes

- 480866f: Upgrade TypeScript.
- Updated dependencies [480866f]
  - @triplex/bridge@0.63.0
  - @triplex/ws@0.63.0

## 0.62.0

### Minor Changes

- 3612434: Add thumbnail support for renderers.

### Patch Changes

- cea76c2: Simplify bridge event names.
- 99b97cf: Remove need for router inside the r3f renderer.
- cdbdc16: Remove redundant bridge events for element props.
- 99b97cf: Error boundaries now reset when the source module and/or open component changes enabling the editor to remain functional even if an error has ocurred.
- 7313788: Internal refactor.
- fe7c5f9: Config now passed to renderer func.
- Updated dependencies [bad0a57]
- Updated dependencies [cea76c2]
- Updated dependencies [99b97cf]
- Updated dependencies [cdbdc16]
- Updated dependencies [3612434]
- Updated dependencies [7313788]
- Updated dependencies [fe7c5f9]
  - @triplex/ws@0.62.0
  - @triplex/bridge@0.62.0

## 0.61.2

### Patch Changes

- @triplex/ws@0.61.2
- @triplex/bridge@0.61.2

## 0.61.1

### Patch Changes

- @triplex/ws@0.61.1
- @triplex/bridge@0.61.1

## 0.61.0

### Minor Changes

- b407820: Add file tabs.

### Patch Changes

- 3091229: Gizmo helper bounding box is no longer visible at certain angles.
- d583e42: You can no-longer enter an element from node modules.
- d583e42: Grid no longer follows focal point.
- 5e22a9a: When loading a scene initially it no longer causes a double suspense.
- 5efeea0: Normalize paths using upath instead of node built-in.
- d583e42: Grid now follows camera.
- cba2b47: Transform controls now has capped precision.
- Updated dependencies [b407820]
  - @triplex/bridge@0.61.0
  - @triplex/ws@0.61.0

## 0.60.1

### Patch Changes

- @triplex/bridge@0.60.1
- @triplex/ws@0.60.1

## 0.60.0

### Minor Changes

- 7a250ba: Adds duplicate scene

### Patch Changes

- 0cce596: Error overlay no longer closers after a HMR event.
- Updated dependencies [0cce596]
  - @triplex/bridge@0.60.0
  - @triplex/ws@0.60.0

## 0.59.1

### Patch Changes

- @triplex/bridge@0.59.1
- @triplex/ws@0.59.1

## 0.59.0

### Minor Changes

- 26bd068: Scene modules are now loaded remotely instead of from the fs. This is going to raise the ceiling on features we can implement as now everything becomes a mutation to the remote source instead of that AND also trying to handle the intermediate state in the scene prior to it being flushed to the fs. Super excited about this.

### Patch Changes

- ce8a108: Exit selection command can now be triggered using the (SHIFT + CmdOrControl + F) hotkey.
- ce8a108: Add transform actions to selection menu.
- 8dd7cd1: Scene/client pkgs now bundled with vite.
- ce8a108: Fix saving accidentally triggered scale transform mode.
- f6e068c: Packages have been moved into namedspaced folders.
- Updated dependencies [f6e068c]
  - @triplex/ws@0.59.0
  - @triplex/bridge@0.59.0

## 0.58.2

### Patch Changes

- 85447c2: Upgrade three.js.
- 250c9ab: Fixes GLTF selection choosing an unexpected scene object.
- 85447c2: Scene helpers are now portalled to be direct descendents of the scene instance.
- 85447c2: Provider no longer has any intermediate groups between it and the rendered canvas element.
- 250c9ab: Fix scene object throwing during HMR when path is undefined.
- b5247c2: Apply lint and prettier fixes.
- Updated dependencies [b5247c2]
  - @triplex/ws-client@0.58.2
  - @triplex/bridge@0.58.2

## 0.58.1

### Patch Changes

- e645e5c: Fix provider ui not respecting default props.
  - @triplex/ws-client@0.58.1
  - @triplex/bridge@0.58.1

## 0.58.0

### Minor Changes

- 37bf36d: Add provider props as config to the ui.
- 3e1e081: Separate soft refresh from hard refresh.

### Patch Changes

- 3e1e081: Transform will no longer be incidentally changed when saving the scene on macOS.
- 3e1e081: Changes to provider are now flushed throughout the scene during hmr.
- Updated dependencies [3e1e081]
  - @triplex/bridge@0.58.0
  - @triplex/ws-client@0.58.0

## 0.57.2

### Patch Changes

- f5bbeda: Fix server throwing when symbols for jsx elements were not resolved.
  - @triplex/ws-client@0.57.2
  - @triplex/bridge@0.57.2

## 0.57.1

### Patch Changes

- d32cf94: Fixes bugs with the new Triplex provider, previously it would be rendered outside the Canvas element as well as being unintentionally transformed into a scene object.
  - @triplex/bridge@0.57.1
  - @triplex/ws-client@0.57.1

## 0.57.0

### Minor Changes

- 5c1fc3d: Add editing child jsx elements through the Triplex UI.
- 2b61384: Adding an asset is now contextual, the original button adds to the open component, while the add buttons on each element in the left scene panel add to it as a child.

### Patch Changes

- 046cf78: Scene now remains functional if an error occured during render.
- Updated dependencies [5c1fc3d]
- Updated dependencies [2b61384]
  - @triplex/bridge@0.57.0
  - @triplex/ws-client@0.57.0

## 0.56.1

### Patch Changes

- e4345ef: Selecting scene objects now bails out from traversing the Three.js scene when it is a host element inside the currently open file.
  - @triplex/ws-client@0.56.1
  - @triplex/bridge@0.56.1

## 0.56.0

### Minor Changes

- 463789f: Adds end-to-end typesafe ws router.
- 32a110f: Add top-level scene component to the scene panel. When selected users can modify the props during their seession to see what happens.
- 47483b9: The data that powers the context panel props is now sourced from types first instead of defined props first, resulting in tuple type data no longer being lost after a prop has been set.

### Patch Changes

- 2e53a2e: Turn off type declaration maps.
- Updated dependencies [463789f]
- Updated dependencies [5f7e78f]
- Updated dependencies [32a110f]
- Updated dependencies [2e53a2e]
  - @triplex/ws-client@0.56.0
  - @triplex/bridge@0.56.0

## 0.55.3

### Patch Changes

- @triplex/bridge@0.55.3
- @triplex/ws-client@0.55.3

## 0.55.2

### Patch Changes

- @triplex/bridge@0.55.2
- @triplex/ws-client@0.55.2

## 0.55.1

### Patch Changes

- ea86fdc: Add license banner.
- Updated dependencies [ea86fdc]
  - @triplex/ws-client@0.55.1
  - @triplex/bridge@0.55.1

## 0.55.0

### Minor Changes

- 3be2782: Add support for adding a gltf static asset to the scene.
- 44faed1: Jsdoc tags are now returned in the jsx element type response.

### Patch Changes

- 111a1f2: Scene helpers are now excluded inside the selection handler.
- Updated dependencies [ab909b4]
  - @triplex/ws-client@0.55.0
  - @triplex/bridge@0.55.0

## 0.54.2

### Patch Changes

- Updated dependencies [a060d2c]
  - @triplex/ws-client@0.54.2
  - @triplex/bridge@0.54.2

## 0.54.1

### Patch Changes

- 3711009: The Triplex orthographic cameras near plane has been decreased to ensure objects stay within view in the scene.
  - @triplex/bridge@0.54.1
  - @triplex/ws-client@0.54.1

## 0.54.0

### Minor Changes

- 36c2d9c: Adds camera helpers for perspective and orthographic cameras rendered in the scene.
- d2d40f6: Helpers for lights are now shown in the editor.
- 8fad65a: Adds camera type to controls menu, allowing you to switch between perspective and orthographic camera.
- e0038f6: Add support for viewing through a user land camera.

### Patch Changes

- 36c2d9c: Editor controls no longer affect user land cameras when they have been set with `makeDefault={true}`.
- Updated dependencies [8fad65a]
- Updated dependencies [e0038f6]
  - @triplex/bridge@0.54.0
  - @triplex/ws-client@0.54.0

## 0.53.1

### Patch Changes

- 4ddb52e: Remove direct usage of @react-three/drei with an alias.
  - @triplex/bridge@0.53.1
  - @triplex/ws-client@0.53.1

## 0.53.0

### Minor Changes

- c71412b: Adds refresh scene action available in the File menubar and through cmd/ctrl + r.

### Patch Changes

- aa3a982: Fixed three peer dependency not being loose enough and react-three-fiber and react being missing from peer dependencies.
- Updated dependencies [aa3a982]
- Updated dependencies [c71412b]
  - @triplex/ws-client@0.53.0
  - @triplex/bridge@0.53.0

## 0.52.0

### Minor Changes

- 8d532f5: Editor now shows build time and runtime errors in an error overlay.

### Patch Changes

- Updated dependencies [8d532f5]
  - @triplex/bridge@0.52.0
  - @triplex/ws-client@0.52.0

## 0.51.1

### Patch Changes

- 753dba5: Fixes attached scene objects throwing.
  - @triplex/bridge@0.51.1
  - @triplex/ws-client@0.51.1

## 0.51.0

### Patch Changes

- 6179fef: Scene objects that are attached to a parent are no longer wrapped in a triplex group.
  - @triplex/bridge@0.51.0
  - @triplex/ws-client@0.51.0

## 0.50.1

### Patch Changes

- b7c966c: The scene traversal that takes place during a selection now stops at the first found object instead of continuing until no children remain. Any odd scene transforms should now be fixed.
- 3c19632: Scene components now better handle edge cases. When children as function the function behavior is respected. When children end up being falsy we no longer render the intermediate scene elements.
  - @triplex/bridge@0.50.1
  - @triplex/ws-client@0.50.1

## 0.50.0

### Minor Changes

- 8ea575b: Built output is now mangled.

### Patch Changes

- Updated dependencies [8ea575b]
  - @triplex/bridge@0.50.0
  - @triplex/ws-client@0.50.0

## 0.49.0

### Patch Changes

- @triplex/bridge@0.49.0
- @triplex/ws-client@0.49.0

## 0.48.0

### Minor Changes

- 6fe34af: Windows support is here. Now Triplex cli and electron can be ran on Windows, as well as the local dev loop now being functional.

### Patch Changes

- @triplex/bridge@0.48.0
- @triplex/ws-client@0.48.0

## 0.47.0

### Minor Changes

- 4164026: Add support for the scene to know what environment it is running in (either web or electron).

### Patch Changes

- @triplex/bridge@0.47.0
- @triplex/ws-client@0.47.0

## 0.46.4

### Patch Changes

- @triplex/bridge@0.46.4
- @triplex/ws-client@0.46.4

## 0.46.3

### Patch Changes

- @triplex/bridge@0.46.3
- @triplex/ws-client@0.46.3

## 0.46.2

### Patch Changes

- @triplex/bridge@0.46.2
- @triplex/ws-client@0.46.2

## 0.46.1

### Patch Changes

- @triplex/bridge@0.46.1
- @triplex/ws-client@0.46.1

## 0.46.0

### Patch Changes

- d67f998: Removes unused deps
  - @triplex/bridge@0.46.0
  - @triplex/ws-client@0.46.0

## 0.45.1

### Patch Changes

- @triplex/bridge@0.45.1
- @triplex/ws-client@0.45.1

## 0.45.0

### Patch Changes

- @triplex/bridge@0.45.0
- @triplex/ws-client@0.45.0

## 0.44.0

### Minor Changes

- 0242833: Scene now removes intermediate state when resetting.
- 4d8d9cc: Builds are now minified.

### Patch Changes

- Updated dependencies [0242833]
- Updated dependencies [4d8d9cc]
- Updated dependencies [557648e]
  - @triplex/bridge@0.44.0
  - @triplex/ws-client@0.44.0

## 0.43.0

### Minor Changes

- 6dfb22d: The add scene component now cleans up all intermediate state when a file has been saved.
- 6dfb22d: The scene loader nolonger holds onto a stale module reference if the module changes during HMR.
- 01cd388: Intermediate state when adding components to a scene is blown away when any hmr after event occurs.
- b7bbeba: When adding a new element to the scene if you have a selection it will be added as a child. If you have no selection it will be added to the root component.

### Patch Changes

- Updated dependencies [b7bbeba]
  - @triplex/bridge@0.43.0
  - @triplex/ws-client@0.43.0

## 0.42.0

### Patch Changes

- @triplex/bridge@0.42.0
- @triplex/ws-client@0.42.0

## 0.41.0

### Patch Changes

- @triplex/bridge@0.41.0
- @triplex/ws-client@0.41.0

## 0.40.0

### Minor Changes

- dac7c76: Selection for scene objects is now more resilient being able to be set before scene objects are actually available.
- dac7c76: When selecting a scene object that has disabled transforms the scene frame now tries to find a backup selection so the gizmo stays ontop of the object instead of being moved back to world [0,0,0].
- a2a2f4b: When unapplying a prop to a component such as performing an undo it is now applied as expected in the scene. Previously only the context panel would be updated with the new value.

### Patch Changes

- Updated dependencies [ee2494b]
  - @triplex/ws-client@0.40.0
  - @triplex/bridge@0.40.0

## 0.39.0

### Patch Changes

- @triplex/bridge@0.39.0
- @triplex/ws-client@0.39.0

## 0.38.0

### Minor Changes

- 06471f6: The components virtual module has been removed in favor of passing down as props instead.

### Patch Changes

- @triplex/bridge@0.38.0
- @triplex/ws-client@0.38.0

## 0.37.0

### Minor Changes

- 0e781ac: Scene no longer assumes `triplexMeta` is always available on the loaded scene component.
- 23fe64a: Adds delete scene object. Access through the context panel when focusing on a scene object.
- 1a2ecea: Components can now be added to the scene through the add component button in the scene panel.
- 1a2ecea: The triplex config now has a new property called `components` - use to mark files that are able to be added to scenes.

### Patch Changes

- Updated dependencies [23fe64a]
- Updated dependencies [1a2ecea]
  - @triplex/bridge@0.37.0
  - @triplex/ws-client@0.37.0

## 0.36.0

### Minor Changes

- f24f2fd: Attribute jsx elements are now excluded from scene objects.

### Patch Changes

- @triplex/bridge@0.36.0
- @triplex/ws-client@0.36.0

## 0.35.0

### Patch Changes

- @triplex/bridge@0.35.0
- @triplex/ws-client@0.35.0

## 0.34.0

### Minor Changes

- 2a64658: The context panel now displays all available props on a component even if they aren't yet declared thanks to the TypeScript compiler and ts-morph. Not all prop types are supported currently, if you have one that you expected to be available but isn't please reach out.

### Patch Changes

- Updated dependencies [2a64658]
  - @triplex/ws-client@0.34.0
  - @triplex/bridge@0.34.0

## 0.33.0

### Minor Changes

- 1067d23: Adds transform controls to the ui.
- 1067d23: Transform control hotkeys now continue to function even when there is no scene object currently selected.

### Patch Changes

- Updated dependencies [1067d23]
  - @triplex/bridge@0.33.0
  - @triplex/ws-client@0.33.0

## 0.32.0

### Minor Changes

- c87a5f3: Undo/redo now available. When manipulating the scene through transform controls or the context panel each persisted manipulation will be able to be undone (and redone) using hotkeys and the edit menu actions.

### Patch Changes

- Updated dependencies [c87a5f3]
  - @triplex/bridge@0.32.0
  - @triplex/ws-client@0.32.0

## 0.31.0

### Minor Changes

- 48002a7: When transitioning to a scene object any props that are jsx elements are now removed preventing serialization errors.

### Patch Changes

- @triplex/bridge@0.31.0
- @triplex/ws-client@0.31.0

## 0.30.0

### Minor Changes

- 0bb6119: Adds support for updating scene objects through the context panel.

### Patch Changes

- Updated dependencies [0bb6119]
  - @triplex/bridge@0.30.0
  - @triplex/ws-client@0.30.0

## 0.29.0

### Minor Changes

- 0d83ef2: When selecting a scene object triplex now continues traversing down the tree looking for the appropriate object to use rather than stopping at the first encountered triplex boundary.

### Patch Changes

- @triplex/bridge@0.29.0
- @triplex/ws-client@0.29.0

## 0.28.0

### Minor Changes

- aa1aa8c: Scene transformation using ts-morph has been replaced with Babel significantly speeding up initial load and saving. The need for the `.triplex/tmp` folder is now gone and thus no longer used.
- aa1aa8c: Line and column numbers for scene objects have been corrected and are now consistent across editor, scene, and server.

### Patch Changes

- @triplex/bridge@0.28.0
- @triplex/ws-client@0.28.0

## 0.27.0

### Minor Changes

- 56f2b3e: Scene objects that have no dimensions (such as lights) can now be focused.
- fa35cde: JSX element type inference has been removed from the critical path of the scene transform.
- 1e405c3: Scene object selection is now scoped to ensure only selecting objects from the current open scene.
- fa35cde: Fix unguarded three.js child check.
- 9b1d135: When transitioning to a scene and it has a position prop set it is replaced with the world position.

### Patch Changes

- @triplex/bridge@0.27.0
- @triplex/ws-client@0.27.0

## 0.26.0

### Minor Changes

- 9d400e4: Selected objects now operate in local space when a parent scene object is scaled.
- e532920: When traversing the Three.js scene to find the appropriate scene object to select it now stops traversal when reaching a triplex boundary.

### Patch Changes

- Updated dependencies [785050d]
  - @triplex/ws-client@0.26.0
  - @triplex/bridge@0.26.0

## 0.25.0

### Minor Changes

- aaac9cc: Scene navigation now guards against empty paths (meaning there's nowhere to navigate to).

### Patch Changes

- @triplex/bridge@0.25.0
- @triplex/ws-client@0.25.0

## 0.24.0

### Patch Changes

- @triplex/bridge@0.24.0
- @triplex/ws-client@0.24.0

## 0.23.0

### Patch Changes

- @triplex/bridge@0.23.0
- @triplex/ws-client@0.23.0

## 0.22.0

### Patch Changes

- @triplex/bridge@0.22.0
- @triplex/ws-client@0.22.0

## 0.21.0

### Patch Changes

- @triplex/bridge@0.21.0
- @triplex/ws-client@0.21.0

## 0.20.0

### Minor Changes

- 1c9771d: Named exports are now able to be opened by the editor.
- 1c9771d: Focus events now only use line and column numbers.

### Patch Changes

- Updated dependencies [1c9771d]
  - @triplex/bridge@0.20.0
  - @triplex/ws-client@0.20.0

## 0.19.0

### Patch Changes

- @triplex/bridge@0.19.0
- @triplex/ws-client@0.19.0

## 0.18.0

### Patch Changes

- @triplex/bridge@0.18.0
- @triplex/ws-client@0.18.0

## 0.17.0

### Patch Changes

- @triplex/bridge@0.17.0
- @triplex/ws-client@0.17.0

## 0.16.0

### Minor Changes

- d8e1602: Fixed non-scene objects not being able to be selected through the UI.
- 7ff35f3: Transform controls now longer continuously error when a scene object has been removed from the scene.
- 7ff35f3: Upgrades @react-three/fiber to latest.
- e7c026b: Selecting host scene objects now have the correct objects selected instead of the wrapping parent group
- 7ff35f3: Navigating to host elements is no longer possible (as there is nowhere to navigate to).
- 2fa7c45: Adds author field to package.json.

### Patch Changes

- Updated dependencies [d8e1602]
- Updated dependencies [7ff35f3]
- Updated dependencies [2fa7c45]
  - @triplex/bridge@0.16.0
  - @triplex/ws-client@0.16.0

## 0.15.0

### Minor Changes

- e54e0f8: Bridge events now flow unidirectionally enabling the editor ui to initiate events to the scene, such as navigate and focus.

### Patch Changes

- Updated dependencies [e54e0f8]
  - @triplex/bridge@0.15.0
  - @triplex/ws-client@0.15.0

## 0.14.0

### Patch Changes

- @triplex/bridge@0.14.0
- @triplex/ws-client@0.14.0

## 0.12.0

### Minor Changes

- 99075ff: Transformed scene entrypoints now export the variable `triplexMeta` instead of `__r3fEditorMeta`.
- 99075ff: When being loaded for the first time scenes will now suspend. This means for any errors thrown during loaded are now propagated to the nearest error boundary.
- cfbd47b: When transitioning between scenes there is no longer a flash of hidden scene objects.
- 969feab: Removes unneeded fetch calls.
- cc917d7: Adds usage of ws-client pkg.
- a4d6882: Passes name during object focus.
- 99075ff: Adds error boundaries so the app doesn't blow up when a scene isn't found.
- 7bebe67: When transforming a selected scene object the intended object object3d is now modified instead of the parent group.
- 99075ff: Scene now loads updated triplex meta when the source file changes.
- cfbd47b: The hotkey check when navigating to a child scene now checks for shift usage instead of upper "f".

### Patch Changes

- Updated dependencies [a4d6882]
- Updated dependencies [cc917d7]
  - @triplex/bridge@0.7.0
  - @triplex/ws-client@0.1.0

## 0.11.0

### Minor Changes

- 55f0206: Scene components now appear nested when children of other components in the UI.

## 0.10.0

### Minor Changes

- 3c725bc: Force release all packages.

### Patch Changes

- Updated dependencies [3c725bc]
  - @triplex/bridge@0.6.0

## 0.9.0

### Minor Changes

- ac9624f: Fixes client/host race condition where host would send events before the client has connected.

### Patch Changes

- Updated dependencies [ac9624f]
  - @triplex/bridge@0.5.0

## 0.8.0

### Minor Changes

- 387f6cd: Adds a menu bar to the editor.

## 0.7.0

### Minor Changes

- c84a8ca: Package now declares the main field.

## 0.6.0

### Minor Changes

- 5498a39: Scene frame now correctly calls back to the react refresh registry on hmr.

## 0.5.0

### Minor Changes

- c8c4a55: Fixes scene frame so it can hot module reload.

## 0.4.0

### Minor Changes

- b144bb1: Package `build` now use `swc` and `tsc` directly.

### Patch Changes

- Updated dependencies [b144bb1]
  - @triplex/bridge@0.4.0

## 0.3.0

### Minor Changes

- bbc457e: Fixes some bugs preventing triplex from being able to be ran via cli.

### Patch Changes

- Updated dependencies [bbc457e]
  - @triplex/bridge@0.3.0

## 0.2.0

### Minor Changes

- 08a03af: Fixes publish to build before pushing.

### Patch Changes

- Updated dependencies [08a03af]
  - @triplex/bridge@0.2.0

## 0.1.0

### Minor Changes

- 9c120b4: Initial release.

### Patch Changes

- Updated dependencies [9c120b4]
  - @triplex/bridge@0.1.0
