[**use-travel**](../README.md) • **Docs**

***

[use-travel](../globals.md) / StoreControlsWithFlags

# Type Alias: StoreControlsWithFlags\<S, F, A, P\>

> **StoreControlsWithFlags**\<`S`, `F`, `A`, `P`\>: [`WithUndoRedoFlags`](WithUndoRedoFlags.md)\<`A` *extends* `true` ? `RebasableTravelsControls`\<`S`, `P`\> : `RebasableManualTravelsControls`\<`S`, `P`\>\>

Controls returned by `useTravelStore`, including `canUndo` and `canRedo`.

## Type Parameters

• **S**

• **F** *extends* `boolean` = `false`

• **A** *extends* `boolean` = `true`

• **P** *extends* `PatchesOption` = `object`

## Defined in

[src/index.ts:90](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L90)
