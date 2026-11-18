import { CITY_ALIASES } from './data/aliases';
import { CITIES } from './data/cities';
import { normalize } from './normalize';
import { getState } from './states';
import type { City, StateCode } from './types';

const ALL_CITIES: readonly City[] = (Object.keys(CITIES) as StateCode[]).flatMap((stateCode) =>
  CITIES[stateCode].map((name) => ({ name, stateCode })),
);

/** Per state: normalized name or alias → canonical city name. */
const LOOKUP = new Map<StateCode, Map<string, string>>();
for (const code of Object.keys(CITIES) as StateCode[]) {
  const index = new Map<string, string>();
  for (const name of CITIES[code]) index.set(normalize(name), name);
  for (const [alias, target] of Object.entries(CITY_ALIASES[code] ?? {})) {
    const key = normalize(alias);
    if (!index.has(key)) index.set(key, target);
  }
  LOOKUP.set(code, index);
}

/** Search keys per city (parallel to ALL_CITIES): its normalized name plus its normalized aliases. */
const SEARCH_KEYS: readonly (readonly string[])[] = (() => {
  const aliasesOf = new Map<string, string[]>();
  for (const [code, map] of Object.entries(CITY_ALIASES)) {
    for (const [alias, target] of Object.entries(map ?? {})) {
      const id = `${code}|${target}`;
      aliasesOf.set(id, [...(aliasesOf.get(id) ?? []), normalize(alias)]);
    }
  }
  return ALL_CITIES.map((c) => [normalize(c.name), ...(aliasesOf.get(`${c.stateCode}|${c.name}`) ?? [])]);
})();

/**
 * City names in a state, sorted A–Z. Accepts anything `getState` accepts (`KA`, `Karnataka`, `IN-KA`).
 * Returns an empty array for an unknown state.
 */
export function getCities(state: string): readonly string[] {
  const found = getState(state);
  return found ? CITIES[found.code] : [];
}

/** Total number of cities, optionally for one state. */
export function countCities(state?: string): number {
  if (state === undefined) return ALL_CITIES.length;
  return getCities(state).length;
}

/**
 * True when `city` belongs to `state`. Case-, accent- and punctuation-insensitive, and accepts former
 * names (`Bangalore` for `Bengaluru`). Useful for validating form input on the server.
 */
export function isValidCity(state: string, city: string): boolean {
  return findCity(state, city) !== undefined;
}

/** The canonical spelling of `city` in `state` (e.g. `bangalore` → `Bengaluru`), or `undefined`. */
export function findCity(state: string, city: string): string | undefined {
  if (typeof city !== 'string') return undefined;
  const key = normalize(city);
  const found = key ? getState(state) : undefined;
  return found ? LOOKUP.get(found.code)?.get(key) : undefined;
}

export interface SearchCitiesOptions {
  /** Restrict results to one state (code or name). */
  readonly state?: string;
  /** Maximum results. Default 20. */
  readonly limit?: number;
}

/**
 * Searches cities by name for autocomplete. Former and alternative names count (`gurg` finds Gurugram via
 * Gurgaon). Ranking: exact → starts with → a word starts with → contains; ties sorted A–Z.
 * Returns `[]` for an empty query or an unknown `state`.
 */
export function searchCities(query: string, options: SearchCitiesOptions = {}): readonly City[] {
  const q = typeof query === 'string' ? normalize(query) : '';
  if (!q) return [];
  const limit = Math.max(0, Math.floor(options.limit ?? 20));

  let stateCode: StateCode | undefined;
  if (options.state !== undefined) {
    stateCode = getState(options.state)?.code;
    if (!stateCode) return [];
  }

  const ranked: { city: City; rank: number }[] = [];
  ALL_CITIES.forEach((city, i) => {
    if (stateCode && city.stateCode !== stateCode) return;
    const rank = rankName(SEARCH_KEYS[i], q);
    if (rank >= 0) ranked.push({ city, rank });
  });

  return ranked
    .sort((a, b) => a.rank - b.rank || a.city.name.localeCompare(b.city.name))
    .slice(0, limit)
    .map((r) => r.city);
}

/** 0 exact, 1 prefix, 2 word prefix, 3 contains, -1 no match. Alternative names count as the city's name. */
function rankName(names: readonly string[], q: string): number {
  if (names.some((n) => n === q)) return 0;
  if (names.some((n) => n.startsWith(q))) return 1;
  if (names.some((n) => n.split(' ').some((word) => word.startsWith(q)))) return 2;
  if (names.some((n) => n.includes(q))) return 3;
  return -1;
}
