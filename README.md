# use-travel

![Node CI](https://github.com/mutativejs/use-travel/workflows/Node%20CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/mutativejs/use-travel/badge.svg?branch=main)](https://coveralls.io/github/mutativejs/use-travel?branch=main)
[![npm](https://img.shields.io/npm/v/use-travel.svg)](https://www.npmjs.com/package/use-travel)
![license](https://img.shields.io/npm/l/use-travel)

A React hook for state time travel with undo, redo, reset and archive functionalities.

### Motivation

`use-travel` is a small and high-performance library for state time travel. It's built on [Mutative](https://github.com/unadlib/mutative) to support mutation updating immutable data. It's designed to be simple and easy to use, and it's also customizable for different use cases.

It's suitable for building any time travel feature in your application.

### Installation

```bash
npm install use-travel mutative
# or
yarn add use-travel mutative
```

### Features

- Undo/Redo/Reset/Go/Archive functionalities
- Mutations update immutable data
- Small size for time travel with Patches history
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

| Parameter         | type          | description                           | default                          |
| ----------------- | ------------- | ------------------------------------- | -------------------------------- |
| `maxHistory`      | number        | The maximum number of history to keep | 10                               |
| `initialPatches`  | TravelPatches | The initial patches                   | {patches: [],inversePatches: []} |
| `initialPosition` | number        | The initial position of the state     | 0                                |
| `autoArchive`     | boolean       | Auto archive the state                | true                             |

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

> `TravelPatches` is the type of patches history, it includes `patches` and `inversePatches`.

> If you want to control the state travel manually, you can set the `autoArchive` option to `false`, and use the `controls.archive` function to archive the state.

> If you want to persist the state, you can use `state`/`controls.patches`/`controls.position` to save the travel history. Then, read the persistent data as `initialState`, `initialPatches`, and `initialPosition` when initializing the state, like this:

```jsx
const [state, setState, controls] = useTravel(initialState, {
  initialPatches,
  initialPosition,
});
```

## License

`use-travel` is [MIT licensed](https://github.com/mutativejs/use-travel/blob/main/LICENSE).
