"use client";

import {
  HighlightPopover,
  useHighlightPopover,
} from "@omsimos/react-highlight-popover";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SelectionToolbar } from "./selection-toolbar";

export function Preview({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "not-prose my-6 rounded-xl border bg-fd-card p-6 text-[15px] leading-relaxed sm:p-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="popover-enter max-w-72 rounded-lg border bg-fd-popover p-3 text-sm text-fd-popover-foreground shadow-lg">
      {children}
    </div>
  );
}

function ClosablePopover() {
  const { currentSelection, setShowPopover } = useHighlightPopover();

  return (
    <Card>
      <p className="line-clamp-2">
        You selected: <strong>{currentSelection}</strong>
      </p>
      <button
        type="button"
        onClick={() => setShowPopover(false)}
        className="mt-2 rounded-md border px-2 py-0.5 text-xs font-medium transition-transform duration-150 hover:bg-fd-accent active:scale-[0.97]"
      >
        Close
      </button>
    </Card>
  );
}

export function BasicDemo() {
  return (
    <Preview>
      <HighlightPopover
        offset={{ y: 8 }}
        renderPopover={() => <ClosablePopover />}
      >
        <p>
          This is a sample text. Try selecting some words to see the popover in
          action, then use the button or press Escape to close it.
        </p>
      </HighlightPopover>
    </Preview>
  );
}

export function ReleaseDemo() {
  return (
    <Preview className="grid gap-8 sm:grid-cols-2">
      {[false, true].map((showWhileSelecting) => (
        <div key={String(showWhileSelecting)}>
          <p className="mb-2 font-mono text-xs text-fd-muted-foreground">
            showWhileSelecting={String(showWhileSelecting)}
          </p>
          <HighlightPopover
            offset={{ y: 8 }}
            showWhileSelecting={showWhileSelecting}
            renderPopover={({ selection }) => (
              <Card>
                <span className="line-clamp-2">{selection}</span>
              </Card>
            )}
          >
            <p>
              Drag slowly across this sentence and watch when the popover
              appears.
            </p>
          </HighlightPopover>
        </div>
      ))}
    </Preview>
  );
}

export function PortalDemo() {
  const [portal, setPortal] = useState(false);

  return (
    <Preview>
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={portal}
          onChange={(event) => setPortal(event.target.checked)}
          className="accent-fd-primary"
        />
        <code className="font-mono text-xs">portal</code>
      </label>
      <div className="overflow-hidden rounded-lg border border-dashed px-4 py-3">
        <HighlightPopover
          portal={portal}
          offset={{ y: 8 }}
          renderPopover={() => (
            <Card>This popover is {portal ? "portalled" : "clipped"}.</Card>
          )}
        >
          <p>
            This box has <code className="font-mono">overflow: hidden</code>.
            Select this text with and without the portal.
          </p>
        </HighlightPopover>
      </div>
    </Preview>
  );
}

export function ArrowDemo() {
  return (
    <Preview>
      <HighlightPopover
        offset={{ y: 10 }}
        popoverProps={{ className: "group" }}
        renderPopover={({ selection }) => (
          <div className="popover-enter relative rounded-lg bg-fd-foreground px-3 py-2 text-sm text-fd-background shadow-lg">
            <span
              aria-hidden
              className="absolute left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-fd-foreground group-data-[placement=bottom]:-top-1 group-data-[placement=top]:-bottom-1"
            />
            {selection.split(/\s+/).length} words
          </div>
        )}
      >
        <p>
          The arrow follows the{" "}
          <code className="font-mono">data-placement</code> attribute. Scroll
          this text near the bottom of your screen and select it to see the
          popover flip, arrow included.
        </p>
      </HighlightPopover>
    </Preview>
  );
}

export function ToolbarDemo() {
  return (
    <Preview>
      <SelectionToolbar>
        <p>
          Select text to highlight it, copy it, or share it. Highlights use the
          CSS Custom Highlight API with the selected <code>range</code>, so they
          don&apos;t change the page&apos;s DOM.
        </p>
      </SelectionToolbar>
    </Preview>
  );
}
