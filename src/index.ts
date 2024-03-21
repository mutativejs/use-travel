import { useCallback, useMemo, useState } from 'react';
import {
  type Options as MutativeOptions,
  type Patches,
  type Draft,
  type Immutable,
  apply,
  create,
} from 'mutative';
import { useMutative } from 'use-mutative';

type TravelPatches = {
  patches: Patches[];
  inversePatches: Patches[];
};

type Options<F extends boolean> = {
  maxHistory?: number;
  initialPatches?: TravelPatches;
} & MutativeOptions<true, F>;

type InitialValue<I extends any> = I extends (...args: any) => infer R ? R : I;
type DraftFunction<S> = (draft: Draft<S>) => void;
type Updater<S> = (value: S | (() => S) | DraftFunction<S>) => void;
type Value<S, F extends boolean> = F extends true
  ? Immutable<InitialValue<S>>
  : InitialValue<S>;
type StateValue<S> =
  | InitialValue<S>
  | (() => InitialValue<S>)
  | DraftFunction<InitialValue<S>>;

type Result<S, F extends boolean> = [
  Value<S, F>,
  Updater<InitialValue<S>>,
  {
    /**
     * The current position in the history
     */
    position: number;
    /**
     * Get the history of the state
     */
    getHistory: () => Value<S, F>[];
    /**
     * The patches of the history
     */
    patches: TravelPatches;
    /**
     * Go back in the history
     */
    back: (amount?: number) => void;
    /**
     * Go forward in the history
     */
    forward: (amount?: number) => void;
    /**
     * Reset the history
     */
    reset: () => void;
    /**
     * Go to a specific position in the history
     */
    go: (position: number) => void;
    /**
     * Check if it's possible to go back
     */
    canBack: () => boolean;
    /**
     * Check if it's possible to go forward
     */
    canForward: () => boolean;
  }
];

/**
 * A hook to travel in the history of a state
 */
export const useTravel = <S, F extends boolean>(
  initialState: S,
  { maxHistory = 10, initialPatches, ...options }: Options<F> = {}
) => {
  const [position, setPosition] = useState(0);
  const [allPatches, setAllPatches] = useMutative(
    () =>
      (initialPatches ?? {
        patches: [],
        inversePatches: [],
      }) as TravelPatches
  );
  const [state, setState] = useState(initialState);
  const cachedSetState = useCallback(
    (updater: any) => {
      const [nextState, patches, inversePatches] = (
        typeof updater === 'function'
          ? create(state, updater, { ...options, enablePatches: true })
          : create(state, () => updater, { ...options, enablePatches: true })
      ) as [S, Patches<true>, Patches<true>];
      setState(nextState);
      setPosition(position + 1);
      setAllPatches((_allPatches) => {
        const notLast = position < _allPatches.patches.length;
        // Remove all patches after the current position
        if (notLast) {
          _allPatches.patches.splice(
            position,
            _allPatches.patches.length - position
          );
          _allPatches.inversePatches.splice(
            position,
            _allPatches.inversePatches.length - position
          );
        }
        _allPatches.patches.push(patches);
        _allPatches.inversePatches.push(inversePatches);
        if (maxHistory < _allPatches.patches.length) {
          _allPatches.patches = _allPatches.patches.slice(-maxHistory);
          _allPatches.inversePatches = _allPatches.inversePatches.slice(
            -maxHistory
          );
        }
      });
    },
    [state, position]
  );
  const cachedTravels = useMemo(() => {
    const go = (nextPosition: number) => {
      const back = nextPosition < position;
      if (nextPosition > allPatches.patches.length) {
        console.warn(`Can't go forward to position ${nextPosition}`);
        nextPosition = allPatches.patches.length;
      }
      if (nextPosition < 0) {
        console.warn(`Can't go back to position ${nextPosition}`);
        nextPosition = 0;
      }
      if (nextPosition === position) return;
      setState(
        () =>
          apply(
            state as object,
            back
              ? allPatches.inversePatches.slice(nextPosition).flat().reverse()
              : allPatches.patches.slice(position, nextPosition).flat()
          ) as S
      );
      setPosition(nextPosition);
    };
    let cachedHistory: S[];
    return {
      position,
      getHistory: () => {
        if (cachedHistory) return cachedHistory;
        cachedHistory = [state];
        let currentState = state as any;
        for (let i = position; i < allPatches.patches.length; i++) {
          currentState = apply(
            currentState as object,
            allPatches.patches[i]
          ) as S;
          cachedHistory.push(currentState);
        }
        currentState = state as any;
        for (let i = position - 1; i > -1; i--) {
          currentState = apply(
            currentState as object,
            allPatches.inversePatches[i]
          ) as S;
          cachedHistory.unshift(currentState);
        }
        return cachedHistory;
      },
      patches: allPatches,
      back: (amount = 1) => {
        go(position - amount);
      },
      forward: (amount = 1) => {
        go(position + amount);
      },
      reset: () => {
        setPosition(0);
        setAllPatches(
          () => initialPatches ?? { patches: [], inversePatches: [] }
        );
        setState(() => initialState);
      },
      go,
      canBack: () => position > 0,
      canForward: () => position < allPatches.patches.length,
    };
  }, [
    position,
    allPatches,
    setPosition,
    setAllPatches,
    setState,
    initialState,
    state,
  ]);
  return [state, cachedSetState, cachedTravels] as Result<S, F>;
};
