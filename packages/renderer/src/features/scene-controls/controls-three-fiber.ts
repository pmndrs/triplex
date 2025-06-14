/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type Controls, type MenuControl } from "@triplex/bridge/host";

export const settings: MenuControl["options"] = [
  {
    group: "Canvas Camera",
    id: "camera_default",
    label: "Use Default Camera",
  },
  {
    group: "Canvas Camera",
    id: "camera_editor",
    label: "Use Editor Camera",
  },
  {
    group: "Canvas Camera",
    id: "camera_editor_toggle_default",
    label: "Toggle Editor As Default",
  },
];

export const controls: Controls = [
  {
    buttons: [
      {
        icon: "world",
        id: "transformlocal",
        label: "Set Local Transform",
      },
      {
        icon: "local",
        id: "transformworld",
        label: "Set World Transform",
      },
    ],
    groupId: "transform_space",
    type: "toggle-button",
  },
  {
    type: "separator",
  },
  {
    buttons: [
      {
        icon: "cursor",
        id: "none",
        label: "Select",
      },
      {
        accelerator: "T",
        icon: "move",
        id: "translate",
        label: "Translate",
      },
      {
        accelerator: "R",
        icon: "angle",
        id: "rotate",
        label: "Rotate",
      },
      {
        accelerator: "S",
        icon: "transform",
        id: "scale",
        label: "Scale",
      },
    ],
    defaultSelected: "none",
    groupId: "transform_controls",
    type: "button-group",
  },
  {
    type: "separator",
  },
  {
    buttons: [
      {
        icon: "moon",
        id: "default_lights_on",
        label: "Turn On Default Lights",
      },
      {
        icon: "sun",
        id: "default_lights_off",
        label: "Turn Off Default Lights",
      },
    ],
    groupId: "lights",
    type: "toggle-button",
  },
  {
    type: "separator",
  },
  {
    buttons: [
      {
        icon: "grid-perspective",
        id: "orthographic",
        label: "Switch To Orthographic",
      },
      {
        icon: "grid",
        id: "perspective",
        label: "Switch To Perspective",
      },
    ],
    groupId: "camera_switcher",
    type: "toggle-button",
  },
];
