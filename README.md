# use-travel

![Node CI](https://github.com/unadlib/use-travel/workflows/Node%20CI/badge.svg)
[![npm](https://img.shields.io/npm/v/use-travel.svg)](https://www.npmjs.com/package/use-travel)
![license](https://img.shields.io/npm/l/use-travel)

A React hook for state time travel with undo, redo, and reset functionalities.

### Motivation

`use-travel` is a small and high-performance library for state time travel. It's built on [Mutative](https://github.com/unadlib/mutative) to support mutation updating immutable data. It's designed to be simple and easy to use, and it's also customizable for different use cases.

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

### API

You can use `useTravel` to create a time travel state. And it returns a tuple with the current state, the state setter, and the controls. The controls include `back`, `forward`, `reset`, `canUndo`, `canRedo`, `getHistory`, `patches`, `position`, and `go`.

```jsx
import { useTravel } from 'use-travel';

const App = () => {
  const [state, setState, controls] = useTravel(0, {
    maxHistory: 10,
    initialPatches: {
      patches: [],
      inversePatches: [],
    },
  });
  return (
    <div>
      <div>{state}</div>
      <button onClick={() => setState(state + 1)}>Increment</button>
      <button onClick={() => setState(state - 1)}>Decrement</button>
      <button onClick={controls.back} disabled={!controls.canBack()}>
        Undo
      </button>
      <button onClick={controls.forward} disabled={!controls.canForward()}>
        Redo
      </button>
      <button onClick={controls.reset}>Reset</button>
      {controls.getHistory().map((state, index) => (
        <div key={index}>{state}</div>
      ))}
      {controls.patches.patches.map((patch, index) => (
        <div key={index}>{patch}</div>
      ))}
      <div>{controls.position}</div>
      <button
        onClick={() => {
          controls.go(1);
        }}
      >
        Go
      </button>
    </div>
  );
};
```

### Options

| Options          | type          | description                           | default                          |
| ---------------- | ------------- | ------------------------------------- | -------------------------------- |
| `maxHistory`     | number        | The maximum number of history to keep | 10                               |
| `initialPatches` | TravelPatches | The initial patches                   | {patches: [],inversePatches: []} |

### Return

| Return                | type                       | description                                                        |
| --------------------- | -------------------------- | ------------------------------------------------------------------ |
| `state`               | T                          | The current state                                                  |
| `setState`            | Dispatch<T>                | The state setter, support mutation update or return immutable data |
| `controls.back`       | () => void                 | Go back to the previous state                                      |
| `controls.forward`    | () => void                 | Go forward to the next state                                       |
| `controls.reset`      | () => void                 | Reset the state to the initial state                               |
| `controls.canUndo`    | () => boolean              | Check if can go back to the previous state                         |
| `controls.canRedo`    | () => boolean              | Check if can go forward to the next state                          |
| `controls.getHistory` | () => T[]                  | Get the history of the state                                       |
| `controls.patches`    | TravelPatches[]            | Get the patches history of the state                               |
| `controls.position`   | number                     | Get the current position of the state                              |
| `controls.go`         | (position: number) => void | Go to the specific position of the state                           |

### TODO

- [ ] add `archive` functionality

## License

`use-travel` is [MIT licensed](https://github.com/unadlib/use-travel/blob/main/LICENSE).
