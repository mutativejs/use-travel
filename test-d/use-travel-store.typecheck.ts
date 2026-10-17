import type {
  RebasableManualTravelsControls,
  RebasableTravelsControls,
  Updater,
} from 'travels';
import { createTravels } from 'travels';
import {
  type StoreControlsWithFlags,
  type UseTravelState,
  useTravelStore,
} from '../index';

const autoTravels = createTravels({ count: 0 });
const manualTravels = createTravels(
  { count: 0 },
  { autoArchive: false as const }
);

const autoResult = useTravelStore(autoTravels);
const manualResult = useTravelStore(manualTravels);

const autoTuple: [
  UseTravelState<{ count: number }, false>,
  (updater: Updater<{ count: number }>) => void,
  RebasableTravelsControls<{ count: number }>,
] = autoResult;

const manualTuple: [
  UseTravelState<{ count: number }, false>,
  (updater: Updater<{ count: number }>) => void,
  RebasableManualTravelsControls<{ count: number }>,
] = manualResult;

const autoControlsWithFlags: StoreControlsWithFlags<
  { count: number },
  false,
  true
> = autoResult[2];
const manualControlsWithFlags: StoreControlsWithFlags<
  { count: number },
  false,
  false
> = manualResult[2];

const autoCanUndo: boolean = autoResult[2].canUndo;
const autoCanRedo: boolean = autoResult[2].canRedo;
const manualCanUndo: boolean = manualResult[2].canUndo;
const manualCanRedo: boolean = manualResult[2].canRedo;

autoTuple[2].rebase();
manualTuple[2].archive();
manualTuple[2].canArchive();
autoResult[1]({ count: 1 }, { label: 'shared store update' });

// @ts-expect-error shared-store callbacks must be synchronous
autoResult[1](async (draft) => {
  draft.count = 1;
});

// @ts-expect-error auto-archived controls should not expose manual archive APIs
autoResult[2].archive();
// @ts-expect-error auto-archived controls should not expose manual archive APIs
autoResult[2].canArchive();
