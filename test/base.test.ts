import { expect, describe, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTravel } from '../src/index';

describe('useTravel', () => {
  it('[useTravel] base state updates with autoArchive=true should advance position for each setState call', () => {
    const { result } = renderHook(() =>
      useTravel({ count: 0 }, { autoArchive: true })
    );

    let [state, setState, controls] = result.current;

    // Initial state
    expect(state).toEqual({ count: 0 });
    expect(controls.position).toBe(0);
    expect(controls.getHistory()).toEqual([{ count: 0 }]);

    act(() => {
      setState((draft) => {
        draft.count += 1;
      });
    });

    [state, setState, controls] = result.current;

    act(() => {
      setState((draft) => {
        draft.count += 1;
      });
    });

    [state, setState, controls] = result.current;

    act(() => {
      setState((draft) => {
        draft.count += 1;
      });
    });

    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 3 });
    expect(controls.position).toBe(3);

    expect(controls.getHistory()).toEqual([
      { count: 0 },
      { count: 1 },
      { count: 2 },
      { count: 3 },
    ]);
  });

  it('[useTravel]: base state updates with autoArchive=false should advance position for each setState call', () => {
    const { result } = renderHook(() =>
      useTravel({ count: 0 }, { autoArchive: false })
    );

    let [state, setState, controls] = result.current;

    // Initial state
    expect(state).toEqual({ count: 0 });
    expect(controls.position).toBe(0);
    expect(controls.getHistory()).toEqual([{ count: 0 }]);

    // Simulate batched setState calls in same event handler
    act(() => {
      setState({ count: 1 });
    });

    [state, setState, controls] = result.current;

    act(() => {
      setState({ count: 2 });
    });

    [state, setState, controls] = result.current;

    act(() => {
      setState({ count: 3 });
    });

    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 3 });

    expect(controls.position).toBe(1);

    // Archive the final state
    act(() => {
      controls.archive();
    });
    [state, setState, controls] = result.current;

    expect(controls.position).toBe(1);
    expect(controls.getHistory()).toEqual([{ count: 0 }, { count: 3 }]);

    act(() => {
      setState((draft) => {
        draft.count += 1;
      });
    });

    [state, setState, controls] = result.current;

    act(() => {
      setState((draft) => {
        draft.count += 1;
      });
    });

    [state, setState, controls] = result.current;

    act(() => {
      setState((draft) => {
        draft.count += 1;
      });
    });

    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 6 });
    expect(controls.position).toBe(2);
    expect(controls.getHistory()).toEqual([
      { count: 0 },
      { count: 3 },
      { count: 6 },
    ]);
    expect(controls.canArchive()).toBe(true);
    act(() => controls.archive());

    [state, setState, controls] = result.current;
    expect(state).toEqual({ count: 6 });
    expect(controls.position).toBe(2);
    expect(controls.getHistory()).toEqual([
      { count: 0 },
      { count: 3 },
      { count: 6 },
    ]);
    expect(controls.canArchive()).toBe(false);
  });

  it('[useTravel]: manual archive metadata is forwarded to Travels events', () => {
    const devtools = vi.fn();
    const { result } = renderHook(() =>
      useTravel(
        { count: 0 },
        {
          autoArchive: false,
          devtools,
        }
      )
    );

    act(() => {
      result.current[1]((draft) => {
        draft.count = 1;
      });
    });

    act(() => {
      result.current[2].archive({
        label: 'checkpoint',
        source: 'toolbar',
      });
    });

    expect(devtools).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: 'archive',
        state: { count: 1 },
        position: 1,
        historyLength: 1,
        metadata: { label: 'checkpoint', source: 'toolbar' },
      })
    );
  });

  it('[useTravel]: navigation archives pending changes in one go event', () => {
    const devtools = vi.fn();
    const { result } = renderHook(() =>
      useTravel({ count: 0 }, { autoArchive: false, devtools })
    );

    act(() => result.current[1]({ count: 1 }));
    devtools.mockClear();

    act(() => result.current[2].back());

    expect(devtools.mock.calls.map(([event]) => event.type)).toEqual(['go']);
    expect(result.current[0]).toEqual({ count: 0 });
    expect(result.current[2].getHistory()).toEqual([
      { count: 0 },
      { count: 1 },
    ]);
    expect(result.current[2].canArchive()).toBe(false);
  });

  it('[useTravel]: sequential updates after navigation replace redo history', () => {
    const { result } = renderHook(() =>
      useTravel({ count: 0 }, { autoArchive: true })
    );

    let [state, setState, controls] = result.current;

    // Build some history first
    act(() => setState({ count: 1 }));
    [state, setState, controls] = result.current;
    act(() => setState({ count: 2 }));
    [state, setState, controls] = result.current;
    act(() => setState({ count: 3 }));

    [state, setState, controls] = result.current;
    expect(controls.position).toBe(3);
    expect(controls.getHistory()).toEqual([
      { count: 0 },
      { count: 1 },
      { count: 2 },
      { count: 3 },
    ]);

    // Go back to middle position
    act(() => controls.go(1));
    [state, setState, controls] = result.current;
    expect(state).toEqual({ count: 1 });
    expect(controls.position).toBe(1);

    act(() => {
      setState({ count: 10 });
      setState({ count: 20 });
    });

    [state, , controls] = result.current;
    expect(state).toEqual({ count: 20 });
    expect(controls.position).toBe(3);
    expect(controls.getHistory()).toEqual([
      { count: 0 },
      { count: 1 },
      { count: 10 },
      { count: 20 },
    ]);
  });

  it('[useTravel]: rapid setState calls each increment the position', () => {
    const { result } = renderHook(() => useTravel(0, { autoArchive: true }));

    let [state, setState, controls] = result.current;

    act(() => {
      setState(1);
      setState(2);
    });

    [state, , controls] = result.current;
    expect(state).toBe(2);
    expect(controls.position).toBe(2);
    expect(controls.getHistory()).toEqual([0, 1, 2]);
  });

  it('[useTravel]: no-op and failed updates do not block the next update', () => {
    const { result } = renderHook(() => useTravel({ count: 0 }));

    act(() => result.current[1](() => undefined));
    expect(() =>
      act(() =>
        result.current[1](() => {
          throw new Error('failed update');
        })
      )
    ).toThrow('failed update');

    act(() =>
      result.current[1]((draft) => {
        draft.count += 1;
      })
    );

    expect(result.current[0]).toEqual({ count: 1 });
    expect(result.current[2].getHistory()).toEqual([
      { count: 0 },
      { count: 1 },
    ]);
  });
});
