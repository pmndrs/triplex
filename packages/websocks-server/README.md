# @triplex/websocks-server

[![Discord](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdiscord.com%2Fapi%2Finvites%2FnBzRBUEs4b%3Fwith_counts%3Dtrue&query=%24.approximate_member_count&style=flat&colorA=000000&colorB=000000&label=discord&logo=&logoColor=000000)](https://discord.gg/mfJJPZ4deK) [![GitHub Sponsors](https://img.shields.io/github/sponsors/itsdouges?style=flat&colorA=000000&colorB=000000&label=sponsor&logo=&logoColor=000000)](https://github.com/sponsors/itsdouges)

## Installation

```bash
npm i @triplex/websocks-server
```

## Usage

```ts
// 1. Create the websocks server
import { createWSServer } from "@triplex/websocks-server";

const wss = createWSServer();

// 2. Define routes
const routes = wss.collectTypes([
  wss.route(
    "/rng/:max",
    ({ max }) => Math.round(Math.random() * Number(max)),
    (push) => {
      setInterval(() => {
        // Every 1s push a new value to the client.
        push();
      }, 1000);
    },
  ),
]);

// 3. Define events
const events = wss.collectTypes([
  tws.event<"ping", { timestamp: number }>("ping", (send) => {
    setInterval(() => {
      send({ timestamp: Date.now() });
    }, 1000);
  }),
]);

// 4. Start listening
wss.listen(3000);

// 5. Export types to use with the client
export type Routes = typeof routes;
export type Events = typeof events;
```

## API

### `createWSServer()`

Creates a typed websocket server.

#### Returns

| Name | Description |
| --- | --- |
| `close()` | Closes the server. |
| `collectTypes(TEvents[] \| TRoutes[])` | Collects types from `event()` and `route()`. |
| `route(path: string, callback: Function, initialize: Function)` | Creates a route. |
| `event(eventName: string, initialize: Function)` | Creates an event. |
| `listen(port: number)` | Listens to the declared port. |
