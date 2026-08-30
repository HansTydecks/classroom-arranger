/**
 * Schritt 2: Die Namen der Klasse erfassen.
 */

import { useState } from 'react';

import { buildRoom } from '../domain/roomTemplates';
import type { ClassStore } from '../state/store';
import type { NameDisplay } from '../types/model';

const DISPLAY_LABELS: Record<NameDisplay, string> = {
  full: 'Vor- und Nachname',
  firstName: 'nur Vorname',
  initial: 'Vorname + Anfangsbuchstabe',
};

export function StudentTable({ store }: { store: ClassStore }) {
  const [bulk, setBulk] = useState('');
  const students = store.data.students;
  const seatCount = buildRoom(store.data.room).seats.length;

  const addBulk = () => {
    const names = bulk
      .split(/[\n,;]+/)
      .map((name) => name.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    store.addStudents(names);
    setBulk('');
  };

  return (
    <div className="columns">
      <div className="panel">
        <h2>Namen hinzufügen</h2>
        <div className="field">
          <label htmlFor="bulk">Ein Name je Zeile</label>
          <textarea
            id="bulk"
            value={bulk}
            placeholder={'Amelie Bauer\nBen Cordes\nCharlotte Dietz'}
            onChange={(event) => setBulk(event.target.value)}
          />
        </div>
        <div className="button-row">
          <button type="button" className="button primary" onClick={addBulk} disabled={!bulk.trim()}>
            Hinzufügen
          </button>
        </div>
        <p className="hint" style={{ marginTop: 12 }}>
          Sie können die Liste auch aus einer Tabelle einfügen — Zeilenumbrüche, Kommas und
          Semikolons trennen die Namen. Das erste Wort gilt als Vorname, der Rest als Nachname.
        </p>

        <div className="field" style={{ marginTop: 18 }}>
          <label htmlFor="nameDisplay">Namen anzeigen als</label>
          <select
            id="nameDisplay"
            value={store.data.nameDisplay}
            onChange={(event) => store.setNameDisplay(event.target.value as NameDisplay)}
          >
            {(Object.keys(DISPLAY_LABELS) as NameDisplay[]).map((mode) => (
              <option key={mode} value={mode}>
                {DISPLAY_LABELS[mode]}
              </option>
            ))}
          </select>
          <p className="hint" style={{ marginTop: 6 }}>
            Gilt für Bildschirm und Ausdruck. Für einen Aushang im Klassenraum reicht meist der
            Vorname — je weniger personenbezogene Daten sichtbar sind, desto besser.
          </p>
        </div>
      </div>

      <div className="panel">
        <h2>
          Klasse{' '}
          <span className="hint">
            ({students.length} {students.length === 1 ? 'Person' : 'Personen'}, {seatCount} Plätze)
          </span>
        </h2>

        {students.length === 0 ? (
          <p className="hint">Noch keine Namen erfasst.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '2.5em' }}>#</th>
                  <th>Vorname</th>
                  <th>Nachname</th>
                  <th style={{ width: '4em' }} />
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id}>
                    <td className="hint">{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        value={student.firstName}
                        aria-label={`Vorname von ${student.firstName}`}
                        onChange={(event) =>
                          store.updateStudent(student.id, { firstName: event.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={student.lastName ?? ''}
                        aria-label={`Nachname von ${student.firstName}`}
                        onChange={(event) =>
                          store.updateStudent(student.id, { lastName: event.target.value })
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button danger"
                        onClick={() => store.removeStudent(student.id)}
                        aria-label={`${student.firstName} entfernen`}
                        title="Entfernen — löscht auch alle Wünsche und Trennungen zu dieser Person"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
