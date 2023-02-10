import { useCallback, useSyncExternalStore } from "react";

const valueCache = new Map<string, unknown>();
const queryCache = new Map<
  string,
  {
    subscriptions: Function[];
    deferred: ReturnType<typeof defer>;
    ws: WebSocket;
  }
>();

function defer() {
  let resolve!: () => void;
  let reject!: () => void;

  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    reject,
    resolve,
  };
}

function wsQuery<TValue>(path: string) {
  function load() {
    if (queryCache.has(path)) {
      return;
    }

    const ws = new WebSocket("ws://localhost:3300");
    const deferred = defer();
    const subscriptions: Function[] = [];

    ws.addEventListener("open", () => {
      ws!.send(path);
    });

    ws.addEventListener("message", (e) => {
      const parsed = JSON.parse(e.data);
      valueCache.set(path, parsed);
      subscriptions.forEach((cb) => cb());
      deferred.resolve();
    });

    ws.addEventListener("error", () => {
      deferred.reject();
    });

    queryCache.set(path, {
      deferred,
      subscriptions,
      ws,
    });
  }

  function read() {
    const query = queryCache.get(path);
    if (!query) {
      throw new Error(`invariant: call load() first for ${path}`);
    }

    const value = valueCache.get(path);
    if (!value) {
      throw query.deferred.promise;
    }

    if (typeof value === "object" && "error" in value) {
      throw value.error;
    }

    return value as TValue;
  }

  function subscribe(onStoreChanged: () => void) {
    const query = queryCache.get(path);
    if (!query) {
      throw new Error(`invariant: call load() first for ${path}`);
    }

    query.subscriptions.push(onStoreChanged);

    return () => {
      const index = query.subscriptions.indexOf(onStoreChanged);
      query.subscriptions.splice(index, 1);
    };
  }

  return {
    load,
    read,
    subscribe,
  };
}

export function useLazySubscription<TSubscriptionData>(path: string) {
  const query = wsQuery<TSubscriptionData>(path);

  query.load();

  const data = useSyncExternalStore<TSubscriptionData>(
    useCallback(query.subscribe, []),
    query.read
  );

  return data;
}
