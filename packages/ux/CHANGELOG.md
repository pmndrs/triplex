# @triplex/ux

## 0.72.2

## 0.69.33

### Patch Changes

- Updated dependencies [a7a0138]
  - @triplex/lib@0.69.19

## 0.69.32

### Patch Changes

- Updated dependencies [46b8c74]
  - @triplex/bridge@0.70.12

## 0.69.31

### Patch Changes

- 0d0e459: The tuple input now immediately applies changes by setting default values to empty required values where appropriate. This will be rolled out over time, if you would like to get this fix early please message on Discord.

## 0.69.30

### Patch Changes

- Updated dependencies [9add655]
  - @triplex/lib@0.69.18

## 0.69.29

### Patch Changes

- Updated dependencies [b229047]
  - @triplex/bridge@0.70.11

## 0.69.28

### Patch Changes

- e736aab: The number input now needs to be dragged by a distance before changes are picked up, preventing accidental drags when trying to click into the input.

## 0.69.27

### Patch Changes

- 1e2a753: Tuple inputs no longer get set to `undefined` when entering a number tuple with all values as `0`, e.g. `[0,0,0]`.
- Updated dependencies [0cbd424]
  - @triplex/bridge@0.70.10

## 0.69.26

### Patch Changes

- 689d15f: Fix select menus not having the correct color scheme for the users theme.
- Updated dependencies [82103a4]
- Updated dependencies [55feda2]
  - @triplex/lib@0.69.17

## 0.69.25

### Patch Changes

- e447108: Add experimental debug data api behind a feature gate.
- Updated dependencies [e447108]
  - @triplex/bridge@0.70.9

## 0.69.24

### Patch Changes

- ae60a8f: Upgrade typescript.
- Updated dependencies [8c82aca]
- Updated dependencies [ae60a8f]
- Updated dependencies [8c82aca]
  - @triplex/bridge@0.70.8
  - @triplex/lib@0.69.16

## 0.69.23

### Patch Changes

- b30f3df: Add resizable panel to ai chat.

## 0.69.22

### Patch Changes

- Updated dependencies [3fd23e3]
  - @triplex/bridge@0.70.7

## 0.69.21

### Patch Changes

- Updated dependencies [839e91e]
  - @triplex/lib@0.69.15

## 0.69.20

### Patch Changes

- Updated dependencies [abf48b9]
  - @triplex/lib@0.69.14

## 0.69.19

### Patch Changes

- Updated dependencies [cfd4a6f]
  - @triplex/bridge@0.70.6

## 0.69.18

### Patch Changes

- 2301fd1: Drop unwanted files when publishing.
- Updated dependencies [2301fd1]
  - @triplex/bridge@0.70.5
  - @triplex/lib@0.69.13

## 0.69.17

### Patch Changes

- Updated dependencies [c06f199]
  - @triplex/lib@0.69.12

## 0.69.16

### Patch Changes

- 01a2e6d: A feedback dialog is now available in the scene floating controls.
- Updated dependencies [b6ef6c2]
  - @triplex/bridge@0.70.4

## 0.69.15

### Patch Changes

- Updated dependencies [088c699]
  - @triplex/bridge@0.70.3

## 0.69.14

### Patch Changes

- Updated dependencies [711322a]
  - @triplex/lib@0.69.11

## 0.69.13

### Patch Changes

- Updated dependencies [37eb94d]
  - @triplex/bridge@0.70.2

## 0.69.12

### Patch Changes

- 85054ef: String and number inputs now show their type as a placeholder even when a label is defined. For example previously it would show as "label", now it shows as "label (number)" / "label (string)" where appropriate.
- a5d2390: React 19 / Three Fiber 9 are now supported.
- Updated dependencies [a5d2390]
  - @triplex/bridge@0.70.1
  - @triplex/lib@0.69.10

## 0.69.11

### Patch Changes

- 9b15541: Fix logo curvature.
- Updated dependencies [9b15541]
  - @triplex/lib@0.69.9

## 0.69.10

### Patch Changes

- Updated dependencies [095c729]
  - @triplex/lib@0.69.8

## 0.69.9

### Patch Changes

- e4db0c2: Upgrade TypeScript to latest.
- Updated dependencies [4e8c285]
- Updated dependencies [e4db0c2]
- Updated dependencies [4e8c285]
- Updated dependencies [93761c7]
  - @triplex/bridge@0.70.0
  - @triplex/lib@0.69.7

## 0.69.8

### Patch Changes

- Updated dependencies [51d16cd]
- Updated dependencies [b1b39e7]
- Updated dependencies [7493473]
- Updated dependencies [7493473]
  - @triplex/bridge@0.69.5
  - @triplex/lib@0.69.6

## 0.69.7

### Patch Changes

- 8c56ae8: Fix number input drag behavior.
- b11fe78: Tuple inputs now show invalid state when partially filled out and some required items are missing.
- f8a755c: When cycling through prop types in the union input it will be scrolled into view if required.
- b11fe78: Add invalid state to all prop controls.
- d0cddb1: Number inputs now correctly round to the nearest step value.
- b11fe78: Union inputs now respect default values set on props.
- b11fe78: Fix tuple inputs behavior when required / optional.
- 726094c: Upgrade react-compiler.
- b11fe78: Tuple inputs now respect default values set on props.
- b11fe78: Boolean input now respects default values set on props.
- 4eacf57: Color input now has a checkered background when no color has been set.
- b11fe78: Literal union inputs can now be cleared through a UI selection when optional.
- 8c56ae8: Fix number input step buttons color mode.
- Updated dependencies [d0cddb1]
  - @triplex/lib@0.69.5

## 0.69.6

### Patch Changes

- Updated dependencies [d38608f]
  - @triplex/bridge@0.69.4

## 0.69.5

### Patch Changes

- 652c1cc: Update package json meta.
- Updated dependencies [652c1cc]
  - @triplex/bridge@0.69.3
  - @triplex/lib@0.69.4

## 0.69.4

### Patch Changes

- c686a64: Telemetry now tracks engagement only when the editor has focus.

## 0.69.3

### Patch Changes

- Updated dependencies [6dca038]
  - @triplex/lib@0.69.3

## 0.69.2

### Patch Changes

- @triplex/bridge@0.69.2
- @triplex/lib@0.69.2

## 0.69.1

### Patch Changes

- 50c28c96: Upgrade tsc.
- Updated dependencies [50c28c96]
  - @triplex/bridge@0.69.1
  - @triplex/lib@0.69.1

## 0.69.0

### Minor Changes

- 740ff8f2: Default editor lights can now be turned on or off through the floating controls panel. Previously they would either be always on (if you had no lights in your component) or always off (if you did have lights). Now you can choose.

### Patch Changes

- fd4fa16f: Internal refactor to consolidate extension points to use a common implementation.
- Updated dependencies [fd4fa16f]
- Updated dependencies [740ff8f2]
  - @triplex/bridge@0.69.0
  - @triplex/lib@0.69.0

## 0.68.8

### Patch Changes

- 07acd338: Fix boolean input firing on change / on confirm events more than expected when the persisted value updates.
  - @triplex/bridge@0.68.8
  - @triplex/lib@0.68.8

## 0.68.7

### Patch Changes

- @triplex/bridge@0.68.7
- @triplex/lib@0.68.7

## 0.68.6

### Patch Changes

- 4cf3e526: Fix union inputs missing descriptions.
  - @triplex/bridge@0.68.6
  - @triplex/lib@0.68.6

## 0.68.5

### Patch Changes

- b6d89da7: The string and number inputs now default to string and number placeholders when labels are undefined, respectively.
  - @triplex/bridge@0.68.5
  - @triplex/lib@0.68.5

## 0.68.4

### Patch Changes

- @triplex/bridge@0.68.4
- @triplex/lib@0.68.4

## 0.68.3

### Patch Changes

- 4ab74c91: Support default values in string, number, boolean, and literal union inputs.
- 0d97596c: Add link to code for controlled props.
- Updated dependencies [1c9c343a]
  - @triplex/lib@0.68.3
  - @triplex/bridge@0.68.3

## 0.68.2

### Patch Changes

- 1ee10f79: Fix color input setting unparsed persisted values instead of the transformed hex value.
- 1ee10f79: Color input now uses blur event instead of native change event when confirming the changed value. This fixes the default value "" being considered the same as "#000".
  - @triplex/bridge@0.68.2
  - @triplex/lib@0.68.2

## 0.68.1

### Patch Changes

- 22164772: Color input now sets value when persisted value prop changes.
- 22164772: Union input now passes along name to children inputs.
- Updated dependencies [a5df6744]
  - @triplex/lib@0.68.1
  - @triplex/bridge@0.68.1

## 0.68.0

### Minor Changes

- 60ee4011: Add none transform option. The renderer now defaults to this.

### Patch Changes

- dd99789a: Upgrade React Compiler.
- Updated dependencies [5b6671c2]
- Updated dependencies [60ee4011]
  - @triplex/lib@0.68.0
  - @triplex/bridge@0.68.0

## 0.67.9

### Patch Changes

- @triplex/bridge@0.67.9
- @triplex/lib@0.67.9

## 0.67.8

### Patch Changes

- Updated dependencies [3952a1c8]
  - @triplex/bridge@0.67.8
  - @triplex/lib@0.67.8

## 0.67.7

### Patch Changes

- @triplex/bridge@0.67.7
- @triplex/lib@0.67.7

## 0.67.6

### Patch Changes

- @triplex/bridge@0.67.6
- @triplex/lib@0.67.6

## 0.67.5

### Patch Changes

- a1121431: Vsce element controls.
- f1c507e9: Fix input bugs.
- Updated dependencies [a1121431]
  - @triplex/lib@0.67.5
  - @triplex/bridge@0.67.5

## 0.67.4

### Patch Changes

- cba1c8db: Internal pkg refactor.
- Updated dependencies [cba1c8db]
  - @triplex/lib@0.67.4
  - @triplex/bridge@0.67.4

## 0.67.3

### Patch Changes

- c9c2bd90: Initial commit.
