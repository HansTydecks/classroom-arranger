import { describe, expect, it } from 'vitest';

import { buildRoom } from '../domain/roomTemplates';
import { migrate, emptyClass } from '../state/store';
import { compileProblem } from './problem';
import { buildReport } from './report';
import { solve } from './solve';
import type { ClassData, SpecialRequest, Student } from '../types/model';

/** Klasse mit 12 Kindern in 4 Reihen × 2 Vierertischen (Platz für 32), ein Kind trägt die Regel. */
function classWith(rule: SpecialRequest | null, extra: Student[] = []): ClassData {
  const data = emptyClass();
  data.room = {
    ...data.room,
    template: 'doubleRows',
    rowCount: 4,
    tablesPerRow: 2,
    seatsPerTable: 4,
    windowSide: 'left',
    doorPosition: 'frontRight',
  };
  data.students = Array.from({ length: 12 }, (_, i) => ({
    id: `s${i}`,
    firstName: `K${i}`,
    wishes: [],
    specials: i === 0 && rule ? [rule] : [],
  }));
  for (const student of extra) data.students[Number(student.id.slice(1))] = student;
  return data;
}

function run(data: ClassData, seed = 3) {
  const room = buildRoom(data.room);
  const { problem } = compileProblem(data, room);
  const result = solve(problem, { seed, restarts: 3, iterations: 6000 });
  const best = result.variants[0]!;
  return { problem, room, assignment: best.assignment, seat: room.seats[best.assignment[0]!]! };
}

describe('Regeln', () => {
  const middle = (cols: number) => (cols - 1) / 2;

  it.each([
    ['front', (s: ReturnType<typeof run>) => s.seat.tableRow === 0],
    ['back', (s: ReturnType<typeof run>) => s.seat.tableRow === 3],
    ['notBack', (s: ReturnType<typeof run>) => s.seat.tableRow < 3],
    ['window', (s: ReturnType<typeof run>) => s.seat.tags.includes('window')],
    ['notWindow', (s: ReturnType<typeof run>) => !s.seat.tags.includes('window')],
    ['aisle', (s: ReturnType<typeof run>) => s.seat.tags.includes('aisle')],
    ['notAisle', (s: ReturnType<typeof run>) => !s.seat.tags.includes('aisle')],
    ['nearDoor', (s: ReturnType<typeof run>) => s.seat.tags.includes('door')],
    ['notDoor', (s: ReturnType<typeof run>) => !s.seat.tags.includes('door')],
    ['leftSide', (s: ReturnType<typeof run>) => s.seat.col <= middle(s.room.gridCols)],
    ['rightSide', (s: ReturnType<typeof run>) => s.seat.col >= middle(s.room.gridCols)],
    [
      'center',
      (s: ReturnType<typeof run>) =>
        Math.abs(s.seat.col - middle(s.room.gridCols)) <= middle(s.room.gridCols) / 2,
    ],
  ] as const)('hält die harte Platzregel „%s“ ein', (kind, check) => {
    for (const seed of [1, 2, 3]) {
      const outcome = run(classWith({ kind, hard: true }), seed);
      expect(check(outcome)).toBe(true);
    }
  });

  it('hält die harten Reihengrenzen ein', () => {
    const max = run(classWith({ kind: 'maxRow', hard: true, row: 1 }));
    expect(max.seat.tableRow).toBeLessThanOrEqual(1);

    const min = run(classWith({ kind: 'minRow', hard: true, row: 2 }));
    expect(min.seat.tableRow).toBeGreaterThanOrEqual(2);
  });

  it('erfüllt weiche Regeln, wenn nichts dagegen spricht', () => {
    const outcome = run(classWith({ kind: 'front', hard: false }));
    expect(outcome.seat.tableRow).toBe(0);
    const report = buildReport(outcome.problem, outcome.assignment);
    expect(report.perStudent[0]!.specials[0]!.satisfied).toBe(true);
  });

  it('hält „nicht neben“ und „nicht am selben Tisch“ hart ein', () => {
    for (const kind of ['notNextTo', 'notSameTable'] as const) {
      const data = classWith({ kind, hard: true, target: 's1' });
      const { problem, room, assignment } = run(data);
      const a = room.seats[assignment[0]!]!;
      const b = room.seats[assignment[1]!]!;
      if (kind === 'notSameTable') expect(a.tableId).not.toBe(b.tableId);
      const value = problem.prox.values[assignment[0]! * problem.m + assignment[1]!]!;
      expect(value).toBeLessThan(kind === 'notNextTo' ? 1 : 0.4);
    }
  });

  it('setzt „direkt neben“ und „am selben Tisch“ hart um', () => {
    for (const kind of ['nextTo', 'sameTable'] as const) {
      const data = classWith({ kind, hard: true, target: 's5' });
      const { room, assignment, problem } = run(data);
      const a = room.seats[assignment[0]!]!;
      const b = room.seats[assignment[5]!]!;
      expect(a.tableId).toBe(b.tableId);
      const report = buildReport(problem, assignment);
      expect(report.hardViolations).toHaveLength(0);
    }
  });

  it('beachtet weiche Beziehungsregeln', () => {
    const near = run(classWith({ kind: 'nextTo', hard: false, target: 's7' }));
    expect(near.room.seats[near.assignment[7]!]!.tableId).toBe(near.seat.tableId);

    const apart = run(classWith({ kind: 'notSameTable', hard: false, target: 's7' }));
    expect(apart.room.seats[apart.assignment[7]!]!.tableId).not.toBe(apart.seat.tableId);
  });

  it('wandelt alte Trennungslisten beim Laden in Regeln um', () => {
    const data = classWith(null);
    data.separations = [
      { a: 's0', b: 's1', radius: 'adjacent' },
      { a: 's2', b: 's3', radius: 'table' },
    ];
    const migrated = migrate(data);
    expect(migrated.separations).toEqual([]);
    expect(migrated.students[0]!.specials).toEqual([
      { kind: 'notNextTo', hard: true, target: 's1' },
    ]);
    expect(migrated.students[2]!.specials).toEqual([
      { kind: 'notSameTable', hard: true, target: 's3' },
    ]);
  });
});
