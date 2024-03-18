import { useCallback, useEffect, useMemo } from 'react';
import {
  type Options as MutativeOptions,
  type Patches,
  type Draft,
  type Immutable,
  apply,
  rawReturn,
} from 'mutative';
import { useMutative } from 'use-mutative';

type TravelPatches = {
  patches: Patches[];
  inversePatches: Patches[];
};

type Options<A extends boolean, F extends boolean> = {
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
export const useTravel = <S, A extends boolean, F extends boolean>(
  initialState: S,
  { maxHistory = 10, initialPatches, ...options }: Options<A, F> = {}
) => {
  const [position, setPosition] = useMutative(-1);
  const [allPatches, setAllPatches] = useMutative(
    () =>
      (initialPatches ?? {
        patches: [],
        inversePatches: [],
      }) as TravelPatches
  );
  const [state, setState, patches, inversePatches] = useMutative(initialState, {
    ...options,
    enablePatches: true,
  });
  useEffect(() => {
    if (position === -1 && patches.length > 0) {
      setAllPatches((_allPatches) => {
        _allPatches.patches.push(patches);
        _allPatches.inversePatches.push(inversePatches);
        if (maxHistory < _allPatches.patches.length) {
          _allPatches.patches = _allPatches.patches.slice(-maxHistory);
          _allPatches.inversePatches = _allPatches.inversePatches.slice(
            -maxHistory
          );
        }
      });
    }
  }, [maxHistory, patches, inversePatches, position]);
  const cachedPosition = useMemo(
    () => (position === -1 ? allPatches.patches.length : position),
    [position, allPatches.patches.length]
  );
  const cachedTravels = useMemo(() => {
    const go = (nextPosition: number) => {
      const back = nextPosition < cachedPosition;
      if (nextPosition > allPatches.patches.length) {
        console.warn(`Can't go forward to position ${nextPosition}`);
        nextPosition = allPatches.patches.length;
      }
      if (nextPosition < 0) {
        console.warn(`Can't go back to position ${nextPosition}`);
        nextPosition = 0;
      }
      if (nextPosition === cachedPosition) return;
      setPosition(nextPosition);
      setState(() =>
        rawReturn(
          apply(
            state as object,
            back
              ? allPatches.inversePatches.slice(nextPosition).flat().reverse()
              : allPatches.patches.slice(position, nextPosition).flat()
          )
        )
      );
    };
    return {
      position: cachedPosition,
      getHistory: () => {
        const history = [state];
        let currentState = state as any;
        for (let i = cachedPosition; i < allPatches.patches.length; i++) {
          currentState = apply(
            currentState as object,
            allPatches.patches[i]
          ) as S;
          console.log('i', i, JSON.stringify(currentState));
          history.push(currentState);
        }
        currentState = state as any;
        for (let i = cachedPosition - 1; i > -1; i--) {
          currentState = apply(
            currentState as object,
            allPatches.inversePatches[i]
          ) as S;
          console.log('j', i, JSON.stringify(currentState));
          history.unshift(currentState);
        }
        console.log('history', JSON.stringify(history));
        return history;
      },
      patches: allPatches,
      back: (amount = 1) => {
        go(cachedPosition - amount);
      },
      forward: (amount = 1) => {
        go(cachedPosition + amount);
      },
      reset: () => {
        setPosition(-1);
        setAllPatches(
          () => initialPatches ?? { patches: [], inversePatches: [] }
        );
        setState(() => initialState);
      },
      go,
      canBack: () => cachedPosition > 0,
      canForward: () => cachedPosition < allPatches.patches.length,
    };
  }, [
    cachedPosition,
    allPatches,
    setPosition,
    setAllPatches,
    setState,
    initialState,
    state,
  ]);
  const cachedSetState = useCallback(
    (value: StateValue<S>) => {
      setPosition(-1);
      if (position !== -1) {
        setAllPatches((_allPatches) => {
          _allPatches.patches = _allPatches.patches.slice(0, position);
          _allPatches.inversePatches = _allPatches.inversePatches.slice(
            0,
            position
          );
        });
      }
      setState(value);
    },
    [setState, setPosition, position, setAllPatches]
  );
  return [state, cachedSetState, cachedTravels] as Result<S, F>;
};
