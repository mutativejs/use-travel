import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useTravel } from '../src/index';

// Mock __DEV__ flag to be true for these tests
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
globalThis.__DEV__ = true;

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
    it('should log error when maxHistory is 0', () => {
      renderHook(() =>
        useTravel(0, {
          maxHistory: 0,
        })
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'useTravel: maxHistory must be a positive number, but got 0'
      );
    });

    it('should log error when maxHistory is negative', () => {
      expect(() =>
        renderHook(() =>
          useTravel(0, {
            maxHistory: -5,
          })
        )
      ).toThrowError('Travels: maxHistory must be non-negative, but got -5');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
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
