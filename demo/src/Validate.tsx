import { useState } from 'react';
import { findCity, getState } from '@vishivish18/india-states-cities';

export function Validate() {
  const [stateInput, setStateInput] = useState('Karnataka');
  const [cityInput, setCityInput] = useState('bangalore');

  const state = getState(stateInput);
  const city = state ? findCity(state.code, cityInput) : undefined;
  const empty = !stateInput.trim() || !cityInput.trim();

  return (
    <section className="card">
      <h2>Validate input</h2>
      <p className="muted">
        <code>getState()</code> and <code>findCity()</code> check free-text input and return the canonical spelling.
      </p>
      <div className="stack">
        <label>
          <span>State (name, code or Hindi)</span>
          <input value={stateInput} onChange={(e) => setStateInput(e.target.value)} placeholder="e.g. OR, Orissa, कर्नाटक" />
        </label>
        <label>
          <span>City</span>
          <input value={cityInput} onChange={(e) => setCityInput(e.target.value)} placeholder="e.g. bombay" />
        </label>
      </div>
      {!empty && (
        <div className={`verdict ${city ? 'ok' : 'bad'}`} role="status">
          {city && state ? (
            <>
              ✓ Valid: <strong>{city}</strong>, {state.name} <code>{state.code}</code>
            </>
          ) : state ? (
            <>✗ “{cityInput}” isn't a city in {state.name}</>
          ) : (
            <>✗ Unknown state “{stateInput}”</>
          )}
        </div>
      )}
    </section>
  );
}
