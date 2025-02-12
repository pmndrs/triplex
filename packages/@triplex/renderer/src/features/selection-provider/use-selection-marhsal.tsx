/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { on } from "@triplex/bridge/client";
import { noop, useEvent } from "@triplex/lib";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { ResetCountContext } from "../scene-loader/context";
import { useSelectionStore, type SelectionListener } from "./store";
import { type SelectionState } from "./types";

type Resolver<T> = (selections: SelectionState[]) => T[];
type SelectionEvent<T> = (resolved: T) => void;

function incrementReducer(state: number) {
  return state + 1;
}

export function useSelectionMarshal<
  T extends { meta: { column: number; line: number; path: string } },
>({
  listener,
  onDeselect = noop,
  onHovered = noop,
  onSelect = noop,
  onSettled = noop,
  resolve,
}: {
  listener: SelectionListener;
  onDeselect?: SelectionEvent<T>;
  onHovered?: SelectionEvent<T>;
  onSelect?: SelectionEvent<T>;
  onSettled?: SelectionEvent<T>;
  resolve: Resolver<T>;
}) {
  const resetCount = useContext(ResetCountContext);
  const selections = useSelectionStore((store) => store.selections);
  const select = useSelectionStore((store) => store.select);
  const clear = useSelectionStore((store) => store.clear);
  const listen = useSelectionStore((store) => store.listen);
  const hovered = useSelectionStore((store) => store.hovered);
  const disabled = useSelectionStore((store) => store.disabled);
  const setDisabled = useSelectionStore((store) => store.setDisabled);
  const [resolvedSelections, setResolvedSelections] = useState<T[]>([]);
  const [resolvedHovered, setResolvedHovered] = useState<T[]>([]);
  const [resolveCount, forciblyResolve] = useReducer(incrementReducer, 0);
  const listenerEvent: SelectionListener = useEvent(listener);
  const resolverEvent: Resolver<T> = useEvent(resolve);
  const onSelectEvent: SelectionEvent<T> = useEvent(onSelect);
  const onDeselectEvent: SelectionEvent<T> = useEvent(onDeselect);
  const onHoveredEvent: SelectionEvent<T> = useEvent(onHovered);
  const onSettledEvent: SelectionEvent<T> = useEvent(onSettled);

  useEffect(() => {
    return on("request-state-change", ({ state }) => {
      const shouldClearResolvedNodes = state === "play";

      setDisabled(shouldClearResolvedNodes);

      if (shouldClearResolvedNodes) {
        setResolvedSelections([]);
        setResolvedHovered([]);
      }
    });
  }, [setDisabled]);

  useLayoutEffect(() => {
    if (resetCount > 0) {
      forciblyResolve();
    }
  }, [resetCount]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    if (selections.length === 0) {
      setResolvedSelections([]);
      return;
    }

    const resolved = resolverEvent(selections);

    setResolvedSelections(resolved);

    resolved.forEach((selection) => onSelectEvent(selection));

    return () => {
      resolved.forEach((selection) => onDeselectEvent(selection));
    };
  }, [
    selections,
    resolveCount,
    resolverEvent,
    onSelectEvent,
    onDeselectEvent,
    disabled,
  ]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    if (!hovered) {
      setResolvedHovered([]);
      return;
    }

    const resolved = resolverEvent([hovered]);
    setResolvedHovered(resolved);

    resolved.forEach((selection) => onHoveredEvent(selection));

    return () => {
      resolved.forEach((selection) => onSettledEvent(selection));
    };
  }, [disabled, hovered, onHoveredEvent, onSettledEvent, resolverEvent]);

  useEffect(() => {
    return listen(listenerEvent);
  }, [listen, listenerEvent]);

  const resolveIfMissing = useEvent(
    (path: string, line: number, column: number) => {
      const isSelected = selections.some(
        (selection) =>
          selection.path === path &&
          selection.line === line &&
          selection.column === column,
      );
      const isObjectMissing = resolvedSelections.every(
        (object) =>
          object.meta.path !== path &&
          object.meta.line !== line &&
          object.meta.column !== column,
      );

      if (isSelected && isObjectMissing) {
        forciblyResolve();
      }
    },
  );

  const store = useMemo(
    () => ({
      clear,
      forciblyResolve,
      resolveIfMissing,
      select,
    }),
    [select, clear, resolveIfMissing, forciblyResolve],
  );

  return [resolvedSelections, resolvedHovered, store] as const;
}
