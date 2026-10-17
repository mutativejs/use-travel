import type {
  RebasableManualTravelsControls,
  RebasableTravelsControls,
  TravelsEvent,
  Updater,
} from 'travels';
import {
  type UseTravelState,
  type WithUndoRedoFlags,
  useTravel,
} from '../index';

const autoResult = useTravel({ count: 0 });
const defaultOptionsResult = useTravel({ count: 0 }, {});
const explicitAutoResult = useTravel({ count: 0 }, { autoArchive: true });
const manualResult = useTravel({ count: 0 }, { autoArchive: false });
const frozenResult = useTravel({ count: 0 }, { enableAutoFreeze: true });
declare const dynamicArchiveMode: boolean;
const dynamicResult = useTravel(
  { count: 0 },
  { autoArchive: dynamicArchiveMode }
);

const autoTuple: [
  UseTravelState<{ count: number }, false>,
  (updater: Updater<{ count: number }>) => void,
  RebasableTravelsControls<{ count: number }>,
] = autoResult;

const explicitAutoTuple: [
  UseTravelState<{ count: number }, false>,
  (updater: Updater<{ count: number }>) => void,
  RebasableTravelsControls<{ count: number }>,
] = explicitAutoResult;

const manualTuple: [
  UseTravelState<{ count: number }, false>,
  (updater: Updater<{ count: number }>) => void,
  RebasableManualTravelsControls<{ count: number }>,
] = manualResult;

const autoControlsWithFlags: WithUndoRedoFlags<
  RebasableTravelsControls<{ count: number }>
> = autoResult[2];
const manualControlsWithFlags: WithUndoRedoFlags<
  RebasableManualTravelsControls<{ count: number }>
> = manualResult[2];
const dynamicControlsWithFlags: WithUndoRedoFlags<
  | RebasableTravelsControls<{ count: number }>
  | RebasableManualTravelsControls<{ count: number }>
> = dynamicResult[2];

const autoCanUndo: boolean = autoResult[2].canUndo;
const autoCanRedo: boolean = autoResult[2].canRedo;
const explicitAutoCanUndo: boolean = explicitAutoResult[2].canUndo;
const explicitAutoCanRedo: boolean = explicitAutoResult[2].canRedo;
const manualCanUndo: boolean = manualResult[2].canUndo;
const manualCanRedo: boolean = manualResult[2].canRedo;
const dynamicCanUndo: boolean = dynamicControlsWithFlags.canUndo;
const dynamicCanRedo: boolean = dynamicControlsWithFlags.canRedo;

autoResult[0].count = 1;
defaultOptionsResult[0].count = 1;
explicitAutoResult[0].count = 1;
manualResult[0].count = 1;
// @ts-expect-error explicitly frozen state is deeply read-only
frozenResult[0].count = 1;

autoTuple[2].rebase();
explicitAutoTuple[2].rebase();
manualTuple[2].rebase();
manualTuple[2].archive();
manualTuple[2].canArchive();
autoResult[1]({ count: 1 }, { label: 'react update' });

// @ts-expect-error hook state callbacks must be synchronous
autoResult[1](async (draft) => {
  draft.count = 1;
});

const maybeAsyncUpdater = (
  draft: { count: number }
): void | Promise<void> => {
  draft.count = 2;
};
// @ts-expect-error Promise unions must also be rejected
autoResult[1](maybeAsyncUpdater);

// @ts-expect-error auto-archived controls should not expose manual archive APIs
autoResult[2].archive();
// @ts-expect-error auto-archived controls should not expose manual archive APIs
autoResult[2].canArchive();
// @ts-expect-error auto-archived controls should not expose manual archive APIs
explicitAutoResult[2].archive();
// @ts-expect-error auto-archived controls should not expose manual archive APIs
explicitAutoResult[2].canArchive();

useTravel(
  { count: 0 },
  {
    // @ts-expect-error controlledApply is reserved for createTravelJournal
    controlledApply: ({ state }: { state: { count: number } }) => state,
  }
);

useTravel(
  { count: 0 },
  {
    // @ts-expect-error split persistence options were removed in use-travel 3
    initialPosition: 0,
  }
);

useTravel(
  { count: 0 },
  {
    devtools(event) {
      const _count: number = event.state.count;
      // @ts-expect-error devtools events carry the hook state type
      void event.state.missing;
    },
  }
);

useTravel(
  { count: 0 },
  {
    autoArchive: false,
    devtools(event) {
      const _count: number = event.state.count;
      // @ts-expect-error manual-mode devtools events carry the hook state type
      void event.state.missing;
    },
  }
);

useTravel(
  { count: 0 },
  // A hook written for any state still fits every timeline.
  { devtools: (event: TravelsEvent<unknown>) => void event }
);
