# @triplex/vscode

## 0.72.2

### Patch Changes

- 46fab87: Dragging files from the file explorer into the Triplex editor now adds components to the scene.
- 46fab87: Link to other triplex packages.
  - @triplex/server@0.72.2
  - @triplex/client@0.70.48

## 0.2.57

### Patch Changes

- a7a0138: fixed #356 - triplex should run offline
  - @triplex/client@0.70.47

## 0.2.56

### Patch Changes

- Updated dependencies [fbd4c8a]
- Updated dependencies [d9adc31]
  - @triplex/server@0.71.24

## 0.2.55

### Patch Changes

- 40d59fa: Turn off console error capture.

## 0.2.54

### Patch Changes

- 46b8c74: The selection system now keeps hold of your selected element across file changes. This fix will be rolled out incrementally across Triplex for VS Code users. Want early access? Reach out on Discord.
- Updated dependencies [46b8c74]
  - @triplex/client@0.70.46
  - @triplex/server@0.71.23

## 0.2.53

### Patch Changes

- e1575ed: Fix an internal error where a function that should have been defined wasn't.
- daaa8b9: Fixed element select flashing without an ellipsis on initial load.
- 0d0e459: The tuple input now immediately applies changes by setting default values to empty required values where appropriate. This will be rolled out over time, if you would like to get this fix early please message on Discord.
- Updated dependencies [e1575ed]
  - @triplex/server@0.71.22

## 0.2.52

### Patch Changes

- b14a832: The camera preview no longer has the selection outline of the camera visible.
- 69864bd: The "Open in Triplex" element action is now called "Open in New Window".
- b14a832: Switching from default to editor camera now correctly fits the scene to it on the first switch.
- b14a832: Switching the canvas camera between editor and defaul no longer bleeds state between each other.
- 9add655: Resetting a component that renders a canvas now persists the camera settings.
  - @triplex/client@0.70.45

## 0.2.51

### Patch Changes

- 299a02e: Errors are no longer thrown if a components name could not be resolved.
- 299a02e: Untyped host elements no-longer throw an exception when selecting through the elements panel.
- Updated dependencies [299a02e]
- Updated dependencies [299a02e]
  - @triplex/server@0.71.21

## 0.2.50

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
- b229047: Fix @react-three/viverse requiring @react-three/xr to be installed before running in Triplex.
- Updated dependencies [b229047]
- Updated dependencies [b229047]
  - @triplex/client@0.70.44

## 0.2.49

### Patch Changes

- e736aab: The number input now needs to be dragged by a distance before changes are picked up, preventing accidental drags when trying to click into the input.
- 487e3fa: Components in the element panel can now be opened in another Triplex editor using the "Open in Triplex" action.
- 990cd9f: Elements returned from components now correctly highlight the parent relation line when selected.

## 0.2.48

### Patch Changes

- c8cea68: The elements panel now has lines to aid in showing the relationship of their children.
- a7511d5: All elements that have children can now be expanded/collapsed in the elements panel instead of just custom components.
- e1153b6: Changes that result in no code change are no longer added to the undo/redo stack.
- Updated dependencies [e1153b6]
  - @triplex/server@0.71.20
  - @triplex/client@0.70.43

## 0.2.47

### Patch Changes

- 196d5f8: The unexpected error splash screen now has a "reload webviews" action, use it to reload your session to get back to it as fast as possible.
- 4500a5f: Deno projects that are missing critical dependencies to run Triplex now have the install prompt set with the `--npm` arg.
- 0cbd424: Components that are no longer exported are now gracefully handled. Instead of an error being thrown the UI remains available prompting you to export the component again.
- Updated dependencies [4500a5f]
- Updated dependencies [0cbd424]
  - @triplex/server@0.71.19
  - @triplex/client@0.70.42

## 0.2.46

### Patch Changes

- @triplex/client@0.70.41

## 0.2.45

### Patch Changes

- @triplex/client@0.70.40

## 0.2.44

### Patch Changes

- acfa8b8: Opening a file with Triplex now opens the last component in the file by default instead of the first.

## 0.2.43

### Patch Changes

- 9da0c8c: Elements in the element panel can now be moved via drag and drop.
- 48d7e85: Add group element action in the element panel action menu.
- 05006cf: Internal refactor.
- Updated dependencies [48d7e85]
- Updated dependencies [77ebf08]
  - @triplex/server@0.71.18
  - @triplex/client@0.70.39

## 0.2.42

### Patch Changes

- 689d15f: Fix select menus not having the correct color scheme for the users theme.
- 55feda2: Add experimental option to the Triplex config. The first available option is "xr_editing".
- Updated dependencies [56b125d]
- Updated dependencies [4546b3e]
- Updated dependencies [55feda2]
  - @triplex/server@0.71.17
  - @triplex/client@0.70.38

## 0.2.41

### Patch Changes

- 030ed16: Sentry integrations have been turned on to hopefully provide more insight into call stack exceptions.
- Updated dependencies [030ed16]
  - @triplex/server@0.71.16
  - @triplex/client@0.70.37

## 0.2.40

### Patch Changes

- @triplex/client@0.70.36

## 0.2.39

### Patch Changes

- e447108: Add experimental debug data api behind a feature gate.
- 5c7d632: Remove bottom scroll overflow from scroll containers in the scene panel.
- e447108: Fix scrollable containers overflow not being set as expected when the container height changes.
- Updated dependencies [e447108]
- Updated dependencies [212ae79]
- Updated dependencies [ff67cb2]
  - @triplex/client@0.70.35
  - @triplex/server@0.71.15

## 0.2.38

### Patch Changes

- 8c82aca: Upgrade react-three dependencies.
- ae60a8f: Upgrade typescript.
- 8c82aca: Upgrade vite dependencies.
- Updated dependencies [8c82aca]
- Updated dependencies [ae60a8f]
- Updated dependencies [8c82aca]
  - @triplex/client@0.70.34
  - @triplex/server@0.71.14

## 0.2.37

### Patch Changes

- 2ba732c: Fix "Open File in Triplex" editor button not working on Windows.
- b30f3df: Add resizable panel to ai chat.
- Updated dependencies [3f92cd3]
  - @triplex/client@0.70.33

## 0.2.36

### Patch Changes

- 66dcad2: Fix editor activity icon in dark mode being incorrect on Windows.

## 0.2.35

### Patch Changes

- 646da01: New editor action "Open File in Triplex" available on JSX/TSX files.
- 7ef27d7: The "Open in WebXR" action now uses a VR headset icon.
  - @triplex/client@0.70.32

## 0.2.34

### Patch Changes

- @triplex/client@0.70.31

## 0.2.33

### Patch Changes

- ba7ff1f: Upgrade react-compiler to rc.1
- Updated dependencies [f420d2e]
  - @triplex/client@0.70.30

## 0.2.32

### Patch Changes

- Updated dependencies [3fd23e3]
  - @triplex/client@0.70.29
  - @triplex/server@0.71.13

## 0.2.31

### Patch Changes

- 839e91e: A new config option "UNSAFE_viteConfig" is now available. Use it to declare custom bundler behavior that otherwise can't be handled by default behavior. See the docs here: https://triplex.dev/docs/api-reference/config-options/unsafe-vite-config.
- Updated dependencies [839e91e]
- Updated dependencies [42b03ff]
  - @triplex/client@0.70.28
  - @triplex/server@0.71.12

## 0.2.30

### Patch Changes

- @triplex/client@0.70.27

## 0.2.29

### Patch Changes

- @triplex/client@0.70.26

## 0.2.28

### Patch Changes

- 302081f: Forward errors to VS Code output for WebXR sessions.
- 302081f: Fix WebXR hostname link having an extra bracket "}" in it.
- f97183e: Add hover/selection indicators to WebXR exploration.
- Updated dependencies [302081f]
  - @triplex/client@0.70.25

## 0.2.27

### Patch Changes

- b97cd77: IPs are now capped to 3000 range.
- a480636: Testing webxr capabilities.
- Updated dependencies [b97cd77]
- Updated dependencies [a480636]
  - @triplex/client@0.70.24
  - @triplex/server@0.71.11

## 0.2.26

### Patch Changes

- 526ff1b: Fix feature gate environment not being set to production.

## 0.2.25

### Patch Changes

- cfd4a6f: Add element preview prop event.
- 4d2cdbc: Cleanup element_props_indicator feature gate.
- 90710ab: Cleanup required_props_indicator feature gate.
- b3a0420: Cleanup camera_reconciler_refactor feature gate.
- 6e5eb02: Cleanup private_auth_gate feature gate.
  - @triplex/client@0.70.23

## 0.2.24

### Patch Changes

- f61dd89: Testing a fix for running postprocessing, it will be gradually rolled out.
  - @triplex/client@0.70.22

## 0.2.23

### Patch Changes

- 2301fd1: Drop unwanted files when publishing.
- Updated dependencies [2301fd1]
  - @triplex/client@0.70.21
  - @triplex/server@0.71.10

## 0.2.22

### Patch Changes

- c06f199: All paths now have their drive casing normalized.
- Updated dependencies [c06f199]
  - @triplex/client@0.70.20
  - @triplex/server@0.71.9

## 0.2.21

### Patch Changes

- 0ad829b: Fix user auth gate check.
- Updated dependencies [f6b8df6]
  - @triplex/client@0.70.19

## 0.2.20

### Patch Changes

- Updated dependencies [8fce951]
  - @triplex/client@0.70.18

## 0.2.19

### Patch Changes

- eca2202: Deno projects that exclusively use deno.json instead of package.json can now be opened inside Triplex.
- Updated dependencies [eca2202]
- Updated dependencies [4dbf621]
  - @triplex/server@0.71.8
  - @triplex/client@0.70.17

## 0.2.18

### Patch Changes

- 66ad72d: Basic and halloween templates have been removed.
- ebf6a03: Links now point to their new locations on the new site.

## 0.2.17

### Patch Changes

- cd6a38e: Users now need to authenticate when working against private repositories.
- 4753a86: Floating controls now wrap when there isn't enough space.
- 5d8a227: Feedback dialog improvements.

## 0.2.16

### Patch Changes

- 01a2e6d: A feedback dialog is now available in the scene floating controls.
- b6ef6c2: The default global provider has been deprecated and replaced with two named exports: CanvasProvider which is a 1:1 replacement, and GlobalProvider, which is placed at the root of the component tree.
- 863de7b: GlobalProvider and CanvasProvider exports from the declared provider module now show up in the provider panel.
- Updated dependencies [b6ef6c2]
- Updated dependencies [863de7b]
  - @triplex/client@0.70.16
  - @triplex/server@0.71.7

## 0.2.15

### Patch Changes

- 088c699: React Three Fiber dependencies are no longer needed to be installed when loading a project that doesn't use them.
- Updated dependencies [088c699]
- Updated dependencies [088c699]
  - @triplex/server@0.71.6
  - @triplex/client@0.70.15

## 0.2.14

### Patch Changes

- 99daee6: The scene now remains interactive even when the editor panel is not active inside Visual Studio Code.
  - @triplex/client@0.70.14

## 0.2.13

### Patch Changes

- 711322a: Testing a new camera system under a feature gate. This gives you more control over what Canvas camera to view through, while also changing the default behavior for React DOM components to view through the default camera instead of the editor camera when initially opening.
- Updated dependencies [0137088]
- Updated dependencies [711322a]
- Updated dependencies [b4f482a]
  - @triplex/client@0.70.13
  - @triplex/server@0.71.5

## 0.2.12

### Patch Changes

- Updated dependencies [6f01882]
  - @triplex/client@0.70.12

## 0.2.11

### Patch Changes

- 9a611b0: Fix scene panel flashing between hovered -> idle -> selected state when selecting a object through the scene.
  - @triplex/client@0.70.11

## 0.2.10

### Patch Changes

- edba305: Fix edge case where component CodeLens actions could appear twice or more for the same component export.
- Updated dependencies [edba305]
- Updated dependencies [edba305]
- Updated dependencies [edba305]
  - @triplex/client@0.70.10

## 0.2.9

### Patch Changes

- 78e0864: Update the package icon.
- Updated dependencies [37eb94d]
  - @triplex/client@0.70.9

## 0.2.8

### Patch Changes

- a5d2390: React 19 / Three Fiber 9 are now supported.
- Updated dependencies [a5d2390]
- Updated dependencies [a5d2390]
  - @triplex/server@0.71.4
  - @triplex/client@0.70.8

## 0.2.7

### Patch Changes

- 62ae87f: Add settings extension point.
- 7657a55: Re-opening the editor now works when re-opening/loading VS Code, as well as re-opening through the command palette.
- 95156aa: Scene controld and options will now be contextually shown depending if there is a Three Fiber canvas mounted to the scene.
- 62ae87f: The camera settings menu in the floating scene controls panel have been moved into a new scene settings menu. Find it in the same spot with the "cog" icon.
  - @triplex/client@0.70.7

## 0.2.6

### Patch Changes

- 3aa0a3e: Fix unexpected borders being shown across some editor themes.
- 9b15541: Fix logo curvature.
- 3aa0a3e: The element panel and scene now shows an empty state when there were no elements found.
- 3aa0a3e: Testing minimizing the amount of loading states behind a feature gate.
- fe84ca9: Syntax errors are now recoverable.
- Updated dependencies [6422c5f]
- Updated dependencies [fe84ca9]
  - @triplex/client@0.70.6
  - @triplex/server@0.71.3

## 0.2.5

### Patch Changes

- Updated dependencies [7977da7]
  - @triplex/client@0.70.5

## 0.2.4

### Patch Changes

- 095c729: A new loading indicator has been implemented.
- Updated dependencies [b2079fd]
- Updated dependencies [095c729]
  - @triplex/client@0.70.4

## 0.2.3

### Patch Changes

- 98ee32b: An error screen is now shown when dependencies needed to start the editor scene are missing.
- Updated dependencies [84a2615]
- Updated dependencies [98ee32b]
  - @triplex/client@0.70.3
  - @triplex/server@0.71.2

## 0.2.2

### Patch Changes

- bc6e2ba: Fix sprite not being selectable.
- Updated dependencies [1922407]
  - @triplex/client@0.70.2

## 0.2.1

### Patch Changes

- 09eb8a6: Add skeleton state loader for the panel.
- Updated dependencies [8574af1]
- Updated dependencies [fe8f650]
  - @triplex/server@0.71.1
  - @triplex/client@0.70.1

## 0.2.0

### Minor Changes

- 4e8c285: How components are loaded has been restructured to support opening components with mixed JSX elements from different reconcilers.
- 4e8c285: Triplex can now open components that have both DOM and Three Fiber JSX elements.

### Patch Changes

- 3451d52: Upgrade react-compiler to latest.
- 1a75709: Code controlled props now can jump to their code location without a confirmation prompt.
- 7a75eed: Host elements such as "mesh" and "div" now have their props logically grouped to remove the laundry list shock.
- b9b1b62: Upgrade vite and all related dependencies to latest.
- ef3ecbd: Pass on sigterm/sigint to child processes.
- 08f7eae: Fix a data loader throwing when exiting play state.
- a262fa6: Prop labels are now truncated when there isn't enough room.
- 481eb4c: The editor should appear more stable now when moving between states, such as switching between elements. Instead of immediately showing the loading indicator it will keep hold of the previous UI until the data has arrived.
- 1a75709: Jump to an elements code location by using the new right click command in the elements panel.
- 01e8fa9: The panel resizable area has been increased.
- e4db0c2: Upgrade TypeScript to latest.
- 7a75eed: Fix tuple prop types from appearing in the selection panel if there are no values defined.
- 130d4b3: Fix selecting a host element and it resolving to an unexpected parent element.
- 7a75eed: Union props that have all unsupported args are now shown as a single unsupported input in the selection panel rather than just not rendering anything at all.
- 8f09ceb: The elements panel is now shown when starting up Triplex for VS Code.
- 93761c7: Element selection hints are now shown when hovering over elements in the scene, and elements in the element panel.
- Updated dependencies [0866bda]
- Updated dependencies [9b67742]
- Updated dependencies [7a75eed]
- Updated dependencies [b9b1b62]
- Updated dependencies [04deea9]
- Updated dependencies [4e8c285]
- Updated dependencies [4e8c285]
- Updated dependencies [0866bda]
- Updated dependencies [fbe725f]
- Updated dependencies [e4db0c2]
- Updated dependencies [25daa3d]
- Updated dependencies [7a75eed]
- Updated dependencies [4e8c285]
- Updated dependencies [c896b64]
- Updated dependencies [7a75eed]
  - @triplex/server@0.71.0
  - @triplex/client@0.70.0

## 0.1.2

### Patch Changes

- 51d16cd: Errors thrown when rendering, initializing modules, importing dependencies, interacting with scene objects, and GLSL compilation are now all captured and notifies you of the error. Where possible the errors are now also recoverable, meaning you can update your code, save, and continue right where you leftoff.
- 8752e68: Duplicated elements are now focused.
- 13d55d9: Fix Triplex taking priority over other Visual Studio Code hotkeys when not focused but active.
- 7493473: Add refresh for the scene via CommandOrCtrl+R.
- 5075bf4: The editor is now unloaded when hidden.
- 7493473: Add hard reload for the scene via CommandOrCtrl+Shift+R.
- Updated dependencies [51d16cd]
- Updated dependencies [8752e68]
- Updated dependencies [b1b39e7]
- Updated dependencies [91ae968]
- Updated dependencies [7493473]
- Updated dependencies [dbab960]
- Updated dependencies [9255c16]
  - @triplex/client@0.69.8

## 0.1.1

### Patch Changes

- 8c56ae8: Fix number input drag behavior.
- b11fe78: Tuple inputs now show invalid state when partially filled out and some required items are missing.
- 82265f5: Missing element props indicator.
- b11fe78: Add invalid state to all prop controls.
- c7b2857: Add warning dialog when a component is missing required props.
- c7b2857: Component switcher now shows ellipsis if the component name is longer than the container.
- b11fe78: Union inputs now respect default values set on props.
- b11fe78: Fix tuple inputs behavior when required / optional.
- 726094c: Upgrade react-compiler.
- b11fe78: Tuple inputs now respect default values set on props.
- b11fe78: Boolean input now respects default values set on props.
- 4eacf57: Color input now has a checkered background when no color has been set.
- b11fe78: Literal union inputs can now be cleared through a UI selection when optional.
- 8c56ae8: Fix number input step buttons color mode.
- Updated dependencies [08f61b5]
- Updated dependencies [0393dfd]
- Updated dependencies [b11fe78]
- Updated dependencies [84f8a37]
  - @triplex/server@0.70.1
  - @triplex/client@0.69.7

## 0.1.0

### Minor Changes

- a1a782c: Triplex now respects the name prop set on custom components in the Scene Panel. E.g. given a component Box, if it has a name prop statically set to "foo" it will appear as "foo (Box)" in the Scene Panel.

### Patch Changes

- f6a7756: The first click when re-focusing into the Triplex webview is now ignored to prevent accidental changes.
- f7c0dee: Triplex for VS Code now is actived `onStartupFinished` to ensure it's available even if the workspace has no tsx/jsx files yet.
- 14747d4: Play Controls now default to default camera.
- bcd4b78: Clean up output channel.
- d38608f: Camera modifiers are now correctly triggered when focused in the parent editor.
- Updated dependencies [2412af5]
- Updated dependencies [31e7812]
- Updated dependencies [a1a782c]
- Updated dependencies [d38608f]
  - @triplex/server@0.70.0
  - @triplex/client@0.69.6

## 0.0.26

### Patch Changes

- Updated dependencies [96c8cb1]
- Updated dependencies [96c8cb1]
- Updated dependencies [652c1cc]
  - @triplex/server@0.69.3
  - @triplex/client@0.69.5

## 0.0.25

### Patch Changes

- c686a64: Telemetry now tracks engagement only when the editor has focus.
- 73db08f: Sentry is now only enabled in production.
- Updated dependencies [c6630d2]
  - @triplex/client@0.69.4

## 0.0.24

### Patch Changes

- 412b35b: Logs are now piped to an output channel.
- 2986748: Set up new Sentry project.
  - @triplex/client@0.69.3

## 0.0.23

### Patch Changes

- 967bfbd0: Upgrade vite to v5.
- Updated dependencies [967bfbd0]
  - @triplex/client@0.69.2
  - @triplex/server@0.69.2

## 0.0.22

### Patch Changes

- 50c28c96: Upgrade tsc.
- 060f66ac: Upgrade react-compiler to latest.
- Updated dependencies [50c28c96]
  - @triplex/client@0.69.1
  - @triplex/server@0.69.1

## 0.0.21

### Patch Changes

- 740ff8f2: Default editor lights can now be turned on or off through the floating controls panel. Previously they would either be always on (if you had no lights in your component) or always off (if you did have lights). Now you can choose.
  - @triplex/client@0.69.0
  - @triplex/server@0.69.0

## 0.0.20

### Patch Changes

- 592aa63f: Prop tags are now passed to number and union inputs.
- a92281f3: Fix external changes affecting all documents instead of the one it originated from.
- a92281f3: Listeners are now disposed of when the panel is disposed.

## 0.0.19

### Patch Changes

- 54a59b63: Changes originating from outside of Triplex for VS Code are now added to the undo/redo stack in the editor.
- e74bf3c4: Modifying elements that live in another file now have their changes persisted when saving.
- Updated dependencies [54a59b63]
  - @triplex/server@0.68.8
  - @triplex/client@0.68.8

## 0.0.18

### Patch Changes

- 3157221e: Fix inconsistent spacing between prop inputs in the context panel.
  - @triplex/client@0.68.7
  - @triplex/server@0.68.7

## 0.0.17

### Patch Changes

- 4cf3e526: Color input no longer has a clear button.
- 4cf3e526: Fix union inputs missing descriptions.
  - @triplex/client@0.68.6
  - @triplex/server@0.68.6

## 0.0.16

### Patch Changes

- b6d89da7: The input panel layout has been refactored to keep the type toggle button always aligned with the first input.
  - @triplex/client@0.68.5
  - @triplex/server@0.68.5

## 0.0.15

### Patch Changes

- 35920ba3: Add component controls.
- Updated dependencies [d78010e0]
- Updated dependencies [d78010e0]
  - @triplex/server@0.68.4
  - @triplex/client@0.68.4

## 0.0.14

### Patch Changes

- 4ab74c91: Fix error splash screen having a huge stack trace unexpectedly.
- 4ab74c91: Add provider controls to the scene panel.
- 4ab74c91: Support default values in string, number, boolean, and literal union inputs.
- 0d97596c: Add link to code for controlled props.
- 0d97596c: Fix borders flashing between two different colors on initial load.
  - @triplex/client@0.68.3
  - @triplex/server@0.68.3

## 0.0.13

### Patch Changes

- f7fa4c78: Panel min/max size has been increased.
- 21a64166: Fix webview shifting 4px when selecting an element for the first time.
- f7fa4c78: Panel splitter resizing now uses initial DOM width instead of state width.
  - @triplex/client@0.68.2
  - @triplex/server@0.68.2

## 0.0.12

### Patch Changes

- 22164772: Add color input.
- c96826c8: Add resize to scene panel.
- a5df6744: Block input keydown event propagation to prevent unmodified keybindings from being fired.
- 22164772: Pass through description titles to prop inputs.
  - @triplex/client@0.68.1
  - @triplex/server@0.68.1

## 0.0.11

### Patch Changes

- dd99789a: App now runs with the React Compiler turned on.
- bfdfdc22: Expose jump to element command in the element actions menu.
- 2f68ff8f: Delete command now exposed via contributed keybinding.
- a52fead7: Expose duplicate command in the element actions menu.
- 37b4d9a0: Component switcher now correctly sets default value.
- dd99789a: Upgrade React Compiler.
- d083ff13: Add delete element action.
  - @triplex/client@0.68.0
  - @triplex/server@0.68.0

## 0.0.10

### Patch Changes

- d0f01ca5: Elements filter is now accessed behind a button in the editor panel.
- d0f01ca5: Prop controls now take up more space in the panel.
- d0f01ca5: There is now a control for quickly switching between components in the current file in the editor panel.
- d0f01ca5: Stabilise state changes using transitions.
- d0f01ca5: Remove usage of vsce inputs.
- f035ce9c: Add duplicate command, use via `CommandOrCtrl+D`.
  - @triplex/client@0.67.9
  - @triplex/server@0.67.9

## 0.0.9

### Patch Changes

- cd444563: Opening subsequent components with CodeLens in the same file now works as expected on Windows.
- 2c991e7b: Fix blur element regression.
  - @triplex/client@0.67.8
  - @triplex/server@0.67.8

## 0.0.8

### Patch Changes

- 23eaef8a: Fix compound hotkeys in electron not being functional.
- Updated dependencies [e958b697]
  - @triplex/server@0.67.7
  - @triplex/client@0.67.7

## 0.0.7

### Patch Changes

- e4081607: Prevent hotkeys double firing when modifier keys are pressed.
- a7862f3c: Strip meta.
- a7862f3c: Fix x-plat builds.
- Updated dependencies [050e5845]
  - @triplex/server@0.67.6
  - @triplex/client@0.67.6

## 0.0.6

### Patch Changes

- 1ba572ca: Undo/redo now are triggered using explicit ids.
- 8ec6f701: Add scene panel.
- a1121431: Vsce element controls.
- 8a399d50: Hide scene panel during play.
- f1c507e9: Fix input bugs.
- Updated dependencies [1ba572ca]
- Updated dependencies [a1121431]
  - @triplex/server@0.67.5
  - @triplex/client@0.67.5

## 0.0.5

### Patch Changes

- 04b96fde: Add readme.
- cba1c8db: Internal pkg refactor.
- 22b75f50: Dispose the project when closed prematurely during initialization.
- 0d2ae698: Reset control now shown always.
- 0d2ae698: Prevent controls being fired when saving.
- 08f3d647: Add error boundaries to the root elements.
- Updated dependencies [cde561dc]
  - @triplex/client@0.67.4
  - @triplex/server@0.67.4

## 0.0.4

### Patch Changes

- 9dc6a74d: Add play controls.
- 45b1c4d4: Refactor to use vsce custom editor.
- c9c2bd90: Add scene controls.
- b8b97458: Forward keypress events to the parent document.
- Updated dependencies [b8b97458]
  - @triplex/client@0.67.3
  - @triplex/server@0.67.3

## 0.0.3

### Patch Changes

- 19474be: Adds missing extension metadata.

## 0.0.2

### Patch Changes

- 4341736: Initial release of the extension. If you're reading this it means you're a _very early_ adopter! Please give feedback on the Poimandres [Discord community](https://discord.gg/ZZjjNvJ) or [Twitter](https://twitter.com/trytriplex).
- Updated dependencies [506ba7e]
- Updated dependencies [264dca9]
- Updated dependencies [264dca9]
  - @triplex/server@0.67.2
  - @triplex/client@0.67.2
