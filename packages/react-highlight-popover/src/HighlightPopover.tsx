import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";

interface Position {
  top: number;
  left: number;
}

interface HighlightPopoverProps {
  children: React.ReactNode;
  renderPopover: (props: {
    position: Position;
    selection: string;
  }) => React.ReactNode;
  className?: string;
  offset?: { x?: number; y?: number };
  minSelectionLength?: number;
  onSelectionStart?: () => void;
  onSelectionEnd?: (selection: string) => void;
  onPopoverShow?: () => void;
  onPopoverHide?: () => void;
}

interface HighlightPopoverContextType {
  showPopover: boolean;
  setShowPopover: React.Dispatch<React.SetStateAction<boolean>>;
  popoverPosition: Position;
  currentSelection: string;
}

const HighlightPopoverContext =
  createContext<HighlightPopoverContextType | null>(null);

export function useHighlightPopover() {
  const context = useContext(HighlightPopoverContext);
  if (!context) {
    throw new Error(
      "useHighlightPopover must be used within a HighlightPopover",
    );
  }
  return context;
}

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
}: HighlightPopoverProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<Position>({
    top: 0,
    left: 0,
  });
  const [currentSelection, setCurrentSelection] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleSelection = useCallback(() => {
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

      const top = rect.bottom - containerRect.top - (offset && (offset.y ?? 0));
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
  }, [
    isSelectionWithinContainer,
    minSelectionLength,
    offset,
    onSelectionStart,
    onSelectionEnd,
    onPopoverShow,
    onPopoverHide,
  ]);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [handleSelection]);

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
  };

  return (
    <HighlightPopoverContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        style={{ position: "relative" }}
        className={className}
      >
        {children}
        {showPopover && (
          <div
            style={{
              zIndex: 40,
              width: "max-content",
              position: "absolute",
              transform: "translateX(-50%)",
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
            }}
          >
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
