import { CITY_ALIASES } from './data/aliases';
import { CITIES } from './data/cities';
import { normalize } from './normalize';
import { getState } from './states';
import type { City, StateCode } from './types';

const ALL_CITIES: readonly City[] = (Object.keys(CITIES) as StateCode[]).flatMap((stateCode) =>
  CITIES[stateCode].map((name) => ({ name, stateCode })),
);

/** Normalized names, computed once (parallel to ALL_CITIES) so search doesn't redo it per keystroke. */
const SEARCH_KEYS: readonly string[] = ALL_CITIES.map((c) => normalize(c.name));

const normalizedAliases = new Map<string, string>(
  Object.entries(CITY_ALIASES).map(([alias, target]) => [normalize(alias), normalize(target)]),
);

/** Current name → its former names, all normalized (e.g. `bengaluru` → [`bangalore`]). */
const aliasesByTarget = new Map<string, string[]>();
for (const [alias, target] of normalizedAliases) {
  aliasesByTarget.set(target, [...(aliasesByTarget.get(target) ?? []), alias]);
}

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
  if (!key) return undefined;
  const target = normalizedAliases.get(key) ?? key;
  return getCities(state).find((name) => normalize(name) === target);
}

export interface SearchCitiesOptions {
  /** Restrict results to one state (code or name). */
  readonly state?: string;
  /** Maximum results. Default 20. */
  readonly limit?: number;
}

/**
 * Searches cities by name for autocomplete. Former names count (`gurg` finds Gurugram via Gurgaon).
 * Ranking: exact → starts with → a word starts with → contains; ties sorted A–Z. Returns `[]` for an empty query or an unknown `state`.
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

/** 0 exact, 1 prefix, 2 word prefix, 3 contains, -1 no match. Former names count as the current name. */
function rankName(name: string, q: string): number {
  const names = [name, ...(aliasesByTarget.get(name) ?? [])];
  if (names.some((n) => n === q)) return 0;
  if (names.some((n) => n.startsWith(q))) return 1;
  if (names.some((n) => n.split(' ').some((word) => word.startsWith(q)))) return 2;
  if (names.some((n) => n.includes(q))) return 3;
  return -1;
}
