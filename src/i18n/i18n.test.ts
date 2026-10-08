import { describe, expect, it } from 'vitest';

import { LANGS, formatMsg, translate } from './index';
import { de } from './locales/de';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { msg } from './message';

const catalogs = { de, en, fr, es } as Record<string, Record<string, string>>;

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]!).sort();
}

describe('i18n', () => {
  it('bietet alle vier Sprachen an', () => {
    expect(LANGS.map((l) => l.id).sort()).toEqual(['de', 'en', 'es', 'fr']);
  });

  it.each(['en', 'fr', 'es'])('%s hat dieselben Schlüssel und Platzhalter wie de', (lang) => {
    const reference = catalogs.de!;
    const other = catalogs[lang]!;
    expect(Object.keys(other).sort()).toEqual(Object.keys(reference).sort());
    for (const key of Object.keys(reference)) {
      expect(other[key], key).toBeTruthy();
      expect(placeholders(other[key]!), key).toEqual(placeholders(reference[key]!));
    }
  });

  it('ersetzt Platzhalter und wählt die Pluralform', () => {
    expect(translate('en', 'class.count_one', { count: 1, seats: 4 })).toBe('1 student, 4 seats');
    expect(translate('en', 'class.count_other', { count: 5, seats: 4 })).toBe('5 students, 4 seats');
    expect(formatMsg('en', msg('class.count', { count: 1, seats: 2 }))).toContain('1 student');
    expect(formatMsg('fr', msg('class.count', { count: 3, seats: 2 }))).toContain('élèves');
  });

  it('übersetzt Regelnamen in Meldungen', () => {
    const text = formatMsg('en', msg('violation.hardRule', { name: 'Ida', rules: { rules: ['front'] } }));
    expect(text).toContain('Ida');
    expect(text).toContain('front');
  });
});
