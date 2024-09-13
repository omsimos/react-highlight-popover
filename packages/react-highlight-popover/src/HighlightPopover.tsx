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
 * Defines the possible alignment options for the popover.
 */
type PopoverAlignment = 'left' | 'center' | 'right';

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
  /** The z-index of the popover. */
  zIndex?: number;
  /** Alignment of the popover relative to the selected text. */
  alignment?: PopoverAlignment;
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

const HighlightPopoverContext = createContext<HighlightPopoverContextType | null>(null);

/**
 * Hook to access the HighlightPopover context.
 * @returns The HighlightPopover context value.
 * @throws Error if used outside of a HighlightPopover component.
 */
export function useHighlightPopover() {
  const context = useContext(HighlightPopoverContext);
  if (!context) {
    throw new Error("useHighlightPopover must be used within a HighlightPopover");
  }
  return context;
}

/**
 * HighlightPopover component for creating popovers on text selection within a container.
 */
export function HighlightPopover({
  children,
  renderPopover,
  className = "",
  offset = { x: 0, y: 0 },
  zIndex = 40,
  alignment = 'center',
  minSelectionLength = 1,
  onSelectionStart,
  onSelectionEnd,
  onPopoverShow,
  onPopoverHide,
}: HighlightPopoverProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<Position>({ top: 0, left: 0 });
  const [currentSelection, setCurrentSelection] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionRangeRef = useRef<Range | null>(null);

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
   * Updates the popover position based on the current selection, container scroll position, and alignment.
   */
  const updatePopoverPosition = useCallback(() => {
    if (!containerRef.current || !selectionRangeRef.current) return;

    const range = selectionRangeRef.current;
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const scrollTop = containerRef.current.scrollTop;
    const scrollLeft = containerRef.current.scrollLeft;

    const top = rect.bottom - containerRect.top + scrollTop - (offset.y ?? 0);
    let left: number;

    switch (alignment) {
      case 'left':
        left = rect.left - containerRect.left + scrollLeft + (offset.x ?? 0);
        break;
      case 'right':
        left = rect.right - containerRect.left + scrollLeft - (offset.x ?? 0);
        break;
      case 'center':
      default:
        left = rect.left - containerRect.left + scrollLeft + rect.width / 2 + (offset.x ?? 0);
        break;
    }

    setPopoverPosition({ top, left });
  }, [offset, alignment]);

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
        selectionRangeRef.current = range;

        updatePopoverPosition();
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
    onSelectionStart,
    onSelectionEnd,
    onPopoverShow,
    onPopoverHide,
    updatePopoverPosition,
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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPopover(false);
        onPopoverHide?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onPopoverHide]);

  // Handle container scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (showPopover) {
        updatePopoverPosition();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [showPopover, updatePopoverPosition]);

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
      top: `${popoverPosition.top}px`,
      ...(alignment === 'left' && { left: `${popoverPosition.left}px` }),
      ...(alignment === 'center' && {
        left: `${popoverPosition.left}px`,
        transform: "translateX(-50%)",
      }),
      ...(alignment === 'right' && { right: `calc(100% - ${popoverPosition.left}px)` }),
    }),
    [zIndex, popoverPosition.top, popoverPosition.left, alignment]
  );

  return (
    <HighlightPopoverContext.Provider value={contextValue}>
      <div ref={containerRef} style={{ position: "relative" }} className={className}>
        {children}
        {showPopover && (
          <div style={popoverStyle} role="tooltip" aria-live="polite">
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
