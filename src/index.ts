import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type {
  TravelPatches,
  TravelsOptions,
  ManualTravelsControls,
  TravelsControls,
  Value,
  Updater,
  InitialValue,
} from 'travels';
import { Travels } from 'travels';

export type { TravelPatches };

type Result<S, F extends boolean, A extends boolean> = [
  Value<S, F>,
  Updater<InitialValue<S>>,
  A extends false ? ManualTravelsControls<S, F> : TravelsControls<S, F>,
];

/**
 * A hook to travel in the history of a state
 */
export function useTravel<S, F extends boolean>(
  initialState: S
): [Value<S, F>, Updater<InitialValue<S>>, TravelsControls<S, F>];
export function useTravel<S, F extends boolean>(
  initialState: S,
  options: Omit<TravelsOptions<F, true>, 'autoArchive'> & { autoArchive?: true }
): [Value<S, F>, Updater<InitialValue<S>>, TravelsControls<S, F>];
export function useTravel<S, F extends boolean>(
  initialState: S,
  options: Omit<TravelsOptions<F, false>, 'autoArchive'> & {
    autoArchive: false;
  }
): [Value<S, F>, Updater<InitialValue<S>>, ManualTravelsControls<S, F>];
export function useTravel<S, F extends boolean, A extends boolean>(
  initialState: S,
  _options: TravelsOptions<F, A> = {}
): Result<S, F, A> {
  // Validate options in development mode (using __DEV__ for consistency with existing codebase)
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
    (updater: any) => {
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
