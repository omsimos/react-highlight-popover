# @omsimos/react-highlight-popover

## 2.0.0

### Major Changes

- 4a0a4cd: ### Breaking Changes 💥

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

### Patch Changes

- 791d454: Fix triple-click selections, and reduce work on pages with several popovers and during scrolling.

  - Triple-clicking a paragraph shows the popover for the whole paragraph. Browsers extend a triple-click selection to the start of the next block, which can be outside the wrapper or inside the popover. The popover used to hide, or keep showing the word from the double-click.
  - Each `HighlightPopover` checks that a selection is inside it before reading the selected text, so other instances on the page skip that work.
  - Scroll and resize events update the popover position at most once per frame.
  - `HighlightPopover` is now a plain function component. `memo` never skipped a render, because `children` changes on every parent render.

## 1.4.1

### Patch Changes

- ### Packaging 🔧
  - Disabled source map emission during the build and removed declaration maps, trimming the published package to the essentials (`index.js` and `index.d.ts`).
  - Result: npm package size is now closer to previous releases while keeping typings intact.

## 1.4.0

### Minor Changes

- ### Performance Improvements 🚀
  - Reduced unnecessary renders by skipping popover position and selection updates when nothing changed.
  - Added a safeguarded `requestAnimationFrame` throttle so multiple `selectionchange` events collapse into a single render and any pending frame is cancelled on unmount.

- ### Lifecycle Reliability ✅
  - Ensured selection lifecycle callbacks only fire on real visibility transitions and always emit `onPopoverHide` during teardown.
  - Prevented duplicate processing when range boundary points remain unchanged, keeping drag interactions smooth.

- ### Compatibility 🔁
  - Expanded peer dependency support to include React 19 while keeping full compatibility with React 17 and 18.

## 1.3.2

### Patch Changes

- ### Bug Fixes 🐞
  - **Removed Redundant Click-Outside Logic**:
    - The `useEffect` that handled clicks outside the popover has been removed. This was causing issues where clicking outside on elements with `user-select: none` would unintentionally close the popover, even though the text remained highlighted.
    - Since clicking outside naturally removes text selection, the previous logic was redundant and caused bugs by closing the popover prematurely.

  ***

  To upgrade to v1.3.2, run:

  ```bash
  npm install @omsimos/react-highlight-popover@latest
  ```

## 1.3.1

### Patch Changes

- ### Bug Fixes 🐞
  - **Removed Unintended `.mjs` File**: An unnecessary file was unintentionally included in the v1.3.0 build. This patch removes the file, ensuring a cleaner build and reducing the package size.

  ## Upgrade Instructions

  To upgrade to v1.3.1, run:

  ```bash
  npm install @omsimos/react-highlight-popover@latest
  ```

## 1.3.0

### Minor Changes

- ### Performance Improvements 🚀
  - **Memoized Components**: Both the main `HighlightPopover` component and the new `PopoverContent` component are now memoized using `React.memo()`, significantly reducing unnecessary re-renders.
  - **Optimized Event Handling**: The `selectionchange` event listener now uses `requestAnimationFrame` to batch updates, reducing the frequency of calculations and improving overall performance.
  - **Reduced State Updates**: The `handleSelection` function now checks conditions before updating state, minimizing unnecessary renders.
  - **Memoized Context Value**: The `contextValue` is now memoized to prevent unnecessary re-renders of context consumers.

  ### Documentation 📚
  - **Updated Basic Example**: The basic usage example in the documentation now demonstrates the use of the `useHighlightPopover` hook, providing a more comprehensive illustration of the component's capabilities.

  ## Upgrade Instructions

  To upgrade to v1.3.0, run:

  ```bash
  npm install @omsimos/react-highlight-popover@latest
  ```

## 1.2.0

### Minor Changes

- ### New Features 🚀
  - **Alignment Prop for Popover**: Introduced a new `alignment` prop that allows for positioning the popover relative to the selected text. Supported values: `'left'`, `'center'`, `'right'`. The default is set to `'center'`.

  ### Bug Fixes 🐞
  - **Resolved ARIA Typo**: Fixed a typo in the ARIA attribute to improve accessibility.

  ### Under The Hood 🔧
  - **ESM-Only Package**: The package has been converted to ESM-only, improving compatibility with modern JavaScript environments.
  - **Minified Package Output**: Reduced the bundle size by minifying the package output, leading to better performance and faster load times.

  ## Upgrade Instructions

  To upgrade to v1.2.0, run:

  ```bash
  npm install @omsimos/react-highlight-popover@latest
  ```

## 1.1.0

### Minor Changes

### New Features 🚀

- **Enhanced Hook Functionality**: The `useHighlightPopover` hook now exposes `setCurrentSelection`, allowing for more flexible control over the selected text.
- **Improved Performance**: Implemented `requestAnimationFrame()` for handling text selection, resulting in smoother updates and better overall performance.

### Improvements 🛠️

- **Better Documentation**: Added JSDoc comments throughout the codebase, improving developer experience with better type hints and function descriptions.
- **Accessibility Enhancements**: Added ARIA attributes to improve screen reader compatibility and overall accessibility.
- **Optimized Rendering**: Memoized the popover style object to reduce unnecessary re-renders and improve performance.

### Under The Hood 🔧

- Various code optimizations and refactoring for better maintainability and performance.

## Upgrade Instructions

To upgrade to v1.1.0, run:

```bash
npm install @omsimos/react-highlight-popover@latest
```

## 1.0.0

### Major Changes

- 2f48f7d: # React Highlight Popover v1.0.0

  We're excited to announce the initial release of React Highlight Popover, a customizable, headless React component for creating popovers on text selection, with zero dependencies!

  ## 🎉 Highlights
  - **Headless Component**: Maximum flexibility for styling and integration
  - **Zero Dependencies**: Only React as a peer dependency
  - **Customizable**: Fine-tune behavior with props and callbacks
  - **Lightweight**: Minimal impact on your bundle size
  - **TypeScript Support**: Full type definitions included

  ## 🚀 Features
  - Easy-to-use React component
  - Fully customizable popover content and styling
  - Configurable minimum selection length
  - Automatic positioning based on text selection
  - Customizable offset for fine-tuning popover position
  - Event callbacks for selection and popover lifecycle
  - Extensible architecture for advanced use cases

  ## 📦 Installation

  ```sh
  npm install @omsimos/react-highlight-popover
  ```

  or

  ```sh
  yarn add @omsimos/react-highlight-popover
  ```

  ## 🔧 Usage

  ```jsx
  import React from "react";
  import { HighlightPopover } from "@omsimos/react-highlight-popover";

  function App() {
    const renderPopover = ({ selection }) => (
      <div className="bg-white border rounded p-2 shadow-lg select-none">
        You selected: {selection}
      </div>
    );

    return (
      <HighlightPopover renderPopover={renderPopover}>
        <p>Select some text to see the popover in action!</p>
      </HighlightPopover>
    );
  }
  ```

  ## 📝 Changelog

  ### v1.0.0
  - Initial release of React Highlight Popover
  - Implemented core HighlightPopover component
  - Added useHighlightPopover hook for accessing internal state
  - Included props for customization:
    - renderPopover
    - className
    - offset
    - minSelectionLength
  - Added event callbacks:
    - onSelectionStart
    - onSelectionEnd
    - onPopoverShow
    - onPopoverHide
  - Implemented automatic positioning of popover
  - Added TypeScript definitions
  - Created comprehensive documentation and examples

  ## 📚 Documentation

  For full documentation, usage examples, and API references, please visit our [GitHub repository](https://github.com/omsimos/react-highlight-popover)
