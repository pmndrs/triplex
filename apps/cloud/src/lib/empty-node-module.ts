/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 *
 * Browser-side stand-in for `node:fs` and `node:os`. The Web Worker pulls
 * them in transitively (via @triplex/server), but the worker only exercises
 * pure-string helpers — anything that genuinely needs filesystem or OS
 * access throws if called, which is the right loud failure mode.
 */
const throwUnavailable = () => {
  throw new Error(
    "[empty-node-module] node:fs / node:os APIs aren't available in the browser worker",
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const target: any = new Proxy(function () {}, {
  apply: throwUnavailable,
  construct: throwUnavailable,
  get(_t, prop) {
    if (prop === "default" || prop === "__esModule") return target;
    return throwUnavailable;
  },
});

export default target;
export const promises = target;
