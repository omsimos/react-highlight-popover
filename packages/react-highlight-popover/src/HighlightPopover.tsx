import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

/**
 * Represents the position of the popover.
 */
interface Position {
  /** The top position of the popover in pixels. */
  top: number;
  /** The left position of the popover in pixels. */
  left: number;
}

/**
 * Props for the HighlightPopover component.
 */
interface HighlightPopoverProps {
  /** The content where text selection will trigger the popover. */
  children: React.ReactNode;
  /** Function to render the popover component. */
  renderPopover: (props: {
    position: Position;
    selection: string;
  }) => React.ReactNode;
  /** Additional CSS class for the wrapper element. */
  className?: string;
  /** Offset for adjusting popover position. */
  offset?: { x?: number; y?: number };
  /** Minimum length of text selection to trigger the popover. */
  minSelectionLength?: number;
  /** Callback fired when text selection starts. */
  onSelectionStart?: () => void;
  /** Callback fired when text selection ends. */
  onSelectionEnd?: (selection: string) => void;
  /** Callback fired when the popover is shown. */
  onPopoverShow?: () => void;
  /** Callback fired when the popover is hidden. */
  onPopoverHide?: () => void;
  /** The z-index of the popover. */
  zIndex?: number;
}

/**
 * Context type for the HighlightPopover.
 */
interface HighlightPopoverContextType {
  /** Indicates whether the popover is currently visible. */
  showPopover: boolean;
  /** Function to manually control popover visibility. */
  setShowPopover: React.Dispatch<React.SetStateAction<boolean>>;
  /** Current position of the popover. */
  popoverPosition: Position;
  /** Currently selected text. */
  currentSelection: string;
  /** Function to manually set the current selection. */
  setCurrentSelection: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Context for the HighlightPopover component.
 */
const HighlightPopoverContext =
  createContext<HighlightPopoverContextType | null>(null);

/**
 * Hook to access the HighlightPopover context.
 * @returns The HighlightPopover context value.
 * @throws Error if used outside of a HighlightPopover component.
 */
export function useHighlightPopover() {
  const context = useContext(HighlightPopoverContext);
  if (!context) {
    throw new Error(
      "useHighlightPopover must be used within a HighlightPopover",
    );
  }
  return context;
}

/**
 * HighlightPopover component for creating popovers on text selection within this container.
 */
export function HighlightPopover({
  children,
  renderPopover,
  className = "",
  offset = { x: 0, y: 0 },
  minSelectionLength = 1,
  onSelectionStart,
  onSelectionEnd,
  onPopoverShow,
  onPopoverHide,
  zIndex = 40,
}: HighlightPopoverProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<Position>({
    top: 0,
    left: 0,
  });
  const [currentSelection, setCurrentSelection] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Checks if the current selection is within the HighlightPopover container.
   * @param selection - The current selection object.
   * @returns True if the selection is within the container, false otherwise.
   */
  const isSelectionWithinContainer = useCallback((selection: Selection) => {
    if (!containerRef.current) return false;
    for (let i = 0; i < selection.rangeCount; i++) {
      const range = selection.getRangeAt(i);
      if (
        !containerRef.current.contains(range.startContainer) ||
        !containerRef.current.contains(range.endContainer)
      ) {
        return false;
      }
    }
    return true;
  }, []);

  /**
   * Handles the text selection and popover positioning.
   */
  const handleSelection = useCallback(() => {
    requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const selection = window.getSelection();
      if (
        selection &&
        selection.toString().trim().length >= minSelectionLength &&
        isSelectionWithinContainer(selection)
      ) {
        onSelectionStart?.();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const top =
          rect.bottom - containerRect.top - (offset && (offset.y ?? 0));
        const left =
          rect.left -
          containerRect.left +
          rect.width / 2 +
          (offset && (offset.x ?? 0));

        setPopoverPosition({ top, left });
        setCurrentSelection(selection.toString());
        setShowPopover(true);
        onPopoverShow?.();
        onSelectionEnd?.(selection.toString());
      } else {
        setShowPopover(false);
        onPopoverHide?.();
      }
    });
  }, [
    isSelectionWithinContainer,
    minSelectionLength,
    offset,
    onSelectionStart,
    onSelectionEnd,
    onPopoverShow,
    onPopoverHide,
  ]);

  // Add event listener for selection changes
  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [handleSelection]);

  // Handle clicks outside the popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
        onPopoverHide?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onPopoverHide]);

  const contextValue: HighlightPopoverContextType = {
    showPopover,
    setShowPopover,
    popoverPosition,
    currentSelection,
    setCurrentSelection,
  };

  const popoverStyle = useMemo(
    () => ({
      zIndex,
      width: "max-content",
      position: "absolute" as const,
      transform: "translateX(-50%)",
      top: `${popoverPosition.top}px`,
      left: `${popoverPosition.left}px`,
    }),
    [zIndex, popoverPosition.top, popoverPosition.left],
  );

  return (
    <HighlightPopoverContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        style={{ position: "relative" }}
        className={className}
      >
        {children}
        {showPopover && (
          <div style={popoverStyle} role="tooltip" aira-live="polite">
            {renderPopover({
              position: popoverPosition,
              selection: currentSelection,
            })}
          </div>
        )}
      </div>
    </HighlightPopoverContext.Provider>
  );
}
