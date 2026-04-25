import type {
  RebasableManualTravelsControls,
  RebasableTravelsControls,
  Updater,
  Value,
} from 'travels';
import { Travels } from 'travels';
import { useTravelStore } from '../index';

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

autoTuple[2].rebase();
manualTuple[2].archive();
manualTuple[2].canArchive();

// @ts-expect-error auto-archived controls should not expose manual archive APIs
autoResult[2].archive();
// @ts-expect-error auto-archived controls should not expose manual archive APIs
autoResult[2].canArchive();
