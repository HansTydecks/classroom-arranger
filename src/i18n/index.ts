/**
 * Mehrsprachigkeit ohne Bibliothek: Deutsch, Englisch, Französisch, Spanisch.
 *
 * Die Texte liegen als flache Schlüssel-Wert-Tabellen in `locales/`. Deutsch ist die
 * Referenz; der Compiler stellt sicher, dass die anderen Sprachen dieselben Schlüssel
 * enthalten. Platzhalter stehen in `{geschweiften Klammern}`; für Mehrzahlformen gibt
 * es Varianten `schluessel_one` / `schluessel_other` (nach `Intl.PluralRules`).
 */

import { de } from './locales/de';
import type { Messages } from './locales/de';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import type { Msg, MsgParam } from './message';

export type Lang = 'de' | 'en' | 'fr' | 'es';

export const LANGS: Array<{ id: Lang; label: string; name: string }> = [
  { id: 'de', label: 'DE', name: 'Deutsch' },
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'fr', label: 'FR', name: 'Français' },
  { id: 'es', label: 'ES', name: 'Español' },
];

const CATALOGS: Record<Lang, Messages> = { de, en, fr, es };

const LANG_STORAGE_KEY = 'classroom-arranger.lang';

export function isLang(value: unknown): value is Lang {
  return value === 'de' || value === 'en' || value === 'fr' || value === 'es';
}

/** Gespeicherte Sprache, sonst die Browsersprache, sonst Deutsch. */
export function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // localStorage nicht verfügbar — dann eben die Browsersprache.
  }
  const candidates = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language]);
  for (const candidate of candidates) {
    const base = candidate?.slice(0, 2).toLowerCase();
    if (isLang(base)) return base;
  }
  return 'de';
}

/** Merkt sich die Sprachwahl. Enthält keine personenbezogenen Daten. */
export function rememberLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // nicht schlimm
  }
}

function listFormat(lang: Lang, items: string[]): string {
  try {
    return new Intl.ListFormat(lang, { style: 'long', type: 'conjunction' }).format(items);
  } catch {
    return items.join(', ');
  }
}

function lookup(lang: Lang, key: string): string | undefined {
  const catalog = CATALOGS[lang] as Record<string, string>;
  return catalog[key] ?? (de as Record<string, string>)[key];
}

export type Translate = (key: string, params?: Record<string, MsgParam>) => string;

/** Übersetzt einen Schlüssel; unbekannte Schlüssel erscheinen unverändert. */
export function translate(
  lang: Lang,
  key: string,
  params: Record<string, MsgParam> = {},
): string {
  let template: string | undefined;
  const count = params.count;
  if (typeof count === 'number') {
    const form = new Intl.PluralRules(lang).select(count);
    template = lookup(lang, `${key}_${form}`) ?? lookup(lang, `${key}_other`);
  }
  template ??= lookup(lang, key);
  if (template === undefined) return key;

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name];
    if (value === undefined) return placeholder;
    if (Array.isArray(value)) return listFormat(lang, value);
    if (typeof value === 'object') {
      return listFormat(
        lang,
        value.rules.map((rule) => translate(lang, `rule.${rule}.short`)),
      );
    }
    return String(value);
  });
}

export function makeTranslate(lang: Lang): Translate {
  return (key, params) => translate(lang, key, params);
}

/** Setzt eine sprachneutrale Meldung in der gewählten Sprache zusammen. */
export function formatMsg(lang: Lang, message: Msg): string {
  return translate(lang, message.key, message.params);
}
