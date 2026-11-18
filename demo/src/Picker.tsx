import type { StateType } from '@vishivish18/india-states-cities';
import type { IndiaStateCity } from '@vishivish18/india-states-cities/react';
import { CopyButton } from './CopyButton';

const SNIPPET = `import { useIndiaStateCity } from '@vishivish18/india-states-cities/react';

const { states, cities, stateCode, city, setState, setCity } = useIndiaStateCity();

<select value={stateCode ?? ''} onChange={(e) => setState(e.target.value || null)}>
  <option value="">Select state</option>
  {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
</select>

<select value={city ?? ''} disabled={!stateCode} onChange={(e) => setCity(e.target.value || null)}>
  <option value="">Select city</option>
  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
</select>`;

interface Props {
  picker: IndiaStateCity;
  filter: StateType | 'all';
  onFilterChange: (f: StateType | 'all') => void;
}

const FILTERS: { value: StateType | 'all'; label: string }[] = [
  { value: 'all', label: 'All 36' },
  { value: 'state', label: 'States' },
  { value: 'union-territory', label: 'Union territories' },
];

export function Picker({ picker, filter, onFilterChange }: Props) {
  const { states, cities, state, stateCode, city, setState, setCity, reset } = picker;
  const output = { state: state ?? null, city };

  return (
    <section id="picker" className="card">
      <div className="card-head">
        <div>
          <h2>State → city picker</h2>
          <p className="muted">
            <code>useIndiaStateCity()</code> keeps the two dropdowns in sync. Changing the state clears the city.
          </p>
        </div>
        <div className="segmented" role="group" aria-label="Which states to list">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => onFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="picker-row">
        <label>
          <span>State</span>
          <select value={stateCode ?? ''} onChange={(e) => setState(e.target.value || null)}>
            <option value="">Select state</option>
            {states.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>
            City {stateCode && <em className="muted">({cities.length.toLocaleString('en-IN')})</em>}
          </span>
          <select value={city ?? ''} disabled={!stateCode} onChange={(e) => setCity(e.target.value || null)}>
            <option value="">{stateCode ? 'Select city' : 'Pick a state first'}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="ghost" onClick={reset} disabled={!stateCode}>
          Clear
        </button>
      </div>

      <div className="split">
        <div>
          <p className="label">Selected value</p>
          <pre className="code">{JSON.stringify(output, null, 2)}</pre>
        </div>
        <div>
          <p className="label">
            Code <CopyButton text={SNIPPET} />
          </p>
          <pre className="code">{SNIPPET}</pre>
        </div>
      </div>
    </section>
  );
}
