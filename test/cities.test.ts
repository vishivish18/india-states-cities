import { describe, expect, it } from 'vitest';
import { countCities, findCity, getCities, getStates, isValidCity, searchCities } from '../src';

describe('getCities', () => {
  it('returns sorted, unique cities for every state', () => {
    for (const s of getStates()) {
      const cities = getCities(s.code);
      expect(cities.length, s.name).toBeGreaterThan(0);
      expect(new Set(cities).size, s.name).toBe(cities.length);
      expect([...cities], s.name).toEqual([...cities].sort((a, b) => a.localeCompare(b)));
    }
  });

  it('accepts names and legacy codes', () => {
    expect(getCities('Karnataka')).toBe(getCities('KA'));
    expect(getCities('OR')).toBe(getCities('OD'));
  });

  it.each([
    ['MH', 'Mumbai'],
    ['MH', 'Pune'],
    ['WB', 'Kolkata'],
    ['TN', 'Chennai'],
    ['KA', 'Bengaluru'],
    ['KA', 'Kalaburagi'],
    ['TS', 'Hyderabad'],
    ['HR', 'Gurugram'],
    ['UP', 'Noida'],
    ['UP', 'Lucknow'],
    ['DL', 'New Delhi'],
    ['KL', 'Thiruvananthapuram'],
    ['AP', 'Visakhapatnam'],
    ['GJ', 'Ahmedabad'],
    ['RJ', 'Jaipur'],
    ['CH', 'Chandigarh'],
  ])('%s includes %s', (state, city) => {
    expect(getCities(state)).toContain(city);
  });

  it('leaves out districts and non-city rows', () => {
    expect(getCities('KA')).not.toContain('Bengaluru Urban');
    expect(getCities('SK')).not.toContain('East');
    expect(getCities('UP').some((c) => / District$/.test(c))).toBe(false);
  });

  it('returns [] for an unknown state', () => {
    expect(getCities('XX')).toEqual([]);
  });

  it('counts cities', () => {
    expect(countCities()).toBeGreaterThan(4000);
    expect(countCities('KA')).toBe(getCities('KA').length);
    expect(countCities('XX')).toBe(0);
  });
});

describe('isValidCity / findCity', () => {
  it('matches regardless of case, spacing and accents', () => {
    expect(isValidCity('MH', 'mumbai')).toBe(true);
    expect(isValidCity('Maharashtra', '  MUMBAI ')).toBe(true);
    expect(findCity('DL', 'new-delhi')).toBe('New Delhi');
  });

  it('accepts former names and returns the current one', () => {
    expect(findCity('KA', 'Bangalore')).toBe('Bengaluru');
    expect(findCity('MH', 'Bombay')).toBe('Mumbai');
    expect(findCity('WB', 'Calcutta')).toBe('Kolkata');
    expect(findCity('HR', 'Gurgaon')).toBe('Gurugram');
    expect(findCity('KA', 'Gulbarga')).toBe('Kalaburagi');
  });

  it('rejects cities from another state', () => {
    expect(isValidCity('KA', 'Mumbai')).toBe(false);
    expect(findCity('MH', 'Bangalore')).toBeUndefined();
  });

  it('rejects empty and unknown input', () => {
    expect(isValidCity('KA', '')).toBe(false);
    expect(isValidCity('XX', 'Mumbai')).toBe(false);
    expect(isValidCity('KA', null as unknown as string)).toBe(false);
  });
});

describe('searchCities', () => {
  it('ranks exact, then prefix, then word prefix, then contains', () => {
    const names = searchCities('pur', { state: 'RJ', limit: 50 }).map((c) => c.name);
    expect(names.length).toBeGreaterThan(0);
    const firstContainsOnly = names.findIndex((n) => !n.toLowerCase().split(/\s+/).some((w) => w.startsWith('pur')));
    const lastPrefix = names.map((n) => n.toLowerCase().startsWith('pur')).lastIndexOf(true);
    if (firstContainsOnly >= 0 && lastPrefix >= 0) expect(lastPrefix).toBeLessThan(firstContainsOnly);
  });

  it('puts the exact match first', () => {
    expect(searchCities('pune')[0]).toEqual({ name: 'Pune', stateCode: 'MH' });
  });

  it('finds a city by its former name', () => {
    expect(searchCities('bangalore')[0]).toEqual({ name: 'Bengaluru', stateCode: 'KA' });
  });

  it('matches partial former names', () => {
    expect(searchCities('gurg').map((c) => c.name)).toContain('Gurugram');
    expect(searchCities('bomb')[0]?.name).toBe('Mumbai');
  });

  it('filters by state and respects limit', () => {
    const results = searchCities('a', { state: 'Kerala', limit: 5 });
    expect(results).toHaveLength(5);
    for (const c of results) expect(c.stateCode).toBe('KL');
  });

  it('returns [] for empty query, unknown state, or limit 0', () => {
    expect(searchCities('')).toEqual([]);
    expect(searchCities('   ')).toEqual([]);
    expect(searchCities('pune', { state: 'XX' })).toEqual([]);
    expect(searchCities('pune', { limit: 0 })).toEqual([]);
  });
});
