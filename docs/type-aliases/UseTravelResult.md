[**use-travel**](../README.md) • **Docs**

***

[use-travel](../globals.md) / UseTravelResult

# Type Alias: UseTravelResult\<S, F, A, P\>

> **UseTravelResult**\<`S`, `F`, `A`, `P`\>: [`Value`\<`S`, `F`\>, [`UseTravelSetState`](UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](WithUndoRedoFlags.md)\<`A` *extends* `false` ? `RebasableManualTravelsControls`\<`S`, `F`, `P`\> : `RebasableTravelsControls`\<`S`, `F`, `P`\>\>]

Tuple returned by `useTravel`, specialized to its archive mode.

## Type Parameters

• **S**

• **F** *extends* `boolean`

• **A** *extends* `boolean`

• **P** *extends* `PatchesOption` = `object`

## Defined in

[use-travel/src/index.ts:54](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L54)
