/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/// <reference types="vite/client" />
import { StatsigClient } from "@statsig/js-client";
import { LocalOverrideAdapter } from "@statsig/js-local-overrides";
import { type ReactNode } from "react";
import { type FGEnvironment } from "./types";

const overrideAdapter = new LocalOverrideAdapter();

let instance: StatsigClient | undefined;

export async function initFeatureGates({
  environment,
  overrides,
  userId,
}: {
  environment: FGEnvironment;
  /**
   * Overrides the feature gate with a specific value if defined. When the value
   * is undefined no override is applied.
   */
  overrides?: Record<string, boolean | undefined>;
  userId: string;
}) {
  if (!userId) {
    throw new Error("invariant: missing userId");
  }

  if (instance) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("Statsig already initialized, skipping.");
    }

    return;
  }

  try {
    const client = new StatsigClient(
      "client-RoO8UZOrk5aM4zXe3AP7vQjy66PWeumvN2PfQ2P6xt7",
      { userID: userId },
      {
        environment: { tier: environment },
        networkConfig: {
          networkTimeoutMs: 2500,
          preventAllNetworkTraffic: environment === "local",
        },
        overrideAdapter,
      },
    );

    await client.initializeAsync();

    instance = client;
  } catch (error) {
    // Ignore initialization errors to prevent blocking app startup but report to console for now
    // eslint-disable-next-line no-console
    console.log("[Statsig] Failed to initialize Statsig:", error);
  }

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-fg-user", userId);
    document.documentElement.setAttribute("data-fg-env", environment);
  }

  if (overrides) {
    Object.entries(overrides).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        overrideAdapter.overrideGate(key, value);
      }
    });
  }
}

export function fg(key: string): boolean {
  return instance?.checkGate(key) ?? false; // Default to false if not initialized
}

export function overrideFg(key: string, value: boolean) {
  overrideAdapter.overrideGate(key, value);
}

export function clearFgOverrides() {
  overrideAdapter.removeAllOverrides();
}

export function fgComponent<
  TProps extends object,
  TComponent extends (props: TProps) => ReactNode,
>(
  key: string,
  {
    off: OffComponent,
    on: OnComponent,
  }: {
    off: (props: TProps) => ReactNode;
    on: (props: TProps) => ReactNode;
  },
): TComponent {
  return function GatedComponent(props: TProps) {
    return fg(key) ? <OnComponent {...props} /> : <OffComponent {...props} />;
  } as TComponent;
}
