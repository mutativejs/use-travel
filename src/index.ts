import { useCallback, useMemo, useRef } from 'react';
import type {
  TravelPatches,
  Travels,
  TravelsOptions,
  RebasableManualTravelsControls,
  RebasableTravelsControls,
  ReadonlyState,
  Updater,
  PatchesOption,
  TravelMetadata,
} from 'travels';
import { createTravels } from 'travels';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

export type { TravelPatches };

const removedRestoreOptions = [
  'history',
  'initialPatches',
  'initialPosition',
  'strictInitialPatches',
] as const;

const unsupportedOwnershipOptions = ['controlledApply', 'mutable'] as const;

function assertOptionsObject(
  options: unknown
): asserts options is Record<PropertyKey, unknown> {
  if (
    options === null ||
    typeof options !== 'object' ||
    Array.isArray(options)
  ) {
    throw new TypeError(
      'useTravel: options must be a non-null, non-array object'
    );
  }
}

/** Options accepted by the component-owned `useTravel` timeline. */
export type UseTravelOptions<
  F extends boolean = false,
  A extends boolean = true,
  P extends PatchesOption = {},
  S = any,
> = Omit<
  TravelsOptions<F, A, P, S>,
  | 'controlledApply'
  | 'history'
  | 'initialPatches'
  | 'initialPosition'
  | 'mutable'
  | 'strictInitialPatches'
>;

/** Hook state: deeply read-only when `enableAutoFreeze` is enabled. */
export type UseTravelState<S, F extends boolean = false> = F extends true
  ? ReadonlyState<S>
  : S;

/** Adds `canUndo` and `canRedo` flags to a controls type. */
export type WithUndoRedoFlags<C> = C & {
  /** Whether undo is currently possible. */
  readonly canUndo: boolean;
  /** Whether redo is currently possible. */
  readonly canRedo: boolean;
};

/** Core-compatible synchronous state setter exposed by the React hooks. */
export type UseTravelSetState<S> = Travels<S>['setState'];

/** Tuple returned by `useTravel`, specialized to its archive mode. */
export type UseTravelResult<
  S,
  F extends boolean = false,
  A extends boolean = true,
  P extends PatchesOption = {},
> = [
  UseTravelState<S, F>,
  UseTravelSetState<S>,
  WithUndoRedoFlags<
    A extends false
      ? RebasableManualTravelsControls<S, P>
      : RebasableTravelsControls<S, P>
  >,
];

/** Controls returned by `useTravelStore`, including `canUndo` and `canRedo`. */
export type StoreControlsWithFlags<
  S,
  F extends boolean = false,
  A extends boolean = true,
  P extends PatchesOption = {},
> = WithUndoRedoFlags<
  A extends true
    ? RebasableTravelsControls<S, P>
    : RebasableManualTravelsControls<S, P>
>;

const useTravelsState = <
  S,
  F extends boolean,
  A extends boolean,
  P extends PatchesOption,
>(
  travels: Travels<S, F, A, P>
): UseTravelState<S, F> => {
  useSyncExternalStore(
    travels.subscribe,
    travels.getRevision,
    travels.getRevision
  );
  return travels.getState() as UseTravelState<S, F>;
};

/**
 * Creates a component-scoped Travels instance with undo/redo support and returns its reactive API.
 *
 * The hook memoises the underlying `Travels` instance per component, wires it to React's lifecycle, and forces
 * re-renders whenever the managed state changes. Consumers receive a tuple containing the current state, a `setState`
 * updater that accepts either a complete value or mutative draft function, and the history controls exposed by
 * Travels.
 *
 * @typeParam S - Shape of the state managed by the travel store.
 * @typeParam F - Whether draft freezing is enabled.
 * @typeParam A - Whether the instance auto-archives changes; determines the controls contract.
 * @typeParam P - Additional patches configuration forwarded to Mutative.
 * @param initialState - Value used to initialise the travel store.
 * @returns A tuple with the current state, typed updater, and history controls.
 */
export function useTravel<S, F extends boolean = false>(
  initialState: S
): [
  UseTravelState<S, F>,
  UseTravelSetState<S>,
  WithUndoRedoFlags<RebasableTravelsControls<S>>,
];
export function useTravel<
  S,
  F extends boolean = false,
  P extends PatchesOption = {},
>(
  initialState: S,
  options: Omit<UseTravelOptions<F, true, P, S>, 'autoArchive'> & {
    autoArchive?: true;
  }
): [
  UseTravelState<S, F>,
  UseTravelSetState<S>,
  WithUndoRedoFlags<RebasableTravelsControls<S, P>>,
];
export function useTravel<
  S,
  F extends boolean = false,
  P extends PatchesOption = {},
>(
  initialState: S,
  options: Omit<UseTravelOptions<F, false, P, S>, 'autoArchive'> & {
    autoArchive: false;
  }
): [
  UseTravelState<S, F>,
  UseTravelSetState<S>,
  WithUndoRedoFlags<RebasableManualTravelsControls<S, P>>,
];
export function useTravel<
  S,
  F extends boolean = false,
  A extends boolean = true,
  P extends PatchesOption = {},
>(
  initialState: S,
  options: UseTravelOptions<F, A, P, S>
): UseTravelResult<S, F, A, P>;
export function useTravel<
  S,
  F extends boolean = false,
  A extends boolean = true,
  P extends PatchesOption = {},
>(
  initialState: S,
  _options: UseTravelOptions<F, A, P, S> = {}
): UseTravelResult<S, F, A, P> {
  assertOptionsObject(_options);
  for (const option of removedRestoreOptions) {
    if (Object.prototype.hasOwnProperty.call(_options, option)) {
      throw new TypeError(
        `useTravel: ${option} was removed; restore a complete snapshot with restoreTravels() and pass that instance to useTravelStore()`
      );
    }
  }

  for (const option of unsupportedOwnershipOptions) {
    if (Object.prototype.hasOwnProperty.call(_options, option)) {
      throw new TypeError(
        option === 'controlledApply'
          ? 'useTravel: controlledApply is reserved for externally owned journals; use createTravelJournal() from travels directly'
          : 'useTravel: the mutable option is not supported, because mutable mode cannot drive React updates; remove it or use travels directly'
      );
    }
  }

  // Create Travels instance (only once)
  const travelsRef = useRef<Travels<S, F, A, P> | null>(null);
  if (!travelsRef.current) {
    travelsRef.current = createTravels<S, F, A, P>(initialState, {
      ..._options,
      mutable: false,
    });
  }

  const travels = travelsRef.current;
  const state = useTravelsState(travels);

  const cachedSetState: UseTravelSetState<S> = useCallback(
    (updater: Updater<S>, metadata?: TravelMetadata) =>
      travels.setState(updater, metadata),
    [travels]
  );

  // Create controls object with memoization
  const cachedControls = useMemo(() => {
    const baseControls = travels.getControls();

    // Preserve the exact core capability surface (including future additions)
    // while adding React-friendly live flags.
    return Object.freeze(
      Object.defineProperties(
        {},
        {
          ...Object.getOwnPropertyDescriptors(baseControls),
          canUndo: {
            get: () => baseControls.canBack(),
            enumerable: true,
          },
          canRedo: {
            get: () => baseControls.canForward(),
            enumerable: true,
          },
        }
      )
    );
  }, [travels]);

  return [state, cachedSetState, cachedControls] as UseTravelResult<S, F, A, P>;
}

/**
 * Subscribes to an existing Travels store and bridges it into React via `useSyncExternalStore`.
 *
 * The hook keeps React in sync with the store's state and exposes the same tuple shape as {@link useTravel}, but it
 * does not create or manage the store lifecycle. Mutable Travels instances are rejected because they reuse the same
 * state reference, which prevents React from observing updates.
 *
 * @typeParam S - Shape of the state managed by the travel store.
 * @typeParam F - Whether draft freezing is enabled.
 * @typeParam A - Whether the instance auto-archives changes; determines the controls contract.
 * @typeParam P - Additional patches configuration forwarded to Mutative.
 * @param travels - Existing Travels instance to bind to React.
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
  UseTravelState<S, F>,
  UseTravelSetState<S>,
  StoreControlsWithFlags<S, F, A, P>,
] {
  const isMutable = travels.mutable;

  if (isMutable) {
    throw new Error(
      'useTravelStore only supports immutable Travels instances. Remove `mutable: true` or use useTravel instead.'
    );
  }
  const state = useTravelsState(travels);
  const setState: UseTravelSetState<S> = useCallback(
    (updater: Updater<S>, metadata?: TravelMetadata) =>
      travels.setState(updater, metadata),
    [travels]
  );
  const controls = useMemo<StoreControlsWithFlags<S, F, A, P>>(() => {
    const base = travels.getControls();
    // Preserve the base controls as own properties so Object.keys and spread keep working.
    return Object.freeze(
      Object.defineProperties(
        {},
        {
          ...Object.getOwnPropertyDescriptors(base),
          canUndo: { get: () => base.canBack(), enumerable: true },
          canRedo: { get: () => base.canForward(), enumerable: true },
        }
      )
    ) as StoreControlsWithFlags<S, F, A, P>;
  }, [travels]);
  return [state as UseTravelState<S, F>, setState, controls];
}
