[**use-travel**](../README.md) • **Docs**

***

[use-travel](../globals.md) / useTravel

# Function: useTravel()

## useTravel(initialState)

> **useTravel**\<`S`, `F`\>(`initialState`): [`Value`\<`S`, `F`\>, (`updater`) => `void`, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `F`\>\>]

Creates a component-scoped Travels instance with undo/redo support and returns its reactive API.

The hook memoises the underlying `Travels` instance per component, wires it to React's lifecycle, and forces
re-renders whenever the managed state changes. Consumers receive a tuple containing the current state, a `setState`
updater that accepts either a mutative draft function or partial state, and the history controls exposed by
Travels.

### Type Parameters

• **S**

Shape of the state managed by the travel store.

• **F** *extends* `boolean`

Whether draft freezing is enabled.

### Parameters

• **initialState**: `S`

Value used to initialise the travel store.

### Returns

[`Value`\<`S`, `F`\>, (`updater`) => `void`, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `F`\>\>]

A tuple with the current state, typed updater, and history controls.

### Throws

When `setState` is invoked multiple times within the same render cycle (development-only guard).

### Defined in

[src/index.ts:67](https://github.com/mutativejs/use-travel/blob/7f7cdf34d8a220ca3456ce5a3b60945c342e356e/src/index.ts#L67)

## useTravel(initialState, options)

> **useTravel**\<`S`, `F`, `A`, `P`\>(`initialState`, `options`): [`Value`\<`S`, `F`\>, (`updater`) => `void`, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `F`, `P`\>\>]

### Type Parameters

• **S**

• **F** *extends* `boolean`

• **A** *extends* `boolean`

• **P** *extends* `object` = `object`

### Parameters

• **initialState**: `S`

• **options**: `Omit`\<`TravelsOptions`\<`F`, `true`, `P`\>, `"mutable"` \| `"autoArchive"`\> & `object`

### Returns

[`Value`\<`S`, `F`\>, (`updater`) => `void`, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `F`, `P`\>\>]

### Defined in

[src/index.ts:74](https://github.com/mutativejs/use-travel/blob/7f7cdf34d8a220ca3456ce5a3b60945c342e356e/src/index.ts#L74)

## useTravel(initialState, options)

> **useTravel**\<`S`, `F`, `A`, `P`\>(`initialState`, `options`): [`Value`\<`S`, `F`\>, (`updater`) => `void`, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableManualTravelsControls`\<`S`, `F`, `P`\>\>]

### Type Parameters

• **S**

• **F** *extends* `boolean`

• **A** *extends* `boolean`

• **P** *extends* `object` = `object`

### Parameters

• **initialState**: `S`

• **options**: `Omit`\<`TravelsOptions`\<`F`, `false`, `P`\>, `"mutable"` \| `"autoArchive"`\> & `object`

### Returns

[`Value`\<`S`, `F`\>, (`updater`) => `void`, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableManualTravelsControls`\<`S`, `F`, `P`\>\>]

### Defined in

[src/index.ts:89](https://github.com/mutativejs/use-travel/blob/7f7cdf34d8a220ca3456ce5a3b60945c342e356e/src/index.ts#L89)
