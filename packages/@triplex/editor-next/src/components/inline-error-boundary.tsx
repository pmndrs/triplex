/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { ErrorBoundary } from "react-error-boundary";

export function InlineErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <div className="flex flex-col gap-2 p-3">
          <h2 className="text-heading text-center font-medium">
            Unexpected Error
          </h2>

          <p className="mx-auto max-w-md text-center text-lg">
            We&apos;re looking into it. If the problem persists try restarting
            Triplex or raising an issue.
          </p>

          <div className="mx-auto flex items-center gap-1.5">
            <a
              className="text-link hover:underline"
              href="https://discord.gg/mfJJPZ4deK"
            >
              Join Discord
            </a>
            <span className="text-xs">•</span>
            <a
              className="text-link hover:underline"
              href="https://github.com/trytriplex/triplex/issues/new"
            >
              Raise an Issue
            </a>
          </div>

          <div className="bg-overlay border-overlay mt-1 border">
            <pre className="select-text overflow-auto px-4 py-2">
              <code className="bg-overlay">
                {"stack" in error ? error.stack : error.message}
              </code>
            </pre>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
