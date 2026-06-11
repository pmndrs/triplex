/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// IndexedDB-backed LRU of WebContainer project/node_modules snapshots.
//
// Each entry is keyed by a SHA-256 hash of the project's resolved deps so
// the cache automatically invalidates when the package.json changes.
//
// Capacity is bounded by entry count: when the store exceeds MAX_ENTRIES,
// the least-recently-accessed entry is evicted before inserting the new
// one. Reads on a cache hit bump `lastAccessed` so the eviction order
// reflects actual usage, not just write order.

const DB_NAME = "triplex-folder-spike";
const STORE = "node_modules";

// Each snapshot is hundreds of MB; 4 keeps the typical cache under ~1 GB.
const MAX_ENTRIES = 4;

// Binary snapshot — the opaque format produced by
// `container.export(path, { format: "binary" })`. Smaller and faster to
// serialise than JSON for large trees (node_modules is hundreds of MB).
// The exact path semantics of mount() with a binary payload are surfaced
// at the call site via post-mount readdir diagnostics.
export type SnapshotBytes = Uint8Array;

interface CacheEntry {
  byteLength: number;
  key: string;
  lastAccessed: number;
  snapshot: SnapshotBytes;
  storedAt: number;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("handles")) {
        db.createObjectStore("handles");
      }
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function hashDeps(pkg: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}): Promise<string> {
  const stable = JSON.stringify({
    deps: sortObject(pkg.dependencies ?? {}),
    devDeps: sortObject(pkg.devDependencies ?? {}),
  });
  const buf = new TextEncoder().encode(stable);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function sortObject<T>(o: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const k of Object.keys(o).sort()) out[k] = o[k];
  return out;
}

export async function loadSnapshot(key: string): Promise<SnapshotBytes | null> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.get(key);
    req.onsuccess = () => {
      const entry = req.result as CacheEntry | undefined;
      if (!entry) return resolve(null);
      // Migrate out anything that isn't a Uint8Array (e.g. the brief
      // JSON-tree iteration). The next boot will reinstall + re-save.
      if (!(entry.snapshot instanceof Uint8Array)) {
        store.delete(key);
        return resolve(null);
      }
      // Touch lastAccessed so this entry survives the next eviction pass.
      const bumped: CacheEntry = { ...entry, lastAccessed: Date.now() };
      store.put(bumped, key);
      resolve(entry.snapshot);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveSnapshot(
  key: string,
  snapshot: SnapshotBytes,
): Promise<void> {
  const db = await open();
  // First, decide whether we need to evict. Collect lightweight metadata
  // (lastAccessed + byteLength) for every existing entry via a cursor —
  // this is cheap because IDB cursors don't materialise the snapshot
  // bytes until we ask for them via `.value`.
  const entries = await new Promise<Array<{ key: string; lastAccessed: number }>>(
    (resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const out: Array<{ key: string; lastAccessed: number }> = [];
      const cursorReq = tx.objectStore(STORE).openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) return resolve(out);
        const entry = cursor.value as CacheEntry;
        // Tolerate legacy entries without lastAccessed (e.g. from the
        // single-slot version) by treating them as oldest.
        out.push({
          key: String(cursor.key),
          lastAccessed: entry.lastAccessed ?? 0,
        });
        cursor.continue();
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    },
  );

  // Decide eviction targets. If the key we're writing already exists, it
  // counts as an in-place update and doesn't need to make room.
  const exists = entries.some((e) => e.key === key);
  const evictees: string[] = [];
  // Target population after this write:
  //   exists  -> entries.length (we're replacing, no growth)
  //   !exists -> entries.length + 1
  let projected = exists ? entries.length : entries.length + 1;
  if (projected > MAX_ENTRIES) {
    const candidates = entries
      .filter((e) => e.key !== key)
      .sort((a, b) => a.lastAccessed - b.lastAccessed);
    while (projected > MAX_ENTRIES && candidates.length > 0) {
      const victim = candidates.shift()!;
      evictees.push(victim.key);
      projected -= 1;
    }
  }

  const now = Date.now();
  const entry: CacheEntry = {
    byteLength: snapshot.byteLength,
    key,
    lastAccessed: now,
    snapshot,
    storedAt: now,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    for (const k of evictees) store.delete(k);
    store.put(entry, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearSnapshot(): Promise<void> {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Lightweight cache stats useful for surfacing in a UI. */
export async function listSnapshots(): Promise<
  Array<{ byteLength: number; key: string; lastAccessed: number; storedAt: number }>
> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const out: Array<{
      byteLength: number;
      key: string;
      lastAccessed: number;
      storedAt: number;
    }> = [];
    const cursorReq = tx.objectStore(STORE).openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor) return resolve(out);
      const entry = cursor.value as CacheEntry;
      out.push({
        byteLength: entry.byteLength ?? entry.snapshot?.byteLength ?? 0,
        key: String(cursor.key),
        lastAccessed: entry.lastAccessed ?? 0,
        storedAt: entry.storedAt ?? 0,
      });
      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}
