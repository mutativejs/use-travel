import { transformSync } from '@babel/core';
import transformReactJsx from '@babel/plugin-transform-react-jsx';
import { act, render, screen } from '@testing-library/react';
import reactCompiler from 'babel-plugin-react-compiler';
import * as React from 'react';
import * as ReactCompilerRuntime from 'react-compiler-runtime';
import { Travels } from 'travels';
import { describe, expect, it } from 'vitest';
import { useTravelStore } from '../src/index';

const compilerFixture = `
const React = require('react');
const { useTravelStore } = require('use-travel-test');

function CompiledCounter({ store }) {
  const [state, setState, controls] = useTravelStore(store);

  return (
    <div>
      <span data-testid="count">{String(state.count)}</span>
      <button type="button" onClick={() => setState({ count: state.count + 1 })}>
        Increment
      </button>
      <button type="button" disabled={!controls.canUndo} onClick={() => controls.back()}>
        Undo
      </button>
      <button type="button" disabled={!controls.canRedo} onClick={() => controls.forward()}>
        Redo
      </button>
    </div>
  );
}

exports.CompiledCounter = CompiledCounter;
`;

function compileCounter() {
  const result = transformSync(compilerFixture, {
    filename: 'compiled-counter.jsx',
    plugins: [
      [reactCompiler, { target: '18', panicThreshold: 'all_errors' }],
      [transformReactJsx, { runtime: 'classic' }],
    ],
    babelrc: false,
    configFile: false,
    sourceType: 'script',
  });

  expect(result?.code).toContain('react-compiler-runtime');

  const module = { exports: {} as Record<string, unknown> };
  const localRequire = (request: string) => {
    if (request === 'react') {
      return React;
    }
    if (request === 'react-compiler-runtime') {
      return ReactCompilerRuntime;
    }
    if (request === 'use-travel-test') {
      return { useTravelStore };
    }
    throw new Error(`Unexpected require: ${request}`);
  };

  new Function('require', 'module', 'exports', result!.code!)(
    localRequire,
    module,
    module.exports
  );

  return module.exports.CompiledCounter as React.ComponentType<{
    store: Travels<{ count: number }>;
  }>;
}

describe('React Compiler integration', () => {
  it('keeps canUndo and canRedo reactive in a compiled component', () => {
    const CompiledCounter = compileCounter();
    const store = new Travels({ count: 0 });

    render(React.createElement(CompiledCounter, { store }));

    const count = screen.getByTestId('count');
    const increment = screen.getByRole('button', { name: 'Increment' });
    const undo = screen.getByRole('button', {
      name: 'Undo',
    }) as HTMLButtonElement;
    const redo = screen.getByRole('button', {
      name: 'Redo',
    }) as HTMLButtonElement;

    expect(count.textContent).toBe('0');
    expect(undo.disabled).toBe(true);
    expect(redo.disabled).toBe(true);

    act(() => {
      increment.click();
    });

    expect(count.textContent).toBe('1');
    expect(undo.disabled).toBe(false);
    expect(redo.disabled).toBe(true);

    act(() => {
      undo.click();
    });

    expect(count.textContent).toBe('0');
    expect(undo.disabled).toBe(true);
    expect(redo.disabled).toBe(false);
  });
});
