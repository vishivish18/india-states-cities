#!/usr/bin/env node
// Builds src/data/*.ts from the dr5hn countries-states-cities dataset (ODbL-1.0).
//
//   node scripts/build-data.mjs <states.csv> <cities-IN.json>
//
// Sources:
//   https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/csv/states.csv
//   https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/contributions/cities/IN.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [statesCsvPath, citiesJsonPath] = process.argv.slice(2);
if (!statesCsvPath || !citiesJsonPath) {
  console.error('usage: node scripts/build-data.mjs <states.csv> <cities-IN.json>');
  process.exit(1);
}

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');

// Place types in the dataset that are not a city/town a person would pick.
const EXCLUDED_TYPES = new Set(['area', 'district', 'abandoned', 'cities']);

// Well-known cities missing from the dataset, added by hand (state code → names).
const SUPPLEMENT = {
  KA: ['Kalaburagi'],
};

// Corrections to Hindi state names in the dataset (ISO code → correct name).
const NAME_HI_FIXES = {
  'IN-AN': 'अंडमान और निकोबार द्वीपसमूह',
  'IN-CG': 'छत्तीसगढ़',
};

// Former / colloquial names → current name in the dataset. Every target is verified below.
const CITY_ALIASES = {
  Bangalore: 'Bengaluru',
  Bombay: 'Mumbai',
  Madras: 'Chennai',
  Calcutta: 'Kolkata',
  Gurgaon: 'Gurugram',
  Allahabad: 'Prayagraj',
  Trivandrum: 'Thiruvananthapuram',
  Vizag: 'Visakhapatnam',
  Mysore: 'Mysuru',
  Poona: 'Pune',
  Baroda: 'Vadodara',
  Cochin: 'Kochi',
  Benares: 'Varanasi',
  Banaras: 'Varanasi',
  Mangalore: 'Mangaluru',
  Belgaum: 'Belagavi',
  Hubli: 'Hubballi',
  Gulbarga: 'Kalaburagi',
  Simla: 'Shimla',
  Cawnpore: 'Kanpur',
};

/** Minimal RFC 4180 CSV parser (quoted fields, escaped quotes). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

function fail(msg) {
  console.error(`build-data: ${msg}`);
  process.exit(1);
}

// ---- states ----
const stateRows = parseCsv(readFileSync(statesCsvPath, 'utf8')).filter((r) => r.country_code === 'IN');
const states = stateRows
  .map((r) => {
    const iso = r.iso3166_2;
    if (!/^IN-[A-Z]{2}$/.test(iso)) fail(`bad ISO code for ${r.name}: ${iso}`);
    const type = r.type === 'state' ? 'state' : r.type === 'union territory' ? 'union-territory' : fail(`unknown type ${r.type}`);
    return { code: iso.slice(3), datasetCode: r.iso2, isoCode: iso, name: r.name.trim(), nameHi: NAME_HI_FIXES[iso] ?? r.native.trim(), type };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const stateCount = states.filter((s) => s.type === 'state').length;
const utCount = states.filter((s) => s.type === 'union-territory').length;
if (stateCount !== 28 || utCount !== 8) fail(`expected 28 states + 8 UTs, got ${stateCount} + ${utCount}`);

const byDatasetCode = new Map(states.map((s) => [s.datasetCode, s.code]));

// ---- cities ----
const rawCities = JSON.parse(readFileSync(citiesJsonPath, 'utf8'));
if (!Array.isArray(rawCities)) fail('cities file is not an array');

const citiesByState = Object.fromEntries(states.map((s) => [s.code, new Set()]));
let skipped = 0;
for (const c of rawCities) {
  const name = typeof c.name === 'string' ? c.name.trim().replace(/\s+/g, ' ') : '';
  const code = byDatasetCode.get(c.state_code);
  if (!name || !code || c.country_code !== 'IN') { skipped++; continue; }
  if (EXCLUDED_TYPES.has(c.type) || / District$/i.test(name)) { skipped++; continue; }
  citiesByState[code].add(name);
}

for (const [code, names] of Object.entries(SUPPLEMENT)) {
  if (!citiesByState[code]) fail(`supplement has unknown state ${code}`);
  for (const name of names) citiesByState[code].add(name);
}

const cities = Object.fromEntries(
  Object.entries(citiesByState).map(([code, set]) => [code, [...set].sort((a, b) => a.localeCompare(b))]),
);
for (const [code, list] of Object.entries(cities)) if (list.length === 0) fail(`no cities for ${code}`);

// ---- aliases (verify targets exist) ----
const aliases = {};
for (const [alias, target] of Object.entries(CITY_ALIASES)) {
  const stateCodes = Object.keys(cities).filter((code) => cities[code].includes(target));
  if (stateCodes.length === 0) fail(`alias target not found: ${alias} → ${target}`);
  aliases[alias] = target;
}

// ---- write ----
const banner = `// AUTO-GENERATED by scripts/build-data.mjs — do not edit by hand.
// Data: dr5hn/countries-states-cities-database, ODbL-1.0 (see DATA_LICENSE.md).
`;
const statesOut = states.map(({ datasetCode, ...s }) => s);
writeFileSync(
  join(OUT_DIR, 'states.ts'),
  `${banner}import type { State } from '../types';\n\nexport const STATES: readonly State[] = ${JSON.stringify(statesOut, null, 2)};\n`,
);
writeFileSync(
  join(OUT_DIR, 'cities.ts'),
  `${banner}import type { StateCode } from '../types';\n\nexport const CITIES: Readonly<Record<StateCode, readonly string[]>> = ${JSON.stringify(cities)};\n`,
);
writeFileSync(
  join(OUT_DIR, 'aliases.ts'),
  `${banner}\n/** Former or colloquial city names → current name. */\nexport const CITY_ALIASES: Readonly<Record<string, string>> = ${JSON.stringify(aliases, null, 2)};\n`,
);
const codesUnion = states.map((s) => `'${s.code}'`).join(' | ');
writeFileSync(join(OUT_DIR, 'codes.ts'), `${banner}\nexport type StateCode = ${codesUnion};\n`);

const total = Object.values(cities).reduce((n, l) => n + l.length, 0);
console.log(`states: ${states.length} (${stateCount} states, ${utCount} UTs); cities: ${total}; skipped rows: ${skipped}; aliases: ${Object.keys(aliases).length}`);
