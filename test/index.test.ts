import { expect, describe, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import * as travelsApi from 'travels';
import type {
  Travels,
  TravelsOptions,
  TravelsSerializedHistory,
} from 'travels';
import { useTravel, useTravelStore } from '../src/index';

const restoreSnapshot = (
  'restoreTravels' in travelsApi
    ? travelsApi.restoreTravels
    : (snapshot, options) =>
        travelsApi.createTravels(snapshot.state, {
          ...options,
          history: snapshot,
        } as never)
) as <S, A extends boolean>(
  snapshot: TravelsSerializedHistory<S>,
  options: TravelsOptions<false, A>
) => Travels<S, false, A>;

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
    const warningCodes: string[] = [];
    const { result } = renderHook(() =>
      useTravel({ todos: [] } as { todos: { name: string }[] }, {
        onWarning: ({ code }) => warningCodes.push(code),
      })
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

    act(() => controls.go(3));
    [nextState, setState, controls] = result.current;
    expect(warningCodes).toEqual(['POSITION_CLAMPED']);
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

    expect(warningCodes).toEqual(['POSITION_CLAMPED', 'POSITION_CLAMPED']);

    //@ts-expect-error
    act(() => controls.archive());
    [nextState, setState, controls] = result.current;
    expect(warningCodes).toEqual([
      'POSITION_CLAMPED',
      'POSITION_CLAMPED',
      'AUTO_ARCHIVE_ENABLED',
    ]);
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
    expect(controls.patches.patches.length).toBe(1);
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

    expect(controls.patches.patches.length).toBe(1);
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

    expect(controls.patches).toMatchInlineSnapshot(`
      {
        "inversePatches": [
          [
            {
              "op": "replace",
              "path": [],
              "value": 3,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 4,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 5,
            },
          ],
        ],
        "patches": [
          [
            {
              "op": "replace",
              "path": [],
              "value": 4,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 5,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 6,
            },
          ],
        ],
      }
    `);

    const restored = restoreSnapshot(
      {
        version: 1,
        state: nextState,
        patches: controls.patches,
        position: controls.position,
      },
      { maxHistory: 3, autoArchive: false }
    );
    result = renderHook(() => useTravelStore(restored)).result;
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
    expect(controls.patches).toMatchInlineSnapshot(`
      {
        "inversePatches": [
          [
            {
              "op": "replace",
              "path": [],
              "value": 3,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 4,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 5,
            },
          ],
        ],
        "patches": [
          [
            {
              "op": "replace",
              "path": [],
              "value": 4,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 5,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 6,
            },
          ],
        ],
      }
    `);

    act(() => setState(() => 7));
    [nextState, setState, controls] = result.current;

    expect(nextState).toEqual(7);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([3, 4, 5, 7]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.patches).toMatchInlineSnapshot(`
      {
        "inversePatches": [
          [
            {
              "op": "replace",
              "path": [],
              "value": 3,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 4,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 5,
            },
          ],
        ],
        "patches": [
          [
            {
              "op": "replace",
              "path": [],
              "value": 4,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 5,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 7,
            },
          ],
        ],
      }
    `);

    act(() => setState(() => 8));
    [nextState, setState, controls] = result.current;

    expect(nextState).toEqual(8);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([3, 4, 5, 8]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.patches).toMatchInlineSnapshot(`
      {
        "inversePatches": [
          [
            {
              "op": "replace",
              "path": [],
              "value": 3,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 4,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 5,
            },
          ],
        ],
        "patches": [
          [
            {
              "op": "replace",
              "path": [],
              "value": 4,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 5,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 8,
            },
          ],
        ],
      }
    `);

    act(() => controls.archive());
    [nextState, setState, controls] = result.current;

    expect(nextState).toEqual(8);
    expect(controls.position).toEqual(3);
    expect(controls.getHistory()).toEqual([3, 4, 5, 8]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.patches).toMatchInlineSnapshot(`
      {
        "inversePatches": [
          [
            {
              "op": "replace",
              "path": [],
              "value": 3,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 4,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 5,
            },
          ],
        ],
        "patches": [
          [
            {
              "op": "replace",
              "path": [],
              "value": 4,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 5,
            },
          ],
          [
            {
              "op": "replace",
              "path": [],
              "value": 8,
            },
          ],
        ],
      }
    `);
  });

  it('[useTravel] - back() with autoArchive: false', () => {
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

    act(() => setState(() => 2));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(2);
    expect(controls.position).toEqual(1);
    expect(controls.getHistory()).toEqual([0, 2]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(true);

    act(() => controls.back());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(0);
    expect(controls.position).toEqual(0);
    expect(controls.getHistory()).toEqual([0, 2]);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(true);
    expect(controls.canArchive()).toBe(false);
  });

  it('[useTravel] - back() with autoArchive: false', () => {
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

    act(() => setState(() => 2));
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(2);
    expect(controls.position).toEqual(1);
    expect(controls.getHistory()).toEqual([0, 2]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(true);

    act(() => controls.archive());
    [nextState, setState, controls] = result.current;
    expect(nextState).toEqual(2);
    expect(controls.position).toEqual(1);
    expect(controls.getHistory()).toEqual([0, 2]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(false);
  });

  it('[useTravel] basic test with autoArchive: false', () => {
    const { result } = renderHook(() =>
      useTravel(0, {
        maxHistory: 10,
        autoArchive: false,
      })
    );

    let [state, setState, controls] = result.current;

    // initial state
    expect(state).toBe(0);
    expect(controls.position).toBe(0);
    expect(controls.getHistory()).toEqual([0]);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(false);

    // simulate the first click of Increment button
    act(() => {
      setState(state + 1); // 0 + 1 = 1
      controls.archive();
    });
    [state, setState, controls] = result.current;

    expect(state).toBe(1);
    expect(controls.position).toBe(1);
    expect(controls.getHistory()).toEqual([0, 1]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(false);

    // simulate the second click of Increment button
    act(() => {
      setState(state + 1); // 1 + 1 = 2
      controls.archive();
    });
    [state, setState, controls] = result.current;

    expect(state).toBe(2);
    expect(controls.position).toBe(2);
    expect(controls.getHistory()).toEqual([0, 1, 2]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    // simulate the click of Decrement button
    act(() => {
      setState(state - 1); // 2 - 1 = 1
      controls.archive();
    });
    [state, setState, controls] = result.current;

    expect(state).toBe(1);
    expect(controls.position).toBe(3);
    expect(controls.getHistory()).toEqual([0, 1, 2, 1]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    // test the back function
    act(() => controls.back());
    [state, setState, controls] = result.current;

    expect(state).toBe(2);
    expect(controls.position).toBe(2);
    expect(controls.getHistory()).toEqual([0, 1, 2, 1]);

    // test the again back function
    act(() => controls.back());
    [state, setState, controls] = result.current;

    expect(state).toBe(1);
    expect(controls.position).toBe(1);
    expect(controls.getHistory()).toEqual([0, 1, 2, 1]);

    // test the forward function
    act(() => controls.forward());
    [state, setState, controls] = result.current;

    expect(state).toBe(2);
    expect(controls.position).toBe(2);
    expect(controls.getHistory()).toEqual([0, 1, 2, 1]);

    // test the modify state from the middle position
    act(() => {
      setState(state + 5); // 2 + 5 = 7
      controls.archive();
    });
    [state, setState, controls] = result.current;

    // here may expose bug: the history after the modify state from the middle position
    expect(state).toBe(7);
    expect(controls.position).toBe(3);
    // the history should be truncated and add new state
    expect(controls.getHistory()).toEqual([0, 1, 2, 7]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);

    // test the state after multiple continuous operations
    act(() => {
      setState(state * 2); // 7 * 2 = 14
      controls.archive();
    });
    [state, setState, controls] = result.current;

    expect(state).toBe(14);
    expect(controls.position).toBe(4);
    expect(controls.getHistory()).toEqual([0, 1, 2, 7, 14]);

    // test the correctness of patches
    expect(controls.patches.patches.length).toBe(4);
    expect(controls.patches.inversePatches.length).toBe(4);

    // test the back to the initial position
    act(() => controls.go(0));
    [state, setState, controls] = result.current;

    expect(state).toBe(0);
    expect(controls.position).toBe(0);

    // test the forward to the various states from the initial position
    act(() => controls.go(4));
    [state, setState, controls] = result.current;

    expect(state).toBe(14);
    expect(controls.position).toBe(4);

    // test the case without calling archive
    act(() => {
      setState(state + 100); // 14 + 100 = 114
      // this time without calling controls.archive()
    });
    [state, setState, controls] = result.current;

    expect(state).toBe(114);
    expect(controls.position).toBe(5);
    expect(controls.canArchive()).toBe(true); // should be able to archive
    expect(controls.getHistory()).toEqual([0, 1, 2, 7, 14, 114]); // the history should show the temporary state

    // test the navigation with temporary state
    act(() => controls.back());
    [state, setState, controls] = result.current;

    expect(state).toBe(14);
    expect(controls.position).toBe(4);
    expect(controls.canArchive()).toBe(false); // the temporary state should be automatically archived

    // test the reset function
    act(() => controls.reset());
    [state, setState, controls] = result.current;

    expect(state).toBe(0);
    expect(controls.position).toBe(0);
    expect(controls.getHistory()).toEqual([0]);
    expect(controls.patches.patches).toEqual([]);
    expect(controls.patches.inversePatches).toEqual([]);
  });

  it('[useTravel] basic test with autoArchive: false and temporary state', () => {
    const { result } = renderHook(() =>
      useTravel(0, {
        maxHistory: 10,
        autoArchive: false,
      })
    );

    let [state, setState, controls] = result.current;

    // initial state
    expect(state).toBe(0);
    expect(controls.position).toBe(0);
    expect(controls.getHistory()).toEqual([0]);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(false);

    // simulate the first click of Increment button
    act(() => {
      setState(state + 1);
    });
    [state, setState, controls] = result.current;

    expect(state).toBe(1);
    expect(controls.position).toBe(1);
    expect(controls.getHistory()).toEqual([0, 1]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(true);

    act(() => {
      setState(state + 1);
    });
    [state, setState, controls] = result.current;

    expect(state).toBe(2);
    expect(controls.position).toBe(1);
    expect(controls.getHistory()).toEqual([0, 2]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(true);

    act(() => {
      controls.archive();
    });
    [state, setState, controls] = result.current;

    expect(state).toBe(2);
    expect(controls.position).toBe(1);
    expect(controls.getHistory()).toEqual([0, 2]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(false);
  });

  it('[useTravel] basic test with autoArchive: false and object state', () => {
    const { result } = renderHook(() =>
      useTravel(
        { count: 0 },
        {
          maxHistory: 10,
          autoArchive: false,
        }
      )
    );

    let [state, setState, controls] = result.current;

    // initial state
    expect(state).toEqual({ count: 0 });
    expect(controls.position).toBe(0);
    expect(controls.getHistory()).toEqual([{ count: 0 }]);
    expect(controls.canBack()).toBe(false);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(false);

    // simulate the first click of Increment button
    act(() => {
      setState({ count: state.count + 1 });
    });
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 1 });
    expect(controls.position).toBe(1);
    expect(controls.getHistory()).toEqual([{ count: 0 }, { count: 1 }]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(true);

    act(() => {
      setState({ count: state.count + 1 });
    });
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 2 });
    expect(controls.position).toBe(1);
    expect(controls.getHistory()).toEqual([{ count: 0 }, { count: 2 }]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(true);

    act(() => {
      controls.archive();
    });
    [state, setState, controls] = result.current;

    expect(state).toEqual({ count: 2 });
    expect(controls.position).toBe(1);
    expect(controls.getHistory()).toEqual([{ count: 0 }, { count: 2 }]);
    expect(controls.canBack()).toBe(true);
    expect(controls.canForward()).toBe(false);
    expect(controls.canArchive()).toBe(false);
  });
});
