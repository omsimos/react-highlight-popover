# Headless Highlight Popover for React

A lightweight and customizable React component for displaying popovers on text selection, with zero dependencies.

![React Highlight Popover](https://github.com/user-attachments/assets/d9bff2f4-e7aa-4374-9273-d1f0a3c744bb)

<div>
  <img src="https://github.com/omsimos/react-highlight-popover/actions/workflows/ci.yml/badge.svg" alt="actions">
  <img src="https://img.shields.io/bundlephobia/minzip/%40omsimos%2Freact-highlight-popover" alt="npm bundle size">
</div>

## Installation

Add the package using your package manager:

```sh
npm i @omsimos/react-highlight-popover
```

## Usage

Here's a basic example of how to use the `HighlightPopover` component:

```jsx
import { HighlightPopover, useHighlightPopover } from "@omsimos/react-highlight-popover";

function Popover() {
  const { currentSelection, setShowPopover } = useHighlightPopover();

  return (
    <div className="bg-white border rounded-md mt-2 p-2 shadow-lg select-none">
      <p>You selected: {currentSelection}</p>
      <button className="font-semibold" onClick={() => setShowPopover(false)}>
        Close
      </button>
    </div>
  );
}

export function Example() {
  return (
    <HighlightPopover renderPopover={() => <Popover />}>
      <p>
        This is a sample text. Try selecting some words to see the popover in action.
      </p>
    </HighlightPopover>
  );
}
```

### [API Reference](https://react-highlight-popover.omsimos.com/docs)
