import {
  render,
  fireEvent,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import { HighlightPopover } from "@omsimos/react-highlight-popover";
import { describe, expect, test, mock, beforeEach } from "bun:test";

describe("HighlightPopover Component", () => {
  beforeEach(() => {
    global.requestAnimationFrame = (callback) => setTimeout(callback, 0);

    Element.prototype.getBoundingClientRect = mock(() => {
      const rect = {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        top: 0,
        left: 0,
        bottom: 50,
        right: 100,
        toJSON: () => rect,
      };
      return DOMRect.fromRect(rect);
    });
  });

  test("renders children correctly", () => {
    const renderPopoverMock = mock(() => <div data-testid="popover" />);
    render(
      <HighlightPopover renderPopover={renderPopoverMock}>
        <div data-testid="child">Test Child</div>
      </HighlightPopover>,
    );

    expect(screen.getByTestId("child")).toBeDefined();
  });

  test("shows popover on text selection", async () => {
    const renderPopoverMock = mock(({ position, selection }) => (
      <div data-testid="popover-show">
        {`Position: (${position.top}, ${position.left}), Selection: ${selection}`}
      </div>
    ));
    const onSelectionStartMock = mock();
    const onSelectionEndMock = mock();

    render(
      <HighlightPopover
        renderPopover={renderPopoverMock}
        onSelectionStart={onSelectionStartMock}
        onSelectionEnd={onSelectionEndMock}
      >
        <p data-testid="selectable-text-show">Select this text</p>
      </HighlightPopover>,
    );

    const textElement = screen.getByTestId("selectable-text-show");

    await act(async () => {
      const range = document.createRange();
      range.selectNodeContents(textElement);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      const event = new Event("selectionchange", {
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(onSelectionStartMock).toHaveBeenCalled();
      expect(onSelectionEndMock).toHaveBeenCalledWith("Select this text");
      expect(screen.getByTestId("popover-show")).toBeDefined();
    });
  });

  test("applies offset to popover position", async () => {
    const renderPopoverMock = mock(({ position }) => (
      <div
        data-testid="popover-offset"
        style={{ top: position.top, left: position.left }}
      >
        Popover Content
      </div>
    ));

    render(
      <HighlightPopover
        renderPopover={renderPopoverMock}
        offset={{ x: 10, y: 20 }}
      >
        <p data-testid="selectable-text-offset">Select this text</p>
      </HighlightPopover>,
    );

    const textElement = screen.getByTestId("selectable-text-offset");

    await act(async () => {
      const range = document.createRange();
      range.selectNodeContents(textElement);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      const event = new Event("selectionchange", {
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });

    // Wait for the popover to appear and check its position
    await waitFor(() => {
      const popover = screen.getByTestId("popover-offset");
      expect(popover).toBeDefined();
      const style = window.getComputedStyle(popover);

      expect(parseInt(style.top)).toBe(-20);
      expect(parseInt(style.left)).toBe(10);
    });
  });

  test("does not show popover for short selections", async () => {
    const renderPopoverMock = mock(() => <div data-testid="popover-short" />);

    render(
      <HighlightPopover
        renderPopover={renderPopoverMock}
        minSelectionLength={10}
      >
        <p data-testid="selectable-text-short">Short</p>
      </HighlightPopover>,
    );

    const textElement = screen.getByTestId("selectable-text-short");

    await act(async () => {
      const range = document.createRange();
      range.selectNodeContents(textElement);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      const event = new Event("selectionchange", {
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });

    expect(screen.queryByTestId("popover-short")).toBeNull();
  });
});
