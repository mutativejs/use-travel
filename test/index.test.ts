import { act, renderHook } from '@testing-library/react';
import { useTravel } from '../src/index';

describe('useTravel', () => {
  it('[useTravel] with normal init state', () => {
    const { result } = renderHook(() =>
      useTravel({ todos: [] } as { todos: { name: string }[] })
    );
    let [nextState, setState, controls] = result.current;
    expect(nextState).toEqual({ todos: [] });
    act(() =>
      setState((draft) => {
        draft.todos.push({
          name: 'todo 1',
        });
        draft.todos.push({
          name: 'todo 2',
        });
      })
    );
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual({
      todos: [
        {
          name: 'todo 1',
        },
        {
          name: 'todo 2',
        },
      ],
    });

    act(() =>
      setState((draft) => {
        draft.todos.push({
          name: 'todo 3',
        });
      })
    );
    [nextState, setState, controls] = result.current;

    act(() => controls.back());
    [nextState, setState, controls] = result.current;

    expect(nextState).toEqual({
      todos: [
        {
          name: 'todo 1',
        },
        {
          name: 'todo 2',
        },
      ],
    });

    act(() => controls.forward());
    [nextState, setState, controls] = result.current;

    expect(nextState).toEqual({
      todos: [
        {
          name: 'todo 1',
        },
        {
          name: 'todo 2',
        },
        {
          name: 'todo 3',
        },
      ],
    });

    act(() => controls.go(0));
    [nextState, setState, controls] = result.current;

    expect(nextState).toEqual({
      todos: [],
    });

    act(() => controls.go(1));
    [nextState, setState, controls] = result.current;

    expect(nextState).toEqual({
      todos: [
        {
          name: 'todo 1',
        },
        {
          name: 'todo 2',
        },
      ],
    });

    expect(controls.getHistory()).toEqual([
      {
        todos: [],
      },
      {
        todos: [
          {
            name: 'todo 1',
          },
          {
            name: 'todo 2',
          },
        ],
      },
      {
        todos: [
          {
            name: 'todo 1',
          },
          {
            name: 'todo 2',
          },
          {
            name: 'todo 3',
          },
        ],
      },
    ]);

    act(() =>
      setState((draft) => {
        draft.todos.push({
          name: 'todo 4',
        });
      })
    );
    [nextState, setState, controls] = result.current;

    act(() =>
    setState((draft) => {
      draft.todos.push({
        name: 'todo 5',
      });
    })
  );
  [nextState, setState, controls] = result.current;

    expect(nextState).toEqual({
      todos: [
        {
          name: 'todo 1',
        },
        {
          name: 'todo 2',
        },
        {
          name: 'todo 4',
        },
        {
          name: 'todo 5',
        },
      ],
    });
    console.log(controls.patches.patches.length, 'CCCC');
    expect(controls.getHistory()).toEqual([
      {
        todos: [],
      },
      {
        todos: [
          {
            name: 'todo 1',
          },
          {
            name: 'todo 2',
          },
        ],
      },
      {
        todos: [
          {
            name: 'todo 1',
          },
          {
            name: 'todo 2',
          },
          {
            name: 'todo 4',
          },
        ],
      },
      {
        todos: [
          {
            name: 'todo 1',
          },
          {
            name: 'todo 2',
          },
          {
            name: 'todo 4',
          },
          {
            name: 'todo 5',
          },
        ],
      },
    ]);

    act(() => controls.reset());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual({ todos: [] });
  });

  it('[useTravel] with normal init state', () => {
    const { result } = renderHook(() =>
      useTravel({ todos: [] } as { todos: { name: string }[] })
    );
    let [nextState, setState, controls] = result.current;
    expect(nextState).toEqual({ todos: [] });
    act(() =>
      setState((draft) => {
        draft.todos.push({
          name: 'todo 1',
        });
        draft.todos.push({
          name: 'todo 2',
        });
      })
    );
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual({
      todos: [
        {
          name: 'todo 1',
        },
        {
          name: 'todo 2',
        },
      ],
    });

    act(() =>
      setState((draft) => {
        draft.todos.push({
          name: 'todo 3',
        });
      })
    );
    [nextState, setState, controls] = result.current;
    act(() =>
      setState((draft) => {
        draft.todos.push({
          name: 'todo 4',
        });
      })
    );
    [nextState, setState, controls] = result.current;

    act(() => controls.go(0));
    [nextState, setState, controls] = result.current;

    expect(controls.position).toBe(0);
    expect(controls.patches.patches.length).toBe(3);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(true);

    act(() => controls.go(3));
    [nextState, setState, controls] = result.current;

    expect(controls.position).toBe(3);
    expect(controls.patches.patches.length).toBe(3);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    act(() => controls.go(1));
    [nextState, setState, controls] = result.current;

    expect(controls.position).toBe(1);
    expect(controls.patches.patches.length).toBe(3);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);

    expect(nextState).toEqual({
      todos: [
        {
          name: 'todo 1',
        },
        {
          name: 'todo 2',
        },
      ],
    });

    act(() =>
      setState((draft) => {
        draft.todos.push({
          name: 'todo 5',
        });
      })
    );
    [nextState, setState, controls] = result.current;

    act(() => controls.go(2));
    [nextState, setState, controls] = result.current;

    expect(controls.position).toBe(2);
    expect(controls.patches.patches.length).toBe(2);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    expect(nextState).toEqual({
      todos: [
        {
          name: 'todo 1',
        },
        {
          name: 'todo 2',
        },
        { name: 'todo 5' },
      ],
    });

    const fnWarning = jest.spyOn(console, 'warn');
    act(() => controls.go(3));
    [nextState, setState, controls] = result.current;
    expect(fnWarning).toHaveBeenCalledWith(`Can't go forward to position 3`);
    expect(nextState).toEqual({
      todos: [
        {
          name: 'todo 1',
        },
        {
          name: 'todo 2',
        },
        { name: 'todo 5' },
      ],
    });

    act(() => controls.go(0));
    [nextState, setState, controls] = result.current;

    act(() => controls.back());
    [nextState, setState, controls] = result.current;

    expect(controls.position).toBe(0);
    expect(controls.patches.patches.length).toBe(2);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(true);

    expect(nextState).toEqual({
      todos: [],
    });

    expect(fnWarning).toHaveBeenCalledWith(`Can't go back to position -1`);
  });
});
