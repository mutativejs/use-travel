[**use-travel**](../README.md) • **Docs**

***

[use-travel](../globals.md) / TravelPatches

# Type Alias: TravelPatches\<P\>

> **TravelPatches**\<`P`\>: `object`

Forward/inverse JSON Patch groups. Retained-history APIs use one group per
entry; observer events use event-local transition groups. Persisted paths use
JSON Pointer strings or dense arrays of strings/non-negative integers.

## Type Parameters

• **P** *extends* `PatchesOption` = `object`

## Type declaration

### inversePatches

> **inversePatches**: `Patches`\<`P`\>[]

### patches

> **patches**: `Patches`\<`P`\>[]

## Defined in

travels/dist/type.d.ts:7
