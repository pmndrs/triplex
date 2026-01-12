# @triplex/lib

## 0.69.19

### Patch Changes

- a7a0138: fixed #356 - triplex should run offline

## 0.69.18

### Patch Changes

- 9add655: Resetting a component that renders a canvas now persists the camera settings.

## 0.69.17

### Patch Changes

- 82103a4: Upgrade statsig dependencies to the latest version.
- 55feda2: Add experimental option to the Triplex config. The first available option is "xr_editing".

## 0.69.16

### Patch Changes

- 8c82aca: Upgrade react-three dependencies.
- ae60a8f: Upgrade typescript.
- 8c82aca: Upgrade vite dependencies.

## 0.69.15

### Patch Changes

- 839e91e: A new config option "UNSAFE_viteConfig" is now available. Use it to declare custom bundler behavior that otherwise can't be handled by default behavior. See the docs here: https://triplex.dev/docs/api-reference/config-options/unsafe-vite-config.

## 0.69.14

### Patch Changes

- abf48b9: Move themes into JS module graph.

## 0.69.13

### Patch Changes

- 2301fd1: Drop unwanted files when publishing.

## 0.69.12

### Patch Changes

- c06f199: All paths now have their drive casing normalized.

## 0.69.11

### Patch Changes

- 711322a: Testing a new camera system under a feature gate. This gives you more control over what Canvas camera to view through, while also changing the default behavior for React DOM components to view through the default camera instead of the editor camera when initially opening.

## 0.69.10

### Patch Changes

- a5d2390: React 19 / Three Fiber 9 are now supported.

## 0.69.9

### Patch Changes

- 9b15541: Fix logo curvature.

## 0.69.8

### Patch Changes

- 095c729: A new loading indicator has been implemented.

## 0.69.7

### Patch Changes

- e4db0c2: Upgrade TypeScript to latest.

## 0.69.6

### Patch Changes

- 7493473: Add refresh for the scene via CommandOrCtrl+R.
- 7493473: Add hard reload for the scene via CommandOrCtrl+Shift+R.

## 0.69.5

### Patch Changes

- d0cddb1: Number inputs now correctly round to the nearest step value.

## 0.69.4

### Patch Changes

- 652c1cc: Update package json meta.

## 0.69.3

### Patch Changes

- 6dca038: Test bump.

## 0.69.2

## 0.69.1

### Patch Changes

- 50c28c96: Upgrade tsc.

## 0.69.0

## 0.68.8

## 0.68.7

## 0.68.6

## 0.68.5

## 0.68.4

## 0.68.3

### Patch Changes

- 1c9c343a: Fix input propagation hook from blocking backspace, escape, and enter keys.

## 0.68.2

## 0.68.1

### Patch Changes

- a5df6744: Block input keydown event propagation to prevent unmodified keybindings from being fired.

## 0.68.0

### Patch Changes

- 5b6671c2: Bootstrap statsig.

## 0.67.9

## 0.67.8

## 0.67.7

## 0.67.6

## 0.67.5

### Patch Changes

- a1121431: Vsce element controls.

## 0.67.4

### Patch Changes

- cba1c8db: Internal pkg refactor.
