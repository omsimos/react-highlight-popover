# Headless Highlight Popover for React

A customizable React component for displaying popovers on text selection, with zero dependencies.

![React Highlight Popover Background](https://github.com/user-attachments/assets/236ebac4-f40c-4895-b23f-baac20db93a9)

## Features

- 🎯 Easy-to-use React component with zero dependencies
- 🧠 Headless component for maximum flexibility
- 🎨 Fully customizable popover content and styling
- 🎭 Smooth rendering with minimal re-renders
- 📏 Configurable minimum selection length
- 🖱️ Automatic positioning based on text selection
- 🎛️ Customizable offset for adjusting popover position
- 🔄 Event callbacks for selection and popover lifecycle
- 🔌 Extensible architecture for advanced use cases

## Installation

Add the package using your package manager:

```sh
npm i @omsimos/react-highlight-popover
```

## Usage

Here's a basic example of how to use the `HighlightPopover` component:

```jsx
import { HighlightPopover } from '@omsimos/react-highlight-popover';

function App() {
  const renderPopover = ({ selection }) => (
    <div className="bg-white border rounded p-2 shadow-lg select-none">
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

### [API Reference](https://react-highlight-popover.omsimos.com/docs)
