[**use-travel**](../README.md) • **Docs**

***

[use-travel](../globals.md) / useTravel

# Function: useTravel()

## useTravel(initialState)

> **useTravel**\<`S`, `F`\>(`initialState`): [[`UseTravelState`](../type-aliases/UseTravelState.md)\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`\>\>]

Creates a component-scoped Travels instance with undo/redo support and returns its reactive API.

The hook memoises the underlying `Travels` instance per component, wires it to React's lifecycle, and forces
re-renders whenever the managed state changes. Consumers receive a tuple containing the current state, a `setState`
updater that accepts either a complete value or mutative draft function, and the history controls exposed by
Travels.

### Type Parameters

• **S**

Shape of the state managed by the travel store.

• **F** *extends* `boolean` = `false`

Whether draft freezing is enabled.

### Parameters

• **initialState**: `S`

Value used to initialise the travel store.

### Returns

[[`UseTravelState`](../type-aliases/UseTravelState.md)\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`\>\>]

A tuple with the current state, typed updater, and history controls.

### Defined in

[src/index.ts:132](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L132)

## useTravel(initialState, options)

> **useTravel**\<`S`, `F`, `P`\>(`initialState`, `options`): [[`UseTravelState`](../type-aliases/UseTravelState.md)\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `P`\>\>]

### Type Parameters

• **S**

• **F** *extends* `boolean` = `false`

• **P** *extends* `object` = `object`

### Parameters

• **initialState**: `S`

• **options**: `Omit`\<[`UseTravelOptions`](../type-aliases/UseTravelOptions.md)\<`F`, `true`, `P`, `S`\>, `"autoArchive"`\> & `object`

### Returns

[[`UseTravelState`](../type-aliases/UseTravelState.md)\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `P`\>\>]

### Defined in

[src/index.ts:139](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L139)

## useTravel(initialState, options)

> **useTravel**\<`S`, `F`, `P`\>(`initialState`, `options`): [[`UseTravelState`](../type-aliases/UseTravelState.md)\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableManualTravelsControls`\<`S`, `P`\>\>]

### Type Parameters

• **S**

• **F** *extends* `boolean` = `false`

• **P** *extends* `object` = `object`

### Parameters

• **initialState**: `S`

• **options**: `Omit`\<[`UseTravelOptions`](../type-aliases/UseTravelOptions.md)\<`F`, `false`, `P`, `S`\>, `"autoArchive"`\> & `object`

### Returns

[[`UseTravelState`](../type-aliases/UseTravelState.md)\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableManualTravelsControls`\<`S`, `P`\>\>]

### Defined in

[src/index.ts:153](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L153)

## useTravel(initialState, options)

> **useTravel**\<`S`, `F`, `A`, `P`\>(`initialState`, `options`): [`UseTravelResult`](../type-aliases/UseTravelResult.md)\<`S`, `F`, `A`, `P`\>

### Type Parameters

• **S**

• **F** *extends* `boolean` = `false`

• **A** *extends* `boolean` = `true`

• **P** *extends* `object` = `object`

### Parameters

• **initialState**: `S`

• **options**: [`UseTravelOptions`](../type-aliases/UseTravelOptions.md)\<`F`, `A`, `P`, `S`\>

### Returns

[`UseTravelResult`](../type-aliases/UseTravelResult.md)\<`S`, `F`, `A`, `P`\>

### Defined in

[src/index.ts:167](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L167)
