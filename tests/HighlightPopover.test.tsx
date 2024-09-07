import { render, fireEvent } from "@testing-library/react";
import { expect, test, describe, beforeEach, mock } from "bun:test";

import { HighlightPopover } from "@omsimos/react-highlight-popover";

mock.module("../src/HighlightPopover", () => {
  const originalModule = require("../src/HighlightPopover");
  return {
    ...originalModule,
    useHighlightPopover: mock(() => ({
      showPopover: false,
      setShowPopover: mock(),
      popoverPosition: { top: 0, left: 0 },
      currentSelection: "",
    })),
  };
});

describe("HighlightPopover", () => {
  const mockRenderPopover = mock(({ selection }) => (
    <div data-testid="mock-popover">Selected: {selection}</div>
  ));

  beforeEach(() => {
    mock.restore();
  });

  test("renders children correctly", () => {
    const { getByText } = render(
      <HighlightPopover renderPopover={mockRenderPopover}>
        <p>Test content</p>
      </HighlightPopover>,
    );

    expect(getByText("Test content")).toBeDefined();
  });

  test("shows popover when text is selected", () => {
    const { container, getByTestId, getByText } = render(
      <HighlightPopover renderPopover={mockRenderPopover}>
        <p>Test content</p>
      </HighlightPopover>,
    );

    const textNode = container.firstChild?.firstChild?.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 4);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    fireEvent(document, new Event("selectionchange"));

    expect(getByTestId("mock-popover")).toBeDefined();
    expect(getByText("Selected: Test")).toBeDefined();
  });

  test("hides popover when clicking outside", () => {
    mock.module("../src/HighlightPopover", () => ({
      ...require("../src/HighlightPopover"),
      useHighlightPopover: mock(() => ({
        showPopover: true,
        setShowPopover: mock(),
        popoverPosition: { top: 0, left: 0 },
        currentSelection: "Test",
      })),
    }));

    const { getByTestId, queryByTestId } = render(
      <HighlightPopover renderPopover={mockRenderPopover}>
        <p>Test content</p>
      </HighlightPopover>,
    );

    expect(getByTestId("mock-popover")).toBeDefined();

    fireEvent.mouseDown(document.body);
    expect(queryByTestId("mock-popover")).toBeNull();
  });

  test("calls event callbacks correctly", () => {
    const onSelectionStart = mock();
    const onSelectionEnd = mock();
    const onPopoverShow = mock();
    const onPopoverHide = mock();

    const { container } = render(
      <HighlightPopover
        renderPopover={mockRenderPopover}
        onSelectionStart={onSelectionStart}
        onSelectionEnd={onSelectionEnd}
        onPopoverShow={onPopoverShow}
        onPopoverHide={onPopoverHide}
      >
        <p>Test content</p>
      </HighlightPopover>,
    );

    const textNode = container.firstChild?.firstChild?.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 4);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    fireEvent(document, new Event("selectionchange"));

    expect(onSelectionStart).toHaveBeenCalled();
    expect(onSelectionEnd).toHaveBeenCalledWith("Test");
    expect(onPopoverShow).toHaveBeenCalled();

    fireEvent.mouseDown(document.body);
    expect(onPopoverHide).toHaveBeenCalled();
  });

  test("respects minSelectionLength prop", () => {
    const { container, queryByTestId } = render(
      <HighlightPopover
        renderPopover={mockRenderPopover}
        minSelectionLength={5}
      >
        <p>Test content</p>
      </HighlightPopover>,
    );

    const textNode = container.firstChild?.firstChild?.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 4);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    fireEvent(document, new Event("selectionchange"));

    expect(queryByTestId("mock-popover")).toBeNull();

    range.setEnd(textNode, 7);

    selection?.removeAllRanges();
    selection?.addRange(range);

    fireEvent(document, new Event("selectionchange"));

    expect(queryByTestId("mock-popover")).toBeDefined();
  });
});
