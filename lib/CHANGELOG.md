# @omsimos/react-highlight-popover

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
