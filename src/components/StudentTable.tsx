/**
 * Schritt 2: Die Namen der Klasse erfassen.
 */

import { useState } from 'react';

import { buildRoom } from '../domain/roomTemplates';
import { useI18n } from '../i18n/I18nContext';
import type { ClassStore } from '../state/store';
import type { NameDisplay } from '../types/model';

const DISPLAY_MODES: NameDisplay[] = ['full', 'firstName', 'initial'];

export function StudentTable({ store }: { store: ClassStore }) {
  const { t } = useI18n();
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
        <h2>{t('class.addNames')}</h2>
        <div className="field">
          <label htmlFor="bulk">{t('class.onePerLine')}</label>
          <textarea
            id="bulk"
            value={bulk}
            placeholder={t('class.placeholder')}
            onChange={(event) => setBulk(event.target.value)}
          />
        </div>
        <div className="button-row">
          <button type="button" className="button primary" onClick={addBulk} disabled={!bulk.trim()}>
            {t('class.add')}
          </button>
        </div>
        <p className="hint" style={{ marginTop: 12 }}>
          {t('class.pasteHint')}
        </p>

        <div className="field" style={{ marginTop: 18 }}>
          <label htmlFor="nameDisplay">{t('class.displayAs')}</label>
          <select
            id="nameDisplay"
            value={store.data.nameDisplay}
            onChange={(event) => store.setNameDisplay(event.target.value as NameDisplay)}
          >
            {DISPLAY_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {t(`class.display.${mode}`)}
              </option>
            ))}
          </select>
          <p className="hint" style={{ marginTop: 6 }}>
            {t('class.displayHint')}
          </p>
        </div>
      </div>

      <div className="panel">
        <h2>
          {t('class.heading')}{' '}
          <span className="hint">
            ({t('class.count', { count: students.length, seats: seatCount })})
          </span>
        </h2>

        {students.length === 0 ? (
          <p className="hint">{t('class.none')}</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '2.5em' }}>#</th>
                  <th>{t('class.firstName')}</th>
                  <th>{t('class.lastName')}</th>
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
                        aria-label={t('class.firstNameOf', { name: student.firstName })}
                        onChange={(event) =>
                          store.updateStudent(student.id, { firstName: event.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={student.lastName ?? ''}
                        aria-label={t('class.lastNameOf', { name: student.firstName })}
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
                        aria-label={t('class.remove', { name: student.firstName })}
                        title={t('class.removeTitle')}
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
