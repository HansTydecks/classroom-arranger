/**
 * Gerüst der Anwendung: vier Arbeitsschritte, zwei Rechtsseiten, eine Fußzeile.
 */

import { useRef, useState } from 'react';

import { RoomEditor } from './components/RoomEditor';
import { SeatingView } from './components/SeatingView';
import { StudentTable } from './components/StudentTable';
import { WishEditor } from './components/WishEditor';
import { downloadClass, readClassFile } from './export/exportJson';
import { Imprint, Privacy } from './pages/Legal';
import { demoClass } from './fixtures/demoClass';
import { useClassStore } from './state/store';
import { useSolver } from './state/useSolver';
import type { SolveOptions } from './solver/solve';

type View = 'room' | 'class' | 'wishes' | 'plan' | 'imprint' | 'privacy';

const STEPS: Array<{ id: View; label: string }> = [
  { id: 'room', label: 'Klassenzimmer' },
  { id: 'class', label: 'Klasse' },
  { id: 'wishes', label: 'Wünsche & Regeln' },
  { id: 'plan', label: 'Sitzplan' },
];

export function App() {
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
      setMessage('Daten geladen.');
      setView('plan');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Die Datei konnte nicht gelesen werden.');
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Alle gespeicherten Daten dieser Anwendung unwiderruflich löschen?\n\n' +
        'Namen, Wünsche, Trennungen und der Sitzplan gehen dabei verloren. ' +
        'Sichern Sie vorher gegebenenfalls über „Daten sichern“.',
    );
    if (!confirmed) return;
    await store.reset();
    setView('room');
    setMessage('Alle Daten wurden gelöscht.');
  };

  if (!store.ready) {
    return (
      <div className="app">
        <p className="hint" style={{ padding: 40 }}>
          Gespeicherte Daten werden geladen …
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="masthead no-print">
        <div className="title">
          <h1>Sitzplan-Generator</h1>
          <span className="subtitle">läuft vollständig im Browser · keine Datenübertragung</span>
        </div>
        <div style={{ minWidth: 180 }}>
          <label htmlFor="className">Klasse</label>
          <input
            id="className"
            type="text"
            value={store.data.name}
            placeholder="z. B. 7b"
            onChange={(event) => store.setName(event.target.value)}
          />
        </div>
      </header>

      <nav className="steps no-print" aria-label="Arbeitsschritte">
        {STEPS.map((step, index) => (
          <button
            key={step.id}
            type="button"
            aria-current={view === step.id}
            onClick={() => setView(step.id)}
          >
            <span className="index">{index + 1}</span>
            {step.label}
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
            ok
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
          Impressum
        </button>
        <button type="button" onClick={() => setView('privacy')}>
          Datenschutz
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" onClick={() => downloadClass(store.data)}>
          Daten sichern
        </button>
        <button type="button" onClick={() => fileInput.current?.click()}>
          Sicherung laden
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
              setMessage('Beispielklasse geladen — 28 Personen mit Wünschen und Trennungen.');
            }}
          >
            Beispielklasse laden
          </button>
        )}
        <span aria-hidden="true">·</span>
        <button type="button" onClick={handleReset}>
          Alle Daten löschen
        </button>
      </footer>
    </div>
  );
}
