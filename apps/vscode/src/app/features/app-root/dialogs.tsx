/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useDialogs } from "../../stores/dialogs";
import { Feedback } from "../feedback";

export function Dialogs() {
  const shownDialog = useDialogs((store) => store.shown);

  if (shownDialog === "help") {
    return <Feedback />;
  }

  return null;
}
