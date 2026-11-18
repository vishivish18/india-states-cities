import { useEffect, useState } from 'react';
import { countCities, getStates, type StateType } from '@vishivish18/india-states-cities';
import { useIndiaStateCity } from '@vishivish18/india-states-cities/react';
import { Browse } from './Browse';
import { CopyButton } from './CopyButton';
import { Picker } from './Picker';
import { Search } from './Search';
import { Validate } from './Validate';

const REPO_URL = 'https://github.com/vishivish18/india-states-cities';
const NPM_URL = 'https://www.npmjs.com/package/@vishivish18/india-states-cities';
const INSTALL = 'npm install @vishivish18/india-states-cities';

export function App() {
  const [filter, setFilter] = useState<StateType | 'all'>('all');
  const picker = useIndiaStateCity({ stateType: filter === 'all' ? undefined : filter });

  // Drop a selection the new filter hides.
  const { state, setState } = picker;
  useEffect(() => {
    if (state && filter !== 'all' && state.type !== filter) setState(null);
  }, [filter, state, setState]);

  const pickFromBrowse = (code: string) => {
    setFilter('all');
    setState(code);
    document.getElementById('picker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <header className="hero">
        <div className="wrap">
          <p className="eyebrow">npm package</p>
          <h1>@vishivish18/india-states-cities</h1>
          <p className="lede">
            Every Indian state and union territory, with its cities, for "pick a state, then a city" forms. Typed,
            zero dependencies, with a headless React hook.
          </p>
          <div className="install">
            <code>{INSTALL}</code>
            <CopyButton text={INSTALL} />
          </div>
          <dl className="stats">
            <div><dt>States</dt><dd>{getStates({ type: 'state' }).length}</dd></div>
            <div><dt>Union territories</dt><dd>{getStates({ type: 'union-territory' }).length}</dd></div>
            <div><dt>Cities</dt><dd>{countCities().toLocaleString('en-IN')}</dd></div>
            <div><dt>Gzipped</dt><dd>~25 KB</dd></div>
          </dl>
          <nav className="links">
            <a href={REPO_URL}>GitHub</a>
            <a href={NPM_URL}>npm</a>
            <a href={`${REPO_URL}#api`}>API docs</a>
          </nav>
        </div>
      </header>

      <main className="wrap">
        <Picker picker={picker} filter={filter} onFilterChange={setFilter} />
        <div className="grid-2">
          <Search />
          <Validate />
        </div>
        <Browse selected={picker.stateCode} onPick={pickFromBrowse} />
      </main>

      <footer className="wrap footer">
        <p>
          Code MIT. City data from the{' '}
          <a href="https://github.com/dr5hn/countries-states-cities-database">countries-states-cities database</a>{' '}
          (ODbL-1.0), filtered and corrected for India.
        </p>
      </footer>
    </>
  );
}
