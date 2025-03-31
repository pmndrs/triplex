/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { fg } from "@triplex/lib/fg";
import { useDialogs } from "../../stores/dialogs";
import { Feedback } from "../feedback";
import { OpenInXR } from "../open-in-xr";

export function Dialogs() {
  const shownDialog = useDialogs((store) => store.shown);

  if (shownDialog === "help") {
    return <Feedback />;
  }

  if (shownDialog === "open_in_xr" && fg("xr_editing")) {
    return <OpenInXR />;
  }

  return null;
}
