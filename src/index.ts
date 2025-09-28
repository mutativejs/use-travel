import {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import {
  type Options as MutativeOptions,
  type Patches,
  type Draft,
  type Immutable,
  apply,
  create,
} from 'mutative';

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
        /**
         * Check if it's possible to archive the current state
         */
        canArchive: () => boolean;
      }
    : Controls<S, F>,
];

type RefStateAction<T> = T | ((current: T) => T | void);

const cloneTravelPatches = (base?: TravelPatches): TravelPatches => ({
  patches: base ? base.patches.map((patch) => patch) : [],
  inversePatches: base ? base.inversePatches.map((patch) => patch) : [],
});

const useRefState = <T>(
  initializer: () => T
): [MutableRefObject<T>, (updater: RefStateAction<T>) => void, number] => {
  const ref = useRef<T>(null as unknown as T);
  const initialized = useRef(false);
  if (!initialized.current) {
    ref.current = initializer();
    initialized.current = true;
  }
  const [version, bumpVersion] = useReducer((v: number) => v + 1, 0);
  const setRef = useCallback(
    (updater: RefStateAction<T>) => {
      const currentValue = ref.current;
      if (typeof updater === 'function') {
        const result = (updater as (value: T) => T | void)(currentValue);
        if (result !== undefined) {
          ref.current = result as T;
        }
      } else {
        ref.current = updater;
      }
      bumpVersion();
    },
    [bumpVersion]
  );
  return [ref, setRef, version];
};

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
  let updatedState: S | null = null;
  const [position, setPosition] = useState(initialPosition);
  const [tempPatchesRef, setTempPatches, tempPatchesVersion] =
    useRefState<TravelPatches>(() => cloneTravelPatches());
  const [allPatchesRef, setAllPatches, allPatchesVersion] =
    useRefState<TravelPatches>(() => cloneTravelPatches(initialPatches));
  const [state, setState] = useState(initialState);
  const cachedSetState = useCallback(
    (updater: any) => {
      const [nextState, patches, inversePatches] = (
        typeof updater === 'function'
          ? create(state, updater, { ...options, enablePatches: true })
          : create(state, () => updater, { ...options, enablePatches: true })
      ) as [S, Patches<true>, Patches<true>];
      setState(nextState);
      const currentAllPatches = allPatchesRef.current;
      const currentTempPatches = tempPatchesRef.current;
      if (autoArchive) {
        setPosition(
          maxHistory < currentAllPatches.patches.length + 1
            ? maxHistory
            : position + 1
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
            allPatchesDraft.patches =
              allPatchesDraft.patches.slice(-maxHistory);
            allPatchesDraft.inversePatches =
              allPatchesDraft.inversePatches.slice(-maxHistory);
          }
        });
      } else {
        const notLast =
          position <
          currentAllPatches.patches.length +
            Number(!!currentTempPatches.patches.length);
        // Remove all patches after the current position
        if (notLast) {
          currentAllPatches.patches.splice(
            position,
            currentAllPatches.patches.length - position
          );
          currentAllPatches.inversePatches.splice(
            position,
            currentAllPatches.inversePatches.length - position
          );
        }
        if (!currentTempPatches.patches.length || notLast) {
          setPosition(
            maxHistory < currentAllPatches.patches.length + 1
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
      updatedState = nextState;
    },
    [
      autoArchive,
      maxHistory,
      options,
      position,
      setAllPatches,
      setPosition,
      setTempPatches,
      setState,
      state,
    ]
  );
  const archive = useCallback(() => {
    if (autoArchive) {
      console.warn('Auto archive is enabled, no need to archive manually');
      return;
    }
    const currentTempPatches = tempPatchesRef.current;
    if (!currentTempPatches.patches.length) return;
    setAllPatches((allPatchesDraft) => {
      // All patches will be merged, it helps to minimize the patch structure
      const [, patches, inversePatches] = create(
        // where the state is updated via the setState callback and immediately executes archive().
        (updatedState ?? state) as object,
        (draft) =>
          apply(draft, currentTempPatches.inversePatches.flat().reverse()),
        {
          enablePatches: true,
        }
      );
      allPatchesDraft.patches.push(inversePatches);
      allPatchesDraft.inversePatches.push(patches);
      if (maxHistory < allPatchesDraft.patches.length) {
        allPatchesDraft.patches = allPatchesDraft.patches.slice(-maxHistory);
        allPatchesDraft.inversePatches =
          allPatchesDraft.inversePatches.slice(-maxHistory);
      }
    });
    setTempPatches((tempPatchesDraft) => {
      tempPatchesDraft.patches.length = 0;
      tempPatchesDraft.inversePatches.length = 0;
    });
  }, [autoArchive, maxHistory, setAllPatches, setTempPatches, state]);
  const shouldArchive = !autoArchive && !!tempPatchesRef.current.patches.length;
  const _allPatches = useMemo(() => {
    const base = allPatchesRef.current;
    if (!shouldArchive) {
      return base;
    }
    return {
      patches: base.patches.concat([tempPatchesRef.current.patches.flat()]),
      inversePatches: base.inversePatches.concat([
        tempPatchesRef.current.inversePatches.flat().reverse(),
      ]),
    };
  }, [allPatchesVersion, shouldArchive, tempPatchesVersion]);

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
      if (shouldArchive) {
        _allPatches.inversePatches.slice(-1)[0].reverse();
      }
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
      patches: shouldArchive ? _allPatches : allPatchesRef.current,
      back: (amount = 1) => {
        go(position - amount);
      },
      forward: (amount = 1) => {
        go(position + amount);
      },
      reset: () => {
        setPosition(initialPosition);
        setAllPatches(() => cloneTravelPatches(initialPatches));
        setState(() => initialState);
        setTempPatches(() => cloneTravelPatches());
      },
      go,
      canBack: () => position > 0,
      canForward: () =>
        shouldArchive
          ? position < _allPatches.patches.length - 1
          : position < allPatchesRef.current.patches.length,
      canArchive: () => shouldArchive,
      archive,
    };
  }, [
    archive,
    allPatchesVersion,
    autoArchive,
    initialPatches,
    initialPosition,
    initialState,
    maxHistory,
    position,
    setAllPatches,
    setPosition,
    setState,
    setTempPatches,
    shouldArchive,
    state,
    _allPatches,
  ]);
  return [state, cachedSetState, cachedTravels] as Result<S, F, A>;
};
