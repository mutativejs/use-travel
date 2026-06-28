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

    const copy = { ...controls } as typeof controls;
    expect(typeof copy.back).toBe('function');
    expect(typeof copy.canBack).toBe('function');
  });
});
