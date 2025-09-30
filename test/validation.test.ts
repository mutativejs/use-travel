import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useTravel } from '../src/index';

// Mock __DEV__ flag to be true for these tests
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
globalThis.__DEV__ = true;

describe('useTravel - Input Validation', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
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
      renderHook(() =>
        useTravel(0, {
          maxHistory: -5,
        })
      );

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

  describe('initialPosition validation', () => {
    it('should log error when initialPosition is negative', () => {
      renderHook(() =>
        useTravel(0, {
          initialPosition: -1,
        })
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'useTravel: initialPosition must be non-negative, but got -1'
      );
    });

    it('should log error when initialPosition is large negative number', () => {
      renderHook(() =>
        useTravel(0, {
          initialPosition: -100,
        })
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'useTravel: initialPosition must be non-negative, but got -100'
      );
    });

    it('should not log error when initialPosition is 0', () => {
      renderHook(() =>
        useTravel(0, {
          initialPosition: 0,
        })
      );

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should not log error when initialPosition is positive', () => {
      renderHook(() =>
        useTravel(0, {
          initialPosition: 5,
        })
      );

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('initialPatches validation', () => {
    it('should log error when patches is not an array', () => {
      // This will throw an error when trying to use invalid patches
      // but should log the validation error first
      expect(() => {
        renderHook(() =>
          useTravel(0, {
            initialPatches: {
              // @ts-expect-error - Testing invalid input
              patches: 'not-an-array',
              inversePatches: [],
            },
          })
        );
      }).toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `useTravel: initialPatches must have 'patches' and 'inversePatches' arrays`
      );
    });

    it('should log error when inversePatches is not an array', () => {
      // This will throw an error when trying to use invalid patches
      // but should log the validation error first
      expect(() => {
        renderHook(() =>
          useTravel(0, {
            initialPatches: {
              patches: [],
              // @ts-expect-error - Testing invalid input
              inversePatches: null,
            },
          })
        );
      }).toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `useTravel: initialPatches must have 'patches' and 'inversePatches' arrays`
      );
    });

    it('should log error when both patches and inversePatches are not arrays', () => {
      // This will throw an error when trying to use invalid patches
      // but should log the validation error first
      expect(() => {
        renderHook(() =>
          useTravel(0, {
            initialPatches: {
              // @ts-expect-error - Testing invalid input
              patches: {},
              // @ts-expect-error - Testing invalid input
              inversePatches: {},
            },
          })
        );
      }).toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `useTravel: initialPatches must have 'patches' and 'inversePatches' arrays`
      );
    });

    it('should log error when patches and inversePatches have different lengths', () => {
      renderHook(() =>
        useTravel(0, {
          initialPatches: {
            patches: [[{ op: 'replace', path: [], value: 1 }]],
            inversePatches: [
              [{ op: 'replace', path: [], value: 0 }],
              [{ op: 'replace', path: [], value: -1 }],
            ],
          },
        })
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `useTravel: initialPatches.patches and initialPatches.inversePatches must have the same length`
      );
    });

    it('should not log error when initialPatches is valid', () => {
      renderHook(() =>
        useTravel(0, {
          initialPatches: {
            patches: [[{ op: 'replace', path: [], value: 1 }]],
            inversePatches: [[{ op: 'replace', path: [], value: 0 }]],
          },
        })
      );

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should not log error when initialPatches has empty arrays', () => {
      renderHook(() =>
        useTravel(0, {
          initialPatches: {
            patches: [],
            inversePatches: [],
          },
        })
      );

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should not log error when initialPatches is undefined', () => {
      renderHook(() =>
        useTravel(0, {
          initialPatches: undefined,
        })
      );

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('multiple validation errors', () => {
    it('should log multiple errors when multiple options are invalid', () => {
      // This will throw an error when trying to use invalid patches
      // but should log all validation errors first
      expect(() => {
        renderHook(() =>
          useTravel(0, {
            maxHistory: -1,
            initialPosition: -5,
            initialPatches: {
              // @ts-expect-error - Testing invalid input
              patches: 'invalid',
              inversePatches: [],
            },
          })
        );
      }).toThrow();

      // Check that all three validation errors were logged
      // (may be called more than 3 times due to React re-renders)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'useTravel: maxHistory must be a positive number, but got -1'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'useTravel: initialPosition must be non-negative, but got -5'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `useTravel: initialPatches must have 'patches' and 'inversePatches' arrays`
      );
    });
  });

  describe('valid options', () => {
    it('should not log any errors when all options are valid', () => {
      renderHook(() =>
        useTravel(
          { count: 0 },
          {
            maxHistory: 20,
            initialPosition: 0,
            initialPatches: {
              patches: [],
              inversePatches: [],
            },
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
