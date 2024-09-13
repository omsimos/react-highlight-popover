"use client";

import { HighlightPopover } from "@omsimos/react-highlight-popover";

function Popover() {
  return (
    <div className="bg-white border rounded-md px-3 p-2 font-semibold shadow-lg mt-2 select-none">
      <p>Hello World 👋</p>
    </div>
  );
}

export function Demo() {
  return (
    <HighlightPopover alignment="right" renderPopover={() => <Popover />}>
      <h4 className="mt-3 text-lg">
        A headless component for displaying popovers on text selection.
      </h4>
    </HighlightPopover>
  );
}
