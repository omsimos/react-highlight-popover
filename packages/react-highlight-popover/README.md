# @omsimos/react-highlight-popover

A customizable, headless React component for creating popovers on text selection, with zero dependencies.

## Features

- 🎯 Easy-to-use React component with zero dependencies
- 🧠 Headless component for maximum flexibility
- 🎨 Fully customizable popover content and styling
- 📏 Configurable minimum selection length
- 🖱️ Automatic positioning based on text selection
- 🎛️ Customizable offset for fine-tuning popover position
- 🔄 Event callbacks for selection and popover lifecycle
- 🔌 Extensible architecture for advanced use cases

## Installation

Install the package using npm:

```sh
npm install @omsimos/react-highlight-popover
```

Or using pnpm:

```sh
pnpm add @omsimos/react-highlight-popover
```

## Usage

Here's a basic example of how to use the `HighlightPopover` component:

```jsx
import { HighlightPopover } from '@omsimos/react-highlight-popover';

function App() {
  const renderPopover = ({ selection }) => (
    <div className="bg-white border rounded p-2 shadow-lg">
      You selected: {selection}
    </div>
  );

  return (
    <HighlightPopover renderPopover={renderPopover}>
      <p>
        This is a sample text. Try selecting some words to see the popover in action.
      </p>
    </HighlightPopover>
  );
}

export default App;
```


## API

### `HighlightPopover` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | (required) | The content where text selection will trigger the popover |
| `renderPopover` | `(props: { position: Position, selection: string }) => React.ReactNode` | (required) | Function to render the popover content |
| `className` | `string` | `''` | Additional CSS class for the wrapper element |
| `offset` | `{ x: number, y: number }` | `{ x: 0, y: 0 }` | Offset for fine-tuning popover position |
| `minSelectionLength` | `number` | `1` | Minimum length of text selection to trigger the popover |
| `onSelectionStart` | `() => void` | `undefined` | Callback fired when text selection starts |
| `onSelectionEnd` | `(selection: string) => void` | `undefined` | Callback fired when text selection ends |
| `onPopoverShow` | `() => void` | `undefined` | Callback fired when the popover is shown |
| `onPopoverHide` | `() => void` | `undefined` | Callback fired when the popover is hidden |

### `useHighlightPopover` Hook

The `useHighlightPopover` hook can be used to access the internal state of the `HighlightPopover` component. It returns an object with the following properties:

- `showPopover`: `boolean` - Indicates whether the popover is currently visible
- `setShowPopover`: `(show: boolean) => void` - Function to manually control popover visibility
- `popoverPosition`: `{ top: number, left: number }` - Current position of the popover
- `currentSelection`: `string` - Currently selected text

## Advanced Example

Here's a more advanced example demonstrating custom styling and event handling:

```jsx
import { HighlightPopover, useHighlightPopover } from '@omsimos/react-highlight-popover';

function CustomPopover() {
  const { currentSelection, setShowPopover } = useHighlightPopover();
  
  return (
    <div className="bg-white border rounded p-2 shadow-lg">
      <p>You selected: {currentSelection}</p>
      <button onClick={() => setShowPopover(false)}>Close</button>
    </div>
  );
}

function App() {
  const handleSelectionStart = () => console.log('Selection started');
  const handleSelectionEnd = (selection) => console.log('Selected:', selection);
  const handlePopoverShow = () => console.log('Popover shown');
  const handlePopoverHide = () => console.log('Popover hidden');

  return (
    <HighlightPopover
      renderPopover={() => <CustomPopover />}
      offset={{ x: 0, y: 10 }}
      minSelectionLength={3}
      onSelectionStart={handleSelectionStart}
      onSelectionEnd={handleSelectionEnd}
      onPopoverShow={handlePopoverShow}
      onPopoverHide={handlePopoverHide}
    >
      <p>
        This is a more advanced example. Try selecting at least three characters
        to see the custom popover with a close button.
      </p>
    </HighlightPopover>
  );
}

export default App;
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request. If you like this project, please consider giving it a star! ✨ 

## License
This project is licensed under the [MIT License](LICENSE)
