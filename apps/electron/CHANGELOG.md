# @triplex/electron

## 0.70.58

### Patch Changes

- Updated dependencies [b070ab9]
- Updated dependencies [b2edcb4]
- Updated dependencies [b070ab9]
  - @triplex/server@0.72.5
  - @triplex/client@0.70.51
  - @triplex/editor@0.70.57

## 0.70.57

### Patch Changes

- 7d42634: Fix experimental features not being available.
  - @triplex/client@0.70.50
  - @triplex/editor@0.70.56
  - @triplex/server@0.72.4

## 0.70.56

### Patch Changes

- Updated dependencies [642aede]
  - @triplex/server@0.72.3
  - @triplex/client@0.70.49
  - @triplex/editor@0.70.55

## 0.70.55

### Patch Changes

- @triplex/server@0.72.2
- @triplex/client@0.70.48
- @triplex/editor@0.70.54

## 0.70.54

### Patch Changes

- @triplex/client@0.70.47
- @triplex/editor@0.70.53

## 0.70.53

### Patch Changes

- Updated dependencies [fbd4c8a]
- Updated dependencies [d9adc31]
  - @triplex/server@0.71.24

## 0.70.52

### Patch Changes

- Updated dependencies [46b8c74]
  - @triplex/client@0.70.46
  - @triplex/editor@0.70.52
  - @triplex/server@0.71.23

## 0.70.51

### Patch Changes

- e1575ed: Fix an internal error where a function that should have been defined wasn't.
- Updated dependencies [e1575ed]
  - @triplex/server@0.71.22
  - @triplex/editor@0.70.51

## 0.70.50

### Patch Changes

- b14a832: The camera preview no longer has the selection outline of the camera visible.
- b14a832: Switching from default to editor camera now correctly fits the scene to it on the first switch.
- b14a832: Switching the canvas camera between editor and defaul no longer bleeds state between each other.
- 9add655: Resetting a component that renders a canvas now persists the camera settings.
  - @triplex/client@0.70.45
  - @triplex/editor@0.70.50

## 0.70.49

### Patch Changes

- 299a02e: Errors are no longer thrown if a components name could not be resolved.
- 299a02e: Untyped host elements no-longer throw an exception when selecting through the elements panel.
- Updated dependencies [299a02e]
- Updated dependencies [299a02e]
  - @triplex/server@0.71.21
  - @triplex/editor@0.70.49

## 0.70.48

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
- Updated dependencies [b229047]
  - @triplex/client@0.70.44
  - @triplex/editor@0.70.48

## 0.70.47

### Patch Changes

- @triplex/editor@0.70.47

## 0.70.46

### Patch Changes

- Updated dependencies [e1153b6]
  - @triplex/server@0.71.20
  - @triplex/client@0.70.43
  - @triplex/editor@0.70.46

## 0.70.45

### Patch Changes

- Updated dependencies [4500a5f]
- Updated dependencies [0cbd424]
  - @triplex/server@0.71.19
  - @triplex/editor@0.70.45
  - @triplex/client@0.70.42

## 0.70.44

### Patch Changes

- @triplex/client@0.70.41
- @triplex/editor@0.70.44

## 0.70.43

### Patch Changes

- @triplex/client@0.70.40
- @triplex/editor@0.70.43

## 0.70.42

### Patch Changes

- Updated dependencies [48d7e85]
- Updated dependencies [77ebf08]
- Updated dependencies [97a64c6]
  - @triplex/server@0.71.18
  - @triplex/client@0.70.39
  - create-triplex-project@0.70.13
  - @triplex/editor@0.70.42

## 0.70.41

### Patch Changes

- Updated dependencies [56b125d]
- Updated dependencies [4546b3e]
- Updated dependencies [55feda2]
  - @triplex/server@0.71.17
  - create-triplex-project@0.70.12
  - @triplex/client@0.70.38
  - @triplex/editor@0.70.41

## 0.70.40

### Patch Changes

- Updated dependencies [030ed16]
  - @triplex/server@0.71.16
  - @triplex/client@0.70.37
  - @triplex/editor@0.70.40

## 0.70.39

### Patch Changes

- @triplex/client@0.70.36
- @triplex/editor@0.70.39

## 0.70.38

### Patch Changes

- Updated dependencies [e447108]
- Updated dependencies [212ae79]
- Updated dependencies [ff67cb2]
  - @triplex/client@0.70.35
  - @triplex/server@0.71.15
  - @triplex/editor@0.70.38

## 0.70.37

### Patch Changes

- 8c82aca: Upgrade react-three dependencies.
- ae60a8f: Upgrade typescript.
- 8c82aca: Upgrade vite dependencies.
- Updated dependencies [8c82aca]
- Updated dependencies [ae60a8f]
- Updated dependencies [8c82aca]
  - create-triplex-project@0.70.11
  - @triplex/client@0.70.34
  - @triplex/editor@0.70.37
  - @triplex/server@0.71.14

## 0.70.36

### Patch Changes

- Updated dependencies [3f92cd3]
  - @triplex/client@0.70.33
  - @triplex/editor@0.70.36

## 0.70.35

### Patch Changes

- Updated dependencies [78bf74e]
- Updated dependencies [78bf74e]
- Updated dependencies [78bf74e]
  - create-triplex-project@0.70.10
  - @triplex/editor@0.70.35

## 0.70.34

### Patch Changes

- @triplex/client@0.70.32
- @triplex/editor@0.70.34

## 0.70.33

### Patch Changes

- @triplex/client@0.70.31
- @triplex/editor@0.70.33

## 0.70.32

### Patch Changes

- ba7ff1f: Upgrade react-compiler to rc.1
- Updated dependencies [ba7ff1f]
- Updated dependencies [f420d2e]
- Updated dependencies [25dfbec]
- Updated dependencies [25dfbec]
- Updated dependencies [f2d1de5]
- Updated dependencies [25dfbec]
  - @triplex/editor@0.70.32
  - @triplex/client@0.70.30
  - create-triplex-project@0.70.9

## 0.70.31

### Patch Changes

- Updated dependencies [8b8dee7]
- Updated dependencies [3fd23e3]
  - create-triplex-project@0.70.8
  - @triplex/client@0.70.29
  - @triplex/server@0.71.13
  - @triplex/editor@0.70.31

## 0.70.30

### Patch Changes

- Updated dependencies [839e91e]
- Updated dependencies [42b03ff]
  - @triplex/client@0.70.28
  - @triplex/server@0.71.12
  - @triplex/editor@0.70.30

## 0.70.29

### Patch Changes

- @triplex/client@0.70.27
- @triplex/editor@0.70.29

## 0.70.28

### Patch Changes

- @triplex/client@0.70.26
- @triplex/editor@0.70.28

## 0.70.27

### Patch Changes

- Updated dependencies [302081f]
  - @triplex/client@0.70.25
  - @triplex/editor@0.70.27

## 0.70.26

### Patch Changes

- b97cd77: IPs are now capped to 3000 range.
- a480636: Testing webxr capabilities.
- Updated dependencies [b97cd77]
- Updated dependencies [a480636]
  - @triplex/client@0.70.24
  - @triplex/server@0.71.11
  - @triplex/editor@0.70.26

## 0.70.25

### Patch Changes

- 526ff1b: Fix feature gate environment not being set to production.
  - @triplex/editor@0.70.25

## 0.70.24

### Patch Changes

- cfd4a6f: Add element preview prop event.
- Updated dependencies [cfd4a6f]
  - @triplex/editor@0.70.24
  - @triplex/client@0.70.23

## 0.70.23

### Patch Changes

- f61dd89: Testing a fix for running postprocessing, it will be gradually rolled out.
  - @triplex/client@0.70.22
  - @triplex/editor@0.70.23

## 0.70.22

### Patch Changes

- 2301fd1: Drop unwanted files when publishing.
- Updated dependencies [2301fd1]
  - @triplex/client@0.70.21
  - @triplex/editor@0.70.22
  - @triplex/server@0.71.10
  - create-triplex-project@0.70.7

## 0.70.21

### Patch Changes

- c06f199: All paths now have their drive casing normalized.
- Updated dependencies [c06f199]
  - create-triplex-project@0.70.6
  - @triplex/client@0.70.20
  - @triplex/editor@0.70.21
  - @triplex/server@0.71.9

## 0.70.20

### Patch Changes

- Updated dependencies [f6b8df6]
  - @triplex/client@0.70.19
  - @triplex/editor@0.70.20

## 0.70.19

### Patch Changes

- Updated dependencies [8fce951]
  - @triplex/client@0.70.18
  - @triplex/editor@0.70.19

## 0.70.18

### Patch Changes

- eca2202: Deno projects that exclusively use deno.json instead of package.json can now be opened inside Triplex.
- Updated dependencies [eca2202]
- Updated dependencies [4dbf621]
  - @triplex/server@0.71.8
  - @triplex/client@0.70.17
  - @triplex/editor@0.70.18

## 0.70.17

### Patch Changes

- 66ad72d: Basic and halloween templates have been removed.
- ebf6a03: Links now point to their new locations on the new site.
- Updated dependencies [66ad72d]
- Updated dependencies [ebf6a03]
  - create-triplex-project@0.70.5
  - @triplex/editor@0.70.17

## 0.70.16

### Patch Changes

- 863de7b: GlobalProvider and CanvasProvider exports from the declared provider module now show up in the provider panel.
- Updated dependencies [b6ef6c2]
- Updated dependencies [863de7b]
  - @triplex/client@0.70.16
  - @triplex/server@0.71.7
  - @triplex/editor@0.70.16

## 0.70.15

### Patch Changes

- dfa0f39: Screenshots have been disabled in editor and will be re-enabled at a later date.
- dfa0f39: Upgrade electron.
- Updated dependencies [088c699]
- Updated dependencies [088c699]
  - @triplex/server@0.71.6
  - @triplex/client@0.70.15
  - @triplex/editor@0.70.15

## 0.70.14

### Patch Changes

- @triplex/client@0.70.14
- @triplex/editor@0.70.14

## 0.70.13

### Patch Changes

- 711322a: Testing a new camera system under a feature gate. This gives you more control over what Canvas camera to view through, while also changing the default behavior for React DOM components to view through the default camera instead of the editor camera when initially opening.
- Updated dependencies [0137088]
- Updated dependencies [711322a]
- Updated dependencies [b4f482a]
  - create-triplex-project@0.70.4
  - @triplex/client@0.70.13
  - @triplex/server@0.71.5
  - @triplex/editor@0.70.13

## 0.70.12

### Patch Changes

- Updated dependencies [6f01882]
  - @triplex/client@0.70.12
  - @triplex/editor@0.70.12

## 0.70.11

### Patch Changes

- @triplex/client@0.70.11
- @triplex/editor@0.70.11

## 0.70.10

### Patch Changes

- Updated dependencies [edba305]
- Updated dependencies [edba305]
- Updated dependencies [edba305]
  - @triplex/client@0.70.10
  - @triplex/editor@0.70.10

## 0.70.9

### Patch Changes

- 78e0864: Update the package icon.
- Updated dependencies [37eb94d]
  - @triplex/client@0.70.9
  - @triplex/editor@0.70.9

## 0.70.8

### Patch Changes

- Updated dependencies [a5d2390]
- Updated dependencies [a5d2390]
  - @triplex/server@0.71.4
  - create-triplex-project@0.70.3
  - @triplex/client@0.70.8
  - @triplex/editor@0.70.8

## 0.70.7

### Patch Changes

- 62ae87f: The camera settings menu in the floating scene controls panel have been moved into a new scene settings menu. Find it in the same spot with the "cog" icon.
- Updated dependencies [95156aa]
  - @triplex/editor@0.70.7
  - @triplex/client@0.70.7

## 0.70.6

### Patch Changes

- Updated dependencies [9b15541]
- Updated dependencies [6422c5f]
- Updated dependencies [fe84ca9]
  - @triplex/editor@0.70.6
  - @triplex/client@0.70.6
  - @triplex/server@0.71.3

## 0.70.5

### Patch Changes

- Updated dependencies [7977da7]
  - @triplex/client@0.70.5
  - @triplex/editor@0.70.5

## 0.70.4

### Patch Changes

- Updated dependencies [b2079fd]
- Updated dependencies [095c729]
  - @triplex/client@0.70.4
  - @triplex/editor@0.69.10

## 0.70.3

### Patch Changes

- Updated dependencies [84a2615]
- Updated dependencies [98ee32b]
  - @triplex/client@0.70.3
  - @triplex/server@0.71.2

## 0.70.2

### Patch Changes

- Updated dependencies [1922407]
  - @triplex/client@0.70.2

## 0.70.1

### Patch Changes

- Updated dependencies [8574af1]
- Updated dependencies [fe8f650]
  - @triplex/server@0.71.1
  - @triplex/client@0.70.1

## 0.70.0

### Minor Changes

- 4e8c285: How components are loaded has been restructured to support opening components with mixed JSX elements from different reconcilers.
- 4e8c285: Triplex can now open components that have both DOM and Three Fiber JSX elements.

### Patch Changes

- b9b1b62: Upgrade vite and all related dependencies to latest.
- e4db0c2: Upgrade TypeScript to latest.
- Updated dependencies [0866bda]
- Updated dependencies [9b67742]
- Updated dependencies [3451d52]
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
  - create-triplex-project@0.70.2
  - @triplex/client@0.70.0
  - @triplex/editor@0.69.9

## 0.69.8

### Patch Changes

- Updated dependencies [51d16cd]
- Updated dependencies [8752e68]
- Updated dependencies [b1b39e7]
- Updated dependencies [91ae968]
- Updated dependencies [7493473]
- Updated dependencies [dbab960]
- Updated dependencies [9255c16]
  - @triplex/client@0.69.8
  - @triplex/editor@0.69.8

## 0.69.7

### Patch Changes

- cf929fe: Sentry error logging is fixed.
- Updated dependencies [08f61b5]
- Updated dependencies [0393dfd]
- Updated dependencies [726094c]
- Updated dependencies [b11fe78]
- Updated dependencies [84f8a37]
  - @triplex/server@0.70.1
  - @triplex/editor@0.69.7
  - @triplex/client@0.69.7

## 0.69.6

### Patch Changes

- 14747d4: Camera Controls now default to default camera.
- Updated dependencies [14747d4]
- Updated dependencies [7bbc4a2]
- Updated dependencies [7bbc4a2]
- Updated dependencies [2412af5]
- Updated dependencies [31e7812]
- Updated dependencies [a1a782c]
- Updated dependencies [d38608f]
  - @triplex/editor@0.69.6
  - create-triplex-project@0.70.1
  - @triplex/server@0.70.0
  - @triplex/client@0.69.6

## 0.69.5

### Patch Changes

- 652c1cc: Remove dialog message mentioning the Triplex config when opening a project as it's no longer needed.
- 652c1cc: You can now select a specific template when creating a new project.
- 652c1cc: Remove initialize option from project creation. Only creating a new project is supported.
- 652c1cc: Update package json meta.
- Updated dependencies [652c1cc]
- Updated dependencies [652c1cc]
- Updated dependencies [96c8cb1]
- Updated dependencies [96c8cb1]
- Updated dependencies [652c1cc]
- Updated dependencies [652c1cc]
- Updated dependencies [652c1cc]
  - create-triplex-project@0.70.0
  - @triplex/server@0.69.3
  - @triplex/editor@0.69.5
  - @triplex/client@0.69.5

## 0.69.4

### Patch Changes

- 73db08f: Sentry is now only enabled in production.
- Updated dependencies [2ff6b88]
- Updated dependencies [c6630d2]
- Updated dependencies [73db08f]
  - create-triplex-project@0.69.3
  - @triplex/client@0.69.4
  - @triplex/editor@0.69.4

## 0.69.3

### Patch Changes

- 2986748: Set up new Sentry project.
- Updated dependencies [2986748]
  - @triplex/editor@0.69.3
  - @triplex/client@0.69.3

## 0.69.2

### Patch Changes

- 967bfbd0: Upgrade vite to v5.
- Updated dependencies [967bfbd0]
  - @triplex/client@0.69.2
  - @triplex/editor@0.69.2
  - @triplex/server@0.69.2
  - create-triplex-project@0.69.2

## 0.69.1

### Patch Changes

- 26e30829: Upgrade Electron to v32.
- 50c28c96: Upgrade tsc.
- Updated dependencies [50c28c96]
- Updated dependencies [060f66ac]
  - create-triplex-project@0.69.1
  - @triplex/client@0.69.1
  - @triplex/editor@0.69.1
  - @triplex/server@0.69.1

## 0.69.0

### Patch Changes

- Updated dependencies [fd4fa16f]
- Updated dependencies [740ff8f2]
  - @triplex/editor@0.69.0
  - @triplex/client@0.69.0
  - @triplex/server@0.69.0
  - create-triplex-project@0.69.0

## 0.68.8

### Patch Changes

- Updated dependencies [54a59b63]
  - @triplex/server@0.68.8
  - @triplex/client@0.68.8
  - @triplex/editor@0.68.8
  - create-triplex-project@0.68.8

## 0.68.7

### Patch Changes

- @triplex/client@0.68.7
- @triplex/editor@0.68.7
- @triplex/server@0.68.7
- create-triplex-project@0.68.7

## 0.68.6

### Patch Changes

- @triplex/editor@0.68.6
- @triplex/client@0.68.6
- @triplex/server@0.68.6
- create-triplex-project@0.68.6

## 0.68.5

### Patch Changes

- @triplex/editor@0.68.5
- @triplex/client@0.68.5
- @triplex/server@0.68.5
- create-triplex-project@0.68.5

## 0.68.4

### Patch Changes

- Updated dependencies [d78010e0]
- Updated dependencies [d78010e0]
  - @triplex/server@0.68.4
  - @triplex/client@0.68.4
  - @triplex/editor@0.68.4
  - create-triplex-project@0.68.4

## 0.68.3

### Patch Changes

- @triplex/editor@0.68.3
- @triplex/client@0.68.3
- @triplex/server@0.68.3
- create-triplex-project@0.68.3

## 0.68.2

### Patch Changes

- @triplex/client@0.68.2
- @triplex/editor@0.68.2
- @triplex/server@0.68.2
- create-triplex-project@0.68.2

## 0.68.1

### Patch Changes

- Updated dependencies [6a1ca455]
  - @triplex/editor@0.68.1
  - @triplex/client@0.68.1
  - @triplex/server@0.68.1
  - create-triplex-project@0.68.1

## 0.68.0

### Patch Changes

- Updated dependencies [dd99789a]
- Updated dependencies [60ee4011]
  - @triplex/editor@0.68.0
  - @triplex/client@0.68.0
  - @triplex/server@0.68.0
  - create-triplex-project@0.68.0

## 0.67.9

### Patch Changes

- Updated dependencies [0af90052]
- Updated dependencies [0af90052]
  - @triplex/editor@0.67.9
  - @triplex/client@0.67.9
  - @triplex/server@0.67.9
  - create-triplex-project@0.67.9

## 0.67.8

### Patch Changes

- @triplex/client@0.67.8
- @triplex/editor@0.67.8
- @triplex/server@0.67.8
- create-triplex-project@0.67.8

## 0.67.7

### Patch Changes

- 23eaef8a: Fix compound hotkeys in electron not being functional.
- Updated dependencies [e958b697]
  - @triplex/server@0.67.7
  - @triplex/client@0.67.7
  - @triplex/editor@0.67.7
  - create-triplex-project@0.67.7

## 0.67.6

### Patch Changes

- Updated dependencies [050e5845]
  - @triplex/server@0.67.6
  - @triplex/client@0.67.6
  - @triplex/editor@0.67.6
  - create-triplex-project@0.67.6

## 0.67.5

### Patch Changes

- Updated dependencies [1ba572ca]
- Updated dependencies [a1121431]
- Updated dependencies [85eec02a]
  - @triplex/server@0.67.5
  - @triplex/editor@0.67.5
  - @triplex/client@0.67.5
  - create-triplex-project@0.67.5

## 0.67.4

### Patch Changes

- Updated dependencies [cba1c8db]
- Updated dependencies [abbbf7c9]
- Updated dependencies [cde561dc]
- Updated dependencies [08f3d647]
  - @triplex/editor@0.67.4
  - @triplex/client@0.67.4
  - @triplex/server@0.67.4
  - create-triplex-project@0.67.4

## 0.67.3

### Patch Changes

- Updated dependencies [ba66926c]
- Updated dependencies [b8b97458]
  - @triplex/editor@0.67.3
  - @triplex/client@0.67.3
  - @triplex/server@0.67.3
  - create-triplex-project@0.67.3

## 0.67.2

### Patch Changes

- 264dca9: Remove get config invariant when opening a project.
- Updated dependencies [506ba7e]
- Updated dependencies [264dca9]
- Updated dependencies [264dca9]
  - @triplex/server@0.67.2
  - @triplex/client@0.67.2
  - @triplex/editor@0.67.2
  - create-triplex-project@0.67.2

## 0.67.1

### Patch Changes

- Updated dependencies [e841a67]
  - @triplex/editor@0.67.1
  - @triplex/client@0.67.1
  - @triplex/server@0.67.1
  - create-triplex-project@0.67.1

## 0.67.0

### Patch Changes

- Updated dependencies [f14b92b]
- Updated dependencies [55ecc10]
- Updated dependencies [b4886f6]
- Updated dependencies [6f3d8de]
- Updated dependencies [2ca7cbe]
- Updated dependencies [3343fad]
  - @triplex/editor@0.67.0
  - create-triplex-project@0.67.0
  - @triplex/server@0.67.0
  - @triplex/client@0.67.0

## 0.66.0

### Minor Changes

- 625e23a: The selection system has been reimplemented, removing the need for intermediate group elements powering scene lookups.

### Patch Changes

- e794908: Fix links and body copy for component controls panel.
- Updated dependencies [346cb79]
- Updated dependencies [3179ed6]
- Updated dependencies [e794908]
- Updated dependencies [625e23a]
  - @triplex/editor@0.66.0
  - @triplex/client@0.66.0
  - @triplex/server@0.66.0
  - create-triplex-project@0.66.0

## 0.65.2

### Patch Changes

- Updated dependencies [c1a986d]
  - @triplex/client@0.65.2
  - @triplex/editor@0.65.2
  - @triplex/server@0.65.2
  - create-triplex-project@0.65.2

## 0.65.1

### Patch Changes

- @triplex/client@0.65.1
- @triplex/editor@0.65.1
- @triplex/server@0.65.1
- create-triplex-project@0.65.1

## 0.65.0

### Patch Changes

- Updated dependencies [29c9d95]
  - @triplex/editor@0.65.0
  - @triplex/client@0.65.0
  - @triplex/server@0.65.0
  - create-triplex-project@0.65.0

## 0.64.4

### Patch Changes

- 0393817: Fix triplex folder passing config precondition with no config file.
- 50dc97a: Fix resolving union labels throwing unexpectedly for some elements.
- Updated dependencies [a66604b]
- Updated dependencies [1df7cc9]
- Updated dependencies [50dc97a]
- Updated dependencies [6ed3037]
  - @triplex/editor@0.64.4
  - @triplex/server@0.64.4
  - @triplex/client@0.64.4
  - create-triplex-project@0.64.4

## 0.64.3

### Patch Changes

- Updated dependencies [1d9c390]
  - @triplex/client@0.64.3
  - @triplex/editor@0.64.3
  - @triplex/server@0.64.3
  - create-triplex-project@0.64.3

## 0.64.2

### Patch Changes

- Updated dependencies [26ac612]
  - @triplex/client@0.64.2
  - @triplex/editor@0.64.2
  - @triplex/server@0.64.2
  - create-triplex-project@0.64.2

## 0.64.1

### Patch Changes

- Updated dependencies [835639f]
  - @triplex/client@0.64.1
  - @triplex/editor@0.64.1
  - @triplex/server@0.64.1
  - create-triplex-project@0.64.1

## 0.64.0

### Minor Changes

- 0868337: Add support for SharedBufferArray.
- 0868337: Add `define` variables support.

### Patch Changes

- 777b2f5: Improve UI/UX of error screen shown when loading a project fails, now showing the actual error message.
- Updated dependencies [f0444d6]
- Updated dependencies [777b2f5]
- Updated dependencies [8712a12]
- Updated dependencies [a153ee8]
- Updated dependencies [0868337]
- Updated dependencies [0868337]
- Updated dependencies [0868337]
- Updated dependencies [f0444d6]
- Updated dependencies [a153ee8]
- Updated dependencies [dca6003]
- Updated dependencies [f0444d6]
- Updated dependencies [6a65504]
- Updated dependencies [f0444d6]
- Updated dependencies [a153ee8]
- Updated dependencies [777b2f5]
- Updated dependencies [09d435f]
- Updated dependencies [9567579]
  - @triplex/editor@0.64.0
  - @triplex/client@0.64.0
  - @triplex/server@0.64.0
  - create-triplex-project@0.64.0

## 0.63.0

### Minor Changes

- 0b5fb14: Add manifest to renderers.
- 4c48d66: Add host element declarations to renderer manifest.

### Patch Changes

- 480866f: Upgrade TypeScript.
- Updated dependencies [8eddebb]
- Updated dependencies [8eddebb]
- Updated dependencies [0b5fb14]
- Updated dependencies [4c48d66]
- Updated dependencies [a81b79a]
- Updated dependencies [8eddebb]
- Updated dependencies [480866f]
  - @triplex/editor@0.63.0
  - @triplex/client@0.63.0
  - @triplex/server@0.63.0
  - create-triplex-project@0.63.0

## 0.62.0

### Minor Changes

- 273c586: Create / open project flow has had its UX changed to improve understanding what is actually happening.
- 0909731: Add Linux support.
- 3612434: Add thumbnail support for renderers.

### Patch Changes

- bad0a57: Triplex now finds random open ports every time a project is opened instead of using hardcoded ones.
- 0de7465: Saving files outside of the project folder is now presented with an error message instead of an exception.
- cea76c2: Simplify bridge event names.
- 547c72d: Finding Triplex config when opening a project now stops when getting to the root directory instead of going forever.
- 2ec38a1: Fix ide link not opening.
- 4e9e389: Open project modal is now tied to a browser window if available.
- 0909731: Fix hotkeys firing when they shouldn't.
- 0ab691d: Inputs no-longer fire accelerators when focused.
- Updated dependencies [bad0a57]
- Updated dependencies [cea76c2]
- Updated dependencies [11a548a]
- Updated dependencies [b629d57]
- Updated dependencies [e2608a8]
- Updated dependencies [273c586]
- Updated dependencies [0909731]
- Updated dependencies [99b97cf]
- Updated dependencies [490aaf1]
- Updated dependencies [b629d57]
- Updated dependencies [0909731]
- Updated dependencies [1d7e53f]
- Updated dependencies [cdbdc16]
- Updated dependencies [3612434]
- Updated dependencies [c2a0640]
- Updated dependencies [7313788]
- Updated dependencies [fe7c5f9]
  - @triplex/client@0.62.0
  - @triplex/editor@0.62.0
  - @triplex/server@0.62.0
  - create-triplex-project@0.62.0

## 0.61.2

### Patch Changes

- Updated dependencies [b8bd0e0]
- Updated dependencies [b8bd0e0]
- Updated dependencies [273b644]
- Updated dependencies [4a40243]
- Updated dependencies [4a40243]
- Updated dependencies [e522b42]
  - @triplex/editor@0.61.2
  - create-triplex-project@0.61.2
  - @triplex/client@0.61.2
  - @triplex/server@0.61.2

## 0.61.1

### Patch Changes

- Updated dependencies [6c887c4]
- Updated dependencies [8e565d9]
  - @triplex/editor@0.61.1
  - @triplex/server@0.61.1
  - @triplex/client@0.61.1
  - create-triplex-project@0.61.1

## 0.61.0

### Minor Changes

- 3920fd3: Scene elements can now be moved before/after/into other scene elements with drag and drop.
- 5299234: Add open file button to tabs.

### Patch Changes

- 5299234: Titlebar now goes partially transparent when inactive.
- 5ceb4de: Upgrade electron dependencies.
- 755e39a: Triplex now traverses up the folder path to see if it can open a project.
- 4664b3c: Fix initial open throwing when no exports were found.
- 5efeea0: Normalize paths using upath instead of node built-in.
- b407820: Add hotkeys for file tabs.
- 755e39a: Open project flow now allows you to create a project without going back to the welcome screen
- Updated dependencies [5299234]
- Updated dependencies [d583e42]
- Updated dependencies [d583e42]
- Updated dependencies [d583e42]
- Updated dependencies [3920fd3]
- Updated dependencies [d583e42]
- Updated dependencies [b407820]
- Updated dependencies [b407820]
- Updated dependencies [2f569d5]
- Updated dependencies [af8c06e]
- Updated dependencies [af8c06e]
- Updated dependencies [5299234]
- Updated dependencies [5efeea0]
- Updated dependencies [b407820]
- Updated dependencies [ab35f91]
- Updated dependencies [cba2b47]
- Updated dependencies [3091229]
  - @triplex/editor@0.61.0
  - @triplex/server@0.61.0
  - @triplex/client@0.61.0
  - create-triplex-project@0.61.0

## 0.60.1

### Patch Changes

- e2fc746: App now bundled into a single file.
- Updated dependencies [b82d12e]
- Updated dependencies [13964df]
  - @triplex/editor@0.60.1
  - @triplex/client@0.60.1
  - @triplex/server@0.60.1
  - create-triplex-project@0.60.1

## 0.60.0

### Patch Changes

- Updated dependencies [000008d]
- Updated dependencies [7a250ba]
- Updated dependencies [722ac20]
- Updated dependencies [b42550f]
- Updated dependencies [b42550f]
- Updated dependencies [eb37a51]
- Updated dependencies [0cce596]
- Updated dependencies [000008d]
- Updated dependencies [0cce596]
- Updated dependencies [000008d]
- Updated dependencies [7a250ba]
  - @triplex/client@0.60.0
  - @triplex/editor@0.60.0
  - @triplex/server@0.60.0
  - create-triplex-project@0.60.0

## 0.59.1

### Patch Changes

- Updated dependencies [f899ef0]
  - create-triplex-project@0.59.1
  - @triplex/client@0.59.1
  - @triplex/editor@0.59.1
  - @triplex/server@0.59.1

## 0.59.0

### Minor Changes

- 26bd068: Scene modules are now loaded remotely instead of from the fs. This is going to raise the ceiling on features we can implement as now everything becomes a mutation to the remote source instead of that AND also trying to handle the intermediate state in the scene prior to it being flushed to the fs. Super excited about this.

### Patch Changes

- 1d70f2b: An error screen is now presented to users when Triplex fails to start up a project.
- 75073e7: Editor now shows a loading screen prior to the project being successfully loaded.
- Updated dependencies [2194c85]
- Updated dependencies [ce8a108]
- Updated dependencies [ce8a108]
- Updated dependencies [26bd068]
- Updated dependencies [f2d612b]
- Updated dependencies [1d70f2b]
- Updated dependencies [8dd7cd1]
- Updated dependencies [75073e7]
- Updated dependencies [ce8a108]
- Updated dependencies [26bd068]
- Updated dependencies [f6e068c]
  - @triplex/editor@0.59.0
  - @triplex/server@0.59.0
  - @triplex/client@0.59.0
  - create-triplex-project@0.59.0

## 0.58.2

### Patch Changes

- b5247c2: Apply lint and prettier fixes.
- Updated dependencies [85447c2]
- Updated dependencies [85447c2]
- Updated dependencies [b5247c2]
- Updated dependencies [85447c2]
  - create-triplex-project@0.58.2
  - @triplex/editor@0.58.2
  - @triplex/server@0.58.2
  - @triplex/client@0.58.2

## 0.58.1

### Patch Changes

- Updated dependencies [e645e5c]
- Updated dependencies [f1656e0]
  - @triplex/editor@0.58.1
  - @triplex/server@0.58.1
  - @triplex/client@0.58.1
  - create-triplex-project@0.58.1

## 0.58.0

### Minor Changes

- 37bf36d: Add provider props as config to the ui.

### Patch Changes

- Updated dependencies [3e1e081]
- Updated dependencies [37bf36d]
- Updated dependencies [221e6a7]
- Updated dependencies [37849fe]
- Updated dependencies [3e1e081]
- Updated dependencies [3e1e081]
- Updated dependencies [3e1e081]
  - @triplex/server@0.58.0
  - @triplex/editor@0.58.0
  - @triplex/client@0.58.0
  - create-triplex-project@0.58.0

## 0.57.2

### Patch Changes

- Updated dependencies [f5bbeda]
- Updated dependencies [f5bbeda]
  - @triplex/editor@0.57.2
  - @triplex/server@0.57.2
  - @triplex/client@0.57.2
  - create-triplex-project@0.57.2

## 0.57.1

### Patch Changes

- Updated dependencies [d32cf94]
  - @triplex/client@0.57.1
  - @triplex/editor@0.57.1
  - @triplex/server@0.57.1
  - create-triplex-project@0.57.1

## 0.57.0

### Patch Changes

- 2b61384: The welcome screen is no longer resizable.
- Updated dependencies [5c1fc3d]
- Updated dependencies [046cf78]
- Updated dependencies [6da8bae]
- Updated dependencies [628646e]
- Updated dependencies [7673ae8]
- Updated dependencies [2b61384]
- Updated dependencies [bcf7cae]
- Updated dependencies [730fa7c]
- Updated dependencies [5c7ba21]
- Updated dependencies [2b61384]
- Updated dependencies [628646e]
  - @triplex/editor@0.57.0
  - @triplex/server@0.57.0
  - @triplex/client@0.57.0
  - create-triplex-project@0.57.0

## 0.56.1

### Patch Changes

- Updated dependencies [baf33b9]
  - @triplex/server@0.56.1
  - @triplex/client@0.56.1
  - @triplex/editor@0.56.1
  - create-triplex-project@0.56.1

## 0.56.0

### Patch Changes

- 2e53a2e: Turn off type declaration maps.
- Updated dependencies [3724bf9]
- Updated dependencies [463789f]
- Updated dependencies [d674f26]
- Updated dependencies [5f7e78f]
- Updated dependencies [47483b9]
- Updated dependencies [32a110f]
- Updated dependencies [2e53a2e]
- Updated dependencies [47483b9]
  - @triplex/server@0.56.0
  - @triplex/editor@0.56.0
  - @triplex/client@0.56.0
  - create-triplex-project@0.56.0

## 0.55.3

### Patch Changes

- Updated dependencies [cd3efc1]
  - create-triplex-project@0.55.3
  - @triplex/client@0.55.3
  - @triplex/editor@0.55.3
  - @triplex/server@0.55.3

## 0.55.2

### Patch Changes

- Updated dependencies [ed3ef0a]
  - @triplex/server@0.55.2
  - @triplex/client@0.55.2
  - @triplex/editor@0.55.2
  - create-triplex-project@0.55.2

## 0.55.1

### Patch Changes

- ea86fdc: Add license banner.
- b3d2fa9: Number input no longer calls change and confirm handlers if the value is outside the min/max range.
- Updated dependencies [ea86fdc]
- Updated dependencies [b3d2fa9]
  - create-triplex-project@0.55.1
  - @triplex/client@0.55.1
  - @triplex/editor@0.55.1
  - @triplex/server@0.55.1

## 0.55.0

### Patch Changes

- ab909b4: Consoldate config into a single module.
- 613cdd8: Stop copying unneeded files into the electron app.
- Updated dependencies [3be2782]
- Updated dependencies [3be2782]
- Updated dependencies [ab909b4]
- Updated dependencies [b6970aa]
- Updated dependencies [ab909b4]
- Updated dependencies [4fa9018]
- Updated dependencies [f7d2d9a]
- Updated dependencies [44faed1]
- Updated dependencies [b6970aa]
  - @triplex/editor@0.55.0
  - @triplex/server@0.55.0
  - @triplex/client@0.55.0
  - create-triplex-project@0.55.0

## 0.54.2

### Patch Changes

- Updated dependencies [a060d2c]
- Updated dependencies [9100a37]
  - @triplex/server@0.54.2
  - @triplex/editor@0.54.2
  - @triplex/client@0.54.2
  - create-triplex-project@0.54.2

## 0.54.1

### Patch Changes

- a2a8d1e: The welcome screen is now closed as early as possible instead of waiting for the scene to completly open.
- Updated dependencies [d58e0b0]
- Updated dependencies [8afea84]
- Updated dependencies [ad66cc8]
- Updated dependencies [76fd3f3]
- Updated dependencies [cdd6234]
- Updated dependencies [cdd6234]
- Updated dependencies [76fd3f3]
- Updated dependencies [f77c830]
  - @triplex/editor@0.54.1
  - @triplex/client@0.54.1
  - @triplex/server@0.54.1
  - create-triplex-project@0.54.1

## 0.54.0

### Minor Changes

- c9fcf24: Template used during project creation now decides how to configure based on app or node.

### Patch Changes

- Updated dependencies [e0038f6]
- Updated dependencies [8fad65a]
- Updated dependencies [e0038f6]
- Updated dependencies [c9fcf24]
  - @triplex/editor@0.54.0
  - create-triplex-project@0.54.0
  - @triplex/client@0.54.0
  - @triplex/server@0.54.0

## 0.53.1

### Patch Changes

- c891574: Replace hardcoded PATH environment variable with values from `shell-env`.
- Updated dependencies [c891574]
  - create-triplex-project@0.53.1
  - @triplex/client@0.53.1
  - @triplex/editor@0.53.1
  - @triplex/server@0.53.1

## 0.53.0

### Minor Changes

- b488d29: When installing dependencies a dialog is presented to select a package manager if it could not be inferred.

### Patch Changes

- 399953b: Adds homebrew to path for dependency installation.
- b488d29: Fix installing dependencies with yarn.
- Updated dependencies [aa3a982]
- Updated dependencies [399953b]
- Updated dependencies [aa3a982]
- Updated dependencies [aa3a982]
- Updated dependencies [bddac75]
- Updated dependencies [aa3a982]
- Updated dependencies [049ac2c]
- Updated dependencies [c71412b]
  - @triplex/editor@0.53.0
  - create-triplex-project@0.53.0
  - @triplex/server@0.53.0
  - @triplex/client@0.53.0

## 0.52.0

### Minor Changes

- fe90482: Logs are now accessible through the View > Logs menubar action.

### Patch Changes

- 8f73338: Windows notifications will now display the correct app name.
- fe90482: Errors during project creation now bubble up and are exposed to users.
- 16bf49e: When calling `exec` nvm's potential location is now accounted for.
- fe90482: Errors during dependency installation now bubble up and are exposed to users.
- fe90482: The `/usr/local/bin` folder is now forcibly exposed on the PATH environment variable when executing shell commands.
- Updated dependencies [48016ba]
- Updated dependencies [16d2c14]
- Updated dependencies [fe90482]
- Updated dependencies [8d532f5]
- Updated dependencies [120f9ef]
  - @triplex/editor@0.52.0
  - create-triplex-project@0.52.0
  - @triplex/client@0.52.0
  - @triplex/server@0.52.0

## 0.51.1

### Patch Changes

- @triplex/client@0.51.1
- @triplex/editor@0.51.1
- @triplex/server@0.51.1
- create-triplex-project@0.51.1

## 0.51.0

### Minor Changes

- b61dc2a: The editor menu bar is now displayed in the title bar for Windows and Node.js.

### Patch Changes

- b61dc2a: The title bar overlay now has a dark background and white text.
- b61dc2a: Menu bar events now originate from the editor source instead of being some in the electron app and some in the editor.
- Updated dependencies [c97e359]
- Updated dependencies [b61dc2a]
- Updated dependencies [b61dc2a]
- Updated dependencies [b61dc2a]
- Updated dependencies [c97e359]
  - @triplex/server@0.51.0
  - @triplex/editor@0.51.0
  - @triplex/client@0.51.0
  - create-triplex-project@0.51.0

## 0.50.1

### Patch Changes

- dfced86: Distributable now comes with an icon.
- Updated dependencies [a101545]
  - @triplex/server@0.50.1
  - @triplex/client@0.50.1
  - @triplex/editor@0.50.1
  - create-triplex-project@0.50.1

## 0.50.0

### Minor Changes

- 8ea575b: Built output is now mangled.

### Patch Changes

- Updated dependencies [8ea575b]
  - @triplex/client@0.50.0
  - create-triplex-project@0.50.0
  - @triplex/editor@0.50.0
  - @triplex/server@0.50.0

## 0.49.0

### Minor Changes

- 3eae131: When installing deps fails a learn more button is now available to help troubleshoot.
- f2be7c9: Windows now also targets 32 bit nsis installer.
- 3eae131: Welcome screen now shows a progress bar when installing node modules.
- 8c5611d: Adds create project action to the welcome screen.

### Patch Changes

- 3eae131: Dependency installation is now aborted when opening another project
- Updated dependencies [8c5611d]
- Updated dependencies [9f0fa17]
- Updated dependencies [9f0fa17]
- Updated dependencies [3eae131]
- Updated dependencies [8c5611d]
- Updated dependencies [3eae131]
  - create-triplex-project@0.49.0
  - @triplex/editor@0.49.0
  - @triplex/client@0.49.0
  - @triplex/server@0.49.0

## 0.48.0

### Minor Changes

- 6fe34af: Windows support is here. Now Triplex cli and electron can be ran on Windows, as well as the local dev loop now being functional.
- 5b189b2: When opening a project for the first time if node modules is missing Triplex will try to install missing dependencies.

### Patch Changes

- Updated dependencies [6fe34af]
  - @triplex/client@0.48.0
  - @triplex/editor@0.48.0
  - @triplex/server@0.48.0

## 0.47.0

### Minor Changes

- daa2697: Adds a welcome screen to the electron app.
- 1fc7657: Menu bar is now native when ran in the electron app.
- 1fc7657: Electron app now uses a custom title bar.
- 1fc7657: Menu bar now contains view, window, and help.
- e8cf76f: Adds native save dialog support.
- 4164026: Add support for the scene to know what environment it is running in (either web or electron).
- daa2697: When opening a project the first found file and export are now immediately opened.

### Patch Changes

- Updated dependencies [daa2697]
- Updated dependencies [1fc7657]
- Updated dependencies [1fc7657]
- Updated dependencies [1fc7657]
- Updated dependencies [4164026]
- Updated dependencies [1fc7657]
- Updated dependencies [e8cf76f]
- Updated dependencies [1fc7657]
- Updated dependencies [e8cf76f]
- Updated dependencies [4164026]
- Updated dependencies [4164026]
  - @triplex/editor@0.47.0
  - @triplex/client@0.47.0
  - @triplex/server@0.47.0

## 0.46.4

### Patch Changes

- 59301bf: The macOS target now is notarized during release.
  - @triplex/client@0.46.4
  - @triplex/editor@0.46.4
  - @triplex/server@0.46.4

## 0.46.3

### Patch Changes

- 275d931: Adds error reporting.
- d4c6ce4: Now builds missing x64 architecture.
  - @triplex/client@0.46.3
  - @triplex/editor@0.46.3
  - @triplex/server@0.46.3

## 0.46.2

### Patch Changes

- cab4585: Force version bump.
  - @triplex/client@0.46.2
  - @triplex/editor@0.46.2
  - @triplex/server@0.46.2

## 0.46.1

### Patch Changes

- 111fd6c: Release action now looks for the create tag event.
  - @triplex/client@0.46.1
  - @triplex/editor@0.46.1
  - @triplex/server@0.46.1

## 0.46.0

### Minor Changes

- d67f998: The built electron app now can actually be ran on macOS.
- d67f998: Replaced electron-forge with electron-builder.
- d6dedf5: Moves logger to electron-logger.

### Patch Changes

- Updated dependencies [d67f998]
- Updated dependencies [c808957]
  - @triplex/client@0.46.0
  - @triplex/editor@0.46.0
  - @triplex/server@0.46.0

## 0.45.1

### Patch Changes

- @triplex/client@0.45.1
- @triplex/server@0.45.1

## 0.45.0

### Minor Changes

- 1aadeb8: App now marked as private.

### Patch Changes

- @triplex/client@0.45.0
- @triplex/server@0.45.0

## 0.44.0

### Patch Changes

- Updated dependencies [0242833]
- Updated dependencies [5039e39]
- Updated dependencies [4d8d9cc]
- Updated dependencies [5039e39]
- Updated dependencies [557648e]
  - @triplex/client@0.44.0
  - @triplex/server@0.44.0
