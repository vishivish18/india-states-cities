import { describe, expect, it } from 'vitest';
import { getState, getStates, isStateCode } from '../src';

describe('getStates', () => {
  it('returns 28 states and 8 union territories, sorted by name', () => {
    const all = getStates();
    expect(all).toHaveLength(36);
    expect(getStates({ type: 'state' })).toHaveLength(28);
    expect(getStates({ type: 'union-territory' })).toHaveLength(8);
    const names = all.map((s) => s.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('uses current ISO 3166-2 codes', () => {
    const codes = getStates().map((s) => s.code);
    expect(codes).toEqual(expect.arrayContaining(['CG', 'OD', 'TS', 'UK', 'DH', 'LA']));
    expect(codes).not.toEqual(expect.arrayContaining(['CT']));
    for (const s of getStates()) expect(s.isoCode).toBe(`IN-${s.code}`);
  });

  it('classifies union territories correctly', () => {
    const uts = getStates({ type: 'union-territory' }).map((s) => s.code).sort();
    expect(uts).toEqual(['AN', 'CH', 'DH', 'DL', 'JK', 'LA', 'LD', 'PY']);
  });

  it('has a Hindi name for every state', () => {
    for (const s of getStates()) expect(s.nameHi).toMatch(/[ऀ-ॿ]/);
  });
});

describe('getState', () => {
  it.each([
    ['KA', 'KA'],
    ['ka', 'KA'],
    ['IN-KA', 'KA'],
    ['Karnataka', 'KA'],
    ['  karnataka ', 'KA'],
    ['Tamil-Nadu', 'TN'],
    ['कर्नाटक', 'KA'],
    ['OR', 'OD'],
    ['CT', 'CG'],
    ['TG', 'TS'],
    ['UT', 'UK'],
    ['DD', 'DH'],
    ['Orissa', 'OD'],
    ['Pondicherry', 'PY'],
    ['Uttaranchal', 'UK'],
    ['NCT of Delhi', 'DL'],
    ['Jammu & Kashmir', 'JK'],
    ['Andaman & Nicobar', 'AN'],
  ])('finds %s → %s', (input, code) => {
    expect(getState(input)?.code).toBe(code);
  });

  it.each(['', '   ', 'XX', 'Atlantis', 'IN-'])('returns undefined for %j', (input) => {
    expect(getState(input)).toBeUndefined();
  });

  it('returns undefined for non-strings', () => {
    expect(getState(undefined as unknown as string)).toBeUndefined();
    expect(getState(42 as unknown as string)).toBeUndefined();
  });
});

describe('isStateCode', () => {
  it('accepts current codes only', () => {
    expect(isStateCode('KA')).toBe(true);
    expect(isStateCode('ka')).toBe(false);
    expect(isStateCode('OR')).toBe(false);
    expect(isStateCode(null)).toBe(false);
  });
});
