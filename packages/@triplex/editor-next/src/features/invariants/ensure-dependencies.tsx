/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useScreenView } from "@triplex/ux";
import { useState, type ReactNode } from "react";
import { Button } from "../../components/button";
import { preloadSubscription, useSubscription } from "../../hooks/ws";
import { sendVSCE } from "../../util/bridge";
import { ErrorIllustration } from "./error-illustration";

function MissingDependencies({
  args,
  dependencies,
  pkgManager,
}: {
  args: string[];
  dependencies: string[];
  pkgManager: string;
}) {
  const [installing, setInstalling] = useState(false);
  const command =
    `${pkgManager} i ${dependencies.join(" ")} ${args.join(" ")}`.trim();

  useScreenView("missing_dependencies", "Screen", true);

  return (
    <div className="fixed inset-0 mx-auto flex max-w-md select-none flex-col items-center justify-center gap-4 p-4 text-center">
      <ErrorIllustration />

      <span>
        Triplex for VS Code couldn't open as required dependencies are missing.
        Once installed please close and re-open the editor.
      </span>
      <Button
        actionId="errorsplash_project_installdeps"
        isDisabled={installing}
        onClick={() => {
          setInstalling(true);
          sendVSCE("terminal", { command });
        }}
        variant="cta"
      >
        Install Missing Dependencies
      </Button>
      <div className="flex flex-col gap-1">
        <span>Alternatively install yourself through your terminal:</span>
        <code
          className="hover:bg-neutral-hovered text-subtle bg-neutral cursor-pointer"
          data-testid="DepsToInstall"
          onClick={(e) => {
            const text =
              e.target instanceof HTMLElement ? e.target.innerText : "";
            navigator.clipboard.writeText(text);
          }}
          title="Copy to Clipboard"
        >
          {command}
        </code>
      </div>
      <hr className="border-input my-2 w-full border-t" />
      <div>
        <ExclamationTriangleIcon className="text-warning inline" /> Ensure
        dependencies match. For example <code>@react-three/fiber@9</code>{" "}
        expects
        {"  "}
        <code>react@19</code> and <code>@types/react@19</code>.
      </div>
    </div>
  );
}

function InvalidDependencies({
  versions,
}: {
  versions: { installedVersion: string; name: string; requiredVersion: string }[];
}) {
  useScreenView("invalid_dependency_versions", "Screen", true);

  return (
    <div className="fixed inset-0 mx-auto flex max-w-md select-none flex-col items-center justify-center gap-4 p-4 text-center">
      <ErrorIllustration />

      <span>
        Triplex for VS Code couldn't open as some dependencies have incompatible
        versions. Please update them and re-open the editor.
      </span>

      <div className="flex flex-col gap-2">
        {versions.map((invalid) => (
          <div
            className="bg-neutral flex flex-col gap-1 rounded px-3 py-2"
            key={invalid.name}
          >
            <code className="text-subtle">{invalid.name}</code>
            <span className="text-sm">
              Installed <code>{invalid.installedVersion}</code>, requires{" "}
              <code>{invalid.requiredVersion}</code>
            </span>
          </div>
        ))}
      </div>

      <hr className="border-input my-2 w-full border-t" />
      <div>
        <ExclamationTriangleIcon className="text-warning inline" /> Ensure
        dependencies match. For example <code>@react-three/fiber@9</code>{" "}
        expects
        {"  "}
        <code>react@19</code> and <code>@types/react@19</code>.
      </div>
    </div>
  );
}

export function EnsureDependencies({ children }: { children: ReactNode }) {
  const {
    args,
    missingDependencies: {
      invalidVersions,
      required: requiredMissingDependencies,
    },
    pkgManager,
  } = useSubscription("/project/dependencies");

  if (requiredMissingDependencies.length) {
    return (
      <MissingDependencies
        args={args}
        dependencies={requiredMissingDependencies}
        pkgManager={pkgManager}
      />
    );
  }

  if (invalidVersions.length) {
    return <InvalidDependencies versions={invalidVersions} />;
  }

  return children;
}

preloadSubscription("/project/dependencies");
