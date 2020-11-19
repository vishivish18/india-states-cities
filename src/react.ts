import { useCallback, useMemo, useState } from 'react';
import { findCity, getCities } from './cities';
import { getState, getStates } from './states';
import type { State, StateCode, StateType } from './types';

export interface UseIndiaStateCityOptions {
  /** Initial state (code or name). Ignored if unknown. */
  readonly defaultState?: string;
  /** Initial city; kept only if it belongs to `defaultState`. */
  readonly defaultCity?: string;
  /** Only offer states or only union territories. */
  readonly stateType?: StateType;
}

export interface IndiaStateCity {
  /** Options for the state dropdown. */
  readonly states: readonly State[];
  /** Options for the city dropdown: the selected state's cities, or `[]` before a state is picked. */
  readonly cities: readonly string[];
  readonly state: State | null;
  readonly stateCode: StateCode | null;
  readonly city: string | null;
  /** Select a state by code or name (`null` clears). Clears the city when the state changes. */
  readonly setState: (codeOrName: string | null) => void;
  /** Select a city of the current state (`null` clears). Names outside the selected state are ignored. */
  readonly setCity: (name: string | null) => void;
  readonly reset: () => void;
}

/**
 * Headless state → city picker. Bring your own UI:
 *
 * ```tsx
 * const { states, cities, stateCode, city, setState, setCity } = useIndiaStateCity();
 * <select value={stateCode ?? ''} onChange={(e) => setState(e.target.value || null)}>…</select>
 * <select value={city ?? ''} disabled={!stateCode} onChange={(e) => setCity(e.target.value || null)}>…</select>
 * ```
 */
export function useIndiaStateCity(options: UseIndiaStateCityOptions = {}): IndiaStateCity {
  const { defaultState, defaultCity, stateType } = options;

  const initialState = defaultState ? getState(defaultState) ?? null : null;
  const initialCity = initialState && defaultCity ? findCity(initialState.code, defaultCity) ?? null : null;

  const [state, setStateValue] = useState<State | null>(initialState);
  const [city, setCityValue] = useState<string | null>(initialCity);

  const states = useMemo(() => getStates({ type: stateType }), [stateType]);
  const cities = useMemo(() => (state ? getCities(state.code) : []), [state]);

  const setState = useCallback(
    (codeOrName: string | null) => {
      const next = codeOrName ? getState(codeOrName) ?? null : null;
      if (next?.code !== state?.code) setCityValue(null);
      setStateValue(next);
    },
    [state],
  );

  const setCity = useCallback(
    (name: string | null) => {
      if (name === null) return setCityValue(null);
      const canonical = state ? findCity(state.code, name) : undefined;
      if (canonical) setCityValue(canonical);
    },
    [state],
  );

  const reset = useCallback(() => {
    setStateValue(initialState);
    setCityValue(initialCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialState?.code, initialCity]);

  return { states, cities, state, stateCode: state?.code ?? null, city, setState, setCity, reset };
}
