import { describe, it, expect } from 'vitest';
import { containsProfanity } from './profanity';

describe('containsProfanity', () => {
  it('returns false for clean song titles', () => {
    expect(containsProfanity('September')).toBe(false);
    expect(containsProfanity('Marry You')).toBe(false);
    expect(containsProfanity('Atemlos durch die Nacht')).toBe(false);
    expect(containsProfanity('99 Luftballons')).toBe(false);
  });

  it('blocks German profanity', () => {
    expect(containsProfanity('Hurensohn-Song')).toBe(true);
    expect(containsProfanity('Scheiß auf alles')).toBe(true);
    expect(containsProfanity('Arschloch-Beat')).toBe(true);
  });

  it('blocks English profanity', () => {
    expect(containsProfanity('Fuck the System')).toBe(true);
    expect(containsProfanity('This Shit')).toBe(true);
    expect(containsProfanity('Bitch Better Have My Money')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(containsProfanity('FUCK')).toBe(true);
    expect(containsProfanity('Scheisse')).toBe(true);
    expect(containsProfanity('SHIT')).toBe(true);
  });

  it('blocks racial slurs', () => {
    // Important: these are real songs/words that should be filtered.
    // We avoid putting the slurs themselves in the test description.
    expect(containsProfanity('n-word phrase')).toBe(false); // safe placeholder
    expect(containsProfanity('nigga')).toBe(true);
    expect(containsProfanity('nigger')).toBe(true);
    expect(containsProfanity('faggot')).toBe(true);
  });

  it('handles empty input', () => {
    expect(containsProfanity('')).toBe(false);
  });

  it('blocks profanity embedded in larger strings', () => {
    expect(containsProfanity('Song titled Hurensohn Edit')).toBe(true);
    expect(containsProfanity('Remix - fucking awesome')).toBe(true);
    // Substring-match: "fuckin" contains "fuck" → also blocked. Conservative is fine here.
    expect(containsProfanity('Remix - fuckin awesome')).toBe(true);
  });
});
