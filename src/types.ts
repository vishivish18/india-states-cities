import type { StateCode } from './data/codes';

export type { StateCode };

export type StateType = 'state' | 'union-territory';

export interface State {
  /** Two-letter ISO 3166-2 subdivision code without the `IN-` prefix, e.g. `KA`. */
  readonly code: StateCode;
  /** Full ISO 3166-2 code, e.g. `IN-KA`. */
  readonly isoCode: string;
  /** English name, e.g. `Karnataka`. */
  readonly name: string;
  /** Hindi name, e.g. `कर्नाटक`. */
  readonly nameHi: string;
  readonly type: StateType;
}

export interface City {
  readonly name: string;
  readonly stateCode: StateCode;
}
