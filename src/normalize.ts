const LATIN_ACCENTS = /[\u0300-\u036f]/g;
const SEPARATORS = /[^\p{L}\p{M}\p{N}]+/gu;

/**
 * Lower-cases, strips Latin accents and punctuation, and collapses whitespace so "  Tamil-Nadu " matches
 * "tamil nadu". Devanagari vowel signs are kept, so Hindi names still compare correctly.
 */
export function normalize(value: string): string {
  return value.normalize('NFD').replace(LATIN_ACCENTS, '').toLowerCase().replace(SEPARATORS, ' ').trim();
}
