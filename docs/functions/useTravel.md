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

[src/index.ts:68](https://github.com/mutativejs/use-travel/blob/7f3591d960ca0f9337e4f7807c5bf3d91effcdf0/src/index.ts#L68)

## useTravel(initialState, options)

> **useTravel**\<`S`, `F`, `A`, `P`\>(`initialState`, `options`): [`Value`\<`S`, `F`\>, (`updater`) => `void`, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `F`, `P`\>\>]

### Type Parameters

• **S**

• **F** *extends* `boolean`

• **A** *extends* `boolean`

• **P** *extends* `object` = `object`

### Parameters

• **initialState**: `S`

• **options**: `Omit`\<`TravelsOptions`\<`F`, `true`, `P`\>, `"mutable"` \| `"autoArchive"` \| `"controlledApply"`\> & `object`

### Returns

[`Value`\<`S`, `F`\>, (`updater`) => `void`, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `F`, `P`\>\>]

### Defined in

[src/index.ts:75](https://github.com/mutativejs/use-travel/blob/7f3591d960ca0f9337e4f7807c5bf3d91effcdf0/src/index.ts#L75)

## useTravel(initialState, options)

> **useTravel**\<`S`, `F`, `A`, `P`\>(`initialState`, `options`): [`Value`\<`S`, `F`\>, (`updater`) => `void`, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableManualTravelsControls`\<`S`, `F`, `P`\>\>]

### Type Parameters

• **S**

• **F** *extends* `boolean`

• **A** *extends* `boolean`

• **P** *extends* `object` = `object`

### Parameters

• **initialState**: `S`

• **options**: `Omit`\<`TravelsOptions`\<`F`, `false`, `P`\>, `"mutable"` \| `"autoArchive"` \| `"controlledApply"`\> & `object`

### Returns

[`Value`\<`S`, `F`\>, (`updater`) => `void`, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableManualTravelsControls`\<`S`, `F`, `P`\>\>]

### Defined in

[src/index.ts:93](https://github.com/mutativejs/use-travel/blob/7f3591d960ca0f9337e4f7807c5bf3d91effcdf0/src/index.ts#L93)
