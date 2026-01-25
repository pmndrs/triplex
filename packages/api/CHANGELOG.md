# @triplex/api

## 0.72.5

## 0.72.4

## 0.72.3

## 0.72.2

## 0.1.4

### Patch Changes

- 86088ed: Fix createSystem function requiring tagged function.

## 0.1.3

### Patch Changes

- 3d41432: Fix build not using automatic jsx namespace.

## 0.1.2

### Patch Changes

- 6639a94: Systems are now tagged so the `injectSystem` function type errors when passed something made outside of `createSystem`.
- 6639a94: The koota helper `injectSystems` now doesn't require `@react-three/xr` on its critical path. The XR logic has been moved to a new entrypoint that has a 1:1 API: `@triplex/api/koota/xr`, use it when needing the XR store passed to your systems.

## 0.1.1

### Patch Changes

- 8ef1d5e: Types are now distributed to npm.

## 0.1.0

### Minor Changes

- e447108: Add experimental debug api.

### Patch Changes

- e447108: Add experimental debug data api behind a feature gate.
- 2de1adc: Add Koota helpers.
