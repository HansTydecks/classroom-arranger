import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { detectLang, formatMsg, makeTranslate, rememberLang } from './index';
import type { Lang, Translate } from './index';
import type { Msg } from './message';

interface I18nValue {
  lang: Lang;
  setLang(lang: Lang): void;
  t: Translate;
  /** Meldung aus Solver / Validierung / Bericht in der aktuellen Sprache. */
  m(message: Msg): string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    rememberLang(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = makeTranslate(lang)('app.title');
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({ lang, setLang, t: makeTranslate(lang), m: (message) => formatMsg(lang, message) }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n außerhalb des I18nProvider verwendet');
  return value;
}
