# @omsimos/react-highlight-popover

A headless React component that shows a popover when people select text. It has no dependencies besides React.

![React Highlight Popover](https://github.com/user-attachments/assets/d9bff2f4-e7aa-4374-9273-d1f0a3c744bb)

<div>
  <img src="https://github.com/omsimos/react-highlight-popover/actions/workflows/ci.yml/badge.svg" alt="actions">
  <img alt="NPM Version" src="https://img.shields.io/npm/v/%40omsimos%2Freact-highlight-popover?logo=npm&labelColor=%23cc3534&color=%23505050">
  <img src="https://img.shields.io/bundlephobia/minzip/%40omsimos%2Freact-highlight-popover" alt="npm bundle size" >
</div>

## Features

- You render the popover content. The component tracks the selection and positions the popover.
- About 2.4 kB gzipped, with no dependencies besides React.
- The popover appears after the user releases the mouse, not during the drag.
- Placement above or below the selection, with alignment and offset props.
- The popover flips and shifts to stay in the viewport, and follows the selection on scroll, resize, and reflow.
- An optional portal, so ancestors with `overflow: hidden` can't clip the popover.
- Escape hides the popover, and `popoverProps` sets its ARIA attributes.
- Callbacks for when a selection starts and ends, and when the popover shows and hides.
- Works with React 18 and 19, and with Server Components.

## Installation

```sh
npm i @omsimos/react-highlight-popover
```

Requires React 18 or 19. The build starts with a `"use client"` directive, so you can render the component directly from a Next.js Server Component.

## Usage

Wrap the content people can select, and return your popover from `renderPopover`:

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

The popover appears below the selection by default. Use `placement="top"` to place it above, and `alignment` to line it up with the left edge, center, or right edge of the selection.

`offset.y` is the gap between the selection and the popover, and `offset.x` moves the popover to the right. Use `offset` instead of margins on your popover content, so the gap stays on the correct side when the popover flips.

When the popover doesn't fit in the viewport, it flips to the other side of the selection and shifts horizontally to stay on screen. Set `collisionPadding` to change the minimum distance from the viewport edges, or `avoidCollisions={false}` to turn this off.

The popover follows the selection when the page scrolls, the window resizes, or the content reflows.

If an ancestor has `overflow: hidden`, render the popover in a portal so the ancestor can't clip it:

```jsx
<HighlightPopover renderPopover={renderPopover} portal>
  {children}
</HighlightPopover>
```

`portal` also accepts an element to render into. A portalled popover uses `position: fixed`, so the target element shouldn't have a `transform`.

The popover element has a `data-placement` attribute with the placement after flipping. Use it to style arrows.

## Interaction

When the user selects with a mouse or pen, the popover appears after they release it. Set `showWhileSelecting` to show and update the popover during the drag instead. Keyboard selections show the popover immediately.

Clicking inside the popover keeps it open, so its buttons work even if the click clears the selection. Selecting text inside the popover doesn't move it.

Pressing Escape hides the popover until the selection changes. Set `closeOnEscape={false}` to turn this off.

## Accessibility

The popover doesn't set a `role`, because the right one depends on what you render. Use `popoverProps` to add one:

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

### `HighlightPopover` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | (required) | Content that people can select to show the popover |
| `renderPopover` | `(props: PopoverRenderProps) => React.ReactNode` | (required) | Renders the popover content |
| `className` | `string` | `undefined` | Class name for the wrapper element |
| `offset` | `{ x?: number, y?: number }` | `{ x: 0, y: 0 }` | `x` moves the popover right, `y` moves it away from the selection |
| `zIndex` | `number` | `40` | The z-index of the popover |
| `alignment` | `'left'` \| `'center'` \| `'right'` | `'center'` | Horizontal alignment relative to the selected text |
| `placement` | `'top'` \| `'bottom'` | `'bottom'` | Side of the selected text to place the popover on |
| `avoidCollisions` | `boolean` | `true` | Flip and shift the popover to keep it inside the viewport |
| `collisionPadding` | `number` | `8` | Minimum distance in pixels from the viewport edges |
| `portal` | `boolean` \| `HTMLElement` | `false` | Render the popover in a portal. `true` uses `document.body` |
| `minSelectionLength` | `number` | `1` | Minimum length of the selected text |
| `showWhileSelecting` | `boolean` | `false` | Show the popover while the pointer is still dragging |
| `closeOnEscape` | `boolean` | `true` | Hide the popover when the user presses Escape |
| `popoverProps` | `React.HTMLAttributes<HTMLDivElement>` | `undefined` | Props for the popover element, such as `role`, `aria-*`, or `className` |
| `onSelectionStart` | `() => void` | `undefined` | Fires when a selection begins inside the wrapper |
| `onSelectionEnd` | `(selection: string) => void` | `undefined` | Fires when a selection is complete, with the selected text |
| `onPopoverShow` | `() => void` | `undefined` | Fires when the popover appears |
| `onPopoverHide` | `() => void` | `undefined` | Fires when the popover hides |

Callbacks can be inline functions. The component always calls the latest version, and a new function on each render doesn't fire extra callbacks.

### `renderPopover` props

| Prop | Type | Description |
|------|------|-------------|
| `selection` | `string` | The selected text |
| `position` | `{ top: number, left: number }` | Position of the popover's top-left corner |
| `placement` | `'top'` \| `'bottom'` | Placement after flipping |
| `range` | `Range \| null` | A copy of the selected range, for example to call `range.getClientRects()` |

### `useHighlightPopover`

`useHighlightPopover` returns the state of the nearest `HighlightPopover`:

| Value | Type | Description |
|-------|------|-------------|
| `showPopover` | `boolean` | Whether the popover is visible |
| `setShowPopover` | `(show: boolean \| ((prev: boolean) => boolean)) => void` | Shows or hides the popover. Hiding it keeps it hidden until the selection changes |
| `popoverPosition` | `{ top: number, left: number }` | Position of the popover's top-left corner |
| `placement` | `'top'` \| `'bottom'` | Placement after flipping |
| `currentSelection` | `string` | The selected text |
| `setCurrentSelection` | `(selection: string) => void` | Replaces the selected text |
| `selectionRange` | `Range \| null` | A copy of the selected range |

### Types

The package exports these types:

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

## Advanced example

This example adds a close button, places the popover above the selection, and logs each callback:

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

- v2 requires React 18 or later.
- A positive `offset.y` now moves the popover away from the selection. In v1, it moved the popover up. Flip the sign, so `offset={{ y: -10 }}` becomes `offset={{ y: 10 }}`.
- `offset.x` always moves the popover right. In v1, it moved the popover left with `alignment="right"`.
- `position` is now the popover's top-left corner. In v1, it was the anchor point under the selection, and a CSS transform centered the popover.
- The popover waits until the user releases the mouse. Add `showWhileSelecting` to keep the v1 behavior.
- `onSelectionStart` fires when a selection begins, before `onSelectionEnd`. In v1, it fired together with `onPopoverShow`.
- The popover no longer has `role="tooltip"` and `aria-live="polite"`. Pass them with `popoverProps` if you need them.
- The popover may flip or shift to stay in the viewport. Set `avoidCollisions={false}` to turn this off.
- Escape hides the popover. Set `closeOnEscape={false}` to turn this off.
- The build output is now `dist/index.mjs`. Import from the package name, because deep imports into `dist` will break.

## Contributing

Pull requests are welcome. If you like the project, consider giving it a star.

If your change affects the published package, add a changeset that describes it:

```sh
bunx changeset
```

After a pull request with a changeset merges into `main`, the release workflow opens a version pull request. Merging the version pull request publishes the new version to npm.

## License

[MIT](lib/LICENSE)
