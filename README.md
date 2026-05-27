# use-travel

![Node CI](https://github.com/mutativejs/use-travel/workflows/Node%20CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/mutativejs/use-travel/badge.svg?branch=main)](https://coveralls.io/github/mutativejs/use-travel?branch=main)
[![npm](https://img.shields.io/npm/v/use-travel.svg)](https://www.npmjs.com/package/use-travel)
![license](https://img.shields.io/npm/l/use-travel)

**React hooks for [Travels](https://github.com/mutativejs/travels): patch-based undo/redo state with immutable updates, manual archiving, rebasing, and shared-store support.**

`use-travel` is the React layer for [`travels`](https://github.com/mutativejs/travels). It keeps the same core model as Travels, which stores JSON Patch history instead of full state snapshots, but exposes that model through React-friendly hooks:

- `useTravel` for component-scoped state with undo/redo
- `useTravelStore` for subscribing React components to an existing immutable `Travels` instance

Use plain [`travels`](https://github.com/mutativejs/travels) directly when your state lives outside React, you need imperative reads right after navigation, or you need `mutable: true`.

## Table of Contents

- [Why use-travel?](#why-use-travel)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Choosing Between `useTravel`, `useTravelStore`, and `travels`](#choosing-between-usetravel-usetravelstore-and-travels)
- [API Reference](#api-reference)
  - [`useTravel(initialState, options?)`](#usetravelinitialstate-options)
  - [`useTravelStore(travels)`](#usetravelstoretravels)
- [Archive Modes](#archive-modes)
- [Important Behavior](#important-behavior)
- [Rebase](#rebase)
- [Persistence](#persistence)
- [State Requirements](#state-requirements)
- [Examples](#examples)
- [Related Projects](#related-projects)
- [License](#license)

## Why use-travel?

- **React-first API**: Use a hook tuple instead of wiring subscriptions manually.
- **Patch-based history**: Undo/redo stores only changes, not full state snapshots.
- **Mutative update syntax**: Write `draft.count += 1` while keeping immutable React state.
- **Manual archive mode**: Group several edits into one undo step when needed.
- **Rebase support**: Promote the current state to the new reset baseline.
- **Shared history support**: Subscribe multiple React components to the same immutable `Travels` store with `useTravelStore`.

## Installation

```bash
npm install use-travel travels mutative
# or
yarn add use-travel travels mutative
# or
pnpm add use-travel travels mutative
```

### Version compatibility

| use-travel | travels                                             |
| ---------- | --------------------------------------------------- |
| `>= 1.8.2` | `>= 1.3.1` (persistence APIs plus 1.3.1 core fixes) |
| `1.8.1`    | `>= 1.3.0` (persistence and metadata APIs)          |
| `1.8.0`    | `>= 1.2.0` (required for `rebase` support)          |
| `< 1.8.0`  | `< 1.2.0`                                           |

## Quick Start

```tsx
import { useTravel } from 'use-travel';

export function Counter() {
  const [state, setState, controls] = useTravel({ count: 0 });

  return (
    <div>
      <strong>{state.count}</strong>

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

      <button
        onClick={() => controls.forward()}
        disabled={!controls.canForward()}
      >
        Redo
      </button>

      <button onClick={controls.reset}>Reset</button>
    </div>
  );
}
```

`setState` supports three update styles:

- Direct value: `setState({ count: 1 })`
- Function returning a value: `setState(() => ({ count: 1 }))`
- Draft mutation: `setState((draft) => { draft.count += 1 })`

## Choosing Between `useTravel`, `useTravelStore`, and `travels`

- Use `useTravel` when the state belongs to a React component and React should own the lifecycle.
- Use `useTravelStore` when you already have a shared immutable `Travels` instance and want React to stay subscribed to it.
- Use plain [`travels`](https://github.com/mutativejs/travels) when another layer is the source of truth, you need imperative `getState()` reads after `back()` or `forward()`, or you need `mutable: true`.

## API Reference

### `useTravel(initialState, options?)`

Creates a component-scoped immutable `Travels` instance and returns a tuple:

```ts
const [state, setState, controls] = useTravel(initialState, options);
```

`useTravel` always uses immutable mode internally so React can observe state changes through reference updates. `mutable` is intentionally not supported here.

#### Options

| Option                   | Type              | Description                                                                       | Default                               |
| ------------------------ | ----------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| `maxHistory`             | `number`          | Maximum number of history entries to keep                                         | `10`                                  |
| `history`                | `TravelsHistory`  | Restore validated history returned by `Travels.deserialize(...)`                  | `undefined`                           |
| `initialPatches`         | `TravelPatches`   | Patch history to restore from persistence                                         | `{ patches: [], inversePatches: [] }` |
| `strictInitialPatches`   | `boolean`         | Throw when persisted patches are invalid instead of falling back to empty history | `false`                               |
| `initialPosition`        | `number`          | History position to restore from persistence                                      | `0`                                   |
| `autoArchive`            | `boolean`         | Save each change automatically or require manual `archive()`                      | `true`                                |
| `warnOnUnsupportedState` | `boolean`         | Warn in development when state has weak JSON Patch or persistence semantics       | development only                      |
| `onError`                | `(error) => void` | Receive wrapped Travels operation errors                                          | `undefined`                           |
| `onBranchDiscard`        | `(event) => void` | Observe redo history discarded by a new edit                                      | `undefined`                           |
| `devtools`               | `(event) => void` | Observe core Travels events for custom devtools                                   | `undefined`                           |
| `enableAutoFreeze`       | `boolean`         | Forwarded to Mutative immutability options                                        | `false`                               |
| `strict`                 | `boolean`         | Forwarded to Mutative strict immutability checks                                  | `false`                               |
| `mark`                   | `Mark<O, F>[]`    | Forwarded to Mutative mark options                                                | `() => void`                          |
| `patchesOptions`         | `PatchesOptions`  | Customize patch output such as `{ pathAsArray: true }`                            | enabled                               |

#### Returns

Common tuple members:

| Member                      | Type                         | Description                                                                 |
| --------------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| `state`                     | `Value<S, F>`                | Current render snapshot                                                     |
| `setState`                  | `Updater<S>`                 | Updates state with a value, function, or draft mutation                     |
| `controls.position`         | `number`                     | Current position in the history timeline                                    |
| `controls.getHistory()`     | `() => Value<S, F>[]`        | Returns the history as state snapshots                                      |
| `controls.patches`          | `TravelPatches`              | Returns the stored patch history                                            |
| `controls.back(amount?)`    | `(amount?: number) => void`  | Undo one or more steps                                                      |
| `controls.forward(amount?)` | `(amount?: number) => void`  | Redo one or more steps                                                      |
| `controls.go(position)`     | `(position: number) => void` | Jump to a specific history position                                         |
| `controls.reset()`          | `() => void`                 | Reset to the initial state and clear history                                |
| `controls.rebase()`         | `() => void`                 | Make the current state the new baseline and discard past and future history |
| `controls.canBack()`        | `() => boolean`              | Whether undo is possible                                                    |
| `controls.canForward()`     | `() => boolean`              | Whether redo is possible                                                    |

When `autoArchive: false`, the controls also include:

| Member                  | Type            | Description                                            |
| ----------------------- | --------------- | ------------------------------------------------------ |
| `controls.archive()`    | `() => void`    | Commit the current working state as the next undo step |
| `controls.canArchive()` | `() => boolean` | Whether there are unarchived changes                   |

### `useTravelStore(travels)`

Subscribes React to an existing immutable `Travels` instance without creating a new store.

```tsx
// store.ts
import { Travels } from 'travels';

export const travels = new Travels({ count: 0 });
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

Important notes for `useTravelStore`:

- It only supports immutable `Travels` instances. Passing a store created with `mutable: true` throws.
- It exposes the same navigation controls as `useTravel`, including `rebase()`.
- It is a React bridge, so the returned `state` is still a render snapshot.
- If you need imperative "navigate and read immediately" behavior, call `travels.back()` or `travels.forward()` and read `travels.getState()` directly from the store.

## Archive Modes

`use-travel` supports two recording modes.

### Auto Archive Mode

With the default `autoArchive: true`, every `setState` call becomes its own undo step.

```tsx
const [state, setState, controls] = useTravel({ count: 0 });

function increment() {
  setState((draft) => {
    draft.count += 1;
  });
}

// Three separate user interactions:
// click #1 -> count = 1
// click #2 -> count = 2
// click #3 -> count = 3

controls.back(); // { count: 2 }
```

### Manual Archive Mode

With `autoArchive: false`, you decide when the current working state should become a committed history entry.

This is useful for flows like forms, drag interactions, or multi-step editors where several changes should undo together.

```tsx
const [doc, setDoc, controls] = useTravel(
  { title: '', body: '' },
  { autoArchive: false }
);

function onTitleChange(title: string) {
  setDoc((draft) => {
    draft.title = title;
  });
}

function onBodyChange(body: string) {
  setDoc((draft) => {
    draft.body = body;
  });
}

function save() {
  if (controls.canArchive()) {
    controls.archive();
  }
}
```

## Important Behavior

### One `setState` call per synchronous call stack

`useTravel` throws if `setState` is called more than once within the same synchronous call stack. If multiple fields need to change together, update them in a single draft mutation.

```tsx
setState((draft) => {
  draft.count += 1;
  draft.todos.push({ id: 1, text: 'Buy milk' });
});
```

In manual archive mode, you can still make one `setState` call per event or render and archive later when the grouped change is ready.

### `initialState` and `options` are read once

`useTravel` creates the underlying `Travels` instance only on the first render. Later changes to `initialState` or `options` do not recreate the history store automatically. If you need a fresh store, remount the component or change its `key`.

### No-op updates are ignored

Updates that do not produce actual changes do not create history entries.

## Rebase

`controls.rebase()` discards all past and future history and makes the current state the new baseline.

This is a destructive operation. After rebasing:

- `controls.position` becomes `0`
- `controls.getHistory()` contains only the current state
- `controls.reset()` returns to the rebased state, not the original initial state
- In manual archive mode, any unarchived working changes become part of the new baseline

```tsx
const [state, setState, controls] = useTravel({ count: 0 });

setState((draft) => {
  draft.count = 5;
});

controls.rebase();

setState((draft) => {
  draft.count = 9;
});

controls.reset(); // { count: 5 }
```

## Persistence

`use-travel` re-exports `TravelPatches`, so you can persist both the current state and its history:

```tsx
import type { TravelPatches } from 'use-travel';

type SavedTravel = {
  state: { count: number };
  patches: TravelPatches;
  position: number;
};

const saved: SavedTravel = {
  state,
  patches: controls.patches,
  position: controls.position,
};
```

Restore that data by passing the saved state as `initialState` and the saved history as `initialPatches` plus `initialPosition`:

```tsx
const [state, setState, controls] = useTravel(saved.state, {
  initialPatches: saved.patches,
  initialPosition: saved.position,
});
```

With `travels@1.3.1` or newer, you can also validate a versioned snapshot before passing it to the hook:

```tsx
import { Travels, type TravelsSerializedHistory } from 'travels';

const saved: TravelsSerializedHistory<{ count: number }> = {
  version: 1,
  state,
  patches: controls.patches,
  position: controls.position,
};

const history = Travels.deserialize(saved);

const [state, setState, controls] = useTravel(history.state, {
  history,
});
```

`history` overrides `initialPatches` and `initialPosition` when both forms are provided. If persisted patch data may be corrupt, set `strictInitialPatches: true` for legacy patch restores or validate snapshots with `Travels.deserialize(...)` before rendering.

## State Requirements

`use-travel` follows the same state rules as [`travels`](https://github.com/mutativejs/travels):

- Prefer plain JSON-serializable data.
- `Map` and `Set` are supported in immutable mode.
- Avoid complex mutable objects such as class instances, functions, DOM nodes, or framework-specific reactive proxies.

If you need mutable observable state, use `travels` directly instead of `useTravelStore`.

## Examples

- [Basic](https://stackblitz.com/edit/react-xfw3uk?file=src%2FApp.js)
- [Manual Time Travel](https://stackblitz.com/edit/react-3mnzq9?file=src%2FApp.js)

## Related Projects

- [travels](https://github.com/mutativejs/travels) - The framework-agnostic undo/redo core
- [zustand-travel](https://github.com/mutativejs/zustand-travel) - Zustand middleware built on Travels

## License

`use-travel` is [MIT licensed](https://github.com/mutativejs/use-travel/blob/main/LICENSE).
