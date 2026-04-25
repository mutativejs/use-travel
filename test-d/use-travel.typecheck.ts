import type {
  RebasableManualTravelsControls,
  RebasableTravelsControls,
  Updater,
  Value,
} from 'travels';
import { useTravel } from '../index';

const autoResult = useTravel({ count: 0 });
const explicitAutoResult = useTravel({ count: 0 }, { autoArchive: true });
const manualResult = useTravel({ count: 0 }, { autoArchive: false });

const autoTuple: [
  Value<{ count: number }, false>,
  (updater: Updater<{ count: number }>) => void,
  RebasableTravelsControls<{ count: number }, false>,
] = autoResult;

const explicitAutoTuple: [
  Value<{ count: number }, false>,
  (updater: Updater<{ count: number }>) => void,
  RebasableTravelsControls<{ count: number }, false>,
] = explicitAutoResult;

const manualTuple: [
  Value<{ count: number }, false>,
  (updater: Updater<{ count: number }>) => void,
  RebasableManualTravelsControls<{ count: number }, false>,
] = manualResult;

autoTuple[2].rebase();
explicitAutoTuple[2].rebase();
manualTuple[2].rebase();
manualTuple[2].archive();
manualTuple[2].canArchive();

// @ts-expect-error auto-archived controls should not expose manual archive APIs
autoResult[2].archive();
// @ts-expect-error auto-archived controls should not expose manual archive APIs
autoResult[2].canArchive();
// @ts-expect-error auto-archived controls should not expose manual archive APIs
explicitAutoResult[2].archive();
// @ts-expect-error auto-archived controls should not expose manual archive APIs
explicitAutoResult[2].canArchive();
