/**
 * Auswertung des angezeigten Sitzplans: Kennzahlen, Problemfälle und die
 * Wunscherfüllung Person für Person.
 */

import type { SolutionReport } from '../solver/report';
import type { SpecialKind, Student } from '../types/model';

const SPECIAL_LABELS: Record<SpecialKind, string> = {
  front: 'vorne',
  notBack: 'nicht hinten',
  window: 'Fenster',
  aisle: 'Gang',
  notDoor: 'nicht an der Tür',
  maxRow: 'Reihenbegrenzung',
};

interface ReportPanelProps {
  report: SolutionReport;
  labels: Map<string, string>;
  students: Student[];
}

export function ReportPanel({ report, labels, students }: ReportPanelProps) {
  const { stats } = report;
  const label = (id: string) => labels.get(id) ?? id;
  void students;

  return (
    <div className="panel report-panel">
      <h2>Auswertung</h2>

      <div className="stats">
        <Stat
          value={`${stats.withAtLeastOneFulfilled} / ${stats.withWishes}`}
          label={`mit erfülltem Wunsch (${stats.fulfilledShare.toFixed(0)} %)`}
        />
        <Stat value={String(stats.firstChoiceFulfilled)} label="erfüllte Erstwünsche" />
        <Stat value={String(stats.secondChoiceFulfilled)} label="erfüllte Zweitwünsche" />
        <Stat
          value={`${stats.mutualPairsRealized} / ${stats.mutualPairsTotal}`}
          label="gegenseitige Paare zusammen"
        />
        <Stat
          value={`${stats.softSpecialsSatisfied} / ${stats.softSpecialsTotal}`}
          label="Sonderwünsche erfüllt"
        />
        <Stat
          value={`${stats.separationsRespected} / ${stats.separationsTotal}`}
          label="Trennungen eingehalten"
        />
      </div>

      {report.unfulfilled.length > 0 ? (
        <p className="notice warning">
          <strong>Ohne erfüllten Wunsch:</strong>{' '}
          {report.unfulfilled.map((entry) => label(entry.studentId)).join(', ')}. Hier lohnt ein
          prüfender Blick — oft hilft schon ein einzelnes Umsetzen von Hand.
        </p>
      ) : (
        <p className="notice info">
          Alle Personen mit Wünschen sitzen neben mindestens einer gewünschten Person.
        </p>
      )}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Reihe</th>
              <th>Wünsche</th>
              <th>Sonderwünsche</th>
            </tr>
          </thead>
          <tbody>
            {report.perStudent.map((entry) => (
              <tr key={entry.studentId}>
                <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{label(entry.studentId)}</td>
                <td className="hint">{entry.tableRow !== null ? entry.tableRow + 1 : '—'}</td>
                <td>
                  {entry.wishes.length === 0 ? (
                    <span className="hint">keine abgegeben</span>
                  ) : (
                    entry.wishes.map((wish, index) => (
                      <span key={index} style={{ marginRight: 10, whiteSpace: 'nowrap' }}>
                        <span className={`badge ${wish.fulfilled ? 'good' : 'bad'}`}>
                          {wish.rank + 1}.
                        </span>{' '}
                        {label(wish.targetId)}
                        {wish.mutual && (
                          <span className="hint" title="Der Wunsch ist gegenseitig">
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
                        title={special.hard ? 'harte Vorgabe' : 'weicher Wunsch'}
                      >
                        {SPECIAL_LABELS[special.kind]}
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
