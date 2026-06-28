import type {
  RebasableManualTravelsControls,
  RebasableTravelsControls,
  Updater,
  Value,
} from 'travels';
import { Travels } from 'travels';
import { type StoreControlsWithFlags, useTravelStore } from '../index';

const autoTravels = new Travels({ count: 0 });
const manualTravels = new Travels(
  { count: 0 },
  { autoArchive: false as const }
);

const autoResult = useTravelStore(autoTravels);
const manualResult = useTravelStore(manualTravels);

const autoTuple: [
  Value<{ count: number }, false>,
  (updater: Updater<{ count: number }>) => void,
  RebasableTravelsControls<{ count: number }, false>,
] = autoResult;

const manualTuple: [
  Value<{ count: number }, false>,
  (updater: Updater<{ count: number }>) => void,
  RebasableManualTravelsControls<{ count: number }, false>,
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

// @ts-expect-error auto-archived controls should not expose manual archive APIs
autoResult[2].archive();
// @ts-expect-error auto-archived controls should not expose manual archive APIs
autoResult[2].canArchive();
