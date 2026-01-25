# @triplex/editor-next

## 0.72.5

### Patch Changes

- b070ab9: Triplex WebXR is now available for everyone, see: https://triplex.dev/docs/building-your-scene/webxr.
- b2edcb4: Cleanup stale feature gates.
- 472ba1e: The scene now has a persistent background across light and dark themes.
- b070ab9: The debug panel is now available for everyone, see: https://triplex.dev/docs/building-your-scene/console-logs/debug-panel.
  - @triplex/ux@0.72.5

## 0.72.4

### Patch Changes

- 7d42634: Fix experimental features not being available.
- Updated dependencies [7d42634]
  - @triplex/lib@0.69.20
  - @triplex/ux@0.72.4

## 0.72.3

### Patch Changes

- @triplex/ux@0.72.3

## 0.72.2

### Patch Changes

- 98bd855: Resizing the element tree panel no longer gets stuck on the editor when moving very fast.
- 98bd855: Imported components now show a "link" icon in the element tree to more easily find them against local components / elements.
  - @triplex/ux@0.72.2

## 0.0.10

### Patch Changes

- Updated dependencies [a7a0138]
  - @triplex/lib@0.69.19
  - @triplex/ux@0.69.33

## 0.0.9

### Patch Changes

- 40d59fa: Turn off console error capture.

## 0.0.8

### Patch Changes

- 46b8c74: The selection system now keeps hold of your selected element across file changes. This fix will be rolled out incrementally across Triplex for VS Code users. Want early access? Reach out on Discord.
- Updated dependencies [46b8c74]
  - @triplex/bridge@0.70.12
  - @triplex/ux@0.69.32

## 0.0.7

### Patch Changes

- daaa8b9: Fixed element select flashing without an ellipsis on initial load.
- 0d0e459: The tuple input now immediately applies changes by setting default values to empty required values where appropriate. This will be rolled out over time, if you would like to get this fix early please message on Discord.
- Updated dependencies [0d0e459]
  - @triplex/ux@0.69.31

## 0.0.6

### Patch Changes

- Updated dependencies [9add655]
  - @triplex/lib@0.69.18
  - @triplex/ux@0.69.30

## 0.0.5

### Patch Changes

- Updated dependencies [b229047]
  - @triplex/bridge@0.70.11
  - @triplex/ux@0.69.29

## 0.0.4

### Patch Changes

- 487e3fa: Components in the element panel can now be opened in another Triplex editor using the "Open in Triplex" action.
- 990cd9f: Elements returned from components now correctly highlight the parent relation line when selected.
- Updated dependencies [e736aab]
  - @triplex/ux@0.69.28

## 0.0.3

### Patch Changes

- c8cea68: The elements panel now has lines to aid in showing the relationship of their children.
- e1153b6: Fix provider data being preloaded when it hasn't been set by users yet.
- a7511d5: All elements that have children can now be expanded/collapsed in the elements panel instead of just custom components.
- e1153b6: Changes that result in no code change are no longer added to the undo/redo stack.

## 0.0.2

### Patch Changes

- 196d5f8: The unexpected error splash screen now has a "reload webviews" action, use it to reload your session to get back to it as fast as possible.
- 4500a5f: Deno projects that are missing critical dependencies to run Triplex now have the install prompt set with the `--npm` arg.
- 0cbd424: Components that are no longer exported are now gracefully handled. Instead of an error being thrown the UI remains available prompting you to export the component again.
- Updated dependencies [0cbd424]
- Updated dependencies [1e2a753]
  - @triplex/websocks-client@0.0.9
  - @triplex/bridge@0.70.10
  - @triplex/ux@0.69.27

## 0.0.1

### Patch Changes

- 48d7e85: Add group element action in the element panel action menu.
- 77ebf08: Add error screen when Vite failed to load a module.
- 05006cf: Internal refactor.
