/**
 * Simulated Annealing und deterministisches Bergsteigen.
 *
 * Zuggenerator: Es werden eine zufällige Person und ein zufälliger Platz gezogen.
 * Ist der Platz frei, wird umgesetzt; ist er belegt, wird mit der dort sitzenden
 * Person getauscht. Dazu kommen gelegentliche Dreier-Rotationen — die bringen die
 * Suche über lokale Optima hinweg, die ein reiner Tausch nicht verlässt.
 *
 * Unzulässige Züge (harte Regeln) liefern `null` und werden übersprungen.
 */

import { EMPTY, Evaluator } from './objective';
import type { Rng } from './random';

/** Anteil der Züge, die eine Dreier-Rotation versuchen. */
const ROTATE_PROBABILITY = 0.1;
/** Endtemperatur als Bruchteil der Starttemperatur. */
const COOLING_RATIO = 1 / 1000;

function randomMove(ev: Evaluator, rng: Rng): number | null {
  const p = ev.problem;

  if (rng() < ROTATE_PROBABILITY) {
    return ev.proposeRotate3(rng.int(p.n), rng.int(p.n), rng.int(p.n));
  }

  const i = rng.int(p.n);
  const seat = rng.int(p.m);
  const occupant = ev.studentAt[seat]!;
  if (occupant === EMPTY) return ev.proposeMove(i, seat);
  if (occupant === i) return null;
  return ev.proposeSwap(i, occupant);
}

/**
 * Starttemperatur so wählen, dass anfangs etwa die Hälfte der verschlechternden
 * Züge angenommen wird: T0 = mittlere Verschlechterung / ln 2.
 */
function calibrateTemperature(ev: Evaluator, rng: Rng, samples = 200): number {
  let sum = 0;
  let count = 0;

  for (let s = 0; s < samples; s++) {
    const delta = randomMove(ev, rng);
    if (delta === null) continue;
    if (delta < 0) {
      sum += -delta;
      count++;
    }
    ev.rollback();
  }

  return count === 0 ? 1 : sum / count / Math.LN2;
}

export interface AnnealResult {
  /** Beste gefundene Zuordnung. */
  assignment: Int32Array;
  score: number;
}

/**
 * Führt einen Annealing-Lauf auf dem aktuellen Zustand des Evaluators aus und
 * hinterlässt ihn auf der besten gefundenen Lösung.
 */
export function anneal(ev: Evaluator, rng: Rng, iterations: number): AnnealResult {
  const best = Int32Array.from(ev.seatOf);
  let bestScore = ev.total;

  const startTemperature = calibrateTemperature(ev, rng);
  const cooling = Math.pow(COOLING_RATIO, 1 / Math.max(1, iterations));
  let temperature = startTemperature;

  for (let step = 0; step < iterations; step++) {
    const delta = randomMove(ev, rng);
    if (delta !== null) {
      if (delta >= 0 || rng() < Math.exp(delta / temperature)) {
        ev.commit();
        if (ev.total > bestScore) {
          bestScore = ev.total;
          best.set(ev.seatOf);
        }
      } else {
        ev.rollback();
      }
    }
    temperature *= cooling;
  }

  ev.setAssignment(best);
  return { assignment: best, score: bestScore };
}

/**
 * Deterministisches Bergsteigen bis zum lokalen Optimum: alle Tauschpaare und alle
 * Umsetzungen auf freie Plätze, solange sich noch etwas verbessert.
 */
export function hillClimb(ev: Evaluator): void {
  const p = ev.problem;
  const epsilon = 1e-9;
  let improved = true;

  while (improved) {
    improved = false;

    for (let i = 0; i < p.n; i++) {
      for (let j = i + 1; j < p.n; j++) {
        const delta = ev.proposeSwap(i, j);
        if (delta === null) continue;
        if (delta > epsilon) {
          ev.commit();
          improved = true;
        } else {
          ev.rollback();
        }
      }

      for (let seat = 0; seat < p.m; seat++) {
        if (ev.studentAt[seat] !== EMPTY) continue;
        const delta = ev.proposeMove(i, seat);
        if (delta === null) continue;
        if (delta > epsilon) {
          ev.commit();
          improved = true;
        } else {
          ev.rollback();
        }
      }
    }
  }
}
