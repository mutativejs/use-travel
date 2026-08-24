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

[src/index.ts:66](https://github.com/mutativejs/use-travel/blob/e45a6fa3283342ebc619ed9665e8f1b65407eb0e/src/index.ts#L66)
