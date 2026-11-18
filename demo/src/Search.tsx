import { useMemo, useState } from 'react';
import { getState, searchCities } from '@vishivish18/india-states-cities';

const EXAMPLES = ['pune', 'bangalore', 'gurg', 'nagar', 'kochi'];

export function Search() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchCities(query, { limit: 8 }), [query]);

  return (
    <section className="card">
      <h2>Search cities</h2>
      <p className="muted">
        <code>searchCities(query)</code> for autocomplete: exact match first, then prefix. Former names work too.
      </p>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a city…"
        aria-label="Search cities"
      />
      <div className="chips" aria-label="Examples">
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" className="chip" onClick={() => setQuery(ex)}>
            {ex}
          </button>
        ))}
      </div>
      {query.trim() && (
        <ul className="results">
          {results.length === 0 && <li className="muted">No city matches “{query}”.</li>}
          {results.map((c) => (
            <li key={`${c.stateCode}-${c.name}`}>
              <strong>{c.name}</strong>
              <span className="muted">{getState(c.stateCode)?.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
