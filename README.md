# use-travel

A React hook for state time travel with undo, redo, and reset functionalities.

### Installation

```bash
npm install use-travel mutative
# or
yarn add use-travel mutative
```

### Features

- Undo/Redo/Reset
- Small size for time travel with Patches history
- Customizable history size
- Customizable initial patches
- High performance
- Mark function for custom immutability

### TODO

- [ ] add `archive` functionality

### API

```jsx
import { useTravel } from 'use-travel';

const App = () => {
  const [state, setState, controls]} = useTravel(0, {
    maxHistory: 10,
    initialPatches: [],
  });
  return (
    <div>
      <div>{state}</div>
      <button onClick={() => setState(state + 1)}>Increment</button>
      <button onClick={() => setState(state - 1)}>Decrement</button>
      <button onClick={controls.back} disabled={!controls.canUndo()}>Undo</button>
      <button onClick={controls.forward} disabled={!controls.canRedo()}>Redo</button>
      <button onClick={controls.reset}>Reset</button>
      {controls.getHistory().map((state, index) => (
        <div key={index}>{state}</div>
      ))}
      {controls.patches.map((patch, index) => (
        <div key={index}>{patch}</div>
      ))}
      <div>{controls.position}</div>
      <button onClick={() => {
        controls.go(1);
      }}>Go</button>
    </div>
  );
}
```
