"use client";

import {
  HighlightPopover,
  useHighlightPopover,
} from "@omsimos/react-highlight-popover";
import { Check, Copy, Highlighter, Share } from "lucide-react";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { siteUrl } from "@/lib/shared";

const HIGHLIGHT_NAME = "rhp-marker";

// Persistent highlights shared by every toolbar on the page.
const listeners = new Set<() => void>();
let highlightCount = 0;

function getRegistry() {
  if (typeof CSS === "undefined" || !("highlights" in CSS)) return null;
  let highlight = CSS.highlights.get(HIGHLIGHT_NAME);
  if (!highlight) {
    highlight = new Highlight();
    CSS.highlights.set(HIGHLIGHT_NAME, highlight);
  }
  return highlight;
}

function emit() {
  highlightCount = getRegistry()?.size ?? 0;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addHighlight(range: Range) {
  const registry = getRegistry();
  if (!registry) return;
  registry.add(range.cloneRange());
  emit();
}

export function clearHighlights() {
  getRegistry()?.clear();
  emit();
}

export function useHighlightCount() {
  return useSyncExternalStore(
    subscribe,
    () => highlightCount,
    () => 0,
  );
}

function useSupportsHighlights() {
  return useSyncExternalStore(
    () => () => {},
    () => typeof CSS !== "undefined" && "highlights" in CSS,
    () => false,
  );
}

export function ToolbarButton({
  className,
  children,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium",
        "transition-[background-color,transform] duration-150 ease-out",
        "hover:bg-fd-background/15 active:scale-[0.97]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marker",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ToolbarSurface({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "popover-enter flex items-center gap-0.5 rounded-full bg-fd-foreground p-1 text-fd-background",
        "shadow-[0_8px_24px_-6px_rgb(0_0_0/0.25),0_2px_6px_-2px_rgb(0_0_0/0.15)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="mx-0.5 h-4 w-px bg-fd-background/20" />;
}

function Toolbar() {
  const { currentSelection, selectionRange, setShowPopover } =
    useHighlightPopover();
  const supportsHighlights = useSupportsHighlights();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timeout);
  }, [copied]);

  const highlight = () => {
    if (!selectionRange) return;
    addHighlight(selectionRange);
    setShowPopover(false);
    window.getSelection()?.removeAllRanges();
  };

  const copy = async () => {
    await navigator.clipboard.writeText(currentSelection);
    setCopied(true);
  };

  const share = () => {
    const quote = currentSelection.slice(0, 200);
    const text = `“${quote}${currentSelection.length > 200 ? "…" : ""}”`;
    const url = new URL("https://x.com/intent/post");
    url.searchParams.set("text", text);
    url.searchParams.set("url", siteUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <ToolbarSurface>
      {supportsHighlights && (
        <>
          <ToolbarButton onClick={highlight}>
            <Highlighter className="size-3.5" aria-hidden />
            Highlight
          </ToolbarButton>
          <Divider />
        </>
      )}
      <ToolbarButton onClick={copy} aria-live="polite">
        <span className="relative size-3.5" aria-hidden>
          <Copy
            className={cn(
              "absolute inset-0 size-3.5 transition-[opacity,filter,transform] duration-200",
              copied && "scale-75 opacity-0 blur-[2px]",
            )}
          />
          <Check
            className={cn(
              "absolute inset-0 size-3.5 transition-[opacity,filter,transform] duration-200",
              !copied && "scale-75 opacity-0 blur-[2px]",
            )}
          />
        </span>
        {copied ? "Copied" : "Copy"}
      </ToolbarButton>
      <Divider />
      <ToolbarButton onClick={share}>
        <Share className="size-3.5" aria-hidden />
        Share
      </ToolbarButton>
    </ToolbarSurface>
  );
}

/**
 * Wraps content so selecting text shows a toolbar with real actions.
 */
export function SelectionToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <HighlightPopover
      className={className}
      offset={{ y: 10 }}
      renderPopover={() => <Toolbar />}
      popoverProps={{ role: "toolbar", "aria-label": "Selection actions" }}
    >
      {children}
    </HighlightPopover>
  );
}

/**
 * Floating chip that shows how many highlights exist and clears them.
 */
export function HighlightsChip() {
  const count = useHighlightCount();
  if (count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="popover-enter pointer-events-auto flex items-center gap-1 rounded-full border bg-fd-background/90 py-1 pr-1 pl-4 text-sm shadow-lg backdrop-blur">
        <span className="tabular-nums">
          {count} {count === 1 ? "highlight" : "highlights"}
        </span>
        <button
          type="button"
          onClick={clearHighlights}
          className="rounded-full px-3 py-1 font-medium text-fd-muted-foreground transition-[background-color,color,transform] duration-150 hover:bg-fd-accent hover:text-fd-accent-foreground active:scale-[0.97]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
