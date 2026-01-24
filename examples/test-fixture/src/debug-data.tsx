/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useEffect } from "react";

export function DebugData() {
  useEffect(() => {
    window.triplex?.debug("object", { hello: () => {}, yes: true });
    window.triplex?.debug("string", "foobar");
    window.triplex?.debug("number", 1234);
    window.triplex?.debug("array", [1234]);
    window.triplex?.debug("function", () => {});
  }, []);

  return <div>hi mate</div>;
}
