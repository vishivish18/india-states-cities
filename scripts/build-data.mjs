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
import { ALIASES, EXCLUDE, RENAMES, SUPPLEMENT } from './corrections.mjs';

const [statesCsvPath, citiesJsonPath] = process.argv.slice(2);
if (!statesCsvPath || !citiesJsonPath) {
  console.error('usage: node scripts/build-data.mjs <states.csv> <cities-IN.json>');
  process.exit(1);
}

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');

// Place types in the dataset that are not a city/town a person would pick.
const EXCLUDED_TYPES = new Set(['area', 'district', 'abandoned', 'cities']);

// Corrections to Hindi state names in the dataset (ISO code → correct name).
const NAME_HI_FIXES = {
  'IN-AN': 'अंडमान और निकोबार द्वीपसमूह',
  'IN-CG': 'छत्तीसगढ़',
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
const knownCodes = new Set(states.map((s) => s.code));
const checkState = (code, where) => { if (!knownCodes.has(code)) fail(`${where}: unknown state ${code}`); };
let skipped = 0;
for (const c of rawCities) {
  const name = typeof c.name === 'string' ? c.name.trim().replace(/\s+/g, ' ') : '';
  const code = byDatasetCode.get(c.state_code);
  if (!name || !code || c.country_code !== 'IN') { skipped++; continue; }
  if (EXCLUDED_TYPES.has(c.type) || / (District|Division)$/i.test(name)) { skipped++; continue; }
  citiesByState[code].add(name);
}

// Excluded rows
for (const [code, names] of Object.entries(EXCLUDE)) {
  checkState(code, 'EXCLUDE');
  for (const name of names) if (!citiesByState[code].delete(name)) fail(`EXCLUDE: ${code} ${name} not in dataset`);
}

// Renames: dataset name → official name; the old name becomes an alias.
const aliasesByState = Object.fromEntries(states.map((s) => [s.code, {}]));
for (const [code, map] of Object.entries(RENAMES)) {
  checkState(code, 'RENAMES');
  for (const [from, to] of Object.entries(map)) {
    if (!citiesByState[code].delete(from)) fail(`RENAMES: ${code} ${from} not in dataset`);
    if (citiesByState[code].has(to)) fail(`RENAMES: ${code} ${to} already exists`);
    citiesByState[code].add(to);
    aliasesByState[code][from] = to;
  }
}

// Supplement: places missing from the dataset.
for (const [code, names] of Object.entries(SUPPLEMENT)) {
  checkState(code, 'SUPPLEMENT');
  for (const name of names) {
    if (citiesByState[code].has(name)) fail(`SUPPLEMENT: ${code} ${name} is already in the dataset; remove it from SUPPLEMENT`);
    citiesByState[code].add(name);
  }
}

const cities = Object.fromEntries(
  Object.entries(citiesByState).map(([code, set]) => [code, [...set].sort((a, b) => a.localeCompare(b))]),
);
for (const [code, list] of Object.entries(cities)) if (list.length === 0) fail(`no cities for ${code}`);

// Aliases (per state): every target must exist in that state, and an alias must not shadow a real city.
for (const [code, map] of Object.entries(ALIASES)) {
  checkState(code, 'ALIASES');
  for (const [alias, target] of Object.entries(map)) {
    if (!citiesByState[code].has(target)) fail(`ALIASES: ${code} ${alias} → ${target}: target not found`);
    if (citiesByState[code].has(alias)) fail(`ALIASES: ${code} ${alias} is itself a city`);
    aliasesByState[code][alias] = target;
  }
}
const aliases = Object.fromEntries(
  Object.entries(aliasesByState).filter(([, m]) => Object.keys(m).length).map(([code, m]) => [code, Object.fromEntries(Object.entries(m).sort())]),
);
const aliasCount = Object.values(aliases).reduce((n, m) => n + Object.keys(m).length, 0);

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
  `${banner}import type { StateCode } from '../types';\n\n/** Per state: alternative city name (former, short, or municipal-corporation name) → name in CITIES. */\nexport const CITY_ALIASES: Readonly<Partial<Record<StateCode, Readonly<Record<string, string>>>>> = ${JSON.stringify(aliases, null, 2)};\n`,
);
const codesUnion = states.map((s) => `'${s.code}'`).join(' | ');
writeFileSync(join(OUT_DIR, 'codes.ts'), `${banner}\nexport type StateCode = ${codesUnion};\n`);

const total = Object.values(cities).reduce((n, l) => n + l.length, 0);
console.log(`states: ${states.length} (${stateCount} states, ${utCount} UTs); cities: ${total}; skipped rows: ${skipped}; aliases: ${aliasCount}`);
