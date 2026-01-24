/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export function addDOMTestData(testId: string, data: Record<string, unknown>) {
  const element = document.createElement("div");
  element.setAttribute("data-testid", testId);
  element.textContent = JSON.stringify(data);
  element.style.display = "none";
  document.body.append(element);

  return () => {
    element.remove();
  };
}
