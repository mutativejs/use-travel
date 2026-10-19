[**use-travel**](../README.md) • **Docs**

***

[use-travel](../globals.md) / UseTravelResult

# Type Alias: UseTravelResult\<S, F, A, P\>

> **UseTravelResult**\<`S`, `F`, `A`, `P`\>: [[`UseTravelState`](UseTravelState.md)\<`S`, `F`\>, [`UseTravelSetState`](UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](WithUndoRedoFlags.md)\<`A` *extends* `false` ? `RebasableManualTravelsControls`\<`S`, `P`\> : `RebasableTravelsControls`\<`S`, `P`\>\>]

Tuple returned by `useTravel`, specialized to its archive mode.

## Type Parameters

• **S**

• **F** *extends* `boolean` = `false`

• **A** *extends* `boolean` = `true`

• **P** *extends* `PatchesOption` = `object`

## Defined in

[src/index.ts:66](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L66)
