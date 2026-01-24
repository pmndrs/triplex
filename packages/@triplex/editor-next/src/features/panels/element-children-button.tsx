/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Link2Icon,
} from "@radix-ui/react-icons";
import { cn } from "@triplex/lib";
import { Pressable } from "../../components/pressable";

export function ShowElementChildrenButton({
  hasChildren,
  id,
  isCustomComponent,
  isExpanded,
  isImportedComponent,
  setExpanded,
}: {
  hasChildren: boolean;
  id: string;
  isCustomComponent: boolean;
  isExpanded: boolean;
  isImportedComponent: boolean;
  setExpanded: (value: (prev: boolean) => boolean) => void;
}) {
  const shouldShow = isCustomComponent || hasChildren;
  const shouldShowExternalComponentIcon =
    isCustomComponent && isImportedComponent;

  if (!shouldShow) {
    return <div className="w-[0.5px]" />;
  }

  return (
    <Pressable
      actionId={
        isExpanded ? "scenepanel_element_collapse" : "scenepanel_element_expand"
      }
      className="z-10 -ml-[5px] grid grid-cols-1 grid-rows-1 items-center justify-center px-0.5"
      describedBy={id}
      onClick={() => setExpanded((state) => !state)}
    >
      {shouldShowExternalComponentIcon && (
        <Link2Icon className="col-start-1 row-start-1 opacity-60 transition-opacity group-focus-within:opacity-0 group-hover:opacity-0" />
      )}

      {isExpanded ? (
        <ChevronDownIcon
          aria-label="Hide Children"
          className={cn([
            "col-start-1 row-start-1",
            shouldShowExternalComponentIcon &&
              "opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100",
          ])}
        />
      ) : (
        <ChevronRightIcon
          aria-label="Show Children"
          className={cn([
            "col-start-1 row-start-1",
            shouldShowExternalComponentIcon &&
              "opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100",
          ])}
        />
      )}
    </Pressable>
  );
}
