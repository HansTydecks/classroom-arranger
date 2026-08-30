import { describe, expect, it } from 'vitest';

import { buildRoom } from '../domain/roomTemplates';
import { demoClass } from '../fixtures/demoClass';
import { constructGreedy } from './construct';
import { EMPTY, Evaluator } from './objective';
import { compileProblem } from './problem';
import type { SolverProblem } from './problem';
import { makeRng } from './random';
import type { Rng } from './random';

function setup(): { problem: SolverProblem; evaluator: Evaluator; rng: Rng } {
  const data = demoClass();
  const room = buildRoom(data.room);
  const { problem } = compileProblem(data, room);
  const rng = makeRng(20240830);
  const evaluator = new Evaluator(problem);
  const start = constructGreedy(problem, rng);
  expect(start).not.toBeNull();
  evaluator.setAssignment(start!);
  return { problem, evaluator, rng };
}

/** Zieht einen zufälligen Zug aller drei Arten. */
function proposeRandom(evaluator: Evaluator, rng: Rng): number | null {
  const p = evaluator.problem;
  const kind = rng();

  if (kind < 0.15) {
    return evaluator.proposeRotate3(rng.int(p.n), rng.int(p.n), rng.int(p.n));
  }

  const i = rng.int(p.n);
  const seat = rng.int(p.m);
  const occupant = evaluator.studentAt[seat]!;
  if (occupant === EMPTY) return evaluator.proposeMove(i, seat);
  if (occupant === i) return null;
  return evaluator.proposeSwap(i, occupant);
}

describe('Evaluator', () => {
  /**
   * Der wichtigste Test des Projekts. Wäre das Delta falsch, würde die Suche
   * stillschweigend in die falsche Richtung laufen und trotzdem plausible
   * Sitzpläne ausgeben — ein Fehler, der ohne diesen Test unentdeckt bliebe.
   */
  it('inkrementelles Delta stimmt mit vollständiger Neubewertung überein', () => {
    const { problem, evaluator, rng } = setup();
    const reference = new Evaluator(problem);
    let moves = 0;

    for (let step = 0; step < 5000; step++) {
      const before = evaluator.total;
      const delta = proposeRandom(evaluator, rng);
      if (delta === null) continue;
      moves++;

      // Vollständige Neubewertung des *vorläufig* angewandten Zustands.
      reference.setAssignment(evaluator.seatOf);
      expect(delta).toBeCloseTo(reference.total - before, 9);

      if (rng() < 0.5) {
        evaluator.commit();
        expect(evaluator.total).toBeCloseTo(reference.total, 9);
      } else {
        evaluator.rollback();
        reference.setAssignment(evaluator.seatOf);
        expect(evaluator.total).toBeCloseTo(reference.total, 9);
      }
    }

    expect(moves).toBeGreaterThan(1000);
  });

  it('Einzelbewertungen bleiben nach vielen Zügen konsistent', () => {
    const { problem, evaluator, rng } = setup();

    for (let step = 0; step < 20000; step++) {
      const delta = proposeRandom(evaluator, rng);
      if (delta === null) continue;
      if (delta >= 0) evaluator.commit();
      else evaluator.rollback();
    }

    const reference = new Evaluator(problem);
    reference.setAssignment(evaluator.seatOf);
    expect(evaluator.total).toBeCloseTo(reference.total, 9);
    for (let i = 0; i < problem.n; i++) {
      expect(evaluator.perStudent[i]).toBeCloseTo(reference.perStudent[i]!, 9);
    }
  });

  it('seatOf und studentAt bleiben zueinander konsistent', () => {
    const { problem, evaluator, rng } = setup();

    for (let step = 0; step < 20000; step++) {
      const delta = proposeRandom(evaluator, rng);
      if (delta === null) continue;
      if (rng() < 0.5) evaluator.commit();
      else evaluator.rollback();
    }

    const occupiedBy = new Map<number, number>();
    for (let i = 0; i < problem.n; i++) {
      const seat = evaluator.seatOf[i]!;
      expect(seat).toBeGreaterThanOrEqual(0);
      expect(occupiedBy.has(seat)).toBe(false);
      occupiedBy.set(seat, i);
      expect(evaluator.studentAt[seat]).toBe(i);
    }
    for (let seat = 0; seat < problem.m; seat++) {
      const occupant = evaluator.studentAt[seat]!;
      if (occupant === EMPTY) expect(occupiedBy.has(seat)).toBe(false);
      else expect(evaluator.seatOf[occupant]).toBe(seat);
    }
  });

  it('lehnt Züge ab, die eine harte Regel verletzen würden', () => {
    const { problem, evaluator, rng } = setup();
    let rejected = 0;

    for (let step = 0; step < 20000; step++) {
      const before = Int32Array.from(evaluator.seatOf);
      const delta = proposeRandom(evaluator, rng);

      if (delta === null) {
        rejected++;
        // Abgelehnte Züge dürfen den Zustand nicht verändern.
        expect(Array.from(evaluator.seatOf)).toEqual(Array.from(before));
        continue;
      }

      // Angenommene Züge müssen alle harten Regeln einhalten. Die Prüfung sammelt
      // erst und meldet nur im Fehlerfall — zehntausende `expect`-Aufrufe je Zug
      // würden den Test um ein Vielfaches verlangsamen, ohne mehr abzudecken.
      for (let i = 0; i < problem.n; i++) {
        if (!evaluator.isAllowed(i, evaluator.seatOf[i]!)) {
          throw new Error(`Person ${i} sitzt nach Zug ${step} auf einem unerlaubten Platz.`);
        }
        for (let k = problem.sepStart[i]!, end = problem.sepStart[i + 1]!; k < end; k++) {
          const partnerSeat = evaluator.seatOf[problem.sepPartner[k]!]!;
          const proximity = problem.prox.values[evaluator.seatOf[i]! * problem.m + partnerSeat]!;
          if (proximity >= problem.sepThreshold[k]!) {
            throw new Error(`Trennung von Person ${i} nach Zug ${step} verletzt.`);
          }
        }
      }

      evaluator.rollback();
    }

    expect(rejected).toBeGreaterThan(0);
  });
});
