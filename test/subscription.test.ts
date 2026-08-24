import { createElement, useLayoutEffect } from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTravels } from 'travels';
import { useTravel, useTravelStore } from '../src/index';

describe('useTravel subscription', () => {
  it('observes an update from a child layout effect during mount', () => {
    const Child = ({ update }: { update: (state: { count: number }) => void }) => {
      useLayoutEffect(() => {
        update({ count: 1 });
      }, [update]);
      return null;
    };

    const Parent = () => {
      const [state, setState] = useTravel({ count: 0 });
      return createElement(
        'div',
        null,
        createElement('output', { 'aria-label': 'count' }, state.count),
        createElement(Child, { update: setState })
      );
    };

    render(createElement(Parent));

    expect(screen.getByLabelText('count').textContent).toBe('1');
  });

  it('re-renders useTravel for timeline-only archive and rebase events', () => {
    let update!: (state: { count: number }) => void;
    let archive!: () => void;
    let rebase!: () => void;

    const App = () => {
      const [state, setState, controls] = useTravel(
        { count: 0 },
        { autoArchive: false }
      );
      update = setState;
      archive = controls.archive;
      rebase = controls.rebase;
      return createElement(
        'output',
        { 'aria-label': 'timeline' },
        `${state.count}:${controls.position}:${controls.canArchive()}:${controls.canUndo}`
      );
    };

    render(createElement(App));
    act(() => update({ count: 1 }));
    expect(screen.getByLabelText('timeline').textContent).toBe('1:1:true:true');

    act(() => archive());
    expect(screen.getByLabelText('timeline').textContent).toBe(
      '1:1:false:true'
    );

    act(() => rebase());
    expect(screen.getByLabelText('timeline').textContent).toBe(
      '1:0:false:false'
    );
  });

  it('re-renders useTravelStore for timeline-only archive and rebase events', () => {
    const travels = createTravels(
      { count: 0 },
      { autoArchive: false as const }
    );

    const App = () => {
      const [state, , controls] = useTravelStore(travels);
      return createElement(
        'output',
        { 'aria-label': 'shared-timeline' },
        `${state.count}:${controls.position}:${controls.canArchive()}:${controls.canUndo}`
      );
    };

    render(createElement(App));
    act(() => travels.setState({ count: 1 }));
    expect(screen.getByLabelText('shared-timeline').textContent).toBe(
      '1:1:true:true'
    );

    act(() => travels.archive());
    expect(screen.getByLabelText('shared-timeline').textContent).toBe(
      '1:1:false:true'
    );

    act(() => travels.rebase());
    expect(screen.getByLabelText('shared-timeline').textContent).toBe(
      '1:0:false:false'
    );
  });
});
