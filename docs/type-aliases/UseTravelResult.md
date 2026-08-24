[**use-travel**](../README.md) • **Docs**

***

[use-travel](../globals.md) / UseTravelResult

# Type Alias: UseTravelResult\<S, F, A, P\>

> **UseTravelResult**\<`S`, `F`, `A`, `P`\>: [`Value`\<`S`, `F`\>, (`updater`) => `void`, [`WithUndoRedoFlags`](WithUndoRedoFlags.md)\<`A` *extends* `false` ? `RebasableManualTravelsControls`\<`S`, `F`, `P`\> : `RebasableTravelsControls`\<`S`, `F`, `P`\>\>]

Tuple returned by `useTravel`, specialized to its archive mode.

## Type Parameters

• **S**

• **F** *extends* `boolean`

• **A** *extends* `boolean`

• **P** *extends* `PatchesOption` = `object`

## Defined in

[src/index.ts:50](https://github.com/mutativejs/use-travel/blob/e45a6fa3283342ebc619ed9665e8f1b65407eb0e/src/index.ts#L50)
