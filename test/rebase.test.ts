import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { Travels } from 'travels';
import { useTravel, useTravelStore } from '../src/index';

describe('rebase support', () => {
  it('useTravel exposes rebase and makes the current state the new reset baseline', () => {
    const { result } = renderHook(() =>
      useTravel({ count: 0, label: 'initial' })
    );

    let [state, setState, controls] = result.current;

    act(() =>
      setState((draft) => {
        draft.count = 1;
      })
    );
    [state, setState, controls] = result.current;

    act(() =>
      setState((draft) => {
        draft.count = 2;
      })
    );
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 2, label: 'initial' });
    expect(controls.position).toBe(2);
    expect(controls.getHistory()).toEqual([
      { count: 0, label: 'initial' },
      { count: 1, label: 'initial' },
      { count: 2, label: 'initial' },
    ]);

    act(() => controls.rebase());
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 2, label: 'initial' });
    expect(controls.position).toBe(0);
    expect(controls.getHistory()).toEqual([{ count: 2, label: 'initial' }]);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(false);

    act(() =>
      setState((draft) => {
        draft.count = 9;
      })
    );
    [state, setState, controls] = result.current;

    expect(state.count).toBe(9);

    act(() => controls.reset());
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 2, label: 'initial' });
    expect(controls.position).toBe(0);
  });

  it('useTravel rebase clears unarchived manual changes and resets archive state', () => {
    const { result } = renderHook(() =>
      useTravel({ count: 0 }, { autoArchive: false })
    );

    let [state, setState, controls] = result.current;

    act(() =>
      setState((draft) => {
        draft.count = 1;
      })
    );
    [state, setState, controls] = result.current;

    act(() =>
      setState((draft) => {
        draft.count = 2;
      })
    );
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 2 });
    expect(controls.canArchive()).toBe(true);

    act(() => controls.rebase());
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 2 });
    expect(controls.position).toBe(0);
    expect(controls.getHistory()).toEqual([{ count: 2 }]);
    expect(controls.canArchive()).toBe(false);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(false);

    act(() =>
      setState((draft) => {
        draft.count = 5;
      })
    );
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 5 });
    expect(controls.canArchive()).toBe(true);

    act(() => controls.reset());
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 2 });
    expect(controls.position).toBe(0);
    expect(controls.canArchive()).toBe(false);
  });

  it('useTravelStore exposes rebase and keeps React in sync after rebasing a shared store', () => {
    const travels = new Travels({ count: 0 });
    const { result } = renderHook(() => useTravelStore(travels));

    let [state, setState, controls] = result.current;

    act(() =>
      setState((draft) => {
        draft.count = 1;
      })
    );
    [state, setState, controls] = result.current;

    act(() =>
      setState((draft) => {
        draft.count = 2;
      })
    );
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 2 });
    expect(controls.position).toBe(2);

    act(() => controls.rebase());
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 2 });
    expect(controls.position).toBe(0);
    expect(controls.getHistory()).toEqual([{ count: 2 }]);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(false);

    act(() =>
      travels.setState((draft) => {
        draft.count = 7;
      })
    );
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 7 });

    act(() => controls.reset());
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 2 });
    expect(controls.position).toBe(0);
  });
});
