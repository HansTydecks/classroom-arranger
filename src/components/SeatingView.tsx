/**
 * Schritt 4: Sitzplan berechnen, prüfen, von Hand nachjustieren und drucken.
 */

import { useEffect, useMemo, useState } from 'react';

import { buildLabels } from '../domain/names';
import { buildRoom } from '../domain/roomTemplates';
import { ReportPanel } from './ReportPanel';
import { SeatGrid } from './SeatGrid';
import type { SeatOccupant } from './SeatGrid';
import { WeightSliders } from './WeightSliders';
import type { ClassStore } from '../state/store';
import type { SolverStatus } from '../state/useSolver';
import { compileProblem } from '../solver/problem';
import { buildReport } from '../solver/report';
import type { SolveOptions } from '../solver/solve';

interface SeatingViewProps {
  store: ClassStore;
  status: SolverStatus;
  run: (options?: SolveOptions) => void;
}

export function SeatingView({ store, status, run }: SeatingViewProps) {
  const { data } = store;
  const room = useMemo(() => buildRoom(data.room), [data.room]);
  const labels = useMemo(
    () => buildLabels(data.students, data.nameDisplay),
    [data.students, data.nameDisplay],
  );

  const [variantIndex, setVariantIndex] = useState(0);
  /** Aktuell angezeigter Plan — kann von der berechneten Variante abweichen. */
  const [assignment, setAssignment] = useState<number[] | null>(null);
  const [edited, setEdited] = useState(false);
  const [mirrored, setMirrored] = useState(false);

  const variants = status.kind === 'done' ? status.variants : [];

  // Neue Berechnung: erste Variante übernehmen und Handänderungen verwerfen.
  useEffect(() => {
    if (status.kind !== 'done' || status.variants.length === 0) return;
    setVariantIndex(0);
    setAssignment(status.variants[0]!.assignment);
    setEdited(false);
  }, [status]);

  const selectVariant = (index: number) => {
    setVariantIndex(index);
    setAssignment(variants[index]?.assignment ?? null);
    setEdited(false);
  };

  // Der Bericht wird bei jeder Änderung neu berechnet — das kostet Millisekunden
  // und hält die Anzeige nach einem Umsetzen sofort korrekt.
  const report = useMemo(() => {
    if (!assignment) return null;
    const { problem } = compileProblem(data, room);
    if (assignment.length !== problem.n) return null;
    return buildReport(problem, Int32Array.from(assignment));
  }, [assignment, data, room]);

  const occupants = useMemo(() => {
    const map = new Map<string, SeatOccupant>();
    if (!assignment || !report) return map;

    data.students.forEach((student, index) => {
      const seatIndex = assignment[index];
      const seat = seatIndex !== undefined && seatIndex >= 0 ? room.seats[seatIndex] : undefined;
      if (!seat) return;
      const entry = report.perStudent[index];
      map.set(seat.id, {
        studentId: student.id,
        name: labels.get(student.id) ?? student.firstName,
        bestRank: entry && entry.wishes.length > 0 ? entry.bestFulfilledRank : undefined,
        pinned: Boolean(student.pinnedSeat),
      });
    });
    return map;
  }, [assignment, report, data.students, room.seats, labels]);

  /** Zwei Plätze tauschen — auch, wenn einer davon leer ist. */
  const swapSeats = (seatIdA: string, seatIdB: string) => {
    if (!assignment) return;
    const a = room.seats.findIndex((seat) => seat.id === seatIdA);
    const b = room.seats.findIndex((seat) => seat.id === seatIdB);
    if (a < 0 || b < 0) return;

    const next = [...assignment];
    const studentA = next.indexOf(a);
    const studentB = next.indexOf(b);
    if (studentA >= 0) next[studentA] = b;
    if (studentB >= 0) next[studentB] = a;
    setAssignment(next);
    setEdited(true);
  };

  const togglePin = (studentId: string) => {
    if (!assignment) return;
    const index = data.students.findIndex((student) => student.id === studentId);
    const student = data.students[index];
    if (!student) return;
    const seatIndex = assignment[index];
    const seat = seatIndex !== undefined ? room.seats[seatIndex] : undefined;
    store.setPinnedSeat(studentId, student.pinnedSeat ? undefined : seat?.id);
  };

  const pinnedCount = data.students.filter((student) => student.pinnedSeat).length;
  const running = status.kind === 'running';
  const canRun = data.students.length > 0;

  return (
    <>
      <div className="panel no-print">
        <div className="button-row" style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="button primary"
            onClick={() => run()}
            disabled={running || !canRun}
          >
            {running ? 'Berechne …' : variants.length > 0 ? 'Neu berechnen' : 'Sitzplan berechnen'}
          </button>

          {pinnedCount > 0 && (
            <>
              <button type="button" className="button" onClick={() => run()} disabled={running}>
                Rest neu optimieren ({pinnedCount} festgehalten)
              </button>
              <button type="button" className="button" onClick={store.clearPins}>
                Alle Pins lösen
              </button>
            </>
          )}

          {!canRun && <span className="hint">Erfassen Sie zuerst die Namen der Klasse.</span>}
        </div>

        {running && (
          <div className="progress" aria-label="Fortschritt">
            <div style={{ width: `${Math.round(status.fraction * 100)}%` }} />
          </div>
        )}

        {status.kind === 'error' && (
          <p className="notice error">Fehler bei der Berechnung: {status.message}</p>
        )}

        {(status.kind === 'blocked' || status.kind === 'done') &&
          status.issues.map((issue, index) => (
            <p key={index} className={`notice ${issue.severity === 'error' ? 'error' : 'warning'}`}>
              {issue.message}
            </p>
          ))}

        {status.kind === 'blocked' && (
          <p className="hint">
            Solange sich die harten Vorgaben widersprechen, gibt es keinen zulässigen Sitzplan.
            Passen Sie eine der genannten Vorgaben an.
          </p>
        )}

        {status.kind === 'done' && (
          <p className="hint">
            {status.succeeded} von {status.attempted} Läufen erfolgreich, {status.elapsedMs} ms.
          </p>
        )}
      </div>

      {variants.length > 0 && assignment && report && (
        <>
          <div className="panel">
            <div className="no-print">
              <div className="variant-tabs">
                {variants.map((variant, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-current={index === variantIndex}
                    onClick={() => selectVariant(index)}
                    title={`Bewertung ${variant.score.toFixed(1)}`}
                  >
                    Variante {String.fromCharCode(65 + index)}
                  </button>
                ))}
                <button
                  type="button"
                  aria-current={mirrored}
                  onClick={() => setMirrored((current) => !current)}
                  title="Zeigt den Plan so, wie Sie ihn von vorne sehen — links und rechts vertauscht"
                >
                  {mirrored ? 'Schülerperspektive' : 'Lehrerperspektive'}
                </button>
                <button type="button" onClick={() => window.print()}>
                  Drucken / als PDF speichern
                </button>
              </div>

              {edited && (
                <p className="notice info">
                  Von Hand geändert. Halten Sie Plätze mit dem Nadel-Symbol fest und wählen Sie
                  „Rest neu optimieren“, damit der Algorithmus den Rest darum herum neu ordnet.
                </p>
              )}

              {report.hardViolations.map((violation, index) => (
                <p key={index} className="notice error">
                  {violation}
                </p>
              ))}
            </div>

            <div className="print-header print-only">
              <h2>Sitzplan {data.name}</h2>
              <span className="meta">
                {mirrored ? 'Ansicht von vorne' : 'Blick zur Tafel'} ·{' '}
                {new Date().toLocaleDateString('de-DE')}
              </span>
            </div>

            <SeatGrid
              room={room}
              occupants={occupants}
              mirrored={mirrored}
              onSwapSeats={swapSeats}
              onTogglePin={togglePin}
            />

            <div className="legend no-print">
              <span className="l-first">Erstwunsch erfüllt</span>
              <span className="l-second">Zweitwunsch erfüllt</span>
              <span className="l-none">kein Wunsch erfüllt</span>
              <span>Zum Umsetzen einen Platz auf einen anderen ziehen.</span>
            </div>
          </div>

          <ReportPanel report={report} labels={labels} students={data.students} />
          <WeightSliders store={store} onRecalculate={() => run()} disabled={running} />
        </>
      )}
    </>
  );
}
