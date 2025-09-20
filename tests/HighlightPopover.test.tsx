import {
  render,
  fireEvent,
  screen,
  waitFor,
  act,
  cleanup,
} from "@testing-library/react";
import {
  HighlightPopover,
  useHighlightPopover,
} from "@omsimos/react-highlight-popover";
import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";

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

    Range.prototype.getBoundingClientRect = mock(() => {
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

  afterEach(() => {
    cleanup();
  });

  const triggerSelection = async (element: HTMLElement) => {
    await act(async () => {
      const range = document.createRange();
      range.selectNodeContents(element);
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
  };

  const clearSelection = async () => {
    await act(async () => {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      const event = new Event("selectionchange", {
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });
  };

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

    await triggerSelection(textElement);

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

    await triggerSelection(textElement);

    await waitFor(() => {
      expect(renderPopoverMock).toHaveBeenCalled();
    });

    const popover = screen.getByTestId("popover-offset");
    expect(popover).toBeDefined();

    const [firstCall] = renderPopoverMock.mock.calls;
    const { position } = firstCall?.[0] as {
      position: { top: number; left: number };
    };
    expect(position.top).toBe(30);
    expect(position.left).toBe(60);
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

    await triggerSelection(textElement);

    expect(screen.queryByTestId("popover-short")).toBeNull();
  });

  test("fires lifecycle callbacks once per show/hide cycle", async () => {
    const renderPopoverMock = mock(() => (
      <div data-testid="popover-lifecycle" />
    ));
    const onSelectionStartMock = mock();
    const onSelectionEndMock = mock();
    const onPopoverShowMock = mock();
    const onPopoverHideMock = mock();

    render(
      <HighlightPopover
        renderPopover={renderPopoverMock}
        onSelectionStart={onSelectionStartMock}
        onSelectionEnd={onSelectionEndMock}
        onPopoverShow={onPopoverShowMock}
        onPopoverHide={onPopoverHideMock}
      >
        <p data-testid="selectable-text-lifecycle">Lifecycle text</p>
      </HighlightPopover>,
    );

    const textElement = screen.getByTestId("selectable-text-lifecycle");
    await triggerSelection(textElement);

    await waitFor(() => {
      expect(onSelectionStartMock).toHaveBeenCalledTimes(1);
      expect(onPopoverShowMock).toHaveBeenCalledTimes(1);
      expect(onSelectionEndMock).toHaveBeenCalledWith("Lifecycle text");
    });

    await clearSelection();

    await waitFor(() => {
      expect(onPopoverHideMock).toHaveBeenCalledTimes(1);
    });

    expect(onSelectionStartMock).toHaveBeenCalledTimes(1);
    expect(onSelectionEndMock).toHaveBeenCalledTimes(1);
    expect(renderPopoverMock).toHaveBeenCalledTimes(1);
  });

  test("applies left alignment style", async () => {
    const renderPopoverMock = mock(
      ({ position }: { position: { top: number; left: number } }) => (
        <div data-testid="popover-left">{`${position.top},${position.left}`}</div>
      ),
    );

    render(
      <HighlightPopover
        renderPopover={renderPopoverMock}
        alignment="left"
        offset={{ x: 15 }}
      >
        <p data-testid="selectable-text-left">Left alignment</p>
      </HighlightPopover>,
    );

    const textElement = screen.getByTestId("selectable-text-left");
    await triggerSelection(textElement);

    const popover = await screen.findByRole("tooltip");
    const style = popover.getAttribute("style") ?? "";
    expect(style).toContain("left: 15px");
    expect(style).not.toContain("transform: translateX(-50%)");

    const [firstCall] = renderPopoverMock.mock.calls;
    const { position } = firstCall?.[0] as {
      position: { top: number; left: number };
    };
    expect(position.left).toBe(15);
  });

  test("applies right alignment style", async () => {
    const renderPopoverMock = mock(
      ({ position }: { position: { top: number; left: number } }) => (
        <div data-testid="popover-right">{`${position.top},${position.left}`}</div>
      ),
    );

    render(
      <HighlightPopover renderPopover={renderPopoverMock} alignment="right">
        <p data-testid="selectable-text-right">Right alignment</p>
      </HighlightPopover>,
    );

    const textElement = screen.getByTestId("selectable-text-right");
    await triggerSelection(textElement);

    const popover = await screen.findByRole("tooltip");
    const style = popover.getAttribute("style") ?? "";
    expect(style).toContain("right: calc(100% - 100px)");

    const [firstCall] = renderPopoverMock.mock.calls;
    const { position } = firstCall?.[0] as {
      position: { top: number; left: number };
    };
    expect(position.left).toBe(100);
  });

  test("ignores selection outside the container", async () => {
    const renderPopoverMock = mock(() => <div data-testid="popover-outside" />);

    render(
      <>
        <p data-testid="outside-text">Outside</p>
        <HighlightPopover renderPopover={renderPopoverMock}>
          <p data-testid="inside-text">Inside</p>
        </HighlightPopover>
      </>,
    );

    const outsideElement = screen.getByTestId("outside-text");
    await triggerSelection(outsideElement);

    await waitFor(() => {
      expect(renderPopoverMock).not.toHaveBeenCalled();
    });
    expect(screen.queryByTestId("popover-outside")).toBeNull();
  });

  test("calls onPopoverHide when unmounted while visible", async () => {
    const onPopoverHideMock = mock();

    const { unmount } = render(
      <HighlightPopover
        renderPopover={() => <div data-testid="popover-unmount" />}
        onPopoverHide={onPopoverHideMock}
      >
        <p data-testid="selectable-text-unmount">Unmount text</p>
      </HighlightPopover>,
    );

    const textElement = screen.getByTestId("selectable-text-unmount");
    await triggerSelection(textElement);

    await waitFor(() => {
      expect(screen.getByTestId("popover-unmount")).toBeDefined();
    });

    unmount();

    expect(onPopoverHideMock).toHaveBeenCalledTimes(1);
  });

  test("useHighlightPopover throws outside provider", () => {
    function Consumer() {
      useHighlightPopover();
      return null;
    }

    expect(() => render(<Consumer />)).toThrowError(
      "useHighlightPopover must be used within a HighlightPopover",
    );
  });

  test("useHighlightPopover exposes context inside provider", async () => {
    function Consumer() {
      const { showPopover, setShowPopover } = useHighlightPopover();
      return (
        <button
          data-testid="hook-toggle"
          onClick={() => setShowPopover((prev) => !prev)}
        >
          {showPopover ? "shown" : "hidden"}
        </button>
      );
    }

    render(
      <HighlightPopover renderPopover={() => <div />}>
        <Consumer />
      </HighlightPopover>,
    );

    const toggle = screen.getByTestId("hook-toggle");
    expect(toggle.textContent).toBe("hidden");

    await act(async () => {
      fireEvent.click(toggle);
    });

    await waitFor(() => {
      expect(toggle.textContent).toBe("shown");
    });
  });
});
