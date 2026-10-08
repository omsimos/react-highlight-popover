---
"@omsimos/react-highlight-popover": patch
---

Reduce work on pages with several popovers and during scrolling.

- Each `HighlightPopover` checks that a selection is inside it before reading the selected text, so other instances on the page skip that work.
- Scroll and resize events update the popover position at most once per frame.
- `HighlightPopover` is now a plain function component. `memo` never skipped a render, because `children` changes on every parent render.
