import { useState } from "react";
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
  type PopoverRenderProps,
} from "@omsimos/react-highlight-popover";
import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const toDOMRect = ({ top, left, width, height }: Rect) =>
  DOMRect.fromRect({ x: left, y: top, width, height });

const restorers: Array<() => void> = [];

const stubProperty = (target: object, key: string, value: unknown) => {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, { configurable: true, get: () => value });
  restorers.push(() => {
    if (original) Object.defineProperty(target, key, original);
    else delete (target as Record<string, unknown>)[key];
  });
};

let rangeRect: Rect;

const setPopoverSize = (width: number, height: number) => {
  stubProperty(HTMLElement.prototype, "offsetWidth", width);
  stubProperty(HTMLElement.prototype, "offsetHeight", height);
};

const setViewport = (width: number, height: number) => {
  stubProperty(document.documentElement, "clientWidth", width);
  stubProperty(document.documentElement, "clientHeight", height);
};

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

const dispatchSelectionChange = () =>
  document.dispatchEvent(new Event("selectionchange"));

const selectNode = async (node: Node) => {
  await act(async () => {
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    dispatchSelectionChange();
  });
  await flush();
};

const clearSelection = async () => {
  await act(async () => {
    window.getSelection()?.removeAllRanges();
    dispatchSelectionChange();
  });
  await flush();
};

const getPosition = (renderPopover: ReturnType<typeof mock>) => {
  const calls = renderPopover.mock.calls;
  return (calls[calls.length - 1]?.[0] as PopoverRenderProps).position;
};

describe("HighlightPopover", () => {
  beforeEach(() => {
    rangeRect = { top: 0, left: 0, width: 100, height: 50 };
    setPopoverSize(0, 0);
    setViewport(1000, 1000);

    const original = {
      element: Element.prototype.getBoundingClientRect,
      range: Range.prototype.getBoundingClientRect,
    };
    Element.prototype.getBoundingClientRect = () =>
      toDOMRect({ top: 0, left: 0, width: 100, height: 50 });
    Range.prototype.getBoundingClientRect = () => toDOMRect(rangeRect);
    restorers.push(() => {
      Element.prototype.getBoundingClientRect = original.element;
      Range.prototype.getBoundingClientRect = original.range;
    });
  });

  afterEach(async () => {
    cleanup();
    window.getSelection()?.removeAllRanges();
    while (restorers.length) restorers.pop()!();
  });

  test("renders children", () => {
    render(
      <HighlightPopover renderPopover={() => <div />}>
        <div data-testid="child">Test Child</div>
      </HighlightPopover>,
    );

    expect(screen.getByTestId("child")).toBeDefined();
  });

  test("shows the popover and fires callbacks in order", async () => {
    const calls: string[] = [];

    render(
      <HighlightPopover
        renderPopover={({ selection }) => (
          <div data-testid="popover">{selection}</div>
        )}
        onSelectionStart={() => calls.push("start")}
        onSelectionEnd={(text) => calls.push(`end:${text}`)}
        onPopoverShow={() => calls.push("show")}
      >
        <p data-testid="text">Select this text</p>
      </HighlightPopover>,
    );

    await selectNode(screen.getByTestId("text"));

    expect(screen.getByTestId("popover").textContent).toBe("Select this text");
    expect(calls).toEqual(["start", "end:Select this text", "show"]);
  });

  test("passes the selected range to renderPopover", async () => {
    const renderPopover = mock((_: PopoverRenderProps) => <div />);

    render(
      <HighlightPopover renderPopover={renderPopover}>
        <p data-testid="text">Range text</p>
      </HighlightPopover>,
    );

    await selectNode(screen.getByTestId("text"));

    const props = renderPopover.mock.calls.at(-1)![0];
    expect(props.range?.toString()).toBe("Range text");
    expect(props.placement).toBe("bottom");
  });

  test("does not show the popover for short selections", async () => {
    render(
      <HighlightPopover
        renderPopover={() => <div data-testid="popover" />}
        minSelectionLength={10}
      >
        <p data-testid="text">Short</p>
      </HighlightPopover>,
    );

    await selectNode(screen.getByTestId("text"));

    expect(screen.queryByTestId("popover")).toBeNull();
  });

  test("ignores selections outside the container", async () => {
    const renderPopover = mock(() => <div />);

    render(
      <>
        <p data-testid="outside">Outside</p>
        <HighlightPopover renderPopover={renderPopover}>
          <p>Inside</p>
        </HighlightPopover>
      </>,
    );

    await selectNode(screen.getByTestId("outside"));

    expect(renderPopover).not.toHaveBeenCalled();
  });

  test("fires lifecycle callbacks once per show/hide cycle", async () => {
    const onSelectionStart = mock();
    const onSelectionEnd = mock();
    const onPopoverShow = mock();
    const onPopoverHide = mock();

    render(
      <HighlightPopover
        renderPopover={() => <div />}
        onSelectionStart={onSelectionStart}
        onSelectionEnd={onSelectionEnd}
        onPopoverShow={onPopoverShow}
        onPopoverHide={onPopoverHide}
      >
        <p data-testid="text">Lifecycle text</p>
      </HighlightPopover>,
    );

    await selectNode(screen.getByTestId("text"));
    await act(async () => dispatchSelectionChange());
    await flush();
    await clearSelection();

    expect(onSelectionStart).toHaveBeenCalledTimes(1);
    expect(onSelectionEnd).toHaveBeenCalledTimes(1);
    expect(onSelectionEnd).toHaveBeenCalledWith("Lifecycle text");
    expect(onPopoverShow).toHaveBeenCalledTimes(1);
    expect(onPopoverHide).toHaveBeenCalledTimes(1);
  });

  test("calls onPopoverHide when unmounted while visible", async () => {
    const onPopoverHide = mock();

    const { unmount } = render(
      <HighlightPopover
        renderPopover={() => <div />}
        onPopoverHide={onPopoverHide}
      >
        <p data-testid="text">Unmount text</p>
      </HighlightPopover>,
    );

    await selectNode(screen.getByTestId("text"));
    unmount();

    expect(onPopoverHide).toHaveBeenCalledTimes(1);
  });

  describe("positioning", () => {
    test("offset moves the popover right and away from the selection", async () => {
      const renderPopover = mock((_: PopoverRenderProps) => <div />);
      setPopoverSize(40, 20);

      render(
        <HighlightPopover
          renderPopover={renderPopover}
          offset={{ x: 10, y: 20 }}
        >
          <p data-testid="text">Select this text</p>
        </HighlightPopover>,
      );

      await selectNode(screen.getByTestId("text"));

      // Centered: 0 + 100 / 2 - 40 / 2 + 10
      expect(getPosition(renderPopover)).toEqual({ top: 70, left: 40 });
      const style = screen
        .getByTestId("text")
        .parentElement!.lastElementChild!.getAttribute("style");
      expect(style).toContain("top: 70px");
      expect(style).toContain("left: 40px");
      expect(style).not.toContain("transform");
    });

    test("aligns to the left and right edges of the selection", async () => {
      const renderPopover = mock((_: PopoverRenderProps) => <div />);
      setPopoverSize(40, 20);
      rangeRect = { top: 0, left: 100, width: 200, height: 50 };

      const { rerender } = render(
        <HighlightPopover renderPopover={renderPopover} alignment="left">
          <p data-testid="text">Aligned text</p>
        </HighlightPopover>,
      );

      await selectNode(screen.getByTestId("text"));
      expect(getPosition(renderPopover).left).toBe(100);

      rerender(
        <HighlightPopover renderPopover={renderPopover} alignment="right">
          <p data-testid="text">Aligned text</p>
        </HighlightPopover>,
      );
      await flush();

      expect(getPosition(renderPopover).left).toBe(260);
    });

    test("places the popover above the selection", async () => {
      const renderPopover = mock((_: PopoverRenderProps) => <div />);
      setPopoverSize(40, 30);
      rangeRect = { top: 200, left: 0, width: 100, height: 50 };

      render(
        <HighlightPopover
          renderPopover={renderPopover}
          placement="top"
          offset={{ y: 8 }}
        >
          <p data-testid="text">Top text</p>
        </HighlightPopover>,
      );

      await selectNode(screen.getByTestId("text"));

      // 200 - 8 - 30
      expect(getPosition(renderPopover).top).toBe(162);
    });

    test("flips to the other side when there is no room", async () => {
      const renderPopover = mock((_: PopoverRenderProps) => <div />);
      setPopoverSize(40, 80);
      setViewport(1000, 300);
      rangeRect = { top: 200, left: 0, width: 100, height: 50 };

      render(
        <HighlightPopover renderPopover={renderPopover}>
          <p data-testid="text">Flip text</p>
        </HighlightPopover>,
      );

      await selectNode(screen.getByTestId("text"));

      const props = renderPopover.mock.calls.at(-1)![0];
      expect(props.placement).toBe("top");
      expect(props.position.top).toBe(120);
      expect(
        document
          .querySelector("[data-placement]")!
          .getAttribute("data-placement"),
      ).toBe("top");
    });

    test("shifts the popover inside the viewport", async () => {
      const renderPopover = mock((_: PopoverRenderProps) => <div />);
      setPopoverSize(150, 20);

      const { rerender } = render(
        <HighlightPopover renderPopover={renderPopover} alignment="right">
          <p data-testid="text">Shift text</p>
        </HighlightPopover>,
      );

      await selectNode(screen.getByTestId("text"));
      expect(getPosition(renderPopover).left).toBe(8);

      rerender(
        <HighlightPopover
          renderPopover={renderPopover}
          alignment="right"
          avoidCollisions={false}
        >
          <p data-testid="text">Shift text</p>
        </HighlightPopover>,
      );
      await flush();

      expect(getPosition(renderPopover).left).toBe(-50);
    });

    test("renders into a portal with fixed positioning", async () => {
      render(
        <HighlightPopover
          renderPopover={() => <div data-testid="popover" />}
          portal
        >
          <p data-testid="text">Portal text</p>
        </HighlightPopover>,
      );

      await selectNode(screen.getByTestId("text"));

      const popover = screen.getByTestId("popover").parentElement!;
      expect(popover.parentElement).toBe(document.body);
      expect(popover.getAttribute("style")).toContain("position: fixed");
    });
  });

  describe("pointer interaction", () => {
    test("waits for the pointer to be released before showing", async () => {
      const onSelectionStart = mock();
      const onSelectionEnd = mock();

      render(
        <HighlightPopover
          renderPopover={() => <div data-testid="popover" />}
          onSelectionStart={onSelectionStart}
          onSelectionEnd={onSelectionEnd}
        >
          <p data-testid="text">Drag text</p>
        </HighlightPopover>,
      );

      const text = screen.getByTestId("text");
      fireEvent.pointerDown(text, { button: 0 });
      await selectNode(text);

      expect(onSelectionStart).toHaveBeenCalledTimes(1);
      expect(onSelectionEnd).not.toHaveBeenCalled();
      expect(screen.queryByTestId("popover")).toBeNull();

      fireEvent.pointerUp(text, { button: 0 });
      await flush();

      expect(onSelectionEnd).toHaveBeenCalledWith("Drag text");
      expect(screen.getByTestId("popover")).toBeDefined();
    });

    test("showWhileSelecting shows the popover during a drag", async () => {
      render(
        <HighlightPopover
          renderPopover={() => <div data-testid="popover" />}
          showWhileSelecting
        >
          <p data-testid="text">Drag text</p>
        </HighlightPopover>,
      );

      const text = screen.getByTestId("text");
      fireEvent.pointerDown(text, { button: 0 });
      await selectNode(text);

      expect(screen.getByTestId("popover")).toBeDefined();
    });

    test("keeps the popover open while it is being clicked", async () => {
      const onClick = mock();

      render(
        <HighlightPopover
          renderPopover={() => (
            <button data-testid="action" onClick={onClick}>
              Action
            </button>
          )}
        >
          <p data-testid="text">Click text</p>
        </HighlightPopover>,
      );

      await selectNode(screen.getByTestId("text"));
      const action = screen.getByTestId("action");

      fireEvent.pointerDown(action, { button: 0 });
      await clearSelection();
      expect(screen.getByTestId("action")).toBe(action);

      fireEvent.pointerUp(action, { button: 0 });
      fireEvent.click(action);
      await flush();

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId("action")).toBeNull();
    });
  });

  describe("dismissal", () => {
    test("Escape hides the popover until the selection changes", async () => {
      const onPopoverHide = mock();

      render(
        <HighlightPopover
          renderPopover={() => <div data-testid="popover" />}
          onPopoverHide={onPopoverHide}
        >
          <p data-testid="first">First text</p>
          <p data-testid="second">Second text</p>
        </HighlightPopover>,
      );

      await selectNode(screen.getByTestId("first"));
      fireEvent.keyDown(document, { key: "Escape" });
      await flush();

      expect(screen.queryByTestId("popover")).toBeNull();
      expect(onPopoverHide).toHaveBeenCalledTimes(1);

      await act(async () => dispatchSelectionChange());
      await flush();
      expect(screen.queryByTestId("popover")).toBeNull();

      await selectNode(screen.getByTestId("second"));
      expect(screen.getByTestId("popover")).toBeDefined();
    });

    test("closeOnEscape={false} keeps the popover open", async () => {
      render(
        <HighlightPopover
          renderPopover={() => <div data-testid="popover" />}
          closeOnEscape={false}
        >
          <p data-testid="text">Escape text</p>
        </HighlightPopover>,
      );

      await selectNode(screen.getByTestId("text"));
      fireEvent.keyDown(document, { key: "Escape" });
      await flush();

      expect(screen.getByTestId("popover")).toBeDefined();
    });
  });

  test("applies popoverProps to the popover element", async () => {
    render(
      <HighlightPopover
        renderPopover={() => <span>Content</span>}
        popoverProps={{
          role: "dialog",
          "aria-label": "Text actions",
          className: "custom",
          style: { color: "red", top: 999 },
        }}
      >
        <p data-testid="text">Props text</p>
      </HighlightPopover>,
    );

    await selectNode(screen.getByTestId("text"));

    const popover = screen.getByRole("dialog", { name: "Text actions" });
    expect(popover.className).toBe("custom");
    const style = popover.getAttribute("style")!;
    expect(style).toContain("color: red");
    expect(style).not.toContain("top: 999px");
  });

  describe("regressions", () => {
    test("inline callbacks and parent re-renders don't fire onPopoverHide", async () => {
      const onPopoverHide = mock();

      function Parent() {
        const [, setSelection] = useState("");
        return (
          <HighlightPopover
            renderPopover={() => <div data-testid="popover" />}
            onSelectionEnd={(text) => setSelection(text)}
            onPopoverHide={() => onPopoverHide()}
          >
            <p data-testid="text">Parent text</p>
          </HighlightPopover>
        );
      }

      render(<Parent />);
      await selectNode(screen.getByTestId("text"));

      expect(screen.getByTestId("popover")).toBeDefined();
      expect(onPopoverHide).not.toHaveBeenCalled();
    });

    test("subscribes to selectionchange once across re-renders", async () => {
      const addEventListener = document.addEventListener;
      let subscriptions = 0;
      document.addEventListener = function (
        this: Document,
        ...args: Parameters<Document["addEventListener"]>
      ) {
        if (args[0] === "selectionchange") subscriptions++;
        return addEventListener.apply(this, args);
      } as Document["addEventListener"];
      restorers.push(() => {
        document.addEventListener = addEventListener;
      });

      const { rerender } = render(
        <HighlightPopover renderPopover={() => <div />} offset={{ x: 1 }}>
          <p data-testid="text">Subscribe text</p>
        </HighlightPopover>,
      );
      await selectNode(screen.getByTestId("text"));
      rerender(
        <HighlightPopover renderPopover={() => <div />} offset={{ x: 2 }}>
          <p data-testid="text">Subscribe text</p>
        </HighlightPopover>,
      );
      await flush();

      expect(subscriptions).toBe(1);
    });

    test("selecting text inside the popover doesn't re-anchor it", async () => {
      const onSelectionEnd = mock();

      render(
        <HighlightPopover
          renderPopover={() => <span data-testid="inner">Popover text</span>}
          onSelectionEnd={onSelectionEnd}
        >
          <p data-testid="text">Original text</p>
        </HighlightPopover>,
      );

      await selectNode(screen.getByTestId("text"));
      await selectNode(screen.getByTestId("inner"));

      expect(onSelectionEnd).toHaveBeenCalledTimes(1);
      expect(onSelectionEnd).toHaveBeenCalledWith("Original text");
      expect(screen.getByTestId("inner")).toBeDefined();
    });
  });

  describe("useHighlightPopover", () => {
    test("throws outside a HighlightPopover", () => {
      function Consumer() {
        useHighlightPopover();
        return null;
      }

      expect(() => render(<Consumer />)).toThrowError(
        "useHighlightPopover must be used within a HighlightPopover",
      );
    });

    test("exposes and controls the popover state", async () => {
      function Consumer() {
        const { showPopover, setShowPopover } = useHighlightPopover();
        return (
          <button
            data-testid="toggle"
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

      const toggle = screen.getByTestId("toggle");
      expect(toggle.textContent).toBe("hidden");

      fireEvent.click(toggle);

      await waitFor(() => {
        expect(toggle.textContent).toBe("shown");
      });
    });

    test("setShowPopover(false) dismisses the current selection", async () => {
      function Popover() {
        const { setShowPopover, currentSelection } = useHighlightPopover();
        return (
          <button data-testid="close" onClick={() => setShowPopover(false)}>
            {currentSelection}
          </button>
        );
      }

      render(
        <HighlightPopover renderPopover={() => <Popover />}>
          <p data-testid="text">Dismiss text</p>
        </HighlightPopover>,
      );

      await selectNode(screen.getByTestId("text"));
      expect(screen.getByTestId("close").textContent).toBe("Dismiss text");

      fireEvent.click(screen.getByTestId("close"));
      await act(async () => dispatchSelectionChange());
      await flush();

      expect(screen.queryByTestId("close")).toBeNull();
    });
  });
});
