# React Highlight Popover

A headless React component that shows a popover when people select text. It has no dependencies besides React.

![React Highlight Popover](https://github.com/user-attachments/assets/d9bff2f4-e7aa-4374-9273-d1f0a3c744bb)

<div>
  <img src="https://github.com/omsimos/react-highlight-popover/actions/workflows/ci.yml/badge.svg" alt="actions">
  <img src="https://img.shields.io/bundlephobia/minzip/%40omsimos%2Freact-highlight-popover" alt="npm bundle size">
</div>

## Installation

```sh
npm i @omsimos/react-highlight-popover
```

Requires React 18 or 19.

## Usage

Wrap the content people can select, and return your popover from `renderPopover`. The `useHighlightPopover` hook reads the selection and closes the popover from inside it:

```jsx
import { HighlightPopover, useHighlightPopover } from "@omsimos/react-highlight-popover";

function Popover() {
  const { currentSelection, setShowPopover } = useHighlightPopover();

  return (
    <div className="bg-white border rounded-md p-2 shadow-lg">
      <p>You selected: {currentSelection}</p>
      <button className="font-semibold" onClick={() => setShowPopover(false)}>
        Close
      </button>
    </div>
  );
}

export function Example() {
  return (
    <HighlightPopover renderPopover={() => <Popover />} offset={{ y: 8 }}>
      <p>
        This is a sample text. Try selecting some words to see the popover in action.
      </p>
    </HighlightPopover>
  );
}
```

To upgrade from v1, see the [migration guide](https://react-highlight-popover.omsimos.com/docs/migration).

### [API reference](https://react-highlight-popover.omsimos.com/docs/api)
