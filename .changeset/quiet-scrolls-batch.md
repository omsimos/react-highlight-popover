---
"@omsimos/react-highlight-popover": patch
---

Fix triple-click selections, and reduce work on pages with several popovers and during scrolling.

- Triple-clicking a paragraph shows the popover for the whole paragraph. Browsers extend a triple-click selection to the start of the next block, which can be outside the wrapper or inside the popover. The popover used to hide, or keep showing the word from the double-click.
- Each `HighlightPopover` checks that a selection is inside it before reading the selected text, so other instances on the page skip that work.
- Scroll and resize events update the popover position at most once per frame.
- `HighlightPopover` is now a plain function component. `memo` never skipped a render, because `children` changes on every parent render.
