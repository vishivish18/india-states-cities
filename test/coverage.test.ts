import { describe, expect, it } from 'vitest';
import { findCity, getCities } from '../src';
import reference from './reference-places.json';

// Every state/UT capital, every district headquarters and every city with 100k+ people (Census 2011),
// taken from Wikipedia's "List of districts in India" and "List of cities in India by population".
interface ReferencePlace {
  state: string;
  name: string;
  sources: string[];
}
const places = reference as ReferencePlace[];

describe('coverage of reference places', () => {
  it('has the full reference list', () => {
    expect(places.length).toBeGreaterThan(850);
  });

  it('resolves every capital, district headquarters and 100k+ city in its own state', () => {
    const missing = places.filter((p) => !findCity(p.state, p.name)).map((p) => `${p.state} ${p.name} (${p.sources.join(', ')})`);
    expect(missing).toEqual([]);
  });

  it('resolves each place to a name that is in the dropdown list', () => {
    for (const p of places) expect(getCities(p.state)).toContain(findCity(p.state, p.name));
  });
});

describe('well-known towns outside the reference lists', () => {
  it.each([
    ['PB', 'Zirakpur'], ['HP', 'McLeod Ganj'], ['UK', 'Kedarnath'], ['TN', 'Udhagamandalam'], ['TN', 'Ooty'],
    ['MH', 'Lonavala'], ['KL', 'Calicut'], ['OD', 'Konark'], ['RJ', 'Mount Abu'], ['JK', 'Gulmarg'], ['JK', 'Pahalgam'],
    ['GJ', 'Somnath'], ['MP', 'Khajuraho'], ['SK', 'Pelling'], ['ML', 'Sohra'], ['AN', 'Havelock'],
    ['UP', 'Greater Noida'], ['TS', 'Secunderabad'], ['HR', 'Panchkula'], ['MH', 'Navi Mumbai'], ['WB', 'Darjeeling'],
  ])('%s %s', (state, city) => {
    expect(findCity(state, city)).toBeTruthy();
  });
});

describe('per-state alternative names', () => {
  it('resolves the same old name differently by state', () => {
    expect(findCity('OD', 'Berhampur')).toBe('Brahmapur');
    expect(findCity('WB', 'Berhampore')).toBe('Baharampur');
    expect(findCity('MH', 'Aurangabad')).toBe('Chhatrapati Sambhajinagar');
    expect(findCity('BR', 'Aurangabad')).toBe('Aurangabad');
  });

  it('does not apply an alias outside its state', () => {
    expect(findCity('MH', 'Bangalore')).toBeUndefined();
    expect(findCity('UP', 'Margao')).toBeUndefined();
  });

  it('keeps renamed dataset spellings working', () => {
    expect(findCity('HP', 'Kulu')).toBe('Kullu');
    expect(findCity('UK', 'Naini Tal')).toBe('Nainital');
    expect(findCity('AP', 'Cuddapah')).toBe('Kadapa');
    expect(getCities('HP')).not.toContain('Kulu');
  });
});
