---
"@omsimos/react-highlight-popover": patch
---

Keep an inline popover open when a triple-click selection runs past it, ignore empty selections and outside presses, give consumers their own copy of the range, make `setShowPopover(true)` do nothing without a selection, leave Escape to IME compositions and elements that handled it, and skip copying ranges for selections outside the wrapper
