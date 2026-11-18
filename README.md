# @vishivish18/india-states-cities

**[Live demo](https://vishivish18.github.io/india-states-cities/)**

All **28 states and 8 union territories of India** with **4,200+ cities**, for building a "pick a state, then a city" form. Typed, zero dependencies, works in Node and the browser, with an optional headless React hook.

```bash
npm install @vishivish18/india-states-cities
```

## Quick start

```ts
import { getStates, getCities } from '@vishivish18/india-states-cities';

getStates();
// [{ code: 'AN', isoCode: 'IN-AN', name: 'Andaman and Nicobar Islands', nameHi: 'अंडमान और निकोबार द्वीपसमूह', type: 'union-territory' }, …]

getCities('KA'); // ['Afzalpur', 'Ajjampur', …, 'Bengaluru', …]
getCities('Karnataka'); // same; names work too
```

## React

A headless hook: it manages the selection and you render whatever UI you like (native `<select>`, MUI, shadcn, …). Picking a different state clears the city.

```tsx
import { useIndiaStateCity } from '@vishivish18/india-states-cities/react';

function AddressFields() {
  const { states, cities, stateCode, city, setState, setCity } = useIndiaStateCity();

  return (
    <>
      <select value={stateCode ?? ''} onChange={(e) => setState(e.target.value || null)}>
        <option value="">Select state</option>
        {states.map((s) => (
          <option key={s.code} value={s.code}>{s.name}</option>
        ))}
      </select>

      <select value={city ?? ''} disabled={!stateCode} onChange={(e) => setCity(e.target.value || null)}>
        <option value="">Select city</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </>
  );
}
```

Options: `useIndiaStateCity({ defaultState: 'MH', defaultCity: 'Pune', stateType: 'state' })`. It also returns `state` (the full object) and `reset()`.

React is an optional peer dependency (17+); the core API never imports it.

## API

<a id="api"></a>

| Function | Returns |
|---|---|
| `getStates({ type? })` | All 36, sorted by name. `type: 'state'` or `'union-territory'` to filter. |
| `getState(codeOrName)` | One state or `undefined`. Accepts `KA`, `IN-KA`, `Karnataka`, `कर्नाटक`, legacy codes (`OR`, `CT`, `TG`, `UT`) and old names (`Orissa`, `Pondicherry`, `Uttaranchal`). |
| `getCities(state)` | City names in that state, A–Z. `[]` for an unknown state. |
| `searchCities(query, { state?, limit? })` | `{ name, stateCode }[]` for autocomplete: exact match first, then prefix, word prefix, contains. Default limit 20. |
| `isValidCity(state, city)` | `true` if the city is in that state. Ignores case, spacing and accents. |
| `findCity(state, city)` | The canonical spelling, e.g. `findCity('KA', 'bangalore')` → `'Bengaluru'`. |
| `countCities(state?)` | Number of cities overall or in one state. |
| `isStateCode(value)` | Type guard for current codes. |

Types: `State`, `StateCode` (a union of all 36 codes), `StateType`, `City`.

### Validating on the server

```ts
import { getState, findCity } from '@vishivish18/india-states-cities';

const state = getState(body.state);
const city = state && findCity(state.code, body.city);
if (!city) throw new BadRequestException('Unknown state or city');
// store state.code and the canonical city name
```

### Former city names

Old names resolve to the current one in `findCity`, `isValidCity` and `searchCities`: Bangalore, Bombay, Madras, Calcutta, Gurgaon, Allahabad, Trivandrum, Vizag, Mysore, Poona, Baroda, Cochin, Benares/Banaras, Mangalore, Belgaum, Hubli, Gulbarga, Simla, Cawnpore.

## Codes

State codes are the current ISO 3166-2:IN codes, so Chhattisgarh is `CG`, Odisha `OD`, Telangana `TS` and Uttarakhand `UK`. The older codes (`CT`, `OR`, `TG`, `UT`) still work as input to every function.

## Data

City data comes from the [countries-states-cities database](https://github.com/dr5hn/countries-states-cities-database) (ODbL-1.0), filtered for this package:

- Districts, "area" rows and abandoned towns are dropped; cities, towns, municipalities and urban localities are kept.
- Duplicates within a state are removed and names are trimmed.
- A few fixes on top: Kalaburagi added (missing upstream), two Hindi state names corrected.

To refresh the data:

```bash
curl -LO https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/csv/states.csv
curl -L -o IN.json https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/contributions/cities/IN.json
npm run data -- states.csv IN.json && npm test
```

The build script checks there are exactly 28 states and 8 UTs, that every state has cities and that every former-name target exists, and fails otherwise.

The list covers cities and towns, not every village. If a city is missing, open an issue or add it to `SUPPLEMENT` in `scripts/build-data.mjs`.

## Licence

Code: MIT. Data: ODbL-1.0; see [DATA_LICENSE.md](./DATA_LICENSE.md) for the attribution requirements.
