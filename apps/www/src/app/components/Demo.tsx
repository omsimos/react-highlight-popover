"use client";

import { HighlightPopover } from "@omsimos/react-highlight-popover";

function Popover() {
  return (
    <div className="bg-white border rounded-md px-3 p-2 font-semibold shadow-lg mt-2">
      <p>Hello World 👋</p>
    </div>
  );
}

export function Demo() {
  return (
    <HighlightPopover className="w-screen" renderPopover={() => <Popover />}>
      <h4 className="font-medium mt-3 text-lg">
        A headless component for displaying popovers on text selection.
      </h4>
    </HighlightPopover>
  );
}
