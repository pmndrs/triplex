# @triplex/editor

## 0.70.56

### Patch Changes

- Updated dependencies [7d42634]
  - @triplex/lib@0.69.20
  - @triplex/ux@0.72.4

## 0.70.55

### Patch Changes

- @triplex/ux@0.72.3

## 0.70.54

### Patch Changes

- @triplex/ux@0.72.2

## 0.70.53

### Patch Changes

- Updated dependencies [a7a0138]
  - @triplex/lib@0.69.19
  - @triplex/ux@0.69.33

## 0.70.52

### Patch Changes

- 46b8c74: The selection system now keeps hold of your selected element across file changes. This fix will be rolled out incrementally across Triplex for VS Code users. Want early access? Reach out on Discord.
- Updated dependencies [46b8c74]
  - @triplex/bridge@0.70.12
  - @triplex/ux@0.69.32

## 0.70.51

### Patch Changes

- Updated dependencies [0d0e459]
  - @triplex/ux@0.69.31

## 0.70.50

### Patch Changes

- Updated dependencies [9add655]
  - @triplex/lib@0.69.18
  - @triplex/ux@0.69.30

## 0.70.49

## 0.70.48

### Patch Changes

- Updated dependencies [b229047]
  - @triplex/bridge@0.70.11
  - @triplex/ux@0.69.29

## 0.70.47

### Patch Changes

- Updated dependencies [e736aab]
  - @triplex/ux@0.69.28

## 0.70.46

## 0.70.45

### Patch Changes

- 0cbd424: Components that are no longer exported are now gracefully handled. Instead of an error being thrown the UI remains available prompting you to export the component again.
- Updated dependencies [0cbd424]
- Updated dependencies [1e2a753]
  - @triplex/websocks-client@0.0.9
  - @triplex/bridge@0.70.10
  - @triplex/ux@0.69.27

## 0.70.44

## 0.70.43

## 0.70.42

## 0.70.41

### Patch Changes

- Updated dependencies [82103a4]
- Updated dependencies [689d15f]
- Updated dependencies [55feda2]
  - @triplex/lib@0.69.17
  - @triplex/ux@0.69.26

## 0.70.40

## 0.70.39

## 0.70.38

### Patch Changes

- Updated dependencies [e447108]
  - @triplex/ux@0.69.25
  - @triplex/bridge@0.70.9

## 0.70.37

### Patch Changes

- 8c82aca: Upgrade react-three dependencies.
- ae60a8f: Upgrade typescript.
- 8c82aca: Upgrade vite dependencies.
- Updated dependencies [8c82aca]
- Updated dependencies [ae60a8f]
- Updated dependencies [8c82aca]
  - @triplex/bridge@0.70.8
  - @triplex/lib@0.69.16
  - @triplex/websocks-client@0.0.8
  - @triplex/ux@0.69.24

## 0.70.36

### Patch Changes

- Updated dependencies [b30f3df]
  - @triplex/ux@0.69.23

## 0.70.35

## 0.70.34

## 0.70.33

### Patch Changes

- Updated dependencies [d5681d8]
  - @triplex/websocks-client@0.0.7

## 0.70.32

### Patch Changes

- ba7ff1f: Upgrade react-compiler to rc.1

## 0.70.31

### Patch Changes

- Updated dependencies [3fd23e3]
  - @triplex/bridge@0.70.7
  - @triplex/ux@0.69.22

## 0.70.30

### Patch Changes

- Updated dependencies [839e91e]
  - @triplex/lib@0.69.15
  - @triplex/ux@0.69.21

## 0.70.29

## 0.70.28

### Patch Changes

- Updated dependencies [abf48b9]
  - @triplex/lib@0.69.14
  - @triplex/ux@0.69.20

## 0.70.27

## 0.70.26

## 0.70.25

## 0.70.24

### Patch Changes

- cfd4a6f: Add element preview prop event.
- Updated dependencies [cfd4a6f]
  - @triplex/bridge@0.70.6
  - @triplex/ux@0.69.19

## 0.70.23

## 0.70.22

### Patch Changes

- 2301fd1: Drop unwanted files when publishing.
- Updated dependencies [2301fd1]
  - @triplex/ux@0.69.18
  - @triplex/bridge@0.70.5
  - @triplex/lib@0.69.13
  - @triplex/websocks-client@0.0.6

## 0.70.21

### Patch Changes

- c06f199: All paths now have their drive casing normalized.
- Updated dependencies [c06f199]
  - @triplex/lib@0.69.12
  - @triplex/ux@0.69.17

## 0.70.20

## 0.70.19

## 0.70.18

## 0.70.17

### Patch Changes

- ebf6a03: Links now point to their new locations on the new site.

## 0.70.16

### Patch Changes

- Updated dependencies [01a2e6d]
- Updated dependencies [b6ef6c2]
- Updated dependencies [863de7b]
- Updated dependencies [863de7b]
  - @triplex/ux@0.69.16
  - @triplex/bridge@0.70.4
  - @triplex/websocks-client@0.0.5

## 0.70.15

### Patch Changes

- Updated dependencies [088c699]
  - @triplex/bridge@0.70.3
  - @triplex/ux@0.69.15

## 0.70.14

### Patch Changes

- Updated dependencies [27f5a72]
  - @triplex/websocks-client@0.0.4

## 0.70.13

### Patch Changes

- 711322a: Testing a new camera system under a feature gate. This gives you more control over what Canvas camera to view through, while also changing the default behavior for React DOM components to view through the default camera instead of the editor camera when initially opening.
- Updated dependencies [711322a]
  - @triplex/lib@0.69.11
  - @triplex/ux@0.69.14

## 0.70.12

## 0.70.11

## 0.70.10

## 0.70.9

### Patch Changes

- Updated dependencies [37eb94d]
  - @triplex/bridge@0.70.2
  - @triplex/ux@0.69.13

## 0.70.8

### Patch Changes

- a5d2390: React 19 / Three Fiber 9 are now supported.
- Updated dependencies [85054ef]
- Updated dependencies [a5d2390]
  - @triplex/ux@0.69.12
  - @triplex/bridge@0.70.1
  - @triplex/websocks-client@0.0.3
  - @triplex/lib@0.69.10

## 0.70.7

### Patch Changes

- 95156aa: Scene controld and options will now be contextually shown depending if there is a Three Fiber canvas mounted to the scene.
- Updated dependencies [1ba6783]
  - @triplex/websocks-client@0.0.2

## 0.70.6

### Patch Changes

- 9b15541: Fix logo curvature.
- Updated dependencies [9b15541]
- Updated dependencies [fe84ca9]
  - @triplex/lib@0.69.9
  - @triplex/ux@0.69.11
  - @triplex/websocks@0.0.1

## 0.70.5

## 0.69.10

### Patch Changes

- 095c729: A new loading indicator has been implemented.
- Updated dependencies [095c729]
  - @triplex/lib@0.69.8
  - @triplex/ux@0.69.10

## 0.69.9

### Patch Changes

- 9b67742: Upgrade three.js dependencies.
- 3451d52: Upgrade react-compiler to latest.
- b9b1b62: Upgrade vite and all related dependencies to latest.
- e4db0c2: Upgrade TypeScript to latest.
- Updated dependencies [bcccc4f]
- Updated dependencies [4e8c285]
- Updated dependencies [e4db0c2]
- Updated dependencies [4e8c285]
- Updated dependencies [93761c7]
  - @triplex/ws@0.69.4
  - @triplex/bridge@0.70.0
  - @triplex/lib@0.69.7
  - @triplex/ux@0.69.9

## 0.69.8

### Patch Changes

- Updated dependencies [51d16cd]
- Updated dependencies [b1b39e7]
- Updated dependencies [7493473]
- Updated dependencies [7493473]
  - @triplex/bridge@0.69.5
  - @triplex/lib@0.69.6
  - @triplex/ux@0.69.8

## 0.69.7

### Patch Changes

- 726094c: Upgrade react-compiler.
- Updated dependencies [8c56ae8]
- Updated dependencies [b11fe78]
- Updated dependencies [f8a755c]
- Updated dependencies [b11fe78]
- Updated dependencies [d0cddb1]
- Updated dependencies [b11fe78]
- Updated dependencies [b11fe78]
- Updated dependencies [726094c]
- Updated dependencies [b11fe78]
- Updated dependencies [b11fe78]
- Updated dependencies [4eacf57]
- Updated dependencies [b11fe78]
- Updated dependencies [8c56ae8]
  - @triplex/ux@0.69.7
  - @triplex/lib@0.69.5

## 0.69.6

### Patch Changes

- 14747d4: Camera Controls now default to default camera.
- Updated dependencies [d38608f]
  - @triplex/bridge@0.69.4
  - @triplex/ux@0.69.6

## 0.69.5

### Patch Changes

- 652c1cc: Remove initialize option from project creation. Only creating a new project is supported.
- 652c1cc: Update package json meta.
- Updated dependencies [652c1cc]
  - @triplex/bridge@0.69.3
  - @triplex/lib@0.69.4
  - @triplex/ux@0.69.5
  - @triplex/ws@0.69.3

## 0.69.4

### Patch Changes

- 73db08f: Sentry is now only enabled in production.
- Updated dependencies [c686a64]
  - @triplex/ux@0.69.4

## 0.69.3

### Patch Changes

- 2986748: Set up new Sentry project.
- Updated dependencies [6dca038]
  - @triplex/lib@0.69.3
  - @triplex/ux@0.69.3

## 0.69.2

### Patch Changes

- 967bfbd0: Upgrade vite to v5.
  - @triplex/ux@0.69.2
  - @triplex/ws@0.69.2
  - @triplex/bridge@0.69.2
  - @triplex/lib@0.69.2

## 0.69.1

### Patch Changes

- 50c28c96: Upgrade tsc.
- 060f66ac: Upgrade react-compiler to latest.
- Updated dependencies [50c28c96]
  - @triplex/bridge@0.69.1
  - @triplex/lib@0.69.1
  - @triplex/ux@0.69.1
  - @triplex/ws@0.69.1

## 0.69.0

### Minor Changes

- 740ff8f2: Default editor lights can now be turned on or off through the floating controls panel. Previously they would either be always on (if you had no lights in your component) or always off (if you did have lights). Now you can choose.

### Patch Changes

- fd4fa16f: Internal refactor to consolidate extension points to use a common implementation.
- Updated dependencies [fd4fa16f]
- Updated dependencies [740ff8f2]
  - @triplex/bridge@0.69.0
  - @triplex/ux@0.69.0
  - @triplex/ws@0.69.0
  - @triplex/lib@0.69.0

## 0.68.8

### Patch Changes

- Updated dependencies [07acd338]
  - @triplex/ux@0.68.8
  - @triplex/ws@0.68.8
  - @triplex/bridge@0.68.8
  - @triplex/lib@0.68.8

## 0.68.7

### Patch Changes

- @triplex/bridge@0.68.7
- @triplex/lib@0.68.7
- @triplex/ux@0.68.7
- @triplex/ws@0.68.7

## 0.68.6

### Patch Changes

- Updated dependencies [4cf3e526]
  - @triplex/ux@0.68.6
  - @triplex/bridge@0.68.6
  - @triplex/lib@0.68.6
  - @triplex/ws@0.68.6

## 0.68.5

### Patch Changes

- Updated dependencies [b6d89da7]
  - @triplex/ux@0.68.5
  - @triplex/bridge@0.68.5
  - @triplex/lib@0.68.5
  - @triplex/ws@0.68.5

## 0.68.4

### Patch Changes

- @triplex/ux@0.68.4
- @triplex/ws@0.68.4
- @triplex/bridge@0.68.4
- @triplex/lib@0.68.4

## 0.68.3

### Patch Changes

- Updated dependencies [4ab74c91]
- Updated dependencies [0d97596c]
- Updated dependencies [1c9c343a]
  - @triplex/ux@0.68.3
  - @triplex/lib@0.68.3
  - @triplex/bridge@0.68.3
  - @triplex/ws@0.68.3

## 0.68.2

### Patch Changes

- Updated dependencies [1ee10f79]
- Updated dependencies [1ee10f79]
  - @triplex/ux@0.68.2
  - @triplex/bridge@0.68.2
  - @triplex/lib@0.68.2
  - @triplex/ws@0.68.2

## 0.68.1

### Patch Changes

- 6a1ca455: Upgrade pdnd.
- Updated dependencies [22164772]
- Updated dependencies [a5df6744]
- Updated dependencies [22164772]
  - @triplex/ux@0.68.1
  - @triplex/lib@0.68.1
  - @triplex/bridge@0.68.1
  - @triplex/ws@0.68.1

## 0.68.0

### Minor Changes

- 60ee4011: Add none transform option. The renderer now defaults to this.

### Patch Changes

- dd99789a: Upgrade React Compiler.
- Updated dependencies [5b6671c2]
- Updated dependencies [dd99789a]
- Updated dependencies [60ee4011]
  - @triplex/lib@0.68.0
  - @triplex/ux@0.68.0
  - @triplex/bridge@0.68.0
  - @triplex/ws@0.68.0

## 0.67.9

### Patch Changes

- 0af90052: Update icon used on the open files button.
- 0af90052: Add explicit new file button.
  - @triplex/bridge@0.67.9
  - @triplex/lib@0.67.9
  - @triplex/ux@0.67.9
  - @triplex/ws@0.67.9

## 0.67.8

### Patch Changes

- Updated dependencies [3952a1c8]
  - @triplex/bridge@0.67.8
  - @triplex/ux@0.67.8
  - @triplex/ws@0.67.8
  - @triplex/lib@0.67.8

## 0.67.7

### Patch Changes

- @triplex/ux@0.67.7
- @triplex/ws@0.67.7
- @triplex/bridge@0.67.7
- @triplex/lib@0.67.7

## 0.67.6

### Patch Changes

- @triplex/ux@0.67.6
- @triplex/ws@0.67.6
- @triplex/bridge@0.67.6
- @triplex/lib@0.67.6

## 0.67.5

### Patch Changes

- 85eec02a: Element filter now expands custom components.
- Updated dependencies [a1121431]
- Updated dependencies [f1c507e9]
  - @triplex/lib@0.67.5
  - @triplex/ux@0.67.5
  - @triplex/ws@0.67.5
  - @triplex/bridge@0.67.5

## 0.67.4

### Patch Changes

- cba1c8db: Internal pkg refactor.
- abbbf7c9: Reset control now always shown.
- 08f3d647: Add error boundaries to the root elements.
- Updated dependencies [08f3d647]
- Updated dependencies [cba1c8db]
  - @triplex/ws@0.67.4
  - @triplex/lib@0.67.4
  - @triplex/ux@0.67.4
  - @triplex/bridge@0.67.4

## 0.67.3

### Patch Changes

- ba66926c: Turn on the React Compiler for the editor.
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

- f14b92b: Scene selection is now powered by an out-of-band raycaster. By default scenes no-longer receive events when in edit mode.
- 55ecc10: Add camera switcher for play state.
- b4886f6: Add play/pause scene states.

### Patch Changes

- 6f3d8de: Upgrade three deps (r3f/drei/three).
- 2ca7cbe: Remove expand/collapse editor panels logic. Always collapsed now.
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

- 346cb79: Prop field layout now consistently sized in the context panel.
- e794908: Fix links and body copy for component controls panel.
- Updated dependencies [625e23a]
  - @triplex/bridge@0.66.0
  - @triplex/ws@0.66.0

## 0.65.2

### Patch Changes

- @triplex/bridge@0.65.2
- @triplex/ws@0.65.2

## 0.65.1

### Patch Changes

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

- a66604b: Fix @step tag not working with number inputs.
- 1df7cc9: Fix non-camera scene objects having an enter camera action.
  - @triplex/ws@0.64.4
  - @triplex/bridge@0.64.4

## 0.64.3

### Patch Changes

- 1d9c390: Fix user land modules being forcibly invalidated during HMR causing unexpected behaviour.
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

- 0868337: Add support for SharedBufferArray.
- f0444d6: Component controls, provider controls, and component prop controls now show default props when no value has been set.
- 09d435f: Add zoom controls.
- 9567579: Add canvas frame.

### Patch Changes

- f0444d6: Fix string literal union input resetting the value on clear to nothing instead of the default value.
- 777b2f5: Improve UI/UX of error screen shown when loading a project fails, now showing the actual error message.
- a153ee8: Error notifications now display the latest error first.
- f0444d6: Fix select input not being cleared when pressing backspace.
- a153ee8: Errors thrown during the initial render are now visible as an error notification.
- Updated dependencies [8712a12]
  - @triplex/bridge@0.64.0
  - @triplex/ws@0.64.0

## 0.63.0

### Minor Changes

- 4c48d66: Add host element declarations to renderer manifest.
- 8eddebb: The canvas can now be set to take up all available space in the editor or take up the space between panels.

### Patch Changes

- 8eddebb: Assets panel now defaults to host elements.
- 8eddebb: Font size has been consolidated across the editor ui.
- a81b79a: Improve filter logic in open component drawer.
- 480866f: Upgrade TypeScript.
- Updated dependencies [480866f]
  - @triplex/bridge@0.63.0
  - @triplex/ws@0.63.0

## 0.62.0

### Minor Changes

- 11a548a: File browser now displays thumbnails.
- 273c586: Create / open project flow has had its UX changed to improve understanding what is actually happening.
- 0909731: Add Linux support.
- 3612434: Add thumbnail support for renderers.

### Patch Changes

- bad0a57: Triplex now finds random open ports every time a project is opened instead of using hardcoded ones.
- cea76c2: Simplify bridge event names.
- b629d57: Component thumbnail has had its design simplified.
- e2608a8: Editor scene now has improved contrast against the editor and tabs.
- 0909731: Fix hotkeys firing when they shouldn't.
- 99b97cf: Remove need for router inside the r3f renderer.
- b629d57: Open component drawer now has distinct sections for files.
- 1d7e53f: Editor now flushes events back to the editor when the "ready" event is called multiple times.
- cdbdc16: Remove redundant bridge events for element props.
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

- b8bd0e0: Fix string input margin for clear button.
- b8bd0e0: Add and default to empty template.
- e522b42: Hoist filter out of context panel to persist between elements.
  - @triplex/ws@0.61.2
  - @triplex/bridge@0.61.2

## 0.61.1

### Patch Changes

- 6c887c4: Fix drag & drop in the scene panel not functioning.
- 8e565d9: Tabs now re-open in their last known index.
  - @triplex/ws@0.61.1
  - @triplex/bridge@0.61.1

## 0.61.0

### Minor Changes

- 3920fd3: Scene elements can now be moved before/after/into other scene elements with drag and drop.
- b407820: Add file tabs.
- 5299234: Add open file button to tabs.
- 3091229: Add new undo/redo system. Any edits are now flushed through this.

### Patch Changes

- 5299234: Titlebar now goes partially transparent when inactive.
- d583e42: Tuple prop labels are now start-aligned.
- d583e42: You can no-longer enter an element from node modules.
- d583e42: Fix ide link for unsupported props.
- d583e42: Assets now displayed as the last folder in the assets drawer.
- b407820: Save is now correctly scoped to the currently opened file. Save all replaces the original functionality.
- 2f569d5: Inputs nolonger remount when value changes from source.
- af8c06e: Inputs now confirm their value when pressing enter.
- af8c06e: Color input now displays a focus state.
- 5efeea0: Normalize paths using upath instead of node built-in.
- b407820: Add hotkeys for file tabs.
- ab35f91: Refactor modified to be a different state to new file. New files now shown as italic and not initially modified.
- cba2b47: Transform controls now has capped precision.
- Updated dependencies [b407820]
  - @triplex/bridge@0.61.0
  - @triplex/ws@0.61.0

## 0.60.1

### Patch Changes

- b82d12e: Provider controls have now moved above the open component to hopefully provider a more intuitive ux.
  - @triplex/bridge@0.60.1
  - @triplex/ws@0.60.1

## 0.60.0

### Minor Changes

- 7a250ba: Adds duplicate scene

### Patch Changes

- 7a250ba: Remove unused code paths missed by a previous refactor.
- 722ac20: Context panel now closes when the element has been lost. This could happen from being deleted in code, re-ordering, anything.
- b42550f: Copy/paste text is now available in the edit menu.
- b42550f: When focusing inputs you will no longer trigger unexpected hotkeys such as transform mode changes when typing.
- eb37a51: IDE links now opened through the `launch-editor` package.
- 0cce596: Error overlay no longer closers after a HMR event.
- 000008d: Element actions are now located in the scene panel, with the enter selection action being removed from the UI altogether. Access it instead via the "Selection" menu, or via its hotkey (SHIFT+F).

  Selection actions remain functional via hotkeys: delete, focus, enter.

- 000008d: Fix delete action not working on nested child elements.
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

- 2194c85: Triplex now warns you when the file you have open is outside where your project has defined files should be.
- ce8a108: Exit selection command can now be triggered using the (SHIFT + CmdOrControl + F) hotkey.
- ce8a108: Add transform actions to selection menu.
- f2d612b: Editor now shows union literal labels where possible.
- 1d70f2b: An error screen is now presented to users when Triplex fails to start up a project.
- 8dd7cd1: Scene/client pkgs now bundled with vite.
- 75073e7: Editor now shows a loading screen prior to the project being successfully loaded.
- ce8a108: Fix saving accidentally triggered scale transform mode.
- f6e068c: Packages have been moved into namedspaced folders.
- Updated dependencies [f6e068c]
  - @triplex/ws@0.59.0
  - @triplex/bridge@0.59.0

## 0.58.2

### Patch Changes

- 85447c2: Add halloween template for project initialization.
- 85447c2: Upgrade three.js.
- b5247c2: Apply lint and prettier fixes.
- Updated dependencies [b5247c2]
  - @triplex/ws-client@0.58.2
  - @triplex/bridge@0.58.2

## 0.58.1

### Patch Changes

- e645e5c: Fix provider ui not respecting default props.
- f1656e0: Provider config now takes up slightly more space.
  - @triplex/ws-client@0.58.1
  - @triplex/bridge@0.58.1

## 0.58.0

### Minor Changes

- 37bf36d: Add provider props as config to the ui.
- 3e1e081: Separate soft refresh from hard refresh.

### Patch Changes

- Updated dependencies [3e1e081]
  - @triplex/bridge@0.58.0
  - @triplex/ws-client@0.58.0

## 0.57.2

### Patch Changes

- f5bbeda: Literal union input now supports boolean literals.
- f5bbeda: Fix server throwing when symbols for jsx elements were not resolved.
  - @triplex/ws-client@0.57.2
  - @triplex/bridge@0.57.2

## 0.57.1

### Patch Changes

- @triplex/bridge@0.57.1
- @triplex/ws-client@0.57.1

## 0.57.0

### Minor Changes

- 5c1fc3d: Add editing child jsx elements through the Triplex UI.
- 628646e: Context panel now has a filter for props.
- 7673ae8: A search input filter is now available when opening a component.
- 2b61384: Adding an asset is now contextual, the original button adds to the open component, while the add buttons on each element in the left scene panel add to it as a child.

### Patch Changes

- 046cf78: Error notification is now displayed in the bottom left and is emphasized less.
- 2b61384: When adding new elements to the scene the left scene panel now scrolls to the added element if needed.
- 628646e: Inputs can now have their content selected with the select all command (cmd + a).
- Updated dependencies [5c1fc3d]
- Updated dependencies [2b61384]
  - @triplex/bridge@0.57.0
  - @triplex/ws-client@0.57.0

## 0.56.1

### Patch Changes

- @triplex/ws-client@0.56.1
- @triplex/bridge@0.56.1

## 0.56.0

### Minor Changes

- 463789f: Adds end-to-end typesafe ws router.
- 32a110f: Add top-level scene component to the scene panel. When selected users can modify the props during their seession to see what happens.
- 47483b9: The data that powers the context panel props is now sourced from types first instead of defined props first, resulting in tuple type data no longer being lost after a prop has been set.

### Patch Changes

- d674f26: Color input can now be cleared when not required.
- 47483b9: Tuple input no longer fires when required values are only partially filled out.
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
- b3d2fa9: Number input no longer calls change and confirm handlers if the value is outside the min/max range.
- Updated dependencies [ea86fdc]
  - @triplex/ws-client@0.55.1
  - @triplex/bridge@0.55.1

## 0.55.0

### Minor Changes

- 3be2782: Add support for adding a gltf static asset to the scene.
- b6970aa: Adds prop tags to context to be picked up by inputs.
- ab909b4: Static assets are now available through the assets drawer.
- 4fa9018: The number input has been re-written to improve its UX.
- 44faed1: Jsdoc tags are now returned in the jsx element type response.
- b6970aa: Number input can now have a min/max value set using `@min` and `@max` jsdoc tags respectively. E.g. `@min 1` will cap the input value to 1.

### Patch Changes

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

- d58e0b0: During save a route transition will only occur if saving the file to another path.
- 8afea84: Focus state is now handled across the app.
- cdd6234: Delete and undo/redo actions are no longer double fired when using the hotkey in the editor.
  - @triplex/bridge@0.54.1
  - @triplex/ws-client@0.54.1

## 0.54.0

### Minor Changes

- 8fad65a: Adds camera type to controls menu, allowing you to switch between perspective and orthographic camera.
- e0038f6: Add support for viewing through a user land camera.

### Patch Changes

- e0038f6: Disable enter component for node modules dependencies.
- Updated dependencies [8fad65a]
- Updated dependencies [e0038f6]
  - @triplex/bridge@0.54.0
  - @triplex/ws-client@0.54.0

## 0.53.1

### Patch Changes

- @triplex/bridge@0.53.1
- @triplex/ws-client@0.53.1

## 0.53.0

### Minor Changes

- c71412b: Adds refresh scene action available in the File menubar and through cmd/ctrl + r.

### Patch Changes

- aa3a982: View logs button no longer is disabled during project creation.
- aa3a982: React and React Three Fiber are now peer dependencies.
- aa3a982: Fixed three peer dependency not being loose enough and react-three-fiber and react being missing from peer dependencies.
- bddac75: Welcome screen version number now positioned depending on OS.
- Updated dependencies [aa3a982]
- Updated dependencies [c71412b]
  - @triplex/ws-client@0.53.0
  - @triplex/bridge@0.53.0

## 0.52.0

### Minor Changes

- 48016ba: Rotation props are now displayed as degrees in the UI and saved to code as radians. Previously it was all radians which was confusing for pretty much everyone.
- fe90482: Logs are now accessible through the View > Logs menubar action.
- 8d532f5: Editor now shows build time and runtime errors in an error overlay.

### Patch Changes

- 120f9ef: When updating array inputs undefined optional values are now ignored and discarded.
- Updated dependencies [8d532f5]
  - @triplex/bridge@0.52.0
  - @triplex/ws-client@0.52.0

## 0.51.1

### Patch Changes

- @triplex/bridge@0.51.1
- @triplex/ws-client@0.51.1

## 0.51.0

### Minor Changes

- b61dc2a: The editor menu bar is now displayed in the title bar for Windows and Node.js.

### Patch Changes

- b61dc2a: Hotkeys on Windows are now title case.
- b61dc2a: Menu bar events now originate from the editor source instead of being some in the electron app and some in the editor.
- c97e359: Inputs no longer call change and confirm handlers with `undefined` values when required.
  - @triplex/bridge@0.51.0
  - @triplex/ws-client@0.51.0

## 0.50.1

### Patch Changes

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

### Minor Changes

- 3eae131: Welcome screen now shows a progress bar when installing node modules.
- 8c5611d: Adds create project action to the welcome screen.
- 3eae131: Welcome screen now is draggable using the top invisible title bar.

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

- daa2697: Adds a welcome screen to the electron app.
- 1fc7657: Menu bar is now native when ran in the electron app.
- 1fc7657: Electron app now uses a custom title bar.
- e8cf76f: Adds native save dialog support.
- 1fc7657: Window title now uses both the folder name and file name if open.
- 4164026: Undo/redo menu items now correctly display as enabled or disabled when appropriate.

### Patch Changes

- 4164026: Editor is now typechecked again.
- e8cf76f: When no file is open irrelevant menu items are now disabled.
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
- 56b17f0: Adds filter for add element drawer.
- 4d8d9cc: Builds are now minified.
- 557648e: Editor has been extracted out of the client dev server and now is bundled when published to npm.

### Patch Changes

- Updated dependencies [0242833]
- Updated dependencies [4d8d9cc]
- Updated dependencies [557648e]
  - @triplex/bridge@0.44.0
  - @triplex/ws-client@0.44.0

## 0.43.0

### Minor Changes

- 6dfb22d: Save as action now available in the menubar. Use to save the current open file to another location.
- 6dfb22d: Scroll container thumb scroll areas now take up less space.
- 6dfb22d: Create a component in the current open file through the component switcher.
- de54812: Color inputs now show a transparent background when undefined.
- b7bbeba: Deleting the selected element with backspace now works when focused on any element other than an input.
- 6dfb22d: A component switcher is now available in the left panel, use it to quickly switch between components in the open file.
- 6dfb22d: The browser tab title now changes when there are unsaved changes.
- b7bbeba: String and numbers in props now can have undefined default values.
- de54812: Prop inputs now are able to be cleared through the ui.
- de54812: Context panel tuple props now show labels when available.
- de54812: Checkbox now renders using a custom icon.
- b7bbeba: When adding a new element to the scene if you have a selection it will be added as a child. If you have no selection it will be added to the root component.
- 01cd388: Adds context panel indicator to the add component drawer when an element is selected.
- facc6aa: Saving a new component now prompts for a component name.
- de54812: Fixed save prop serializing undefined to null.
- 01cd388: Fixes the context panel unexpectedly when closing the color picker with escape.

### Patch Changes

- Updated dependencies [b7bbeba]
  - @triplex/bridge@0.43.0
  - @triplex/ws-client@0.43.0

## 0.42.0

### Patch Changes

- @triplex/bridge@0.42.0
- @triplex/ws-client@0.42.0

## 0.41.0

### Minor Changes

- 5d161d8: The editor panels are now displayed on a single flex layout.

### Patch Changes

- @triplex/bridge@0.41.0
- @triplex/ws-client@0.41.0

## 0.40.0

### Minor Changes

- a2a2f4b: Removes usage of r3f internals.
- a2a2f4b: Fixes union input accidentally having default value being applied when it shouldn't.
- dac7c76: Selection for scene objects is now more resilient being able to be set before scene objects are actually available.
- bfb0f7a: Adds an error boundary ui to replace the basic error text version.
- ee2494b: When clicking ide links such as view source websocket connections no longer close.

### Patch Changes

- Updated dependencies [ee2494b]
  - @triplex/ws-client@0.40.0
  - @triplex/bridge@0.40.0

## 0.39.0

### Minor Changes

- ca9807e: New files can now be created through the file menu.
- ca9807e: After adding a component it will now be automatically focused.
- ca9807e: Union input now correctly picks up default value.

### Patch Changes

- @triplex/bridge@0.39.0
- @triplex/ws-client@0.39.0

## 0.38.0

### Patch Changes

- @triplex/bridge@0.38.0
- @triplex/ws-client@0.38.0

## 0.37.0

### Minor Changes

- 23fe64a: Adds delete scene object. Access through the context panel when focusing on a scene object.

### Patch Changes

- Updated dependencies [23fe64a]
- Updated dependencies [1a2ecea]
  - @triplex/bridge@0.37.0
  - @triplex/ws-client@0.37.0

## 0.36.0

### Patch Changes

- @triplex/bridge@0.36.0
- @triplex/ws-client@0.36.0

## 0.35.0

### Minor Changes

- e53a703: Prop font size in the context panel has been reduced.
- e53a703: Emissive prop now considered a color.

### Patch Changes

- @triplex/bridge@0.35.0
- @triplex/ws-client@0.35.0

## 0.34.0

### Minor Changes

- 2a64658: Prop descriptions are now viewable in the context panel when hovering over prop names.
- 2a64658: The context panel now displays all available props on a component even if they aren't yet declared thanks to the TypeScript compiler and ts-morph. Not all prop types are supported currently, if you have one that you expected to be available but isn't please reach out.

### Patch Changes

- Updated dependencies [2a64658]
  - @triplex/ws-client@0.34.0
  - @triplex/bridge@0.34.0

## 0.33.0

### Minor Changes

- 1067d23: Adds transform controls to the ui.

### Patch Changes

- Updated dependencies [1067d23]
  - @triplex/bridge@0.33.0
  - @triplex/ws-client@0.33.0

## 0.32.0

### Minor Changes

- 73d9e8c: Inputs no longer trigger dirty scene state if their value hasn't changed.
- c87a5f3: Undo/redo now available. When manipulating the scene through transform controls or the context panel each persisted manipulation will be able to be undone (and redone) using hotkeys and the edit menu actions.
- c87a5f3: Saving with hotkey is now available when focus is on the ui.
- c87a5f3: Adds reset command. Use this to throw away all unsaved changes in the scene.

### Patch Changes

- Updated dependencies [c87a5f3]
  - @triplex/bridge@0.32.0
  - @triplex/ws-client@0.32.0

## 0.31.0

### Minor Changes

- 5ac3a26: UI has been darkened and borders have been deemphasized.
- a1e3127: When source changes ui now reflects the updated value.
- 48002a7: Array input no longer caches its value which resulted in unexpected bugs when transforming in scene and then through the ui.

### Patch Changes

- @triplex/bridge@0.31.0
- @triplex/ws-client@0.31.0

## 0.30.0

### Minor Changes

- 0bb6119: Adds support for updating scene objects through the context panel.
- 0bb6119: Extract inputs to their own custom components.
- 0bb6119: Fix color input not showing for various color inputs.

### Patch Changes

- Updated dependencies [0bb6119]
  - @triplex/bridge@0.30.0
  - @triplex/ws-client@0.30.0

## 0.29.0

### Minor Changes

- 0d83ef2: Scene drawer now has correct padding and is increased in width.
- 0d83ef2: The catch all prop field now has capped height stopping it from looking ridiculous.

### Patch Changes

- @triplex/bridge@0.29.0
- @triplex/ws-client@0.29.0

## 0.28.0

### Minor Changes

- aa1aa8c: Scene transformation using ts-morph has been replaced with Babel significantly speeding up initial load and saving. The need for the `.triplex/tmp` folder is now gone and thus no longer used.
- aa1aa8c: Line and column numbers for scene objects have been corrected and are now consistent across editor, scene, and server.
- aa1aa8c: Scene drawer now shows loading text when appropriate.

### Patch Changes

- @triplex/bridge@0.28.0
- @triplex/ws-client@0.28.0

## 0.27.0

### Minor Changes

- fa35cde: Fixes UI scrolling and contrast bugs.
- 9b1d135: Increased gutters in the scene panel list as well as fixing the variable width in the context panel.
- 246217f: Text contrast in the scene and context panel have been improved.
- e5a3419: Context panel now supports more prop types.

### Patch Changes

- @triplex/bridge@0.27.0
- @triplex/ws-client@0.27.0

## 0.26.0

### Minor Changes

- 785050d: Adds unsaved indicator to the editor.
- 71374c9: Scene, context, and open scene containers now scroll when overflowing with content.

### Patch Changes

- Updated dependencies [785050d]
  - @triplex/ws-client@0.26.0
  - @triplex/bridge@0.26.0

## 0.25.0

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

### Minor Changes

- aa9c9ae: Lighten selected state.

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
- 1c9771d: Scene drawer now shows named exports from scenes.
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

- e7c026b: Scene drawer no-longer stays open when selecting a scene.
- 7ff35f3: Context panel no longer throws when navigating between scene and a scene object is selected.
- e7c026b: Scene panel now shows correctly nested jsx elements.
- e7c026b: Disabled menu items are now actually disabled.
- 7ff35f3: Upgrades @react-three/fiber to latest.
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

- e54e0f8: Editor now has a select menu with useful actions when a scene object is selected.
- e54e0f8: Bridge events now flow unidirectionally enabling the editor ui to initiate events to the scene, such as navigate and focus.

### Patch Changes

- Updated dependencies [e54e0f8]
  - @triplex/bridge@0.15.0
  - @triplex/ws-client@0.15.0

## 0.14.0

### Minor Changes

- 7a8083c: The open rpc has been added back to prevent the "flash of no scene" when transitioning between scenes for the first time.

### Patch Changes

- @triplex/bridge@0.14.0
- @triplex/ws-client@0.14.0

## 0.13.0

### Minor Changes

- cfbd47b: When transitioning between scenes there is no longer a flash of hidden scene objects.
- 969feab: Removes unneeded fetch calls.
- cc917d7: Adds usage of ws-client pkg.
- 969feab: Adds react suspense powered websocket abstraction.
- a4d6882: Adds context panel for selected scene objects.
- 99075ff: Adds error boundaries so the app doesn't blow up when a scene isn't found.
- cfbd47b: Scene meta has been extrated into a common hook.
- 969feab: Scene list and scene components ui now fetch data using the websocket client.

### Patch Changes

- Updated dependencies [a4d6882]
- Updated dependencies [cc917d7]
  - @triplex/bridge@0.7.0
  - @triplex/ws-client@0.1.0

## 0.12.0

### Minor Changes

- 55f0206: Fixed focus and blur events between the scene and the editor.
- 55f0206: Scene components now appear nested when children of other components in the UI.

## 0.11.0

### Minor Changes

- 3c725bc: Force release all packages.

### Patch Changes

- Updated dependencies [3c725bc]
  - @triplex/bridge@0.6.0

## 0.10.0

### Minor Changes

- a32c72e: Adds the scene component list to the sidebar with the ability to focus scene objects on click. Scene components in this list are also selected when focusing scene objects in the scene.

## 0.9.0

### Minor Changes

- ac9624f: Fixes client/host race condition where host would send events before the client has connected.
- 7db42bd: Adds open scene drawer.

### Patch Changes

- Updated dependencies [ac9624f]
  - @triplex/bridge@0.5.0

## 0.8.0

### Minor Changes

- 387f6cd: Editor now able to use tailwindcss during dev, which is compiled away when packaged to npm.
- 387f6cd: Adds a menu bar to the editor.

## 0.7.0

### Minor Changes

- 56dde00: Fixes publish config main field to point to the correct location.

## 0.6.0

### Minor Changes

- c84a8ca: Package now declares the main field.

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
