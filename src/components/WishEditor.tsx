/**
 * Schritt 3: Wünsche, Sonderwünsche und Trennungen erfassen.
 */

import { useMemo, useState } from 'react';

import { buildLabels } from '../domain/names';
import { buildRoom } from '../domain/roomTemplates';
import type { ClassStore } from '../state/store';
import type { SpecialKind, Student } from '../types/model';
import { MAX_WISHES } from '../types/model';

const SPECIAL_LABELS: Record<SpecialKind, string> = {
  front: 'vorne',
  notBack: 'nicht hinten',
  window: 'Fenster',
  aisle: 'Gang',
  notDoor: 'nicht an der Tür',
  maxRow: 'höchstens Reihe',
};

const SPECIAL_ORDER: SpecialKind[] = ['front', 'notBack', 'window', 'aisle', 'notDoor', 'maxRow'];

const WISH_LABELS = ['Erstwunsch', 'Zweitwunsch', 'Drittwunsch'];

export function WishEditor({ store }: { store: ClassStore }) {
  const { students, separations, nameDisplay } = store.data;
  const labels = useMemo(() => buildLabels(students, nameDisplay), [students, nameDisplay]);
  const tableRowCount = buildRoom(store.data.room).tableRowCount;

  const [separationA, setSeparationA] = useState('');
  const [separationB, setSeparationB] = useState('');
  const [separationRadius, setSeparationRadius] = useState<'adjacent' | 'table'>('table');

  const label = (id: string) => labels.get(id) ?? '(unbekannt)';

  if (students.length === 0) {
    return (
      <div className="panel">
        <h2>Wünsche &amp; Regeln</h2>
        <p className="hint">Erfassen Sie zuerst die Namen der Klasse.</p>
      </div>
    );
  }

  const addSeparation = () => {
    if (!separationA || !separationB || separationA === separationB) return;
    store.addSeparation({ a: separationA, b: separationB, radius: separationRadius });
    setSeparationA('');
    setSeparationB('');
  };

  return (
    <>
      <div className="panel">
        <h2>Wünsche und Sonderwünsche</h2>
        <p className="hint">
          Sonderwünsche als <strong>hart</strong> zu markieren bedeutet: Der Algorithmus wird sie
          nie verletzen. Das ist für Attest, Sehschwäche oder Nachteilsausgleich gedacht — je mehr
          harte Vorgaben, desto weniger Spielraum bleibt für die Sitznachbar-Wünsche.
        </p>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                {WISH_LABELS.slice(0, MAX_WISHES).map((wishLabel) => (
                  <th key={wishLabel}>{wishLabel}</th>
                ))}
                <th>Sonderwünsche</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  students={students}
                  label={label}
                  store={store}
                  tableRowCount={tableRowCount}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h2>Trennungen</h2>
        <p className="hint">
          Diese beiden sollen nicht nebeneinander sitzen. Trennungen sind immer bindend — der
          Sitzplan wird sie unter keinen Umständen verletzen.
        </p>

        <div className="field-row" style={{ alignItems: 'flex-end', marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="sepA">Person</label>
            <select id="sepA" value={separationA} onChange={(e) => setSeparationA(e.target.value)}>
              <option value="">— auswählen —</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {label(student.id)}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="sepB">und</label>
            <select id="sepB" value={separationB} onChange={(e) => setSeparationB(e.target.value)}>
              <option value="">— auswählen —</option>
              {students
                .filter((student) => student.id !== separationA)
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {label(student.id)}
                  </option>
                ))}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="sepRadius">Abstand</label>
            <select
              id="sepRadius"
              value={separationRadius}
              onChange={(e) => setSeparationRadius(e.target.value as 'adjacent' | 'table')}
            >
              <option value="adjacent">nicht direkt nebeneinander</option>
              <option value="table">nicht am selben Tisch</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0, flex: '0 0 auto' }}>
            <button
              type="button"
              className="button primary"
              onClick={addSeparation}
              disabled={!separationA || !separationB || separationA === separationB}
            >
              Trennung hinzufügen
            </button>
          </div>
        </div>

        {separations.length === 0 ? (
          <p className="hint">Keine Trennungen festgelegt.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Trennung</th>
                <th>Abstand</th>
                <th style={{ width: '4em' }} />
              </tr>
            </thead>
            <tbody>
              {separations.map((separation, index) => (
                <tr key={`${separation.a}-${separation.b}-${index}`}>
                  <td>
                    {label(separation.a)} &nbsp;↮&nbsp; {label(separation.b)}
                  </td>
                  <td className="hint">
                    {separation.radius === 'adjacent'
                      ? 'nicht direkt nebeneinander'
                      : 'nicht am selben Tisch'}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="button danger"
                      onClick={() => store.removeSeparation(index)}
                      aria-label="Trennung entfernen"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

interface StudentRowProps {
  student: Student;
  students: Student[];
  label: (id: string) => string;
  store: ClassStore;
  tableRowCount: number;
}

function StudentRow({ student, students, label, store, tableRowCount }: StudentRowProps) {
  const others = students.filter((other) => other.id !== student.id);

  return (
    <tr>
      <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{label(student.id)}</td>

      {Array.from({ length: MAX_WISHES }, (_, rank) => {
        const current = student.wishes[rank] ?? '';
        // Bereits an anderer Stelle genannte Personen ausblenden, damit kein
        // versehentlicher Doppelwunsch entsteht.
        const takenElsewhere = new Set(
          student.wishes.filter((_, index) => index !== rank).filter(Boolean),
        );
        return (
          <td key={rank}>
            <select
              value={current}
              aria-label={`${WISH_LABELS[rank]} von ${label(student.id)}`}
              onChange={(event) => store.setWish(student.id, rank, event.target.value || null)}
            >
              <option value="">—</option>
              {others
                .filter((other) => other.id === current || !takenElsewhere.has(other.id))
                .map((other) => (
                  <option key={other.id} value={other.id}>
                    {label(other.id)}
                  </option>
                ))}
            </select>
          </td>
        );
      })}

      <td>
        <div className="chips">
          {SPECIAL_ORDER.map((kind) => {
            const active = student.specials.find((special) => special.kind === kind);
            return (
              <span key={kind} style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
                <button
                  type="button"
                  className={`chip${active?.hard ? ' hard' : ''}`}
                  aria-pressed={Boolean(active)}
                  onClick={() => store.toggleSpecial(student.id, kind)}
                  title={
                    active
                      ? 'Sonderwunsch entfernen'
                      : `Sonderwunsch „${SPECIAL_LABELS[kind]}“ hinzufügen`
                  }
                >
                  {SPECIAL_LABELS[kind]}
                  {kind === 'maxRow' && active ? ` ${(active.row ?? 1) + 1}` : ''}
                </button>

                {active && kind === 'maxRow' && (
                  <select
                    value={active.row ?? 1}
                    aria-label="Höchste erlaubte Reihe"
                    style={{ width: 'auto', padding: '1px 4px', fontSize: '0.78rem' }}
                    onChange={(event) =>
                      store.setSpecialRow(student.id, kind, Number(event.target.value))
                    }
                  >
                    {Array.from({ length: tableRowCount }, (_, row) => (
                      <option key={row} value={row}>
                        {row + 1}
                      </option>
                    ))}
                  </select>
                )}

                {active && (
                  <button
                    type="button"
                    className="chip"
                    aria-pressed={active.hard}
                    onClick={() => store.setSpecialHard(student.id, kind, !active.hard)}
                    title={
                      active.hard
                        ? 'Harte Vorgabe — wird nie verletzt. Klicken, um sie zu einem Wunsch zu machen.'
                        : 'Weicher Wunsch. Klicken, um ihn verbindlich zu machen.'
                    }
                  >
                    {active.hard ? 'hart' : 'weich'}
                  </button>
                )}
              </span>
            );
          })}
        </div>
      </td>
    </tr>
  );
}
