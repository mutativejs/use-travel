[**use-travel**](../README.md) • **Docs**

***

[use-travel](../globals.md) / StoreControlsWithFlags

# Type Alias: StoreControlsWithFlags\<S, F, A, P\>

> **StoreControlsWithFlags**\<`S`, `F`, `A`, `P`\>: [`WithUndoRedoFlags`](WithUndoRedoFlags.md)\<`A` *extends* `true` ? `RebasableTravelsControls`\<`S`, `F`, `P`\> : `RebasableManualTravelsControls`\<`S`, `F`, `P`\>\>

Controls returned by `useTravelStore`, including `canUndo` and `canRedo`.

## Type Parameters

• **S**

• **F** *extends* `boolean`

• **A** *extends* `boolean`

• **P** *extends* `PatchesOption` = `object`

## Defined in

[src/index.ts:40](https://github.com/mutativejs/use-travel/blob/7f7cdf34d8a220ca3456ce5a3b60945c342e356e/src/index.ts#L40)
