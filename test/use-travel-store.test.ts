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
      { autoArchive: false }
    );

    const { result } = renderHook(() => useTravelStore(travels));

    let [state, setState, controls] = result.current;
    const manualControls = controls as ReturnType<typeof travels.getControls>;
    expect(typeof (manualControls as any).archive).toBe('function');
    expect(typeof (manualControls as any).canArchive).toBe('function');
    expect((manualControls as any).canArchive()).toBe(false);

    act(() =>
      setState((draft) => {
        draft.todos.push('todo 1');
      })
    );
    [state, setState, controls] = result.current;

    const manualControlsAfterUpdate =
      controls as ReturnType<typeof travels.getControls>;

    expect(state.todos).toEqual(['todo 1']);
    expect((manualControlsAfterUpdate as any).canArchive()).toBe(true);

    act(() => (manualControlsAfterUpdate as any).archive());
    [state, setState, controls] = result.current;

    const manualControlsAfterArchive =
      controls as ReturnType<typeof travels.getControls>;

    expect((manualControlsAfterArchive as any).canArchive()).toBe(false);
    expect(manualControlsAfterArchive.getHistory()).toEqual(
      travels.getHistory()
    );
  });
});
