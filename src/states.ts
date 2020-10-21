import { STATES } from './data/states';
import { normalize } from './normalize';
import type { State, StateCode, StateType } from './types';

/**
 * Older or alternative codes people still use → current ISO 3166-2 code.
 * ISO changed CT→CG, OR→OD, TG→TS and UT→UK in 2020; DD/DN were merged into DH that year.
 */
const LEGACY_CODES: Readonly<Record<string, StateCode>> = {
  CT: 'CG',
  OR: 'OD',
  TG: 'TS',
  UT: 'UK',
  DD: 'DH',
  DN: 'DH',
};

/** Common alternative names → state code. */
const NAME_ALIASES: Readonly<Record<string, StateCode>> = {
  orissa: 'OD',
  pondicherry: 'PY',
  uttaranchal: 'UK',
  'nct of delhi': 'DL',
  'new delhi': 'DL',
  'andaman nicobar': 'AN',
  'andaman and nicobar': 'AN',
  'dadra and nagar haveli': 'DH',
  'daman and diu': 'DH',
  'jammu kashmir': 'JK',
};

const byCode = new Map<string, State>(STATES.map((s) => [s.code, s]));
const byName = new Map<string, State>();
for (const s of STATES) {
  byName.set(normalize(s.name), s);
  byName.set(normalize(s.nameHi), s);
}

export interface GetStatesOptions {
  /** Only states, or only union territories. Default: both. */
  readonly type?: StateType;
}

/** All 28 states and 8 union territories, sorted by English name. */
export function getStates(options: GetStatesOptions = {}): readonly State[] {
  return options.type ? STATES.filter((s) => s.type === options.type) : STATES;
}

/**
 * Finds a state by code (`KA`, `IN-KA`, legacy `OR`), English or Hindi name, or a common alias (`Orissa`).
 * Case- and punctuation-insensitive. Returns `undefined` when nothing matches.
 */
export function getState(codeOrName: string): State | undefined {
  if (typeof codeOrName !== 'string') return undefined;
  const raw = codeOrName.trim();
  if (!raw) return undefined;

  const code = raw.toUpperCase().replace(/^IN-/, '');
  const direct = byCode.get(code) ?? byCode.get(LEGACY_CODES[code] ?? '');
  if (direct) return direct;

  const key = normalize(raw);
  const named = byName.get(key) ?? byCode.get(NAME_ALIASES[key] ?? '');
  return named;
}

/** True when `value` is a current state code such as `KA`. Narrows the type. */
export function isStateCode(value: unknown): value is StateCode {
  return typeof value === 'string' && byCode.has(value);
}
