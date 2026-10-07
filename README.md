# @omsimos/react-highlight-popover

A customizable, headless React component for creating popovers on text selection, with zero dependencies.

![React Highlight Popover](https://github.com/user-attachments/assets/d9bff2f4-e7aa-4374-9273-d1f0a3c744bb)

<div>
  <img src="https://github.com/omsimos/react-highlight-popover/actions/workflows/ci.yml/badge.svg" alt="actions">
  <img alt="NPM Version" src="https://img.shields.io/npm/v/%40omsimos%2Freact-highlight-popover?logo=npm&labelColor=%23cc3534&color=%23505050">
  <img src="https://img.shields.io/bundlephobia/minzip/%40omsimos%2Freact-highlight-popover" alt="npm bundle size" >
</div>

## Features

- 🎯 Easy-to-use React component with zero dependencies
- 🧠 Headless component for maximum flexibility
- 🎨 Fully customizable popover content and styling
- 🎭 Smooth rendering with minimal re-renders
- 🖱️ Shows the popover when the selection is complete
- 📐 Placement, alignment, offset, and viewport collision handling
- 🧭 Follows the selection on scroll, resize, and reflow
- 🚪 Optional portal rendering to escape `overflow: hidden`
- ⌨️ Escape to dismiss, and configurable ARIA attributes
- 🔄 Event callbacks for selection and popover lifecycle
- ⚛️ React 18 and 19, with `"use client"` for Server Components

## Installation

Add the package using your package manager:

```sh
npm i @omsimos/react-highlight-popover
```

Requires React 18 or 19. The component is marked with `"use client"`, so you can render it directly from a Next.js Server Component.

## Usage

Here's a basic example of how to use the `HighlightPopover` component:

```jsx
import { HighlightPopover } from '@omsimos/react-highlight-popover';

function App() {
  const renderPopover = ({ selection }) => (
    <div className="bg-white border rounded-sm p-2 shadow-lg">
      You selected: {selection}
    </div>
  );

  return (
    <HighlightPopover renderPopover={renderPopover} offset={{ y: 8 }}>
      <p>
        This is a sample text. Try selecting some words to see the popover in action.
      </p>
    </HighlightPopover>
  );
}

export default App;
```

## Positioning

The popover is placed below the selection by default. Use `placement="top"` to place it above, and `alignment` to line it up with the left edge, center, or right edge of the selection.

`offset.y` is the gap between the selection and the popover, and `offset.x` moves the popover to the right. Prefer `offset` over margins on your popover content, so the gap stays correct when the popover flips.

When the popover doesn't fit in the viewport, it flips to the other side of the selection and shifts horizontally to stay on screen. Set `collisionPadding` to change the minimum distance from the viewport edges, or `avoidCollisions={false}` to turn this off.

The popover follows the selection when the page scrolls, the window resizes, or the content reflows.

If an ancestor has `overflow: hidden`, render the popover in a portal so it can't be clipped:

```jsx
<HighlightPopover renderPopover={renderPopover} portal>
  {children}
</HighlightPopover>
```

`portal` also accepts an element to render into. Portalled popovers use `position: fixed`, so the target element shouldn't have a `transform`.

The popover element has a `data-placement` attribute with the resolved placement, which you can use to style arrows.

## Interaction

When selecting with a mouse or pen, the popover appears once the pointer is released. Set `showWhileSelecting` to show and update it during the drag instead. Selections made with the keyboard show the popover immediately.

Clicking inside the popover keeps it open, so buttons work even if the click clears the selection. Selecting text inside the popover doesn't move it.

Pressing Escape hides the popover. It stays hidden until the selection changes. Set `closeOnEscape={false}` to turn this off.

## Accessibility

The popover is headless and doesn't set a `role`, since the right one depends on what you render. Use `popoverProps` to add one:

```jsx
<HighlightPopover
  renderPopover={renderPopover}
  popoverProps={{ role: 'dialog', 'aria-label': 'Text actions' }}
>
  {children}
</HighlightPopover>
```

Use `role: 'tooltip'` only for content that isn't interactive.

## API

### `HighlightPopover` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | (required) | The content where text selection will trigger the popover |
| `renderPopover` | `(props: PopoverRenderProps) => React.ReactNode` | (required) | Function to render the popover content |
| `className` | `string` | `undefined` | Additional CSS class for the wrapper element |
| `offset` | `{ x?: number, y?: number }` | `{ x: 0, y: 0 }` | `x` moves the popover right, `y` moves it away from the selection |
| `zIndex` | `number` | `40` | The z-index of the popover |
| `alignment` | `'left'` \| `'center'` \| `'right'` | `'center'` | Horizontal alignment of the popover relative to the selected text |
| `placement` | `'top'` \| `'bottom'` | `'bottom'` | Side of the selected text to place the popover on |
| `avoidCollisions` | `boolean` | `true` | Flip and shift the popover to keep it inside the viewport |
| `collisionPadding` | `number` | `8` | Minimum distance in pixels from the viewport edges |
| `portal` | `boolean` \| `HTMLElement` | `false` | Render the popover in a portal. `true` uses `document.body` |
| `minSelectionLength` | `number` | `1` | Minimum length of text selection to trigger the popover |
| `showWhileSelecting` | `boolean` | `false` | Show the popover while the pointer is still dragging |
| `closeOnEscape` | `boolean` | `true` | Hide the popover when Escape is pressed |
| `popoverProps` | `React.HTMLAttributes<HTMLDivElement>` | `undefined` | Props spread onto the popover element, e.g. `role`, `aria-*` or `className` |
| `onSelectionStart` | `() => void` | `undefined` | Callback fired when a selection begins inside the wrapper |
| `onSelectionEnd` | `(selection: string) => void` | `undefined` | Callback fired when a selection is completed |
| `onPopoverShow` | `() => void` | `undefined` | Callback fired when the popover is shown |
| `onPopoverHide` | `() => void` | `undefined` | Callback fired when the popover is hidden |

Callbacks can be inline functions. The latest version is always called, and changing them doesn't trigger extra callbacks.

### `renderPopover`

`renderPopover` receives:

- `selection`: `string` - The selected text
- `position`: `{ top: number, left: number }` - Position of the popover's top-left corner
- `placement`: `'top'` \| `'bottom'` - Resolved placement, after flipping
- `range`: `Range | null` - A snapshot of the selected range, e.g. for `range.getClientRects()`

### `useHighlightPopover` Hook

The `useHighlightPopover` hook can be used to access the internal state of the `HighlightPopover` component. It returns an object with the following properties:

- `showPopover`: `boolean` - Indicates whether the popover is currently visible
- `setShowPopover`: `(show: boolean | ((prev: boolean) => boolean)) => void` - Function to manually control popover visibility. Hiding the popover dismisses the current selection until it changes
- `popoverPosition`: `{ top: number, left: number }` - Current position of the popover
- `placement`: `'top'` \| `'bottom'` - Resolved placement of the popover
- `currentSelection`: `string` - Currently selected text
- `setCurrentSelection`: `(selection: string) => void` - Function to manually update the current selection
- `selectionRange`: `Range | null` - A snapshot of the selected range

### Types

All types are exported:

```ts
import type {
  HighlightPopoverProps,
  HighlightPopoverContextValue,
  PopoverRenderProps,
  PopoverPosition,
  PopoverAlignment,
  PopoverPlacement,
} from '@omsimos/react-highlight-popover';
```

## Advanced Example

Here's a more advanced example demonstrating custom styling and event handling:

```jsx
import { HighlightPopover, useHighlightPopover } from '@omsimos/react-highlight-popover';

function CustomPopover() {
  const { currentSelection, setShowPopover } = useHighlightPopover();

  return (
    <div className="bg-white border rounded-md p-2 shadow-lg">
      <p>You selected: {currentSelection}</p>
      <button className="font-semibold" onClick={() => setShowPopover(false)}>Close</button>
    </div>
  );
}

function App() {
  return (
    <HighlightPopover
      renderPopover={() => <CustomPopover />}
      offset={{ y: 10 }}
      placement="top"
      minSelectionLength={5}
      popoverProps={{ role: 'dialog', 'aria-label': 'Selection actions' }}
      onSelectionStart={() => console.log('Selection started')}
      onSelectionEnd={(selection) => console.log('Selected:', selection)}
      onPopoverShow={() => console.log('Popover shown')}
      onPopoverHide={() => console.log('Popover hidden')}
    >
      <p>
        This is a more advanced example. Try selecting at least five characters
        to see the custom popover with a close button.
      </p>
    </HighlightPopover>
  );
}

export default App;
```

## Migrating from v1

- **React 18 or later is required.** React 17 is no longer supported.
- **`offset.y` now moves the popover away from the selection.** In v1, a positive `y` moved it up. Flip the sign: `offset={{ y: -10 }}` becomes `offset={{ y: 10 }}`.
- **`offset.x` always moves the popover right.** In v1, it moved left with `alignment="right"`.
- **`position` is now the popover's top-left corner.** In v1, it was the anchor point under the selection, and the popover was centered with a CSS transform.
- **The popover waits for the pointer to be released.** Add `showWhileSelecting` to keep the v1 behavior.
- **`onSelectionStart` fires when a selection begins**, before `onSelectionEnd`. In v1, it fired together with `onPopoverShow`.
- **The popover no longer has `role="tooltip"` and `aria-live="polite"`.** Pass them with `popoverProps` if you need them.
- **The popover may flip or shift to stay in the viewport.** Set `avoidCollisions={false}` to turn this off.
- **Escape hides the popover.** Set `closeOnEscape={false}` to turn this off.
- **The build output is `dist/index.mjs`.** Import from the package name. Deep imports into `dist` will break.

## Contributing
Contributions are welcome! Please feel free to submit a pull request, we appreciate your interest and look forward to collaborating with you. If you like this project, please consider giving it a star! ✨ 

If your change affects the published package, add a changeset describing it:

```sh
bunx changeset
```

When changes land on `main`, a release workflow opens a version pull request. Merging that pull request publishes the new version to npm.

## License
This project is licensed under the [MIT License](LICENSE)
