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

[src/index.ts:41](https://github.com/mutativejs/use-travel/blob/7f3591d960ca0f9337e4f7807c5bf3d91effcdf0/src/index.ts#L41)
