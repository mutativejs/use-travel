import { expect, describe, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTravel } from '../src/index';

describe('useTravel - Edge Cases', () => {
  describe('canForward and canBack edge cases', () => {
    it('should correctly report canForward/canBack with autoArchive: true at boundaries', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: true, maxHistory: 10 })
      );

      let [state, setState, controls] = result.current;

      // Initial state: position = 0, no history yet
      expect(controls.position).toBe(0);
      expect(controls.canBack()).toBe(false);
      expect(controls.canForward()).toBe(false);

      // Add first state
      act(() => setState(1));
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(1);
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(false);

      // Add second state
      act(() => setState(2));
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(2);
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(false);

      // Go back to middle
      act(() => controls.back());
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(1);
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(true);

      // Go back to start
      act(() => controls.back());
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(0);
      expect(controls.canBack()).toBe(false);
      expect(controls.canForward()).toBe(true);

      // Go forward to end
      act(() => controls.forward(2));
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(2);
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(false);
    });

    it('should correctly report canForward/canBack with autoArchive: false without temporary patches', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: false, maxHistory: 10 })
      );

      let [state, setState, controls] = result.current;

      // Initial state
      expect(controls.position).toBe(0);
      expect(controls.canBack()).toBe(false);
      expect(controls.canForward()).toBe(false);
      expect(controls.canArchive()).toBe(false);

      // Add and archive first state
      act(() => {
        setState(1);
        controls.archive();
      });
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(1);
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(false);
      expect(controls.canArchive()).toBe(false);

      // Add and archive second state
      act(() => {
        setState(2);
        controls.archive();
      });
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(2);
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(false);
      expect(controls.canArchive()).toBe(false);

      // Go back to middle
      act(() => controls.back());
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(1);
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(true);

      // Go back to start
      act(() => controls.back());
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(0);
      expect(controls.canBack()).toBe(false);
      expect(controls.canForward()).toBe(true);
    });

    it('should correctly report canForward/canBack with temporary patches at end position', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: false, maxHistory: 10 })
      );

      let [state, setState, controls] = result.current;

      // Build archived history
      act(() => {
        setState(1);
        controls.archive();
      });
      [state, setState, controls] = result.current;

      act(() => {
        setState(2);
        controls.archive();
      });
      [state, setState, controls] = result.current;

      // Position = 2, patches.length = 2
      expect(controls.position).toBe(2);
      expect(controls.patches.patches.length).toBe(2);
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(false);
      expect(controls.canArchive()).toBe(false);

      // Add temporary patch (not archived)
      act(() => setState(3));
      [state, setState, controls] = result.current;

      // When adding temp patch at end, position increments to 3
      // but patches are not yet archived
      expect(controls.position).toBe(3);
      expect(controls.patches.patches.length).toBe(3); // includes temp
      expect(controls.getHistory()).toEqual([0, 1, 2, 3]); // shows all history including temp
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(false); // Can't forward from temp state
      expect(controls.canArchive()).toBe(true);

      // Verify getHistory shows the temporary state
      const history = controls.getHistory();
      expect(history.length).toBe(4);
      expect(history[3]).toBe(3); // Temporary state is visible
    });

    it('should correctly report canForward/canBack with temporary patches at middle position', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: false, maxHistory: 10 })
      );

      let [state, setState, controls] = result.current;

      // Build archived history
      act(() => {
        setState(1);
        controls.archive();
      });
      [state, setState, controls] = result.current;

      act(() => {
        setState(2);
        controls.archive();
      });
      [state, setState, controls] = result.current;

      act(() => {
        setState(3);
        controls.archive();
      });
      [state, setState, controls] = result.current;

      // Go back to middle
      act(() => controls.back());
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(2);
      expect(state).toBe(2);

      // Add temporary patch from middle position (notLast = true, so position increments)
      act(() => setState(10));
      [state, setState, controls] = result.current;

      // Position increments because we were in the middle (notLast)
      expect(controls.position).toBe(3);
      expect(state).toBe(10);
      expect(controls.patches.patches.length).toBe(3); // 2 archived + 1 temp
      expect(controls.getHistory()).toEqual([0, 1, 2, 10]); // temp state replaces position 3 onward
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(false); // Can't forward, temp is the new end
      expect(controls.canArchive()).toBe(true);
    });

    it('should handle canForward after navigating back with temporary patches', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: false, maxHistory: 10 })
      );

      let [state, setState, controls] = result.current;

      // Build history with temp patch
      act(() => {
        setState(1);
        controls.archive();
      });
      [state, setState, controls] = result.current;

      act(() => {
        setState(2);
        controls.archive();
      });
      [state, setState, controls] = result.current;

      act(() => setState(3)); // Temporary - position increments to 3
      [state, setState, controls] = result.current;

      expect(controls.position).toBe(3);
      expect(controls.getHistory()).toEqual([0, 1, 2, 3]);
      expect(controls.canForward()).toBe(false);

      // Go back - this should archive the temp patch first
      act(() => controls.back());
      [state, setState, controls] = result.current;

      // After back(), temp patch was archived and we're at position 2 (state 2)
      expect(controls.position).toBe(2);
      expect(state).toBe(2);
      expect(controls.canArchive()).toBe(false); // Temp was archived
      expect(controls.canForward()).toBe(true); // Can now forward to archived temp state
      expect(controls.patches.patches.length).toBe(3);

      // Forward should go to the archived temp state
      act(() => controls.forward());
      [state, setState, controls] = result.current;
      expect(state).toBe(3);
      expect(controls.position).toBe(3);
      expect(controls.canForward()).toBe(false);
    });

    it('should handle boundary conditions with maxHistory limit', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: false, maxHistory: 3 })
      );

      let [state, setState, controls] = result.current;

      // Fill up to maxHistory
      for (let i = 1; i <= 4; i++) {
        act(() => {
          setState(i);
          controls.archive();
        });
        [state, setState, controls] = result.current;
      }

      // Position should be capped at maxHistory
      expect(controls.position).toBe(3);
      expect(controls.patches.patches.length).toBe(3);
      expect(controls.getHistory().length).toBe(4);
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(false);

      // Add temporary patch
      act(() => setState(5));
      [state, setState, controls] = result.current;

      expect(controls.position).toBe(3); // Capped by maxHistory
      expect(controls.patches.patches.length).toBe(4); // includes temp
      expect(controls.getHistory()).toEqual([2, 3, 4, 5]);
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(false);
      expect(controls.canArchive()).toBe(true);
    });

    it('should correctly handle canForward when temporary patch is at position 0', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: false, maxHistory: 10 })
      );

      let [state, setState, controls] = result.current;

      // Initial state with immediate temp patch
      act(() => setState(1));
      [state, setState, controls] = result.current;

      expect(controls.position).toBe(1);
      expect(state).toBe(1);
      expect(controls.patches.patches.length).toBe(1);
      expect(controls.getHistory()).toEqual([0, 1]);
      expect(controls.canBack()).toBe(true);
      expect(controls.canForward()).toBe(false);
      expect(controls.canArchive()).toBe(true);

      // Go back to initial state
      act(() => controls.back());
      [state, setState, controls] = result.current;

      // Temp patch should be archived on back()
      expect(controls.position).toBe(0);
      expect(state).toBe(0);
      expect(controls.canBack()).toBe(false);
      expect(controls.canForward()).toBe(true);
      expect(controls.canArchive()).toBe(false);
    });
  });

  describe('go() function boundary behavior', () => {
    it('should clamp position when going beyond bounds with autoArchive: true', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: true, maxHistory: 10 })
      );

      let [state, setState, controls] = result.current;

      act(() => setState(1));
      [state, setState, controls] = result.current;
      act(() => setState(2));
      [state, setState, controls] = result.current;

      // With autoArchive, patches.length = 2, valid positions are 0,1,2
      expect(controls.position).toBe(2);
      expect(controls.patches.patches.length).toBe(2);

      // Try to go beyond forward bound
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      act(() => controls.go(10));
      [state, setState, controls] = result.current;

      expect(warnSpy).toHaveBeenCalledWith("Can't go forward to position 10");
      expect(controls.position).toBe(2); // Clamped to patches.length
      expect(state).toBe(2);

      // Try to go beyond backward bound
      act(() => controls.go(-5));
      [state, setState, controls] = result.current;

      expect(warnSpy).toHaveBeenCalledWith("Can't go back to position -5");
      expect(controls.position).toBe(0); // Clamped to min
      expect(state).toBe(0);

      warnSpy.mockRestore();
    });

    it('should clamp position when going beyond bounds with autoArchive: false and temp patches', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: false, maxHistory: 10 })
      );

      let [state, setState, controls] = result.current;

      act(() => {
        setState(1);
        controls.archive();
      });
      [state, setState, controls] = result.current;
      act(() => {
        setState(2);
        controls.archive();
      });
      [state, setState, controls] = result.current;
      act(() => setState(3)); // Temporary - position moves to 3
      [state, setState, controls] = result.current;

      expect(controls.position).toBe(3);
      expect(controls.patches.patches.length).toBe(3);

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Try to go beyond forward bound (should archive first, then clamp)
      act(() => controls.go(10));
      [state, setState, controls] = result.current;

      expect(warnSpy).toHaveBeenCalledWith("Can't go forward to position 10");
      expect(controls.position).toBe(3); // Clamped to max (after archiving)
      expect(state).toBe(3);
      expect(controls.canArchive()).toBe(false); // Temp was archived

      warnSpy.mockRestore();
    });

    it('should handle go(currentPosition) as no-op', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: true, maxHistory: 10 })
      );

      let [state, setState, controls] = result.current;

      act(() => setState(1));
      act(() => setState(2));
      [state, setState, controls] = result.current;

      const currentPosition = controls.position;
      const currentState = state;

      // Go to current position should be no-op
      act(() => controls.go(currentPosition));
      [state, setState, controls] = result.current;

      expect(controls.position).toBe(currentPosition);
      expect(state).toBe(currentState);
    });
  });

  describe('Complex navigation scenarios', () => {
    it('should handle: back -> setState -> back -> setState -> archive sequence', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: false, maxHistory: 10 })
      );

      let [state, setState, controls] = result.current;

      // Build initial history
      act(() => {
        setState(1);
        controls.archive();
      });
      [state, setState, controls] = result.current;
      act(() => {
        setState(2);
        controls.archive();
      });
      [state, setState, controls] = result.current;
      act(() => {
        setState(3);
        controls.archive();
      });
      [state, setState, controls] = result.current;

      expect(controls.position).toBe(3);
      expect(controls.getHistory()).toEqual([0, 1, 2, 3]);

      // Go back and add temp state
      act(() => controls.back());
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(2);

      act(() => setState(10));
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(3); // Position increments because notLast
      expect(state).toBe(10);
      expect(controls.getHistory()).toEqual([0, 1, 2, 10]);
      expect(controls.canArchive()).toBe(true);

      // Go back again (should archive temp first)
      act(() => controls.back());
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(2);
      expect(state).toBe(2);
      expect(controls.canArchive()).toBe(false);

      // Add another temp state
      act(() => setState(20));
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(3); // Position increments again
      expect(state).toBe(20);
      expect(controls.canArchive()).toBe(true);

      // Archive manually
      act(() => controls.archive());
      [state, setState, controls] = result.current;
      expect(controls.position).toBe(3);
      expect(state).toBe(20);
      // When we went back from 10, it archived. Then we added 20 from position 2,
      // which replaced the history at position 3
      expect(controls.getHistory()).toEqual([0, 1, 2, 20]);
      expect(controls.canArchive()).toBe(false);
    });

    it('should handle rapid state changes without archive then navigate', () => {
      const { result } = renderHook(() =>
        useTravel(0, { autoArchive: false, maxHistory: 10 })
      );

      let [state, setState, controls] = result.current;

      // Multiple setState without archive (each overwrites temp)
      act(() => setState(1));
      [state, setState, controls] = result.current;
      expect(state).toBe(1);

      act(() => setState(2));
      [state, setState, controls] = result.current;
      expect(state).toBe(2);

      act(() => setState(3));
      [state, setState, controls] = result.current;
      expect(state).toBe(3);

      // Only the last temp state should be in history
      expect(controls.position).toBe(1);
      expect(controls.getHistory()).toEqual([0, 3]);
      expect(controls.canArchive()).toBe(true);

      // Navigate back should archive the temp
      act(() => controls.back());
      [state, setState, controls] = result.current;
      expect(state).toBe(0);
      expect(controls.position).toBe(0);
      expect(controls.canArchive()).toBe(false);

      // Forward should go to archived temp
      act(() => controls.forward());
      [state, setState, controls] = result.current;
      expect(state).toBe(3);
      expect(controls.position).toBe(1);
    });
  });
});
