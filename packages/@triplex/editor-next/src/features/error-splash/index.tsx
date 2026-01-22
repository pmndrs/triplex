/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useScreenView } from "@triplex/ux";
import { Button } from "../../components/button";
import { sendVSCE } from "../../util/bridge";
import { ErrorIllustration } from "../invariants/error-illustration";

export function ErrorSplash({ error }: { error: Error | { message: string } }) {
  useScreenView("error_splash", "Screen");

  return (
    <>
      <div
        className="fixed inset-0 mx-auto flex h-full max-w-2xl select-none flex-col items-center justify-center gap-4 p-4"
        data-testid="ErrorSplash"
      >
        <ErrorIllustration />

        <h1 className="text-heading text-center font-medium">
          This wasn't expected, sorry!
        </h1>

        <p className="mx-auto max-w-md text-center text-lg">
          An unexpected error occurred, we&apos;re looking into it. Reload
          Triplex for VS Code and try again. Problem persisting? Raise an issue
          on GitHub or Discord.
        </p>

        <Button
          actionId="errorsplash_controls_reload"
          onClick={() => sendVSCE("reload-webviews", undefined)}
          variant="cta"
        >
          Reload Webviews
        </Button>

        <div className="mx-auto flex items-center gap-2">
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

        <code className="mx-auto my-2 max-h-32 w-full max-w-2xl select-text overflow-auto bg-white/5 px-4 py-2 text-left">
          <pre>{error.message}</pre>
        </code>
      </div>
    </>
  );
}
