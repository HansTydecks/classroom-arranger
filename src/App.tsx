/**
 * Gerüst der Anwendung: vier Arbeitsschritte, zwei Rechtsseiten, Sprachwahl und Fußzeile.
 */

import { useRef, useState } from 'react';

import { RoomEditor } from './components/RoomEditor';
import { SeatingView } from './components/SeatingView';
import { StudentTable } from './components/StudentTable';
import { WishEditor } from './components/WishEditor';
import { downloadClass, ImportError, readClassFile } from './export/exportJson';
import { useI18n } from './i18n/I18nContext';
import { LANGS } from './i18n';
import { Imprint, Privacy } from './pages/Legal';
import { demoClass } from './fixtures/demoClass';
import { useClassStore } from './state/store';
import { useSolver } from './state/useSolver';
import type { SolveOptions } from './solver/solve';

type View = 'room' | 'class' | 'wishes' | 'plan' | 'imprint' | 'privacy';

const STEPS: View[] = ['room', 'class', 'wishes', 'plan'];

export function App() {
  const { t, lang, setLang } = useI18n();
  const store = useClassStore();
  const { status, run } = useSolver();
  const [view, setView] = useState<View>('room');
  const [message, setMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const solve = (options?: SolveOptions) => run(store.data, options);

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      store.replaceAll(await readClassFile(file));
      setMessage(t('import.done'));
      setView('plan');
    } catch (error) {
      setMessage(error instanceof ImportError ? t(error.key) : t('import.failed'));
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(t('reset.confirm'));
    if (!confirmed) return;
    await store.reset();
    setView('room');
    setMessage(t('reset.done'));
  };

  if (!store.ready) {
    return (
      <div className="app">
        <p className="hint" style={{ padding: 40 }}>
          {t('app.loading')}
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="masthead no-print">
        <div className="title">
          <svg className="logo" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#e8c547" />
            <rect x="6" y="7" width="20" height="2.4" rx="1.2" fill="#30323d" />
            <g fill="#30323d">
              <rect x="6" y="13" width="8" height="5" rx="1.2" />
              <rect x="18" y="13" width="8" height="5" rx="1.2" />
              <rect x="6" y="21" width="8" height="5" rx="1.2" />
              <rect x="18" y="21" width="8" height="5" rx="1.2" />
            </g>
          </svg>
          <div>
            <h1>{t('app.title')}</h1>
            <span className="subtitle">{t('app.subtitle')}</span>
          </div>
        </div>

        <div className="masthead-tools">
          <div className="class-name">
            <label htmlFor="className">{t('app.className')}</label>
            <input
              id="className"
              type="text"
              value={store.data.name}
              placeholder={t('app.classNamePlaceholder')}
              onChange={(event) => store.setName(event.target.value)}
            />
          </div>

          <div className="lang-switch" role="group" aria-label={t('app.language')}>
            {LANGS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                lang={entry.id}
                aria-pressed={lang === entry.id}
                title={entry.name}
                onClick={() => setLang(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <nav className="steps no-print" aria-label={t('app.steps')}>
        {STEPS.map((step, index) => (
          <button
            key={step}
            type="button"
            aria-current={view === step}
            onClick={() => setView(step)}
          >
            <span className="index">{index + 1}</span>
            {t(`step.${step}`)}
          </button>
        ))}
      </nav>

      {message && (
        <p className="notice info no-print">
          {message}{' '}
          <button
            type="button"
            className="button"
            style={{ padding: '1px 8px', marginLeft: 8 }}
            onClick={() => setMessage(null)}
          >
            {t('common.ok')}
          </button>
        </p>
      )}

      <main>
        {view === 'room' && <RoomEditor store={store} />}
        {view === 'class' && <StudentTable store={store} />}
        {view === 'wishes' && <WishEditor store={store} />}
        {view === 'plan' && <SeatingView store={store} status={status} run={solve} />}
        {view === 'imprint' && <Imprint />}
        {view === 'privacy' && <Privacy />}
      </main>

      <footer className="site-footer no-print">
        <button type="button" onClick={() => setView('imprint')}>
          {t('footer.imprint')}
        </button>
        <button type="button" onClick={() => setView('privacy')}>
          {t('footer.privacy')}
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" onClick={() => downloadClass(store.data)}>
          {t('footer.save')}
        </button>
        <button type="button" onClick={() => fileInput.current?.click()}>
          {t('footer.load')}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            void handleImport(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        {store.data.students.length === 0 && (
          <button
            type="button"
            onClick={() => {
              store.replaceAll(demoClass());
              setView('plan');
              setMessage(t('demo.loaded', { count: 28 }));
            }}
          >
            {t('footer.demo')}
          </button>
        )}
        <span aria-hidden="true">·</span>
        <button type="button" onClick={handleReset}>
          {t('footer.reset')}
        </button>
      </footer>
    </div>
  );
}
