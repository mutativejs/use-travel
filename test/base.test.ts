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
      { count: 3 }
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
    expect(controls.getHistory()).toEqual([
      { count: 0 },
      { count: 3 },
    ]);


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
      { count: 6 }
    ]);
    expect(controls.canArchive()).toBe(true);
    act(() => controls.archive());

    [state, setState, controls] = result.current;
    expect(state).toEqual({ count: 6 });
    expect(controls.position).toBe(2);
    expect(controls.getHistory()).toEqual([
      { count: 0 },
      { count: 3 },
      { count: 6 }
    ]);
    expect(controls.canArchive()).toBe(false);
  });

  it('[useTravel]: setState calls after navigation truncate newly added patches incorrectly', () => {
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
      { count: 3 }
    ]);

    // Go back to middle position
    act(() => controls.go(1));
    [state, setState, controls] = result.current;
    expect(state).toEqual({ count: 1 });
    expect(controls.position).toBe(1);

    expect(() => {
      act(() => {
        setState({ count: 10 });
        setState({ count: 20 });
      });
    }).toThrow('setState cannot be called multiple times.');
  });

  it('[useTravel]: Multiple rapid setState calls should each increment position correctly', () => {
    const { result } = renderHook(() =>
      useTravel(0, { autoArchive: true })
    );

    let [state, setState, controls] = result.current;

    expect(() => {
      act(() => {
        setState(1);
        setState(2);
      });
    }).toThrow('setState cannot be called multiple times.');
  });
});
