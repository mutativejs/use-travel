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

[use-travel/src/index.ts:70](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L70)
