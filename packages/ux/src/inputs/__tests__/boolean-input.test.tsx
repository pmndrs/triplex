/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BooleanInput } from "../boolean-input";

const TestHarness = (testProps: {
  defaultValue?: boolean;
  onChange?: (value?: boolean) => void;
  onConfirm?: (value?: boolean) => void;
  persistedValue?: boolean;
}) => (
  <BooleanInput
    actionId="assetsdrawer_assets"
    name="bool"
    onChange={vi.fn()}
    onConfirm={vi.fn()}
    {...testProps}
  >
    {(props) => <input {...props} data-testid="bool" type="checkbox" />}
  </BooleanInput>
);

describe("boolean input", () => {
  it("should set the initial value from default value prop when persisted prop is undefined", () => {
    const { getByTestId } = render(<TestHarness defaultValue={true} />);

    const element = getByTestId("bool") as HTMLInputElement;

    expect(element.checked).toEqual(true);
  });

  it("should update the default value", () => {
    const { getByTestId, rerender } = render(
      <TestHarness defaultValue={true} />,
    );

    rerender(<TestHarness defaultValue={false} />);

    const element = getByTestId("bool") as HTMLInputElement;
    expect(element.checked).toEqual(false);
  });

  it("should prioritize persisted value over default value", () => {
    const { getByTestId } = render(
      <TestHarness defaultValue={true} persistedValue={false} />,
    );

    const element = getByTestId("bool") as HTMLInputElement;
    expect(element.checked).toEqual(false);
  });

  it("should update the persisted value", () => {
    const { getByTestId } = render(
      <TestHarness defaultValue={true} persistedValue={true} />,
    );

    const element = getByTestId("bool") as HTMLInputElement;
    expect(element.checked).toEqual(true);
  });

  it("should not callback events when updating the persisted value", () => {
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    const { rerender } = render(
      <TestHarness
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={true}
      />,
    );

    rerender(
      <TestHarness
        onChange={onChange}
        onConfirm={onConfirm}
        persistedValue={false}
      />,
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("should ignore values that aren't boolean", () => {
    const { getByTestId } = render(
      <TestHarness
        // @ts-expect-error
        persistedValue="foo"
      />,
    );

    const element = getByTestId("bool") as HTMLInputElement;
    expect(element.checked).toEqual(false);
  });
});
