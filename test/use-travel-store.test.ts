import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { Travels } from 'travels';
import { useTravelStore } from '../src/index';

describe('useTravelStore', () => {
  it('throws when used with a mutable Travels instance', () => {
    const travels = new Travels({ count: 0 }, { mutable: true });

    expect(() =>
      renderHook(() => useTravelStore(travels))
    ).toThrowError(
      /useTravelStore only supports immutable Travels instances/
    );
  });

  it('syncs state and controls with an immutable Travels instance', () => {
    const travels = new Travels({ count: 0 });

    const { result } = renderHook(() => useTravelStore(travels));

    let [state, setState, controls] = result.current;
    expect(state).toEqual({ count: 0 });
    expect(typeof setState).toBe('function');
    expect(controls.getHistory()).toEqual(travels.getHistory());

    act(() =>
      setState((draft) => {
        draft.count = 1;
      })
    );
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 1 });
    expect(travels.getState()).toEqual({ count: 1 });
    expect(controls.getHistory()).toEqual(travels.getHistory());

    act(() =>
      travels.setState((draft) => {
        draft.count = 42;
      })
    );
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 42 });
    expect(controls.getHistory()).toEqual(travels.getHistory());
  });

  it('exposes reactive canUndo/canRedo getters while keeping controls stable', () => {
    const travels = new Travels({ count: 0 });

    const { result } = renderHook(() => useTravelStore(travels));

    const [, setState, controlsBefore] = result.current;
    expect(controlsBefore.canUndo).toBe(false);
    expect(controlsBefore.canRedo).toBe(false);

    act(() =>
      setState((draft) => {
        draft.count = 1;
      })
    );

    const [, , controlsAfter] = result.current;

    expect(controlsAfter).toBe(controlsBefore);
    expect(controlsAfter.canUndo).toBe(true);
    expect(controlsAfter.canRedo).toBe(false);
    expect(controlsAfter.canBack()).toBe(true);

    act(() => controlsAfter.back());
    const [, , controlsAfterUndo] = result.current;

    expect(controlsAfterUndo.canUndo).toBe(false);
    expect(controlsAfterUndo.canRedo).toBe(true);
  });

  it('keeps existing controls members own-enumerable (Object.keys / spread)', () => {
    const travels = new Travels({ count: 0 });

    const { result } = renderHook(() => useTravelStore(travels));
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
    expect(copy.canUndo).toBe(false);
  });

  it('exposes manual archive controls when autoArchive is disabled', () => {
    const travels = new Travels(
      { todos: [] as string[] },
      { autoArchive: false as const }
    );

    const { result } = renderHook(() => useTravelStore(travels));

    let [state, setState, controls] = result.current;
    expect(typeof controls.archive).toBe('function');
    expect(typeof controls.canArchive).toBe('function');
    expect(controls.canArchive()).toBe(false);

    act(() =>
      setState((draft) => {
        draft.todos.push('todo 1');
      })
    );
    [state, setState, controls] = result.current;

    expect(state.todos).toEqual(['todo 1']);
    expect(controls.canArchive()).toBe(true);

    act(() => controls.archive());
    [state, setState, controls] = result.current;

    expect(controls.canArchive()).toBe(false);
    expect(controls.getHistory()).toEqual(travels.getHistory());
  });
});
