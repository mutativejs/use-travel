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

type Options<F extends boolean, A extends boolean> = {
  /**
   * The maximum number of history to keep, by default `10`
   */
  maxHistory?: number;
  /**
   * The initial position in the history, by default `0`
   */
  initialPosition?: number;
  /**
   * The initial patches of the history
   */
  initialPatches?: TravelPatches;
  /**
   * Whether to automatically archive the current state, by default `true`
   */
  autoArchive?: A;
} & Omit<MutativeOptions<true, F>, 'enablePatches'>;

type InitialValue<I extends any> = I extends (...args: any) => infer R ? R : I;
type DraftFunction<S> = (draft: Draft<S>) => void;
type Updater<S> = (value: S | (() => S) | DraftFunction<S>) => void;
type Value<S, F extends boolean> = F extends true
  ? Immutable<InitialValue<S>>
  : InitialValue<S>;

interface Controls<S, F extends boolean> {
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

type Result<S, F extends boolean, A extends boolean> = [
  Value<S, F>,
  Updater<InitialValue<S>>,
  A extends false
    ? Controls<S, F> & {
        /**
         * Archive the current state
         */
        archive: () => void;
      }
    : Controls<S, F>
];

/**
 * A hook to travel in the history of a state
 */
export const useTravel = <S, F extends boolean, A extends boolean>(
  initialState: S,
  _options: Options<F, A> = {}
) => {
  const {
    maxHistory = 10,
    initialPatches,
    initialPosition = 0,
    autoArchive = true,
    ...options
  } = _options;
  const [position, setPosition] = useState(initialPosition);
  const [tempPatches, setTempPatches] = useMutative(
    () =>
      ({
        patches: [],
        inversePatches: [],
      } as TravelPatches)
  );
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
      if (autoArchive) {
        setPosition(
          maxHistory < allPatches.patches.length + 1 ? maxHistory : position + 1
        );
        setAllPatches((allPatchesDraft) => {
          const notLast = position < allPatchesDraft.patches.length;
          // Remove all patches after the current position
          if (notLast) {
            allPatchesDraft.patches.splice(
              position,
              allPatchesDraft.patches.length - position
            );
            allPatchesDraft.inversePatches.splice(
              position,
              allPatchesDraft.inversePatches.length - position
            );
          }
          allPatchesDraft.patches.push(patches);
          allPatchesDraft.inversePatches.push(inversePatches);
          if (maxHistory < allPatchesDraft.patches.length) {
            allPatchesDraft.patches = allPatchesDraft.patches.slice(
              -maxHistory
            );
            allPatchesDraft.inversePatches =
              allPatchesDraft.inversePatches.slice(-maxHistory);
          }
        });
      } else {
        const notLast =
          position <
          allPatches.patches.length + Number(!!tempPatches.patches.length);
        // Remove all patches after the current position
        if (notLast) {
          allPatches.patches.splice(
            position,
            allPatches.patches.length - position
          );
          allPatches.inversePatches.splice(
            position,
            allPatches.inversePatches.length - position
          );
        }
        if (!tempPatches.patches.length || notLast) {
          setPosition(
            maxHistory < allPatches.patches.length + 1
              ? maxHistory
              : position + 1
          );
        }
        setTempPatches((tempPatchesDraft) => {
          if (notLast) {
            tempPatchesDraft.patches.length = 0;
            tempPatchesDraft.inversePatches.length = 0;
          }
          tempPatchesDraft.patches.push(patches);
          tempPatchesDraft.inversePatches.push(inversePatches);
        });
      }
    },
    [state, position, setTempPatches]
  );
  const archive = () => {
    if (autoArchive) {
      console.warn('Auto archive is enabled, no need to archive manually');
      return;
    }
    if (!tempPatches.patches.length) return;
    setAllPatches((allPatchesDraft) => {
      allPatchesDraft.patches.push(tempPatches.patches.flat());
      allPatchesDraft.inversePatches.push(tempPatches.inversePatches.flat());
      if (maxHistory < allPatchesDraft.patches.length) {
        allPatchesDraft.patches = allPatchesDraft.patches.slice(-maxHistory);
        allPatchesDraft.inversePatches = allPatchesDraft.inversePatches.slice(
          -maxHistory
        );
      }
    });
    setTempPatches((tempPatchesDraft) => {
      tempPatchesDraft.patches.length = 0;
      tempPatchesDraft.inversePatches.length = 0;
    });
  };
  const shouldArchive = useMemo(() => !autoArchive && tempPatches.patches.length, [tempPatches]);
  const _allPatches = useMemo(() => {
    let mergedPatches = allPatches;
    if (shouldArchive) {
      mergedPatches = {
        patches: allPatches.patches.concat(),
        inversePatches: allPatches.inversePatches.concat(),
      };
      mergedPatches.patches.push(tempPatches.patches.flat());
      mergedPatches.inversePatches.push(tempPatches.inversePatches.flat());
    }
    return mergedPatches;
  }, [allPatches, tempPatches, shouldArchive]);

  const cachedTravels = useMemo(() => {
    const go = (nextPosition: number) => {
      const back = nextPosition < position;
      if (shouldArchive) {
        archive();
      }
      if (nextPosition > _allPatches.patches.length) {
        console.warn(`Can't go forward to position ${nextPosition}`);
        nextPosition = _allPatches.patches.length;
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
              ? _allPatches.inversePatches
                  .slice(-maxHistory)
                  .slice(nextPosition)
                  .flat()
                  .reverse()
              : _allPatches.patches
                  .slice(-maxHistory)
                  .slice(position, nextPosition)
                  .flat()
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
        let currentState = state;
        const patches =
          !autoArchive && _allPatches.patches.length > maxHistory
            ? _allPatches.patches.slice(_allPatches.patches.length - maxHistory)
            : _allPatches.patches;
        const inversePatches =
          !autoArchive && _allPatches.inversePatches.length > maxHistory
            ? _allPatches.inversePatches.slice(
                _allPatches.inversePatches.length - maxHistory
              )
            : _allPatches.inversePatches;
        for (let i = position; i < patches.length; i++) {
          currentState = apply(currentState as object, patches[i]) as S;
          cachedHistory.push(currentState);
        }
        currentState = state;
        for (let i = position - 1; i > -1; i--) {
          currentState = apply(currentState as object, inversePatches[i]) as S;
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
        setPosition(initialPosition);
        setAllPatches(
          () => initialPatches ?? { patches: [], inversePatches: [] }
        );
        setState(() => initialState);
        setTempPatches(() => ({ patches: [], inversePatches: [] }));
      },
      go,
      canBack: () => {
        return position > 0;
      },
      canForward: () => {
        if (shouldArchive) {
          return position < _allPatches.patches.length - 1;
        }
        return position < allPatches.patches.length;
      },
      archive,
    };
  }, [
    position,
    allPatches,
    setPosition,
    setAllPatches,
    setState,
    initialState,
    state,
    tempPatches,
    _allPatches,
    shouldArchive,
  ]);
  return [state, cachedSetState, cachedTravels] as Result<S, F, A>;
};
