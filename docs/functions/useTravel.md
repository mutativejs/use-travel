[**use-travel**](../README.md) • **Docs**

***

[use-travel](../globals.md) / useTravel

# Function: useTravel()

## useTravel(initialState)

> **useTravel**\<`S`, `F`\>(`initialState`): [`Value`\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `F`\>\>]

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

[`Value`\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `F`\>\>]

A tuple with the current state, typed updater, and history controls.

### Throws

When `setState` is invoked multiple times within the same render cycle.

### Defined in

[use-travel/src/index.ts:114](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L114)

## useTravel(initialState, options)

> **useTravel**\<`S`, `F`, `P`\>(`initialState`, `options`): [`Value`\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `F`, `P`\>\>]

### Type Parameters

• **S**

• **F** *extends* `boolean`

• **P** *extends* `object` = `object`

### Parameters

• **initialState**: `S`

• **options**: `Omit`\<[`UseTravelOptions`](../type-aliases/UseTravelOptions.md)\<`F`, `true`, `P`\>, `"autoArchive"`\> & `object`

### Returns

[`Value`\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableTravelsControls`\<`S`, `F`, `P`\>\>]

### Defined in

[use-travel/src/index.ts:121](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L121)

## useTravel(initialState, options)

> **useTravel**\<`S`, `F`, `P`\>(`initialState`, `options`): [`Value`\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableManualTravelsControls`\<`S`, `F`, `P`\>\>]

### Type Parameters

• **S**

• **F** *extends* `boolean`

• **P** *extends* `object` = `object`

### Parameters

• **initialState**: `S`

• **options**: `Omit`\<[`UseTravelOptions`](../type-aliases/UseTravelOptions.md)\<`F`, `false`, `P`\>, `"autoArchive"`\> & `object`

### Returns

[`Value`\<`S`, `F`\>, [`UseTravelSetState`](../type-aliases/UseTravelSetState.md)\<`S`\>, [`WithUndoRedoFlags`](../type-aliases/WithUndoRedoFlags.md)\<`RebasableManualTravelsControls`\<`S`, `F`, `P`\>\>]

### Defined in

[use-travel/src/index.ts:131](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L131)

## useTravel(initialState, options)

> **useTravel**\<`S`, `F`, `A`, `P`\>(`initialState`, `options`): [`UseTravelResult`](../type-aliases/UseTravelResult.md)\<`S`, `F`, `A`, `P`\>

### Type Parameters

• **S**

• **F** *extends* `boolean`

• **A** *extends* `boolean`

• **P** *extends* `object` = `object`

### Parameters

• **initialState**: `S`

• **options**: [`UseTravelOptions`](../type-aliases/UseTravelOptions.md)\<`F`, `A`, `P`\>

### Returns

[`UseTravelResult`](../type-aliases/UseTravelResult.md)\<`S`, `F`, `A`, `P`\>

### Defined in

[use-travel/src/index.ts:141](https://github.com/mutativejs/use-travel/blob/main/src/index.ts#L141)
