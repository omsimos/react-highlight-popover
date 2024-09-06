import { useState, useEffect, useCallback, useRef } from "react";

interface PopoverPosition {
  top: number;
  left: number;
}

interface UseHighlightPopoverResult {
  containerRef: React.RefObject<HTMLDivElement>;
  popoverPosition: PopoverPosition;
  showPopover: boolean;
  setShowPopover: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useHighlightPopover(): UseHighlightPopoverResult {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({
    top: 0,
    left: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const isSelectionWithinContainer = useCallback((selection: Selection) => {
    if (!containerRef.current) return false;

    const range = selection.getRangeAt(0);
    return containerRef.current.contains(range.commonAncestorContainer);
  }, []);

  const handleSelection = useCallback(() => {
    if (!containerRef.current) return;

    const selection = window.getSelection();
    if (
      selection &&
      selection.toString().trim().length > 0 &&
      isSelectionWithinContainer(selection)
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      const top = Math.min(
        rect.bottom - containerRect.top,
        containerRect.height,
      );
      const left = Math.max(
        0,
        Math.min(
          rect.left - containerRect.left + rect.width / 2,
          containerRect.width,
        ),
      );

      setPopoverPosition({ top, left });
      setShowPopover(true);
    } else {
      setShowPopover(false);
    }
  }, [isSelectionWithinContainer]);

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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return { containerRef, popoverPosition, showPopover, setShowPopover };
}
