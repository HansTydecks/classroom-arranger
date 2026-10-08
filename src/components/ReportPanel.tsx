/**
 * Auswertung des angezeigten Sitzplans: Kennzahlen, Problemfälle und die
 * Wunscherfüllung Person für Person.
 */

import { useI18n } from '../i18n/I18nContext';
import type { SolutionReport } from '../solver/report';
import type { Student } from '../types/model';

interface ReportPanelProps {
  report: SolutionReport;
  labels: Map<string, string>;
  students: Student[];
}

export function ReportPanel({ report, labels, students }: ReportPanelProps) {
  const { t } = useI18n();
  const { stats } = report;
  const label = (id: string) => labels.get(id) ?? id;
  void students;

  return (
    <div className="panel report-panel">
      <h2>{t('report.title')}</h2>

      <div className="stats">
        <Stat
          value={`${stats.withAtLeastOneFulfilled} / ${stats.withWishes}`}
          label={t('report.withWish', { share: stats.fulfilledShare.toFixed(0) })}
        />
        <Stat value={String(stats.firstChoiceFulfilled)} label={t('report.firstFulfilled')} />
        <Stat value={String(stats.secondChoiceFulfilled)} label={t('report.secondFulfilled')} />
        <Stat
          value={`${stats.mutualPairsRealized} / ${stats.mutualPairsTotal}`}
          label={t('report.mutualPairs')}
        />
        <Stat
          value={`${stats.softSpecialsSatisfied} / ${stats.softSpecialsTotal}`}
          label={t('report.rulesSatisfied')}
        />
        <Stat
          value={`${stats.separationsRespected} / ${stats.separationsTotal}`}
          label={t('report.separations')}
        />
      </div>

      {report.unfulfilled.length > 0 ? (
        <p className="notice warning">
          <strong>{t('report.unfulfilled')}</strong>{' '}
          {t('report.unfulfilledHint', {
            names: report.unfulfilled.map((entry) => label(entry.studentId)),
          })}
        </p>
      ) : (
        <p className="notice info">{t('report.allFulfilled')}</p>
      )}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{t('common.name')}</th>
              <th>{t('report.row')}</th>
              <th>{t('report.wishes')}</th>
              <th>{t('report.rules')}</th>
            </tr>
          </thead>
          <tbody>
            {report.perStudent.map((entry) => (
              <tr key={entry.studentId}>
                <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{label(entry.studentId)}</td>
                <td className="hint">{entry.tableRow !== null ? entry.tableRow + 1 : '—'}</td>
                <td>
                  {entry.wishes.length === 0 ? (
                    <span className="hint">{t('report.noWishes')}</span>
                  ) : (
                    entry.wishes.map((wish, index) => (
                      <span key={index} style={{ marginRight: 10, whiteSpace: 'nowrap' }}>
                        <span className={`badge ${wish.fulfilled ? 'good' : 'bad'}`}>
                          {wish.rank + 1}.
                        </span>{' '}
                        {label(wish.targetId)}
                        {wish.mutual && (
                          <span className="hint" title={t('report.mutualTitle')}>
                            {' '}
                            ↔
                          </span>
                        )}
                      </span>
                    ))
                  )}
                </td>
                <td>
                  {entry.specials.length === 0 ? (
                    <span className="hint">—</span>
                  ) : (
                    entry.specials.map((special, index) => (
                      <span
                        key={index}
                        className={`badge ${special.satisfied ? 'good' : special.hard ? 'bad' : 'mid'}`}
                        style={{ marginRight: 5 }}
                        title={special.hard ? t('report.hardTitle') : t('report.softTitle')}
                      >
                        {t(`rule.${special.kind}.short`)}
                        {special.targetName ? ` ${special.targetName}` : ''}
                        {special.hard ? ' !' : ''} {special.satisfied ? '✓' : '✕'}
                      </span>
                    ))
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
