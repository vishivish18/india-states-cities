import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useIndiaStateCity } from '../src/react';

describe('useIndiaStateCity', () => {
  it('starts empty with all states and no cities', () => {
    const { result } = renderHook(() => useIndiaStateCity());
    expect(result.current.states).toHaveLength(36);
    expect(result.current.cities).toEqual([]);
    expect(result.current.state).toBeNull();
    expect(result.current.city).toBeNull();
  });

  it('loads cities when a state is picked and clears the city when the state changes', () => {
    const { result } = renderHook(() => useIndiaStateCity());
    act(() => result.current.setState('Maharashtra'));
    expect(result.current.stateCode).toBe('MH');
    expect(result.current.cities).toContain('Mumbai');

    act(() => result.current.setCity('mumbai'));
    expect(result.current.city).toBe('Mumbai');

    act(() => result.current.setState('MH'));
    expect(result.current.city).toBe('Mumbai');

    act(() => result.current.setState('KA'));
    expect(result.current.city).toBeNull();
    expect(result.current.cities).toContain('Bengaluru');
  });

  it('ignores cities outside the selected state and unknown states', () => {
    const { result } = renderHook(() => useIndiaStateCity({ defaultState: 'KA' }));
    act(() => result.current.setCity('Mumbai'));
    expect(result.current.city).toBeNull();
    act(() => result.current.setState('Atlantis'));
    expect(result.current.state).toBeNull();
    expect(result.current.cities).toEqual([]);
  });

  it('honours defaults, keeps a valid default city and drops an invalid one', () => {
    const ok = renderHook(() => useIndiaStateCity({ defaultState: 'Karnataka', defaultCity: 'Bangalore' }));
    expect(ok.result.current.stateCode).toBe('KA');
    expect(ok.result.current.city).toBe('Bengaluru');

    const bad = renderHook(() => useIndiaStateCity({ defaultState: 'KA', defaultCity: 'Mumbai' }));
    expect(bad.result.current.city).toBeNull();
  });

  it('filters to union territories and resets to defaults', () => {
    const { result } = renderHook(() => useIndiaStateCity({ stateType: 'union-territory', defaultState: 'DL' }));
    expect(result.current.states).toHaveLength(8);
    act(() => result.current.setState('CH'));
    act(() => result.current.reset());
    expect(result.current.stateCode).toBe('DL');
    expect(result.current.city).toBeNull();
  });
});
