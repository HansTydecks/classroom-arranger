import { describe, expect, it } from 'vitest';

import { buildRoom } from '../domain/roomTemplates';
import { demoClass } from '../fixtures/demoClass';
import { compileProblem } from './problem';
import type { SolverProblem } from './problem';
import { buildReport } from './report';
import { hammingDistance, solve } from './solve';
import type { ClassData } from '../types/model';

function setup(data: ClassData = demoClass()): SolverProblem {
  const room = buildRoom(data.room);
  return compileProblem(data, room).problem;
}

/** Prüft alle Zusicherungen, die der Solver nie verletzen darf. */
function expectValidAssignment(problem: SolverProblem, assignment: Int32Array): void {
  const used = new Set<number>();

  for (let i = 0; i < problem.n; i++) {
    const seat = assignment[i]!;
    expect(seat).toBeGreaterThanOrEqual(0);
    expect(seat).toBeLessThan(problem.m);
    expect(used.has(seat)).toBe(false);
    used.add(seat);
    expect(problem.allowed[i * problem.m + seat]).toBe(1);
  }

  for (let i = 0; i < problem.n; i++) {
    for (let k = problem.sepStart[i]!, end = problem.sepStart[i + 1]!; k < end; k++) {
      const partnerSeat = assignment[problem.sepPartner[k]!]!;
      const proximity = problem.prox.values[assignment[i]! * problem.m + partnerSeat]!;
      expect(proximity).toBeLessThan(problem.sepThreshold[k]!);
    }
  }
}

describe('solve', () => {
  it('hält über viele Zufallsläufe hinweg jede harte Regel ein', () => {
    const problem = setup();
    for (let seed = 1; seed <= 40; seed++) {
      const result = solve(problem, { seed, restarts: 3, iterations: 4000 });
      expect(result.variants.length).toBeGreaterThan(0);
      for (const variant of result.variants) expectValidAssignment(problem, variant.assignment);
    }
  });

  it('findet für jeden Neustart eine zulässige Startlösung', () => {
    const problem = setup();
    const result = solve(problem, { seed: 7 });
    expect(result.succeeded).toBe(result.attempted);
  });

  it('erfüllt bei der Demo-Klasse mindestens 90 % der Personen einen Wunsch', () => {
    const problem = setup();
    const result = solve(problem, { seed: 42 });
    const report = buildReport(problem, result.variants[0]!.assignment);

    expect(report.stats.fulfilledShare).toBeGreaterThanOrEqual(90);
    expect(report.stats.separationsRespected).toBe(report.stats.separationsTotal);
    expect(report.stats.separationsTotal).toBe(3);
  });

  it('liefert bei gleichem Startwert exakt dasselbe Ergebnis', () => {
    const problem = setup();
    const a = solve(problem, { seed: 5, restarts: 4, iterations: 5000 });
    const b = solve(problem, { seed: 5, restarts: 4, iterations: 5000 });

    expect(a.variants.map((v) => v.score)).toEqual(b.variants.map((v) => v.score));
    expect(Array.from(a.variants[0]!.assignment)).toEqual(Array.from(b.variants[0]!.assignment));
  });

  it('liefert deutlich verschiedene Varianten', () => {
    const problem = setup();
    const result = solve(problem, { seed: 42 });
    expect(result.variants.length).toBe(3);

    const minDistance = Math.round(problem.n * 0.2);
    for (let a = 0; a < result.variants.length; a++) {
      for (let b = a + 1; b < result.variants.length; b++) {
        const distance = hammingDistance(
          result.variants[a]!.assignment,
          result.variants[b]!.assignment,
        );
        expect(distance).toBeGreaterThanOrEqual(minDistance);
      }
    }
  });

  it('respektiert fest zugewiesene Plätze und rechnet den Rest darum herum', () => {
    const data = demoClass();
    const room = buildRoom(data.room);
    // Zwei Personen festnageln — genau der Ablauf hinter „Rest neu optimieren“.
    data.students.find((s) => s.id === 'zoe')!.pinnedSeat = room.seats[0]!.id;
    data.students.find((s) => s.id === 'ute')!.pinnedSeat = room.seats[7]!.id;

    const problem = compileProblem(data, room).problem;
    const result = solve(problem, { seed: 3, restarts: 5, iterations: 8000 });

    for (const variant of result.variants) {
      expectValidAssignment(problem, variant.assignment);
      expect(room.seats[variant.assignment[problem.studentIndex.get('zoe')!]!]!.id).toBe(
        room.seats[0]!.id,
      );
      expect(room.seats[variant.assignment[problem.studentIndex.get('ute')!]!]!.id).toBe(
        room.seats[7]!.id,
      );
    }
  });

  it('bleibt mit den Voreinstellungen deutlich unter zwei Sekunden', () => {
    const problem = setup();
    const result = solve(problem, { seed: 1 });
    expect(result.elapsedMs).toBeLessThan(2000);
  });

  it('kommt mit einer Klasse ohne jeden Wunsch zurecht', () => {
    const data = demoClass();
    for (const student of data.students) student.wishes = [];
    const problem = setup(data);
    const result = solve(problem, { seed: 1, restarts: 2, iterations: 2000 });

    expect(result.variants.length).toBeGreaterThan(0);
    expectValidAssignment(problem, result.variants[0]!.assignment);
    const report = buildReport(problem, result.variants[0]!.assignment);
    expect(report.stats.withWishes).toBe(0);
    expect(report.stats.fulfilledShare).toBe(100);
  });

  it('kommt auch ohne freien Platz zurecht', () => {
    const data = demoClass();
    // 7 Reihen a 2 Tische a 2 Plätze = 28 Plätze für 28 Personen: kein Spielraum.
    data.room = { ...data.room, rowCount: 7, tablesPerRow: 2, seatsPerTable: 2 };
    const problem = setup(data);
    expect(problem.m).toBe(problem.n);

    const result = solve(problem, { seed: 2, restarts: 6, iterations: 10000 });
    expect(result.variants.length).toBeGreaterThan(0);
    expectValidAssignment(problem, result.variants[0]!.assignment);
  });
});

describe('Bericht', () => {
  it('zählt gegenseitige Paare und erfüllte Wünsche schlüssig', () => {
    const problem = setup();
    const result = solve(problem, { seed: 42 });
    const report = buildReport(problem, result.variants[0]!.assignment);
    const stats = report.stats;

    expect(stats.studentCount).toBe(28);
    expect(stats.seatCount).toBe(30);
    expect(stats.mutualPairsRealized).toBeLessThanOrEqual(stats.mutualPairsTotal);
    expect(stats.withAtLeastOneFulfilled).toBe(
      report.perStudent.filter((r) => r.fulfilledCount > 0).length,
    );
    expect(report.unfulfilled.every((r) => r.fulfilledCount === 0)).toBe(true);

    // Jede Person sitzt auf genau einem benannten Platz.
    const seats = report.perStudent.map((r) => r.seatId);
    expect(new Set(seats).size).toBe(seats.length);
    expect(seats.every((s) => s !== null)).toBe(true);
  });

  it('weist harte Sonderwünsche immer als erfüllt aus', () => {
    const problem = setup();
    const result = solve(problem, { seed: 11 });
    const report = buildReport(problem, result.variants[0]!.assignment);

    for (const entry of report.perStudent) {
      for (const special of entry.specials) {
        if (special.hard) expect(special.satisfied).toBe(true);
      }
    }
  });
});
