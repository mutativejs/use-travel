[**use-travel**](../README.md) • **Docs**

***

[use-travel](../globals.md) / useTravelStore

# Function: useTravelStore()

> **useTravelStore**\<`S`, `F`, `A`, `P`\>(`travels`): [`Value`\<`S`, `F`\>, (`updater`) => `void`, [`StoreControlsWithFlags`](../type-aliases/StoreControlsWithFlags.md)\<`S`, `F`, `A`, `P`\>]

Subscribes to an existing Travels store and bridges it into React via `useSyncExternalStore`.

The hook keeps React in sync with the store's state and exposes the same tuple shape as [useTravel](useTravel.md), but it
does not create or manage the store lifecycle. Mutable Travels instances are rejected because they reuse the same
state reference, which prevents React from observing updates.

## Type Parameters

• **S**

Shape of the state managed by the travel store.

• **F** *extends* `boolean`

Whether draft freezing is enabled.

• **A** *extends* `boolean`

Whether the instance auto-archives changes; determines the controls contract.

• **P** *extends* `object` = `object`

Additional patches configuration forwarded to Mutative.

## Parameters

• **travels**: `Travels`\<`S`, `F`, `A`, `P`\>

Existing Travels instance to bind to React.

## Returns

[`Value`\<`S`, `F`\>, (`updater`) => `void`, [`StoreControlsWithFlags`](../type-aliases/StoreControlsWithFlags.md)\<`S`, `F`, `A`, `P`\>]

A tuple containing the current state, typed updater, and history controls.

## Throws

If the provided `Travels` instance was created with `mutable: true`.

## Defined in

[src/index.ts:255](https://github.com/mutativejs/use-travel/blob/7f7cdf34d8a220ca3456ce5a3b60945c342e356e/src/index.ts#L255)
