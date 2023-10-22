/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  ActivityLogIcon,
  DiscordLogoIcon,
  GlobeIcon,
  HeartFilledIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { useEffect, useState } from "react";
import { version } from "../package.json";
import { Button } from "./ds/button";
import { cn } from "./ds/cn";

function ProgressBar() {
  const [progress, setProgress] = useState(-1);

  useEffect(() => {
    return window.triplex.handleProgressBarChange((progress) => {
      setProgress(progress);
    });
  }, []);

  return (
    <div
      className={cn([
        progress > 0 ? "opacity-100" : "opacity-0",
        "absolute bottom-0 left-0 right-0 h-1 overflow-hidden bg-gradient-to-r from-black/50 to-white/20 transition-opacity",
      ])}
    >
      {progress > 1 ? (
        <div className="indeterminate absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400" />
      ) : (
        <div
          className="absolute inset-0 origin-left bg-gradient-to-r from-blue-500 to-blue-400"
          style={{ transform: `scale3d(${progress * 100}%, 1, 1)` }}
        />
      )}
    </div>
  );
}

function WelcomeScreen() {
  const [windowState, setWindowState] = useState<WindowState>("active");

  useEffect(() => {
    return window.triplex.handleWindowStateChange((state) => {
      setWindowState(state);
    });
  }, []);

  return (
    <div className="flex h-[100lvh] w-screen select-none flex-col gap-8">
      <div className="absolute left-0 right-0 top-0 z-50 h-8 [-webkit-app-region:drag]"></div>
      <div className="relative">
        <img className="bg-black" draggable="false" src="banner-r3f.jpg" />
        <span
          className={cn([
            window.triplex.platform === "darwin" ? "top-0" : "bottom-0",
            "absolute right-0 ml-auto flex h-8 items-center pr-2.5 text-xs text-neutral-300",
          ])}
        >
          {version}
        </span>

        <ProgressBar />
      </div>

      <div className="flex gap-4 px-10">
        <div className="basis-1/2">
          <h2 className="text-xs font-medium text-neutral-400">Projects</h2>

          <div className="-mx-2 flex flex-col">
            <Button
              disabled={windowState === "disabled"}
              onClick={() => window.triplex.sendCommand("open-project")}
              size="tight"
            >
              Open Project...
            </Button>
            <Button
              disabled={windowState === "disabled"}
              onClick={() => window.triplex.sendCommand("create-project")}
              size="tight"
            >
              Create Project...
            </Button>
          </div>
        </div>
        <div className="flex basis-1/2 flex-col"></div>
      </div>

      <div className="mt-auto flex gap-5 px-10">
        <div className="-mx-2 flex basis-1/2 flex-col justify-end">
          <Button
            icon={ReaderIcon}
            onClick={() =>
              window.triplex.openLink("https://triplex.dev/docs/overview")
            }
            size="tight"
          >
            Documentation
          </Button>
          <Button
            icon={DiscordLogoIcon}
            onClick={() =>
              window.triplex.openLink("https://discord.gg/nBzRBUEs4b")
            }
            size="tight"
          >
            Join Discord
          </Button>
          <Button
            icon={ActivityLogIcon}
            onClick={() => window.triplex.sendCommand("view-logs")}
            size="tight"
          >
            View Logs
          </Button>
        </div>
        <div className="-mx-2 flex basis-1/2 flex-col justify-end">
          <Button
            icon={GlobeIcon}
            onClick={() =>
              window.triplex.openLink(
                "https://github.com/try-triplex/triplex/releases"
              )
            }
            size="tight"
          >
            Release Notes
          </Button>
          <Button
            icon={HeartFilledIcon}
            isSelected
            onClick={() =>
              window.triplex.openLink("https://github.com/sponsors/itsdouges")
            }
            size="tight"
          >
            Sponsor Development
          </Button>
        </div>
      </div>
      <div />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<WelcomeScreen />);
