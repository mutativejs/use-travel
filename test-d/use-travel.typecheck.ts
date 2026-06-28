import type {
  RebasableManualTravelsControls,
  RebasableTravelsControls,
  Updater,
  Value,
} from 'travels';
import { type WithUndoRedoFlags, useTravel } from '../index';

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

const autoControlsWithFlags: WithUndoRedoFlags<
  RebasableTravelsControls<{ count: number }, false>
> = autoResult[2];
const manualControlsWithFlags: WithUndoRedoFlags<
  RebasableManualTravelsControls<{ count: number }, false>
> = manualResult[2];

const autoCanUndo: boolean = autoResult[2].canUndo;
const autoCanRedo: boolean = autoResult[2].canRedo;
const explicitAutoCanUndo: boolean = explicitAutoResult[2].canUndo;
const explicitAutoCanRedo: boolean = explicitAutoResult[2].canRedo;
const manualCanUndo: boolean = manualResult[2].canUndo;
const manualCanRedo: boolean = manualResult[2].canRedo;

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
