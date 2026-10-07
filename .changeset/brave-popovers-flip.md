---
"@omsimos/react-highlight-popover": major
---

### Breaking Changes 💥

- **React 18 or later is required.** React 17 is no longer supported.
- **`offset.y` now moves the popover away from the selection.** A positive `y` used to move it up. Flip the sign: `offset={{ y: -10 }}` becomes `offset={{ y: 10 }}`.
- **`offset.x` always moves the popover right**, including with `alignment="right"`.
- **`position` is now the popover's top-left corner.** The popover is no longer centered with a CSS transform.
- **The popover waits for the pointer to be released** before showing. Add `showWhileSelecting` to keep the old behavior.
- **`onSelectionStart` fires when a selection begins**, before `onSelectionEnd`.
- **The popover no longer has `role="tooltip"` and `aria-live="polite"`.** Pass them with the new `popoverProps` prop if you need them.
- **The build output is `dist/index.mjs`**, exposed through an `exports` map.

### New Features 🚀

- **Placement**: `placement="top"` places the popover above the selection.
- **Collision handling**: the popover flips and shifts to stay in the viewport. Configure it with `avoidCollisions` and `collisionPadding`.
- **Portal**: `portal` renders the popover outside the wrapper, so ancestors with `overflow: hidden` can't clip it.
- **Auto-update**: the popover follows the selection on scroll, resize, and reflow.
- **Escape to dismiss**: pressing Escape hides the popover until the selection changes. Turn it off with `closeOnEscape={false}`.
- **`popoverProps`**: spread `role`, `aria-*`, `className`, and other attributes onto the popover element.
- **`data-placement`** attribute on the popover element for styling arrows.
- **Selection range**: `renderPopover` receives `range` and `placement`, and `useHighlightPopover` returns `selectionRange` and `placement`.
- **Exported types**: `HighlightPopoverProps`, `HighlightPopoverContextValue`, `PopoverRenderProps`, `PopoverPosition`, `PopoverAlignment`, and `PopoverPlacement`.
- **`"use client"`** directive, so the component can be rendered from Server Components.

### Bug Fixes 🐞

- `onPopoverHide` no longer fires while the popover is visible when a parent re-renders with inline callbacks.
- The `selectionchange` listener is no longer re-subscribed on every render when `offset` is passed inline.
- Selecting text inside the popover no longer moves the popover onto its own text.
- Clicking a button inside the popover no longer hides the popover before the click is handled.
- Hiding the popover with `setShowPopover(false)` no longer reopens it for the same selection.
