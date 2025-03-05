/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { Dialog, useScreenView, useTelemetry } from "@triplex/ux";
import { Button } from "../../components/button";
import { useDialogs } from "../../stores/dialogs";

export function Feedback() {
  const hideSelf = useDialogs((store) => () => store.set(undefined));
  const telemetry = useTelemetry();

  useScreenView("help", "Dialog");

  async function onSubmit(formData: FormData) {
    telemetry.event("dialog_help_submit");

    const query = new URLSearchParams(
      formData as unknown as Record<string, string>,
    ).toString();

    fetch(
      "https://triplex-docs-git-main-try-triplex.vercel.app/api/feedback?" +
        query,
      {
        headers: { "Content-Type": "application/json" },
        method: "GET",
      },
    );

    hideSelf();
  }

  return (
    <Dialog
      className="backdrop:bg-overlay border-overlay bg-overlay-top text-default w-full max-w-xs rounded border backdrop:opacity-80"
      onDismiss={hideSelf}
    >
      <form action={onSubmit} className="flex flex-col gap-2.5 p-2.5">
        <span className="select-none">Send Feedback</span>
        <input name="app" type="hidden" value="vsce" />
        <textarea
          aria-label="Anything you'd like to tell us?"
          className="text-subtle placeholder:text-subtlest border-input bg-input focus:border-selected h-20 w-full resize-none rounded-sm border p-2 text-sm focus:outline-none"
          maxLength={1024}
          name="feedback"
          placeholder="Anything you'd like to tell us?"
          required
        />
        <Button actionId="(UNSAFE_SKIP)" type="submit" variant="cta">
          Send Feedback
        </Button>
        <div className="select-none text-left">
          Want to request a feature, report a bug, or talk to someone?{" "}
          <a
            className="text-link underline focus:outline-none"
            href="https://discord.gg/nBzRBUEs4b"
            onClick={() => telemetry.event("dialog_help_discord")}
          >
            Join the Discord community
          </a>{" "}
          and{" "}
          <a
            className="text-link underline focus:outline-none"
            href="https://github.com/trytriplex/triplex/issues/new"
            onClick={() => telemetry.event("dialog_help_github")}
          >
            raise an issue on GitHub
          </a>
          .
        </div>
      </form>
    </Dialog>
  );
}
