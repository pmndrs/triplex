# @triplex/websocks-client

[![Discord](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdiscord.com%2Fapi%2Finvites%2FnBzRBUEs4b%3Fwith_counts%3Dtrue&query=%24.approximate_member_count&style=flat&colorA=000000&colorB=000000&label=discord&logo=&logoColor=000000)](https://discord.gg/mfJJPZ4deK) [![GitHub Sponsors](https://img.shields.io/github/sponsors/itsdouges?style=flat&colorA=000000&colorB=000000&label=sponsor&logo=&logoColor=000000)](https://github.com/sponsors/itsdouges)

## Installation

```bash
npm i @triplex/websocks-client
```

## Usage

```tsx
// 1. Import the server types
import { createWSEvents } from "@triplex/websocks-client/events";
import { createWSHooks } from "@triplex/websocks-client/react";
import { type Events, type Routes } from "./server";

// 2. Declare the clients
const { preloadSubscription, useSubscription } = createWSHooks<Routes>({
  url: "ws://localhost:3000",
});

const { on } = createWSEvents<Events>({
  url: "ws://localhost:3000",
});

// 3. Preload data
preloadSubscription("/rng/:max", { max: 100 });

// 4. Subscribe to the data
function Component() {
  const value = useSubscription("/rng/:max", { max: 100 });
  return <div>{value}</div>;
}

on("ping", ({ timestamp }) => {
  console.log(timestamp);
});
```

## API

### `createWSHooks(options: Options | () => Options)`

Creates a routes client using types from the server that returns React hooks.

#### Returns

| Name | Description |
| --- | --- |
| `clearQuery(path: string, args: TArgs)` | Clears the query from the cache. |
| `preloadSubscription(path: string, args: TArgs)` | Preloads the subscription. |
| `useSubscription(path: string, args: TArgs)` | Returns the value of a preloaded subscription. |
| `useLazySubscription(path: string, args: TArgs)` | Returns the value of a subscription. |

### `createWSEvents(options: Options | () => Options)`

Creates an events client using types from the server.

#### Returns

| Name                                        | Description         |
| ------------------------------------------- | ------------------- |
| `on(eventName: string, callback: Function)` | Listen to an event. |
