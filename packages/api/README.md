# @triplex/api

> This package is an experiment. Found it useful? Give feedback in the [Triplex Discord community](https://discord.gg/mfJJPZ4deK).

## Installation

Use your favorite package manager to install.

```bash
npm i @triplex/api
```

Update your `tsconfig.json` / `jsconfig.json` to inject global Triplex types.

```json
{
  "compilerOptions": {
    "types": ["@triplex/api/types"]
  }
}
```

## Usage

### Global Triplex API

#### `window.triplex.debug(channel: string, data: object)`

Log data to the Triplex debug panel call it whenever you want, even in frame loops. Any serializable data can be passed in the data argument.

```js
window.triplex?.debug("players", 2);
```

### Koota

Helpers for [Koota](https://github.com/pmndrs/koota) that make it easier to use with Triplex.

#### `createSystem(system: Function, args: string | object)`

```tsx
import { createSystem } from "@triplex/api/koota";
```

Creates an ECS systems to be used in conjunction with `injectSystems`. Args are optional and can be a `string` or an `object`:

- `string` — defines the system name which will then show up in provider controls. This system is always running by default. Disable by clicking the "pause(SystemName)" checkbox.
- `{ dev: boolean, name: string }` — defines the system name and declares a system as "dev". This system is paused by default. Run it by clicking the "run(SystemName)" checkbox.

#### `injectSystems(component: Function, args: System[])`

```tsx
import { injectSystem } from "@triplex/api/koota";
```

Higher-order component that injects the [canvas provider](https://triplex.dev/docs/building-your-scene/providers#canvas-provider) with systems created from `createSystem`.

These systems are:

1. Added to the frame loop and automatically run when inside Triplex.
1. Added to provider input controls enabling you to run / pause them as needed.

#### XR Support

When wanting to inject the XR store into systems import from `@triplex/api/koota/xr` instead. It has the same 1:1 API as `@triplex/api/koota` except passes the XR store into systems.
