/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 *
 * Drop-in shim that replaces @httptoolkit/httpolyglot with plain
 * `http.createServer`. The real package multiplexes HTTP/HTTPS on one port
 * by peeking at the first byte. In a WebContainer environment we never need
 * HTTPS (cert generation fails anyway), and httpolyglot's TLS detection
 * corrupts plain HTTP responses through WebContainer's proxy.
 */
import http from "node:http";

export function createServer(_opts, requestListener) {
  // First arg is `{ cert, key }`, but we ignore it.
  return http.createServer(requestListener);
}

export default { createServer };
