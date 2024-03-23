import { act, renderHook } from '@testing-library/react';
import { useTravel } from '../src/index';

describe('useTravel', () => {
  it('[useTravel] with normal init state', () => {
    const { result } = renderHook(() =>
      useTravel({ todos: [] } as { todos: { name: string }[] })
    );
    let [nextState, setState, controls] = result.current;
    expect(nextState).toEqual({ todos: [] });
    expect(controls.getHistory()).toEqual([{ todos: [] }]);

    act(() =>
      setState({
        todos: [
          {
            name: 'todo 1',
          },
          {
            name: 'todo 2',
          },
        ],
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
    expect(controls.getHistory()).toEqual([
      { todos: [] },
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
    ]);

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

    act(() => controls.go(1));
    [nextState, setState, controls] = result.current;

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
    expect(controls.getHistory()).toEqual([{ todos: [] }]);
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

    //@ts-expect-error
    act(() => controls.archive());
    [nextState, setState, controls] = result.current;
    expect(fnWarning).toHaveBeenCalledWith(`Auto archive is enabled, no need to archive manually`);
  });

  it('[useTravel] with normal init state and disable autoArchive', () => {
    const { result } = renderHook(() =>
      useTravel({ todos: [] } as { todos: { name: string }[] }, {
        autoArchive: false,
      })
    );
    let [nextState, setState, controls] = result.current;
    expect(nextState).toEqual({ todos: [] });
    expect(controls.getHistory()).toEqual([{ todos: [] }]);

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
    expect(controls.patches.patches.length).toBe(0);
    expect(controls.position).toBe(1);
    expect(controls.getHistory()).toEqual([
      { todos: [] },
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
    ]);

    act(() =>
      setState((draft) => {
        draft.todos.push({
          name: 'todo 3',
        });
      })
    );
    [nextState, setState, controls] = result.current;

    expect(controls.patches.patches.length).toBe(0);
    expect(controls.position).toBe(1);
    expect(controls.getHistory()).toEqual([
      { todos: [] },
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

    act(() => controls.archive());
    [nextState, setState, controls] = result.current;

    expect(controls.getHistory()).toEqual([
      { todos: [] },
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

    act(() => controls.back());
    [nextState, setState, controls] = result.current;

    expect(nextState).toEqual({
      todos: [],
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
        {
          name: 'todo 3',
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
          {
            name: 'todo 3',
          },
        ],
      },
    ]);
    expect(controls.position).toBe(1);

    act(() =>
      setState((draft) => {
        draft.todos.push({
          name: 'todo 4',
        });
      })
    );
    [nextState, setState, controls] = result.current;
    expect(controls.position).toBe(2);
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
        {
          name: 'todo 4',
        },
      ],
    });

    // act(() => controls.archive());
    // [nextState, setState, controls] = result.current;
    act(() => controls.back());
    [nextState, setState, controls] = result.current;
    expect(controls.position).toBe(1);

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
          {
            name: 'todo 3',
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
          {
            name: 'todo 4',
          },
        ],
      },
    ]);

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
        {
          name: 'todo 4',
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
          {
            name: 'todo 3',
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
          {
            name: 'todo 4',
          },
        ],
      },
    ]);

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
        {
          name: 'todo 3',
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
          {
            name: 'todo 3',
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
          {
            name: 'todo 4',
          },
        ],
      },
    ]);

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
          name: 'todo 3',
        },
        {
          name: 'todo 5',
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
          {
            name: 'todo 3',
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
          {
            name: 'todo 5',
          },
        ],
      },
    ]);

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
        {
          name: 'todo 3',
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
          {
            name: 'todo 3',
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
          {
            name: 'todo 5',
          },
        ],
      },
    ]);

    act(() => controls.reset());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual({ todos: [] });
    expect(controls.getHistory()).toEqual([{ todos: [] }]);
  });

  it('[useTravel] maxHistory', () => {
    const { result } = renderHook(() =>
      useTravel(0, {
        maxHistory: 3,
      })
    );
    let [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(0);
    expect(controls.position).toEqual(0);
    expect(controls.getHistory()).toEqual([0]);

    act(() => setState(() => 1));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(1);
    expect(controls.position).toEqual(1);
    expect(controls.getHistory()).toEqual([0, 1]);

    act(() => setState(2));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(2);
    expect(controls.position).toEqual(2);
    expect(controls.getHistory()).toEqual([0, 1, 2]);

    act(() => setState(3));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(3);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([0, 1, 2, 3]);

    act(() => setState(4));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(4);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([1, 2, 3, 4]);

    act(() => setState(5));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(5);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    act(() => controls.back());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(4);
    expect(controls.position).toEqual(2);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);

    act(() => controls.back());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(3);
    expect(controls.position).toEqual(1);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);

    act(() => controls.back());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(2);
    expect(controls.position).toEqual(0);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(true);

    act(() => controls.back());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(2);
    expect(controls.position).toEqual(0);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(true);

    act(() => controls.forward());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(3);
    expect(controls.position).toEqual(1);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);

    act(() => controls.forward());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(4);
    expect(controls.position).toEqual(2);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);

    act(() => controls.forward());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(5);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    act(() => controls.forward());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(5);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
  });

  it('[useTravel] maxHistory with autoArchive: false', () => {
    let { result } = renderHook(() =>
      useTravel(0, {
        maxHistory: 3,
        autoArchive: false,
      })
    );
    let [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(0);
    expect(controls.position).toEqual(0);
    expect(controls.getHistory()).toEqual([0]);

    act(() => setState(() => 1));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(1);
    expect(controls.position).toEqual(1);
    expect(controls.getHistory()).toEqual([0, 1]);

    act(() => controls.archive());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(1);
    expect(controls.position).toEqual(1);
    expect(controls.getHistory()).toEqual([0, 1]);

    act(() => setState(2));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(2);
    expect(controls.position).toEqual(2);
    expect(controls.getHistory()).toEqual([0, 1, 2]);


    act(() => controls.archive());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(2);
    expect(controls.position).toEqual(2);
    expect(controls.getHistory()).toEqual([0, 1, 2]);

    act(() => setState(3));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(3);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([0, 1, 2, 3]);


    act(() => controls.archive());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(3);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([0, 1, 2, 3]);

    act(() => setState(4));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(4);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([1, 2, 3, 4]);

    act(() => controls.archive());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(4);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([1, 2, 3, 4]);

    act(() => setState(5));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(5);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    act(() => controls.archive());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(5);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    act(() => controls.archive());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(5);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    act(() => setState(6));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(6);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    act(() => controls.archive());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(6);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    (global as any).x = true;
    act(() => controls.back());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(5);
    expect(controls.position).toEqual(2);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);
    // return;

    act(() => controls.back());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(4);
    expect(controls.position).toEqual(1);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);

    act(() => controls.back());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(3);
    expect(controls.position).toEqual(0);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(true);

    act(() => controls.back());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(3);
    expect(controls.position).toEqual(0);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(true);

    act(() => controls.forward());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(4);
    expect(controls.position).toEqual(1);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);

    act(() => controls.forward());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(5);
    expect(controls.position).toEqual(2);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);

    act(() => controls.forward());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(6);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    act(() => controls.forward());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(6);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    act(() => controls.back());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(5);
    expect(controls.position).toEqual(2);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);

    result = renderHook(() =>
      useTravel(nextState, {
        maxHistory: 3,
        autoArchive: false,
        initialPatches: controls.patches,
        initialPosition: controls.position,
      })
    ).result;
    [nextState, setState, controls] = result.current;

    act(() => controls.back());
    [nextState, setState, controls] = result.current;

    expect(nextState).toEqual(4);
    expect(controls.position).toEqual(1);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);

    act(() => controls.reset());
    [nextState, setState, controls] = result.current;

    expect(nextState).toEqual(5);
    expect(controls.position).toEqual(2);
    expect(controls.getHistory()).toEqual([3, 4, 5, 6]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(true);
  });
});
