/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export class DNDError extends Error {
  multipleExports?: string[];

  constructor(
    public message: string,
    public type: string = "unknown",
  ) {
    super(message);
    this.name = "DNDError";
  }

  toJSON() {
    return {
      message: this.message,
      multipleExports: this.multipleExports,
      type: this.type,
    };
  }
}
