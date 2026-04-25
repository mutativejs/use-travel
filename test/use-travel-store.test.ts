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
