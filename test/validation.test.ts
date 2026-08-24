import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useTravel } from '../src/index';

describe('useTravel - Input Validation', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('maxHistory validation', () => {
    it('accepts maxHistory 0 to disable retained history', () => {
      const { result } = renderHook(() =>
        useTravel(0, {
          maxHistory: 0,
        })
      );

      expect(result.current[2].getHistory()).toEqual([0]);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('delegates invalid negative values to core validation', () => {
      expect(() =>
        renderHook(() =>
          useTravel(0, {
            maxHistory: -5,
          })
        )
      ).toThrowError('Travels: maxHistory must be non-negative, but got -5');

      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        'useTravel: maxHistory must be a positive number, but got -5'
      );
    });

    it('should not log error when maxHistory is positive', () => {
      renderHook(() =>
        useTravel(0, {
          maxHistory: 10,
        })
      );

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  it.each([
    'history',
    'initialPatches',
    'initialPosition',
    'strictInitialPatches',
  ] as const)('rejects the removed %s restore option', (option) => {
    expect(() =>
      renderHook(() => useTravel(0, { [option]: undefined } as never))
    ).toThrow(
      `useTravel: ${option} was removed; restore a complete snapshot with restoreTravels() and pass that instance to useTravelStore()`
    );
  });

  it('rejects mutable mode instead of silently overriding it', () => {
    expect(() =>
      renderHook(() => useTravel(0, { mutable: true } as never))
    ).toThrow(
      'useTravel: mutable mode cannot drive React updates; use an immutable timeline or travels directly'
    );
  });

  it('rejects externally owned journal options', () => {
    expect(() =>
      renderHook(() =>
        useTravel({ count: 0 }, {
          controlledApply: ({ state }: { state: { count: number } }) => state,
        } as any)
      )
    ).toThrow(
      'useTravel: controlledApply is reserved for externally owned journals; use createTravelJournal() from travels directly'
    );
  });

  describe('valid options', () => {
    it('should not log any errors when all options are valid', () => {
      renderHook(() =>
        useTravel(
          { count: 0 },
          {
            maxHistory: 20,
            autoArchive: true,
          }
        )
      );

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should not log any errors with default options', () => {
      renderHook(() => useTravel({ count: 0 }));

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
