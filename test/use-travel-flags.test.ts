import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTravel } from '../src/index';

describe('useTravel canUndo / canRedo flags', () => {
  it('exposes reactive canUndo / canRedo getters while keeping the methods', () => {
    const { result } = renderHook(() => useTravel({ count: 0 }));

    let [, setState, controls] = result.current;
    expect(controls.canUndo).toBe(false);
    expect(controls.canRedo).toBe(false);

    act(() =>
      setState((draft) => {
        draft.count = 1;
      })
    );
    [, setState, controls] = result.current;

    expect(controls.canUndo).toBe(true);
    expect(controls.canRedo).toBe(false);

    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    act(() => controls.back());
    [, , controls] = result.current;

    expect(controls.canUndo).toBe(false);
    expect(controls.canRedo).toBe(true);
  });

  it('keeps controls members own-enumerable (Object.keys / spread)', () => {
    const { result } = renderHook(() => useTravel({ count: 0 }));
    const [, , controls] = result.current;

    const keys = Object.keys(controls);
    for (const member of [
      'position',
      'getHistory',
      'getHistorySnapshot',
      'patches',
      'back',
      'forward',
      'reset',
      'go',
      'canBack',
      'canForward',
      'rebase',
    ]) {
      expect(keys).toContain(member);
    }
    expect(keys).toContain('canUndo');
    expect(keys).toContain('canRedo');
    expect(keys).not.toContain('archive');
    expect(keys).not.toContain('canArchive');

    const copy = { ...controls } as typeof controls;
    expect(typeof copy.back).toBe('function');
    expect(typeof copy.canBack).toBe('function');
  });

  it('shares the cached read-only patches view until history changes', () => {
    const { result } = renderHook(() => useTravel({ count: 0 }));
    const patches = result.current[2].patches;

    expect(Object.isFrozen(patches)).toBe(true);
    expect(Object.isFrozen(patches.patches)).toBe(true);
    expect(result.current[2].patches).toBe(patches);

    act(() => result.current[1]({ count: 1 }));

    expect(result.current[2].patches).not.toBe(patches);
    expect(result.current[2].patches.patches).toHaveLength(1);
  });

  it('preserves manual-only archive capabilities', () => {
    const { result } = renderHook(() =>
      useTravel({ count: 0 }, { autoArchive: false })
    );
    const [, , controls] = result.current;

    expect(Object.keys(controls)).toContain('archive');
    expect(Object.keys(controls)).toContain('canArchive');
  });

  it('keeps the controls capability surface immutable', () => {
    const { result } = renderHook(() => useTravel({ count: 0 }));
    const [, , controls] = result.current;
    const controlsWithInjectedArchive = controls as typeof controls & {
      archive?: () => void;
    };

    expect(Object.isFrozen(controls)).toBe(true);
    expect(() => {
      controlsWithInjectedArchive.archive = () => undefined;
    }).toThrow(TypeError);
    expect('archive' in controls).toBe(false);
  });
});
