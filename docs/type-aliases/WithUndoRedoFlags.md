[**use-travel**](../README.md) • **Docs**

***

[use-travel](../globals.md) / WithUndoRedoFlags

# Type Alias: WithUndoRedoFlags\<C\>

> **WithUndoRedoFlags**\<`C`\>: `C` & `object`

Adds reactive `canUndo` / `canRedo` availability flags to a controls type.

## Type declaration

### canRedo

> `readonly` **canRedo**: `boolean`

Whether redo is possible. Render-safe reactive getter — read this during render.

### canUndo

> `readonly` **canUndo**: `boolean`

Whether undo is possible. Render-safe reactive getter — read this during render.

## Type Parameters

• **C**

## Defined in

[src/index.ts:17](https://github.com/mutativejs/use-travel/blob/7f7cdf34d8a220ca3456ce5a3b60945c342e356e/src/index.ts#L17)
