/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useEffect, type ReactNode } from "react";

export const CanvasProvider: React.FC<{
  /** @group Foo */
  barbar?: "foo" | "baz";
  /** @group Foo */
  batbat?: number;
  /** @group Foo */
  bazbaz?: string;
  /** @group Bar */
  bgColor?: string;
  children: React.ReactNode;
  /** @group Foo */
  foofoo?: boolean;
}> = ({
  barbar = "baz",
  batbat = 100,
  bazbaz = "jelly",
  bgColor = "#ccc",
  children,
  foofoo = true,
}) => {
  useEffect(() => {
    const element = document.createElement("div");
    element.setAttribute("data-testid", "provider-props");
    element.textContent = JSON.stringify({
      barbar,
      batbat,
      bazbaz,
      bgColor,
      foofoo,
    });
    element.style.display = "none";
    document.body.append(element);

    return () => {
      element.remove();
    };
  }, [bgColor, foofoo, barbar, batbat, bazbaz]);

  return (
    <>
      {bgColor && <color args={[bgColor]} attach="background" />}
      {children}
    </>
  );
};

export function GlobalProvider({
  children,
  theme = "triplex",
}: {
  children: ReactNode;
  theme: "triplex" | "gitplex";
}) {
  useEffect(() => {
    document.documentElement.setAttribute("data-test-theme", theme);
  }, [theme]);

  return <>{children}</>;
}
