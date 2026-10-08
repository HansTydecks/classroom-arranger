/**
 * Schritt 3: Wünsche und Regeln erfassen.
 *
 * Regeln werden je Kind aus einem nach Themen gegliederten Auswahlmenü hinzugefügt.
 * Jede Regel ist entweder „weich“ (ein Wunsch, den der Algorithmus nach Möglichkeit
 * erfüllt) oder „hart“ (wird nie verletzt).
 */

import { useMemo } from 'react';

import { buildLabels } from '../domain/names';
import { buildRoom } from '../domain/roomTemplates';
import { isDuplicate, isPairRule, isRowRule, newRule, RULE_GROUPS } from '../domain/rules';
import { useI18n } from '../i18n/I18nContext';
import type { ClassStore } from '../state/store';
import type { SpecialKind, Student } from '../types/model';
import { MAX_WISHES } from '../types/model';

const WISH_KEYS = ['wishes.first', 'wishes.second', 'wishes.third'];

export function WishEditor({ store }: { store: ClassStore }) {
  const { t } = useI18n();
  const { students, nameDisplay } = store.data;
  const labels = useMemo(() => buildLabels(students, nameDisplay), [students, nameDisplay]);
  const tableRowCount = buildRoom(store.data.room).tableRowCount;

  const label = (id: string) => labels.get(id) ?? t('common.unknown');

  if (students.length === 0) {
    return (
      <div className="panel">
        <h2>{t('wishes.title')}</h2>
        <p className="hint">{t('wishes.empty')}</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>{t('wishes.heading')}</h2>
      <p className="hint">{t('wishes.intro')}</p>
      <p className="hint">{t('wishes.hardHint')}</p>

      <div className="table-scroll">
        <table className="rules-table">
          <thead>
            <tr>
              <th>{t('common.name')}</th>
              {WISH_KEYS.slice(0, MAX_WISHES).map((key) => (
                <th key={key}>{t(key)}</th>
              ))}
              <th>{t('wishes.rules')}</th>
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
  const { t } = useI18n();
  const others = students.filter((other) => other.id !== student.id);
  const defaultTarget = others[0]?.id;

  return (
    <tr>
      <td className="student-name">{label(student.id)}</td>

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
              aria-label={t('wishes.wishOf', { rank: t(WISH_KEYS[rank]!), name: label(student.id) })}
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

      <td className="rules-cell">
        <ul className="rule-list">
          {student.specials.map((rule, index) => (
            <li key={`${rule.kind}-${index}`} className={`rule${rule.hard ? ' hard' : ''}`}>
              <span className="rule-name">{t(`rule.${rule.kind}.short`)}</span>

              {isRowRule(rule.kind) && (
                <select
                  value={rule.row ?? 1}
                  aria-label={t('wishes.rowLimit')}
                  onChange={(event) =>
                    store.updateRule(student.id, index, { row: Number(event.target.value) })
                  }
                >
                  {Array.from({ length: tableRowCount }, (_, row) => (
                    <option key={row} value={row}>
                      {t('wishes.rowNumber', { row: row + 1 })}
                    </option>
                  ))}
                </select>
              )}

              {isPairRule(rule.kind) && (
                <select
                  value={rule.target ?? ''}
                  aria-label={t('wishes.ruleTarget')}
                  onChange={(event) =>
                    store.updateRule(student.id, index, { target: event.target.value })
                  }
                >
                  {!rule.target && <option value="">—</option>}
                  {others.map((other) => (
                    <option key={other.id} value={other.id}>
                      {label(other.id)}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                className="rule-strength"
                aria-pressed={rule.hard}
                onClick={() => store.updateRule(student.id, index, { hard: !rule.hard })}
                title={rule.hard ? t('wishes.hardTitle') : t('wishes.softTitle')}
              >
                {rule.hard ? t('wishes.hard') : t('wishes.soft')}
              </button>

              <button
                type="button"
                className="rule-remove"
                onClick={() => store.removeRule(student.id, index)}
                aria-label={t('wishes.removeRule', { rule: t(`rule.${rule.kind}.short`) })}
                title={t('wishes.removeRule', { rule: t(`rule.${rule.kind}.short`) })}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <select
          className="rule-add"
          value=""
          aria-label={t('wishes.addRuleFor', { name: label(student.id) })}
          onChange={(event) => {
            const kind = event.target.value as SpecialKind;
            if (!kind) return;
            const target = isPairRule(kind) ? defaultTarget : undefined;
            store.addRule(student.id, newRule(kind, target));
          }}
        >
          <option value="">{t('wishes.addRule')}</option>
          {RULE_GROUPS.map((group) => (
            <optgroup key={group.id} label={t(`rule.group.${group.id}`)}>
              {group.kinds.map((kind) => (
                <option
                  key={kind}
                  value={kind}
                  disabled={
                    isDuplicate(student.specials, kind) || (isPairRule(kind) && !defaultTarget)
                  }
                >
                  {t(`rule.${kind}.name`)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </td>
    </tr>
  );
}
