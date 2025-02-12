/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { readdirSync } from "node:fs";

export const templates = readdirSync(`${__dirname}/../templates`, {
  withFileTypes: true,
})
  .filter((file) => file.isDirectory())
  .map((file) => file.name);
