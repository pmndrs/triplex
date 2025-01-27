/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
const { join } = require("upath");

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    join(__dirname, "./src/app/**/*.tsx"),
    join(__dirname, "../packages/@triplex/ux/**/*.tsx"),
    join(__dirname, "./index.html"),
  ],
  theme: {
    backgroundColor: {
      "active-selected": "var(--vscode-list-activeSelectionBackground)",
      editor: "var(--vscode-editor-background)",
      hover: "var(--vscode-toolbar-hoverBackground)",
      "inactive-selected": "var(--vscode-list-inactiveSelectionBackground)",
      input: "var(--vscode-input-background)",
      "list-hovered": "var(--vscode-list-hoverBackground)",
      neutral: "var(--vscode-button-secondaryBackground)",
      "neutral-hovered": "var(--vscode-button-secondaryHoverBackground)",
      overlay: "var(--panel-view-background)",
      "overlay-top": "var(--vscode-notifications-background)",
      "overlay-top-hovered": "var(--vscode-list-hoverBackground)",
      primary: "var(--vscode-button-background)",
      "primary-hovered": "var(--vscode-button-hoverBackground)",
      scrollbar: "var(--vscode-scrollbarSlider-background)",
      "scrollbar-active": "var(--vscode-scrollbarSlider-activeBackground)",
      "scrollbar-hovered": "var(--vscode-scrollbarSlider-hoverBackground)",
      selected: "var(--vscode-toolbar-activeBackground)",
      warning: "var(--vscode-editorWarning-foreground)",
    },
    borderColor: {
      button: "var(--vscode-button-border, transparent)",
      danger: "var(--vscode-editorError-foreground, transparent)",
      input: "var(--vscode-dropdown-border, transparent)",
      overlay: "var(--vscode-panel-border, transparent)",
      selected: "var(--vscode-focusBorder, transparent)",
      transparent: "transparent",
    },
    boxShadow: {
      overlay: "var(--vscode-widget-shadow) 0px 0px 8px 2px",
      scrollbar: "var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset",
    },
    fontFamily: {
      default: "var(--vscode-font-family)",
    },
    fontSize: {
      base: "var(--vscode-font-size)",
      heading: "1rem",
    },
    fontWeight: {
      medium: 500,
      normal: "var(--vscode-font-weight)",
      semibold: 600,
    },
    outlineColor: {
      selected: "var(--focus-border)",
    },
    outlineOffset: {
      button: "var(--button-icon-outline-offset)",
      inset: "-1px",
    },
    outlineWidth: {
      default: "calc(var(--border-width) * 1px)",
    },
    textColor: {
      "active-selected": "var(--vscode-list-activeSelectionForeground)",
      danger: "var(--vscode-editorError-foreground)",
      default: "var(--vscode-foreground)",
      disabled: "var(--vscode-disabledForeground)",
      info: "var(--vscode-editorInfo-foreground)",
      input: "var(--vscode-input-foreground)",
      "input-placeholder": "var(--vscode-input-placeholderForeground)",
      link: "var(--vscode-textLink-foreground)",
      "list-hovered": "var(--vscode-list-hoverForeground)",
      primary: "var(--vscode-button-foreground)",
      selected: "var(--vscode-tab-activeForeground)",
      subtle: "var(--vscode-button-secondaryForeground)",
      subtlest: "var(--vscode-descriptionForeground)",
      warning: "var(--vscode-editorWarning-foreground)",
    },
  },
};
