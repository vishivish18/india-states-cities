import { countCities, getStates } from '@vishivish18/india-states-cities';

interface Props {
  selected: string | null;
  onPick: (code: string) => void;
}

export function Browse({ selected, onPick }: Props) {
  return (
    <section className="card">
      <h2>All states and union territories</h2>
      <p className="muted">Click one to load it in the picker above.</p>
      <ul className="states">
        {getStates().map((s) => (
          <li key={s.code}>
            <button type="button" aria-pressed={selected === s.code} onClick={() => onPick(s.code)}>
              <span className="code-badge">{s.code}</span>
              <span className="state-name">
                {s.name}
                <small lang="hi">{s.nameHi}</small>
              </span>
              <span className="count">
                {countCities(s.code).toLocaleString('en-IN')}
                {s.type === 'union-territory' && <small>UT</small>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
