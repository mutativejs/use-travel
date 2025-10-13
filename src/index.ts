import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type {
  TravelPatches,
  TravelsOptions,
  ManualTravelsControls,
  TravelsControls,
  Value,
  Updater,
  PatchesOption,
} from 'travels';
import { Travels } from 'travels';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

export type { TravelPatches };

type Result<
  S,
  F extends boolean,
  A extends boolean,
  P extends PatchesOption = {},
> = [
  Value<S, F>,
  (updater: Updater<S>) => void,
  A extends false ? ManualTravelsControls<S, F, P> : TravelsControls<S, F, P>,
];

/**
 * Creates a component-scoped {@link Travels} instance with undo/redo support and returns its reactive API.
 *
 * The hook memoises the underlying `Travels` instance per component, wires it to React's lifecycle, and forces
 * re-renders whenever the managed state changes. Consumers receive a tuple containing the current state, a `setState`
 * updater that accepts either a mutative draft function or partial state, and the history controls exposed by
 * {@link Travels}.
 *
 * @typeParam S - Shape of the state managed by the travel store.
 * @typeParam F - Whether draft freezing is enabled.
 * @typeParam A - Whether the instance auto-archives changes; determines the controls contract.
 * @typeParam P - Additional patches configuration forwarded to Mutative.
 * @param initialState - Value used to initialise the travel store.
 * @param _options - Optional configuration mirrored from {@link Travels}.
 * @returns A tuple with the current state, typed updater, and history controls.
 * @throws {Error} When `setState` is invoked multiple times within the same render cycle (development-only guard).
 */
export function useTravel<S, F extends boolean>(
  initialState: S
): [Value<S, F>, (updater: Updater<S>) => void, TravelsControls<S, F>];
export function useTravel<
  S,
  F extends boolean,
  A extends boolean,
  P extends PatchesOption = {},
>(
  initialState: S,
  options: Omit<TravelsOptions<F, true, P>, 'autoArchive'> & {
    autoArchive?: true;
  }
): [Value<S, F>, (updater: Updater<S>) => void, TravelsControls<S, F, P>];
export function useTravel<
  S,
  F extends boolean,
  A extends boolean,
  P extends PatchesOption = {},
>(
  initialState: S,
  options: Omit<TravelsOptions<F, false, P>, 'autoArchive'> & {
    autoArchive: false;
  }
): [Value<S, F>, (updater: Updater<S>) => void, ManualTravelsControls<S, F, P>];
export function useTravel<
  S,
  F extends boolean,
  A extends boolean,
  P extends PatchesOption = {},
>(initialState: S, _options: TravelsOptions<F, A, P> = {}): Result<S, F, A, P> {
  if (__DEV__) {
    const { maxHistory = 10, initialPosition = 0, initialPatches } = _options;

    if (maxHistory <= 0) {
      console.error(
        `useTravel: maxHistory must be a positive number, but got ${maxHistory}`
      );
    }

    if (initialPosition < 0) {
      console.error(
        `useTravel: initialPosition must be non-negative, but got ${initialPosition}`
      );
    }

    if (initialPatches) {
      if (
        !Array.isArray(initialPatches.patches) ||
        !Array.isArray(initialPatches.inversePatches)
      ) {
        console.error(
          `useTravel: initialPatches must have 'patches' and 'inversePatches' arrays`
        );
      } else if (
        initialPatches.patches.length !== initialPatches.inversePatches.length
      ) {
        console.error(
          `useTravel: initialPatches.patches and initialPatches.inversePatches must have the same length`
        );
      }
    }
  }

  // Create Travels instance (only once)
  const travelsRef = useRef<Travels<S, F, A>>();
  if (!travelsRef.current) {
    travelsRef.current = new Travels<S, F, A>(initialState, _options);
  }

  // Force re-render when state changes
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // Track if setState has been called in the current render cycle
  const setStateCalledInRender = useRef(false);

  // Reset the flag at the start of each render cycle
  useEffect(() => {
    setStateCalledInRender.current = false;
  });

  // Subscribe to state changes
  useEffect(() => {
    const travels = travelsRef.current!;
    const unsubscribe = travels.subscribe(() => {
      forceUpdate();
    });
    return unsubscribe;
  }, []);

  const travels = travelsRef.current;

  // Wrap setState to prevent multiple calls in the same render cycle
  const cachedSetState = useCallback(
    (updater: Updater<S>) => {
      if (setStateCalledInRender.current) {
        throw new Error(
          'setState cannot be called multiple times in the same render cycle.'
        );
      }
      setStateCalledInRender.current = true;
      travels.setState(updater);
    },
    [travels]
  );

  // Get the current state
  const state = travels.getState();

  // Create controls object with memoization
  const cachedControls = useMemo(() => {
    const baseControls = travels.getControls();

    // Create a proxy-like object that always gets fresh values
    const controls: any = {
      get position() {
        return travels.getPosition();
      },
      getHistory: () => baseControls.getHistory(),
      get patches() {
        return travels.getPatches();
      },
      back: (amount?: number) => baseControls.back(amount),
      forward: (amount?: number) => baseControls.forward(amount),
      reset: () => baseControls.reset(),
      go: (position: number) => baseControls.go(position),
      canBack: () => baseControls.canBack(),
      canForward: () => baseControls.canForward(),
      // Always include archive and canArchive methods for compatibility
      // Even in autoArchive mode, archive() can be called (but will warn)
      archive: () => {
        if ('archive' in baseControls) {
          baseControls.archive();
        } else {
          travels.archive();
        }
      },
      canArchive: () => {
        if ('canArchive' in baseControls) {
          return baseControls.canArchive();
        }
        return travels.canArchive();
      },
    };

    return controls;
  }, [travels]);

  return [state, cachedSetState, cachedControls] as Result<S, F, A>;
}

/**
 * Subscribes to an existing {@link Travels} store and bridges it into React via `useSyncExternalStore`.
 *
 * The hook keeps React in sync with the store's state and exposes the same tuple shape as {@link useTravel}, but it
 * does not create or manage the store lifecycle. Mutable Travels instances are rejected because they reuse the same
 * state reference, which prevents React from observing updates.
 *
 * @typeParam S - Shape of the state managed by the travel store.
 * @typeParam F - Whether draft freezing is enabled.
 * @typeParam A - Whether the instance auto-archives changes; determines the controls contract.
 * @typeParam P - Additional patches configuration forwarded to Mutative.
 * @param travels - Existing {@link Travels} instance to bind to React.
 * @returns A tuple containing the current state, typed updater, and history controls.
 * @throws {Error} If the provided `Travels` instance was created with `mutable: true`.
 */
export function useTravelStore<
  S,
  F extends boolean,
  A extends boolean,
  P extends PatchesOption = {},
>(
  travels: Travels<S, F, A, P>
): [
  Value<S, F>,
  (updater: Updater<S>) => void,
  A extends false ? ManualTravelsControls<S, F, P> : TravelsControls<S, F, P>,
] {
  const isMutable = Boolean((travels as any)?.mutable);

  if (isMutable) {
    throw new Error(
      'useTravelStore only supports immutable Travels instances. Remove `mutable: true` or use useTravel instead.'
    );
  }
  const state = useSyncExternalStore(
    travels.subscribe.bind(travels),
    travels.getState.bind(travels),
    travels.getState.bind(travels)
  );
  const setState = useCallback(
    (updater: Updater<S>) => travels.setState(updater),
    [travels]
  );
  const controls = useMemo(() => travels.getControls(), [travels]);
  return [state as Value<S, F>, setState, controls] as [
    Value<S, F>,
    (updater: Updater<S>) => void,
    A extends false ? ManualTravelsControls<S, F, P> : TravelsControls<S, F, P>,
  ];
}
