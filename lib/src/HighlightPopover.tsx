import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
  useLayoutEffect,
} from "react";
import type {
  ReactNode,
  CSSProperties,
  HTMLAttributes,
  SetStateAction,
  Dispatch,
  ReactElement,
} from "react";
import { createPortal, flushSync } from "react-dom";

/**
 * Position of the popover's top-left corner in pixels. Relative to the
 * wrapper element, or to the viewport when the popover is portalled.
 */
export interface PopoverPosition {
  /** The top position of the popover in pixels. */
  top: number;
  /** The left position of the popover in pixels. */
  left: number;
}

/**
 * Horizontal alignment of the popover relative to the selected text.
 */
export type PopoverAlignment = "left" | "center" | "right";

/**
 * Side of the selected text the popover is placed on.
 */
export type PopoverPlacement = "top" | "bottom";

/**
 * Props passed to `renderPopover`.
 */
export interface PopoverRenderProps {
  /** Resolved position of the popover. */
  position: PopoverPosition;
  /** Resolved placement, which may differ from the requested one after flipping. */
  placement: PopoverPlacement;
  /** The selected text. */
  selection: string;
  /** A snapshot of the selected range. */
  range: Range | null;
}

/**
 * Props for the HighlightPopover component.
 */
export interface HighlightPopoverProps {
  /** The content where text selection will trigger the popover. */
  children: ReactNode;
  /** Function to render the popover content. */
  renderPopover: (props: PopoverRenderProps) => ReactNode;
  /** Additional CSS class for the wrapper element. */
  className?: string;
  /**
   * Offset in pixels. `x` moves the popover right, `y` moves it away from
   * the selection.
   */
  offset?: { x?: number; y?: number };
  /** The z-index of the popover. */
  zIndex?: number;
  /** Horizontal alignment of the popover relative to the selected text. */
  alignment?: PopoverAlignment;
  /** Side of the selected text to place the popover on. */
  placement?: PopoverPlacement;
  /** Flip and shift the popover to keep it inside the viewport. */
  avoidCollisions?: boolean;
  /** Minimum distance in pixels from the viewport edges when avoiding collisions. */
  collisionPadding?: number;
  /**
   * Render the popover in a portal so ancestors with `overflow: hidden`
   * can't clip it. `true` portals into `document.body`.
   */
  portal?: boolean | HTMLElement;
  /** Minimum length of text selection to trigger the popover. */
  minSelectionLength?: number;
  /**
   * Show and update the popover while the pointer is still dragging. By
   * default the popover waits until the pointer is released.
   */
  showWhileSelecting?: boolean;
  /** Hide the popover when the Escape key is pressed. */
  closeOnEscape?: boolean;
  /** Props spread onto the popover element, e.g. `role`, `aria-*` or `className`. */
  popoverProps?: HTMLAttributes<HTMLDivElement>;
  /** Callback fired when a selection begins inside the wrapper. */
  onSelectionStart?: () => void;
  /** Callback fired when a selection is completed, with the selected text. */
  onSelectionEnd?: (selection: string) => void;
  /** Callback fired when the popover is shown. */
  onPopoverShow?: () => void;
  /** Callback fired when the popover is hidden. */
  onPopoverHide?: () => void;
}

/**
 * Value returned by `useHighlightPopover`.
 */
export interface HighlightPopoverContextValue {
  /** Indicates whether the popover is currently visible. */
  showPopover: boolean;
  /**
   * Function to manually control popover visibility. Hiding the popover
   * dismisses the current selection until it changes.
   */
  setShowPopover: (show: SetStateAction<boolean>) => void;
  /** Current position of the popover. */
  popoverPosition: PopoverPosition;
  /** Resolved placement of the popover. */
  placement: PopoverPlacement;
  /** Currently selected text. */
  currentSelection: string;
  /** Function to manually set the current selection. */
  setCurrentSelection: Dispatch<SetStateAction<string>>;
  /** A snapshot of the selected range. */
  selectionRange: Range | null;
}

interface Layout extends PopoverPosition {
  placement: PopoverPlacement;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function useLatest<T>(value: T) {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

const isSameRange = (a: Range, b: Range) => {
  try {
    return (
      a.compareBoundaryPoints(Range.START_TO_START, b) === 0 &&
      a.compareBoundaryPoints(Range.END_TO_END, b) === 0
    );
  } catch {
    // Ranges in different documents or roots can't be compared.
    return false;
  }
};

/**
 * Returns a copy of the selected range limited to the container's text, or
 * null when the selection includes text outside the container.
 *
 * Triple-clicking a paragraph selects up to the start of the next block,
 * which can be outside the container or inside an inline popover. That
 * trailing part has no text, so it is cut off instead of rejecting the
 * selection.
 */
const getContainedRange = (
  container: Element,
  popover: Node | null,
  selection: Selection,
): Range | null => {
  for (let i = 1; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    if (!container.contains(range.commonAncestorContainer)) return null;
  }

  const range = selection.getRangeAt(0).cloneRange();
  if (!container.contains(range.startContainer)) return null;
  if (popover?.contains(range.startContainer)) return null;

  // The selectable content ends before an inline popover, or at the end of
  // the container.
  const limit = container.ownerDocument.createRange();
  if (popover && container.contains(popover)) {
    limit.setStartBefore(popover);
  } else {
    limit.selectNodeContents(container);
    limit.collapse(false);
  }

  const { startContainer: node, startOffset: offset } = limit;
  if (range.comparePoint(node, offset) === 0) {
    const tail = range.cloneRange();
    tail.setStart(node, offset);
    if (tail.toString().trim()) return null;
    range.setEnd(node, offset);
  }

  return range;
};

const HighlightPopoverContext =
  createContext<HighlightPopoverContextValue | null>(null);

/**
 * Hook to access the HighlightPopover context.
 * @returns The HighlightPopover context value.
 * @throws Error if used outside of a HighlightPopover component.
 */
export function useHighlightPopover(): HighlightPopoverContextValue {
  const context = useContext(HighlightPopoverContext);
  if (!context) {
    throw new Error(
      "useHighlightPopover must be used within a HighlightPopover",
    );
  }
  return context;
}

/**
 * HighlightPopover component for creating popovers on text selection within a container.
 */
export function HighlightPopover({
  children,
  renderPopover,
  className,
  offset,
  zIndex = 40,
  alignment = "center",
  placement = "bottom",
  avoidCollisions = true,
  collisionPadding = 8,
  portal = false,
  minSelectionLength = 1,
  showWhileSelecting = false,
  closeOnEscape = true,
  popoverProps,
  onSelectionStart,
  onSelectionEnd,
  onPopoverShow,
  onPopoverHide,
}: HighlightPopoverProps): ReactElement {
  const offsetX = offset?.x ?? 0;
  const offsetY = offset?.y ?? 0;
  const isPortalled = portal !== false;

  const [showPopover, setShowPopoverState] = useState(false);
  const [currentSelection, setCurrentSelection] = useState("");
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [layout, setLayout] = useState<Layout>({
    top: 0,
    left: 0,
    placement,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const showRef = useRef(false);
  const rangeRef = useRef<Range | null>(null);
  const dismissedRangeRef = useRef<Range | null>(null);
  const selectingRef = useRef(false);
  const reportedSelectionRef = useRef("");
  const pointerDownRef = useRef(false);
  const pointerInPopoverRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const notifiedShowRef = useRef(false);

  // Read through refs so listeners subscribe once and inline props are safe.
  const callbacksRef = useLatest({
    onSelectionStart,
    onSelectionEnd,
    onPopoverShow,
    onPopoverHide,
  });
  const optionsRef = useLatest({
    offsetX,
    offsetY,
    alignment,
    placement,
    isPortalled,
    avoidCollisions,
    collisionPadding,
    minSelectionLength,
    showWhileSelecting,
  });

  const applyShow = useCallback((show: boolean) => {
    if (showRef.current === show) return;
    showRef.current = show;
    setShowPopoverState(show);
  }, []);

  const setShowPopover = useCallback(
    (value: SetStateAction<boolean>) => {
      const show = typeof value === "function" ? value(showRef.current) : value;
      dismissedRangeRef.current = show ? null : rangeRef.current;
      if (!show) reportedSelectionRef.current = "";
      applyShow(show);
    },
    [applyShow],
  );

  const resetSelection = useCallback(() => {
    selectingRef.current = false;
    dismissedRangeRef.current = null;
    reportedSelectionRef.current = "";
    if (rangeRef.current) {
      rangeRef.current = null;
      setSelectionRange(null);
    }
    setCurrentSelection((prev) => (prev === "" ? prev : ""));
    applyShow(false);
  }, [applyShow]);

  const evaluateSelection = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Leave the popover alone while it is being interacted with.
    if (pointerDownRef.current && pointerInPopoverRef.current) return;

    const selection = container.ownerDocument.getSelection();
    const popover = popoverRef.current;
    // Selecting text inside the popover doesn't move it.
    if (popover && selection && popover.contains(selection.anchorNode)) {
      return;
    }

    if (!selection || selection.rangeCount === 0) {
      resetSelection();
      return;
    }

    // Check containment first so other instances on the page skip the
    // cost of stringifying a large selection.
    const range = getContainedRange(container, popover, selection);
    if (!range) {
      // Dragging from the text into the popover doesn't move it either.
      if (popover?.contains(selection.focusNode)) return;
      resetSelection();
      return;
    }

    const options = optionsRef.current;
    const text = selection.toString().trim();
    if (text.length < options.minSelectionLength) {
      resetSelection();
      return;
    }

    if (!selectingRef.current) {
      selectingRef.current = true;
      callbacksRef.current.onSelectionStart?.();
    }

    if (pointerDownRef.current && !options.showWhileSelecting) return;

    if (dismissedRangeRef.current) {
      if (isSameRange(dismissedRangeRef.current, range)) return;
      dismissedRangeRef.current = null;
    }
    if (
      showRef.current &&
      rangeRef.current &&
      isSameRange(rangeRef.current, range)
    ) {
      return;
    }

    // `range` is already a copy, which the browser can't mutate.
    rangeRef.current = range;
    setSelectionRange(range);
    setCurrentSelection(text);
    applyShow(true);

    if (reportedSelectionRef.current !== text) {
      reportedSelectionRef.current = text;
      callbacksRef.current.onSelectionEnd?.(text);
    }
  }, [applyShow, callbacksRef, optionsRef, resetSelection]);

  const updatePosition = useCallback(() => {
    const container = containerRef.current;
    const popover = popoverRef.current;
    const range = rangeRef.current;
    if (!container || !popover || !range) return;

    const {
      offsetX: x,
      offsetY: y,
      alignment,
      placement: preferred,
      isPortalled,
      avoidCollisions,
      collisionPadding: padding,
    } = optionsRef.current;
    const viewport = container.ownerDocument.documentElement;
    const anchor = range.getBoundingClientRect();
    const width = popover.offsetWidth;
    const height = popover.offsetHeight;

    const below = anchor.bottom + y;
    const above = anchor.top - y - height;
    let resolved = preferred;

    if (avoidCollisions) {
      const fitsBelow = below + height <= viewport.clientHeight - padding;
      const fitsAbove = above >= padding;
      if (preferred === "bottom" && !fitsBelow && fitsAbove) {
        resolved = "top";
      } else if (preferred === "top" && !fitsAbove && fitsBelow) {
        resolved = "bottom";
      }
    }

    let top = resolved === "bottom" ? below : above;
    let left =
      alignment === "left"
        ? anchor.left + x
        : alignment === "right"
          ? anchor.right - width + x
          : anchor.left + anchor.width / 2 - width / 2 + x;

    if (avoidCollisions) {
      const maxLeft = viewport.clientWidth - width - padding;
      left = Math.max(padding, Math.min(left, maxLeft));
    }

    if (!isPortalled) {
      const rect = container.getBoundingClientRect();
      top += container.scrollTop - rect.top - container.clientTop;
      left += container.scrollLeft - rect.left - container.clientLeft;
    }

    setLayout((prev) =>
      prev.top === top && prev.left === left && prev.placement === resolved
        ? prev
        : { top, left, placement: resolved },
    );
  }, [optionsRef]);

  // Listen for selection and pointer changes for the component's lifetime.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const doc = container.ownerDocument;
    const win = doc.defaultView ?? window;

    const schedule = () => {
      if (frameRef.current !== null) return;
      frameRef.current = win.requestAnimationFrame(() => {
        frameRef.current = null;
        evaluateSelection();
      });
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      pointerDownRef.current = true;
      pointerInPopoverRef.current =
        popoverRef.current?.contains(event.target as Node) ?? false;
    };
    const onPointerUp = () => {
      if (!pointerDownRef.current) return;
      pointerDownRef.current = false;
      pointerInPopoverRef.current = false;
      schedule();
    };

    doc.addEventListener("selectionchange", schedule);
    doc.addEventListener("pointerdown", onPointerDown, true);
    doc.addEventListener("pointerup", onPointerUp, true);
    doc.addEventListener("pointercancel", onPointerUp, true);
    win.addEventListener("blur", onPointerUp);

    return () => {
      doc.removeEventListener("selectionchange", schedule);
      doc.removeEventListener("pointerdown", onPointerDown, true);
      doc.removeEventListener("pointerup", onPointerUp, true);
      doc.removeEventListener("pointercancel", onPointerUp, true);
      win.removeEventListener("blur", onPointerUp);
      if (frameRef.current !== null) {
        win.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [evaluateSelection]);

  // Measure and position before paint whenever the inputs change.
  useIsomorphicLayoutEffect(() => {
    if (showPopover) updatePosition();
  }, [
    showPopover,
    selectionRange,
    currentSelection,
    offsetX,
    offsetY,
    alignment,
    placement,
    isPortalled,
    avoidCollisions,
    collisionPadding,
    updatePosition,
  ]);

  // Keep the popover attached on scroll, resize and reflow.
  useEffect(() => {
    const container = containerRef.current;
    if (!showPopover || !container) return;
    const win = container.ownerDocument.defaultView ?? window;

    // Flush synchronously so the popover moves in the same frame.
    const update = () => flushSync(updatePosition);
    // Nested scroll containers can fire several events per frame. Scroll
    // and resize events run before animation frames, so batching them
    // into one frame still updates before paint.
    let frame: number | null = null;
    const schedule = () => {
      if (frame !== null) return;
      frame = win.requestAnimationFrame(() => {
        frame = null;
        update();
      });
    };

    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(container);
    if (popoverRef.current) observer?.observe(popoverRef.current);
    win.addEventListener("scroll", schedule, {
      capture: true,
      passive: true,
    });
    win.addEventListener("resize", schedule, { passive: true });

    return () => {
      observer?.disconnect();
      win.removeEventListener("scroll", schedule, { capture: true });
      win.removeEventListener("resize", schedule);
      if (frame !== null) win.cancelAnimationFrame(frame);
    };
  }, [showPopover, updatePosition]);

  useEffect(() => {
    const container = containerRef.current;
    if (!showPopover || !closeOnEscape || !container) return;
    const doc = container.ownerDocument;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowPopover(false);
    };

    doc.addEventListener("keydown", onKeyDown);
    return () => doc.removeEventListener("keydown", onKeyDown);
  }, [showPopover, closeOnEscape, setShowPopover]);

  useEffect(() => {
    if (notifiedShowRef.current === showPopover) return;
    notifiedShowRef.current = showPopover;
    if (showPopover) {
      callbacksRef.current.onPopoverShow?.();
    } else {
      callbacksRef.current.onPopoverHide?.();
    }
  }, [showPopover, callbacksRef]);

  useEffect(() => {
    return () => {
      if (notifiedShowRef.current) {
        notifiedShowRef.current = false;
        callbacksRef.current.onPopoverHide?.();
      }
    };
  }, [callbacksRef]);

  const popoverPosition = useMemo<PopoverPosition>(
    () => ({ top: layout.top, left: layout.left }),
    [layout.top, layout.left],
  );

  const contextValue = useMemo<HighlightPopoverContextValue>(
    () => ({
      showPopover,
      setShowPopover,
      popoverPosition,
      placement: layout.placement,
      currentSelection,
      setCurrentSelection,
      selectionRange,
    }),
    [
      showPopover,
      setShowPopover,
      popoverPosition,
      layout.placement,
      currentSelection,
      selectionRange,
    ],
  );

  let popover: ReactNode = null;
  if (showPopover) {
    const style: CSSProperties = {
      ...popoverProps?.style,
      position: isPortalled ? "fixed" : "absolute",
      top: layout.top,
      left: layout.left,
      width: "max-content",
      zIndex,
    };

    popover = (
      <div
        {...popoverProps}
        ref={popoverRef}
        style={style}
        data-placement={layout.placement}
      >
        {renderPopover({
          position: popoverPosition,
          placement: layout.placement,
          selection: currentSelection,
          range: selectionRange,
        })}
      </div>
    );

    if (isPortalled) {
      const target =
        portal === true
          ? (containerRef.current?.ownerDocument ?? document).body
          : portal;
      popover = createPortal(popover, target);
    }
  }

  return (
    <HighlightPopoverContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        style={{ position: "relative" }}
        className={className}
      >
        {children}
        {popover}
      </div>
    </HighlightPopoverContext.Provider>
  );
}
