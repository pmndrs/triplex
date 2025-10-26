/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  CheckIcon,
  CodeIcon,
  ExclamationTriangleIcon,
  SwitchIcon,
} from "@radix-ui/react-icons";
import { cn } from "@triplex/lib";
import { fgComponent } from "@triplex/lib/fg";
import { type DeclaredProp, type Prop } from "@triplex/lib/types";
import {
  BooleanInput,
  ColorInput,
  LiteralUnionInput,
  NumberOrExpressionInput,
  resolveDefaultValue,
  StringInput,
  TupleInputNext,
  TupleInput as TupleInputOld,
  UnionInput,
  type RenderInputs,
} from "@triplex/ux/inputs";
import { IconButton } from "../../components/button";
import { Label } from "../../components/label";
import { createCodeLink } from "../../util/commands";

const TupleInput = fgComponent("tuple_input_set_defaults", {
  off: TupleInputOld,
  on: TupleInputNext,
});

const createIssueURL = (prop: DeclaredProp | Prop) =>
  encodeURI(
    "https://github.com/trytriplex/triplex/issues/new?title=Unsupported input request&body=Please describe your use case and what the prop type is here.\n\n---\n\nMeta:\n```\n" +
      JSON.stringify(prop, null, 2) +
      "\n```",
  );

export const renderPropInputs: RenderInputs = ({
  onChange,
  onConfirm,
  path,
  prop,
}) => {
  if (prop.type === "string") {
    if (/[Cc]olor/.test(prop.prop.name)) {
      const persistedValue = "value" in prop.prop ? prop.prop.value : undefined;

      return (
        <ColorInput
          actionId="scene_controls"
          defaultValue={resolveDefaultValue(prop.prop, "string")}
          name={prop.prop.name}
          onChange={onChange}
          onConfirm={onConfirm}
          persistedValue={persistedValue}
          required={prop.prop.required}
        >
          {({ ref, ...props }, { hasChanged }) => (
            <>
              <Label
                description={prop.prop.description}
                htmlFor={props.id}
                tags={prop.prop.tags}
              >
                {prop.prop.name}
              </Label>
              <div className="mb-1 flex items-center gap-1">
                <input
                  {...props}
                  className={cn([
                    prop.prop.required && persistedValue === undefined
                      ? "border-danger"
                      : "border-input",
                    !hasChanged &&
                      "[&::-webkit-color-swatch]:[background:repeating-conic-gradient(#717171_0%_25%,transparent_0%_50%)_50%_/_26px_26px!important]",
                    "text-input focus:border-selected bg-input placeholder:text-input-placeholder h-[26px] w-[26px] rounded-sm border focus:outline-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none",
                  ])}
                  ref={ref}
                  type="color"
                />
              </div>
            </>
          )}
        </ColorInput>
      );
    }

    return (
      <StringInput
        actionId="scene_controls"
        defaultValue={resolveDefaultValue(prop.prop, "string")}
        label={prop.prop.label}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
        required={prop.prop.required}
      >
        {({ onChange, ref, ...props }) => (
          <>
            <Label
              description={prop.prop.description}
              htmlFor={props.id}
              tags={prop.prop.tags}
            >
              {prop.prop.name}
            </Label>
            <input
              {...props}
              className="text-input invalid:border-danger focus:border-selected bg-input border-input placeholder:text-input-placeholder mb-1 h-[26px] w-full rounded-sm border px-[9px] focus:outline-none"
              onChange={onChange}
              ref={ref}
            />
          </>
        )}
      </StringInput>
    );
  }

  if (prop.type === "number") {
    const persistedValue = "value" in prop.prop ? prop.prop.value : undefined;

    return (
      <NumberOrExpressionInput
        {...prop.prop.tags}
        actionId="scene_controls"
        defaultValue={resolveDefaultValue(prop.prop, "number")}
        label={prop.prop.label}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={persistedValue}
        pointerMode="capture"
        required={prop.prop.required}
      >
        {({ ref, ...props }, { isActive, mode, shouldFocus, toggle }) => (
          <>
            <Label
              description={prop.prop.description}
              htmlFor={props.id}
              tags={prop.prop.tags}
            >
              {prop.prop.name}
            </Label>
            <div className="mb-1 flex gap-1">
              <input
                {...props}
                aria-label={prop.prop.label}
                autoFocus={shouldFocus}
                className={cn([
                  !isActive && "invalid:border-danger",
                  "text-input border-input focus:border-selected bg-input placeholder:text-input-placeholder mb-1 h-[26px] w-full cursor-col-resize rounded-sm border px-[9px] [color-scheme:light_dark] [font-variant-numeric:tabular-nums] focus:cursor-text focus:outline-none",
                ])}
                ref={ref}
                type={mode === "number" ? "number" : "text"}
              />
              <IconButton
                actionId="contextpanel_input_number_expression_toggle"
                icon={CodeIcon}
                label={
                  mode === "number"
                    ? "Switch to expression"
                    : "Switch to number"
                }
                onClick={toggle}
                spacing="spacious"
              />
            </div>
          </>
        )}
      </NumberOrExpressionInput>
    );
  }

  if (prop.type === "boolean") {
    const persistedValue = "value" in prop.prop ? prop.prop.value : undefined;

    return (
      <BooleanInput
        actionId="scene_controls"
        defaultValue={resolveDefaultValue(prop.prop, "boolean")}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={persistedValue}
      >
        {({ onChange, ref, ...props }) => (
          <>
            <Label
              description={prop.prop.description}
              htmlFor={props.id}
              tags={prop.prop.tags}
            >
              {prop.prop.name}
            </Label>
            <div
              className={cn([
                prop.prop.required && persistedValue === undefined
                  ? "border-danger"
                  : "border-input",
                "text-input focus-within:border-selected bg-input mb-1 grid h-5 w-5 rounded-sm border",
              ])}
            >
              <input
                {...props}
                className="grid-col peer h-full w-full appearance-none opacity-0 [grid-column:1] [grid-row:1]"
                onChange={onChange}
                ref={ref}
                type="checkbox"
              />
              <CheckIcon className="pointer-events-none h-full w-full opacity-0 [grid-column:1] [grid-row:1] peer-checked:opacity-100" />
            </div>
          </>
        )}
      </BooleanInput>
    );
  }

  if (prop.type === "union") {
    return (
      <UnionInput
        defaultValue={resolveDefaultValue(prop.prop, "any")}
        description={prop.prop.description}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        path={path}
        persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
        required={prop.prop.required}
        tags={prop.prop.tags}
        values={prop.prop.shape}
      >
        {(props, actions) => (
          <div
            className="grid grid-flow-col gap-x-1 [grid-template:'input_.'_'input_action']"
            style={{ gridTemplateColumns: "minmax(auto, 10fr) 1fr" }}
          >
            {renderPropInputs(props)}
            <div className="flex self-start [grid-area:action]">
              <IconButton
                actionId="contextpanel_input_union_switch"
                icon={SwitchIcon}
                label="Switch prop type"
                onClick={actions.toggle}
                spacing="spacious"
              />
            </div>
          </div>
        )}
      </UnionInput>
    );
  }

  if (prop.type === "tuple") {
    return (
      <>
        <Label
          description={prop.prop.description}
          htmlFor=""
          tags={prop.prop.tags}
        >
          {prop.prop.name}
        </Label>
        <div className="flex flex-col">
          <TupleInput
            defaultValue={resolveDefaultValue(prop.prop, "array")}
            onChange={onChange}
            onConfirm={onConfirm}
            path={path}
            persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
            propName={prop.prop.name}
            required={prop.prop.required}
            values={prop.prop.shape}
          >
            {renderPropInputs}
          </TupleInput>
        </div>
      </>
    );
  }

  if (prop.type === "union-literal") {
    return (
      <LiteralUnionInput
        actionId="scene_controls"
        defaultValue={resolveDefaultValue(prop.prop, "string")}
        name={prop.prop.name}
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={"value" in prop.prop ? prop.prop.value : undefined}
        required={prop.prop.required}
        values={prop.prop.shape}
      >
        {({ onChange, options, ref, ...props }) => (
          <>
            <Label
              description={prop.prop.description}
              htmlFor={props.id}
              tags={prop.prop.tags}
            >
              {prop.prop.name}
            </Label>
            <select
              {...props}
              className="text-input invalid:border-danger focus:border-selected bg-input border-input placeholder:text-input-placeholder mb-1 h-[26px] w-full rounded-sm border px-1.5 [color-scheme:light_dark] focus:outline-none"
              onChange={onChange}
              ref={ref}
            >
              {options.map(([label, value], index) => (
                <option key={`${label}-${value}-${index}`} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </>
        )}
      </LiteralUnionInput>
    );
  }

  const isControlledInCode = "value" in prop.prop && prop.prop.value;

  return (
    <>
      <Label
        description={prop.prop.description}
        htmlFor=""
        tags={prop.prop.tags}
      >
        {prop.prop.name}
      </Label>
      <a
        className="hover:text-disabled text-disabled focus:border-selected bg-input border-input mb-1 flex h-[26px] w-full cursor-pointer items-center rounded-sm border px-[9px] focus:outline-none"
        href={
          isControlledInCode
            ? "value" in prop.prop
              ? createCodeLink(path, prop.prop)
              : ""
            : createIssueURL(prop.prop)
        }
        title={
          isControlledInCode
            ? "This prop is controlled by code."
            : "This field is not supported, please raise an issue on Github."
        }
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-neutral-400">
          {"value" in prop.prop && prop.prop.value ? (
            `{${prop.prop.value}}`
          ) : (
            <i>Unsupported</i>
          )}
        </span>
        <div
          className={cn([
            "ml-auto flex-shrink-0",
            isControlledInCode ? "text-warning" : "text-danger",
          ])}
        >
          <ExclamationTriangleIcon />
        </div>
      </a>
    </>
  );
};
