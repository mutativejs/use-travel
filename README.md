# use-travel

![Node CI](https://github.com/mutativejs/use-travel/workflows/Node%20CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/mutativejs/use-travel/badge.svg?branch=main)](https://coveralls.io/github/mutativejs/use-travel?branch=main)
[![npm](https://img.shields.io/npm/v/use-travel.svg)](https://www.npmjs.com/package/use-travel)
![license](https://img.shields.io/npm/l/use-travel)

A React hook for state time travel with undo, redo, reset and archive functionalities with [Travels](https://github.com/mutativejs/travels).

### Motivation

`use-travel` is a small and high-performance library for state time travel. It's built on [Mutative](https://github.com/unadlib/mutative) and [Travels](https://github.com/mutativejs/travels) to support mutation updating immutable data. It's designed to be simple and easy to use, and it's also customizable for different use cases.

It's suitable for building any time travel feature in your application.

### Installation

```bash
npm install use-travel mutative travels
# or
yarn add use-travel mutative travels
# or
pnpm add use-travel mutative travels
```

### Features

- Undo/Redo/Reset/Go/Archive functionalities
- Mutations update immutable data
- Small size for time travel with JSON Patch history
- Customizable history size
- Customizable initial patches
- High performance
- Mark function for custom immutability

### Example

- [Basic](https://stackblitz.com/edit/react-xfw3uk?file=src%2FApp.js)
- [Manual Time Travel](https://stackblitz.com/edit/react-3mnzq9?file=src%2FApp.js)

### API

You can use `useTravel` to create a time travel state. And it returns a tuple with the current state, the state setter, and the controls. The controls include `back()`, `forward()`, `reset()`, `canBack()`, `canForward()`, `canArchive()`, `getHistory()`, `patches`, `position`, `archive()`, and `go()`.

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
      <button onClick={() => controls.back()} disabled={!controls.canBack()}>
        Undo
      </button>
      <button
        onClick={() => controls.forward()}
        disabled={!controls.canForward()}
      >
        Redo
      </button>
      <button onClick={controls.reset}>Reset</button>
      {controls.getHistory().map((state, index) => (
        <div key={index}>{state}</div>
      ))}
      {controls.patches.patches.map((patch, index) => (
        <div key={index}>{JSON.stringify(patch)}</div>
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

### Parameters

| Parameter          | type          | description                                                                                                              | default                          |
| ------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| `maxHistory`       | number        | The maximum number of history to keep                                                                                    | 10                               |
| `initialPatches`   | TravelPatches | The initial patches                                                                                                      | {patches: [],inversePatches: []} |
| `initialPosition`  | number        | The initial position of the state                                                                                        | 0                                |
| `autoArchive`      | boolean       | Auto archive the state (see [Archive Mode](#archive-mode) for details)                                                  | true                             |
| `enableAutoFreeze` | boolean       | Enable auto freeze the state, [view more](https://github.com/unadlib/mutative?tab=readme-ov-file#createstate-fn-options) | false                            |
| `strict`           | boolean       | Enable strict mode, [view more](https://github.com/unadlib/mutative?tab=readme-ov-file#createstate-fn-options)           | false                            |
| `mark`             | Mark<O, F>[]  | The mark function , [view more](https://github.com/unadlib/mutative?tab=readme-ov-file#createstate-fn-options)           | () => void                       |

### Returns

| Return                | type                           | description                                                            |
| --------------------- | ------------------------------ | ---------------------------------------------------------------------- |
| `state`               | Value<S, F>                    | The current state                                                      |
| `setState`            | Updater<InitialValue<S>>       | The state setter, support mutation update or return immutable data     |
| `controls.back`       | (amount?: number) => void      | Go back to the previous state                                          |
| `controls.forward`    | (amount?: number) => void      | Go forward to the next state                                           |
| `controls.reset`      | () => void                     | Reset the state to the initial state                                   |
| `controls.canBack`    | () => boolean                  | Check if can go back to the previous state                             |
| `controls.canForward` | () => boolean                  | Check if can go forward to the next state                              |
| `controls.canArchive` | () => boolean                  | Check if can archive the current state                                 |
| `controls.getHistory` | () => T[]                      | Get the history of the state                                           |
| `controls.patches`    | TravelPatches[]                | Get the patches history of the state                                   |
| `controls.position`   | number                         | Get the current position of the state                                  |
| `controls.go`         | (nextPosition: number) => void | Go to the specific position of the state                               |
| `controls.archive`    | () => void                     | Archive the current state(the `autoArchive` options should be `false`) |

### useTravelStore

When you need to manage a single `Travels` instance outside of React—e.g. to share the same undo/redo history across multiple components—create the store manually and bind it with `useTravelStore`. The hook keeps React in sync with the external store, exposes the same controls object, and rejects mutable stores to ensure React can observe updates.

```tsx
// store.ts
import { Travels } from 'travels';

export const travels = new Travels({ count: 0 }); // mutable: true is not supported
```

```tsx
// Counter.tsx
import { useTravelStore } from 'use-travel';
import { travels } from './store';

export function Counter() {
  const [state, setState, controls] = useTravelStore(travels);

  return (
    <div>
      <span>{state.count}</span>
      <button
        onClick={() =>
          setState((draft) => {
            draft.count += 1;
          })
        }
      >
        Increment
      </button>
      <button onClick={() => controls.back()} disabled={!controls.canBack()}>
        Undo
      </button>
    </div>
  );
}
```

`useTravelStore` stays reactive even when the `Travels` instance is updated elsewhere (for example, in services or other components) and forwards manual archive helpers when the store is created with `autoArchive: false`.

### Archive Mode

`use-travel` provides two archive modes to control how state changes are recorded in history:

#### Auto Archive Mode (default: `autoArchive: true`)

In auto archive mode, every `setState` call is automatically recorded as a separate history entry. This is the simplest mode and suitable for most use cases.

```jsx
const [state, setState, controls] = useTravel({ count: 0 });
// or explicitly: useTravel({ count: 0 }, { autoArchive: true })

// Each setState creates a new history entry
setState({ count: 1 }); // History: [0, 1]
// ... user clicks another button
setState({ count: 2 }); // History: [0, 1, 2]
// ... user clicks another button
setState({ count: 3 }); // History: [0, 1, 2, 3]

controls.back(); // Go back to count: 2
```

#### Manual Archive Mode (`autoArchive: false`)

In manual archive mode, you control when state changes are recorded to history using the `archive()` function. This is useful when you want to group multiple state changes into a single undo/redo step.

**Use Case 1: Batch multiple changes into one history entry**

```jsx
const [state, setState, controls] = useTravel({ count: 0 }, {
  autoArchive: false
});

// Multiple setState calls across different renders
setState({ count: 1 }); // Temporary change (not in history yet)
// ... user clicks another button
setState({ count: 2 }); // Temporary change (not in history yet)
// ... user clicks another button
setState({ count: 3 }); // Temporary change (not in history yet)

// Commit all changes as a single history entry
controls.archive(); // History: [0, 3]

// Now undo will go back to 0, not 2 or 1
controls.back(); // Back to 0
```

**Use Case 2: Explicit commit after a single change**

```jsx
function handleSave() {
  setState((draft) => {
    draft.count += 1;
  });
  controls.archive(); // Commit immediately
}
```

The key difference:
- **Auto archive**: Each `setState` = one undo step
- **Manual archive**: `archive()` call = one undo step (can include multiple `setState` calls)

### Important Notes

> **⚠️ setState Restriction**: `setState` can only be called **once** within the same synchronous call stack (e.g., inside a single event handler). This ensures predictable undo/redo behavior where each history entry represents a clear, atomic change.

```jsx
const App = () => {
  const [state, setState, controls] = useTravel({ count: 0, todo: [] });
  return (
    <div>
      <div>{state.count}</div>
      <button
        onClick={() => {
          // ❌ Multiple setState calls in the same event handler
          setState((draft) => {
            draft.count += 1;
          });
          setState((draft) => {
            draft.todo.push({ id: 1, text: 'Buy' });
          });
          // This will throw: "setState cannot be called multiple times in the same render cycle"

          // ✅ Correct: Batch all changes in a single setState
          setState((draft) => {
            draft.count += 1;
            draft.todo.push({ id: 1, text: 'Buy' });
          });
        }}
      >
        Update
      </button>
    </div>
  );
};
```

> **Note**: With `autoArchive: false`, you can call `setState` once per event handler across multiple renders, then call `archive()` whenever you want to commit those changes to history.

### Persistence

> `TravelPatches` is the type of patches history, it includes `patches` and `inversePatches`.

> If you want to persist the state, you can use `state`/`controls.patches`/`controls.position` to save the travel history. Then, read the persistent data as `initialState`, `initialPatches`, and `initialPosition` when initializing the state, like this:

```jsx
const [state, setState, controls] = useTravel(initialState, {
  initialPatches,
  initialPosition,
});
```

## License

`use-travel` is [MIT licensed](https://github.com/mutativejs/use-travel/blob/main/LICENSE).
