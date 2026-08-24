import { createElement, useLayoutEffect } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTravel } from '../src/index';

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
});
