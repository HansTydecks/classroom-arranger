/**
 * Startlösungen für die lokale Suche.
 *
 * Beide Verfahren liefern eine *zulässige* Zuordnung (harte Sonderwünsche, Pins und
 * Trennungen eingehalten) oder `null`, wenn sie sich festgefahren haben. `solve.ts`
 * startet dann mit einem anderen Zufallswert neu.
 */

import { EMPTY } from './objective';
import type { SolverProblem } from './problem';
import type { Rng } from './random';

/** Belegung während des Aufbaus: Platz je Person und Person je Platz. */
interface Partial {
  seatOf: Int32Array;
  studentAt: Int32Array;
}

function emptyPartial(problem: SolverProblem): Partial {
  return {
    seatOf: new Int32Array(problem.n).fill(EMPTY),
    studentAt: new Int32Array(problem.m).fill(EMPTY),
  };
}

/** Verstößt Person i auf Platz s gegen eine harte Regel? Berücksichtigt nur bereits Platzierte. */
function feasible(p: SolverProblem, state: Partial, i: number, seat: number): boolean {
  if (p.allowed[i * p.m + seat] !== 1) return false;
  if (state.studentAt[seat] !== EMPTY) return false;
  const row = seat * p.m;
  for (let k = p.sepStart[i]!, end = p.sepStart[i + 1]!; k < end; k++) {
    const partnerSeat = state.seatOf[p.sepPartner[k]!]!;
    if (partnerSeat === EMPTY) continue;
    if (p.prox.values[row + partnerSeat]! >= p.sepThreshold[k]!) return false;
  }
  return true;
}

function place(state: Partial, i: number, seat: number): void {
  state.seatOf[i] = seat;
  state.studentAt[seat] = i;
}

/**
 * Wert, den Platz `seat` für Person i *im aktuellen Teilaufbau* hat: Sonderwunsch-Bonus
 * plus alle Wunschbeziehungen zu bereits platzierten Personen — in beide Richtungen,
 * denn ein Wunsch zählt auch dann, wenn die andere Seite ihn geäußert hat.
 */
function incrementalValue(p: SolverProblem, state: Partial, i: number, seat: number): number {
  let value = p.unary[i * p.m + seat]!;
  const row = seat * p.m;

  for (let k = p.wishStart[i]!, end = p.wishStart[i + 1]!; k < end; k++) {
    const partnerSeat = state.seatOf[p.wishTarget[k]!]!;
    if (partnerSeat !== EMPTY) value += p.wishBase[k]! * p.prox.values[row + partnerSeat]!;
  }

  for (let a = p.affectedStart[i]!, end = p.affectedStart[i + 1]!; a < end; a++) {
    const j = p.affected[a]!;
    if (j === i) continue;
    const partnerSeat = state.seatOf[j]!;
    if (partnerSeat === EMPTY) continue;
    for (let k = p.wishStart[j]!, jEnd = p.wishStart[j + 1]!; k < jEnd; k++) {
      if (p.wishTarget[k] === i) value += p.wishBase[k]! * p.prox.values[row + partnerSeat]!;
    }
  }

  return value;
}

/**
 * Reihenfolge nach Eingeschränktheit: Wer die wenigsten erlaubten Plätze und die
 * meisten Trennungen hat, wird zuerst gesetzt — sonst bleiben am Ende nur Plätze
 * übrig, die für die schwierigen Fälle nicht taugen.
 */
function constrainednessOrder(p: SolverProblem, rng: Rng): number[] {
  const order = Array.from({ length: p.n }, (_, i) => i);
  const key = (i: number) =>
    p.domainSize[i]! * 1000 -
    (p.sepStart[i + 1]! - p.sepStart[i]!) * 100 -
    (p.wishStart[i + 1]! - p.wishStart[i]!) * 10 +
    rng() * 5;
  return order.sort((a, b) => key(a) - key(b));
}

/** Setzt alle noch unplatzierten Personen gierig mit randomisierter Auswahl. */
function fillGreedy(p: SolverProblem, state: Partial, rng: Rng): boolean {
  const order = constrainednessOrder(p, rng).filter((i) => state.seatOf[i] === EMPTY);

  for (const i of order) {
    let best: Array<{ seat: number; value: number }> = [];

    for (let seat = 0; seat < p.m; seat++) {
      if (!feasible(p, state, i, seat)) continue;
      const value = incrementalValue(p, state, i, seat);
      if (best.length < 3) {
        best.push({ seat, value });
        best.sort((a, b) => b.value - a.value);
      } else if (value > best[2]!.value) {
        best[2] = { seat, value };
        best.sort((a, b) => b.value - a.value);
      }
    }

    if (best.length === 0) {
      if (!placeByEjection(p, state, i, rng)) return false;
      continue;
    }
    place(state, i, best[rng.int(best.length)]!.seat);
  }

  return true;
}

/**
 * Rettungsanker, wenn für Person i kein zulässiger freier Platz mehr übrig ist —
 * typischerweise, weil die letzten freien Plätze alle neben einer Person liegen,
 * von der i getrennt werden muss.
 *
 * Wir nehmen dann einer bereits platzierten Person j den Platz weg, setzen i dorthin
 * und suchen für j einen der freien Plätze. Das löst die allermeisten Sackgassen und
 * kostet höchstens O(m²) — bei 30 Plätzen also nichts.
 */
function placeByEjection(p: SolverProblem, state: Partial, i: number, rng: Rng): boolean {
  const freeSeats: number[] = [];
  for (let seat = 0; seat < p.m; seat++) {
    if (state.studentAt[seat] === EMPTY) freeSeats.push(seat);
  }
  shuffle(freeSeats, rng);

  const occupied: number[] = [];
  for (let seat = 0; seat < p.m; seat++) {
    if (state.studentAt[seat] !== EMPTY && p.allowed[i * p.m + seat] === 1) occupied.push(seat);
  }
  shuffle(occupied, rng);

  for (const seat of occupied) {
    const j = state.studentAt[seat]!;

    state.studentAt[seat] = EMPTY;
    state.seatOf[j] = EMPTY;

    if (feasible(p, state, i, seat)) {
      place(state, i, seat);
      for (const target of freeSeats) {
        if (feasible(p, state, j, target)) {
          place(state, j, target);
          return true;
        }
      }
      state.seatOf[i] = EMPTY;
      state.studentAt[seat] = EMPTY;
    }

    place(state, j, seat);
  }

  return false;
}

function shuffle(values: number[], rng: Rng): void {
  for (let k = values.length - 1; k > 0; k--) {
    const swapWith = rng.int(k + 1);
    const tmp = values[k]!;
    values[k] = values[swapWith]!;
    values[swapWith] = tmp;
  }
}

/** Randomisiert-gieriger Aufbau (GRASP). */
export function constructGreedy(p: SolverProblem, rng: Rng): Int32Array | null {
  const state = emptyPartial(p);
  return fillGreedy(p, state, rng) ? state.seatOf : null;
}

/**
 * Paar-zuerst: Gegenseitige Wunschpaare werden zuerst auf benachbarte Plätze gesetzt,
 * danach füllt das gierige Verfahren auf. Führt oft direkt in ein sehr gutes Tal.
 */
export function constructPairFirst(p: SolverProblem, rng: Rng): Int32Array | null {
  const state = emptyPartial(p);

  for (const [i, j] of mutualPairs(p, rng)) {
    if (state.seatOf[i] !== EMPTY || state.seatOf[j] !== EMPTY) continue;

    let bestValue = -Infinity;
    let bestA = EMPTY;
    let bestB = EMPTY;

    for (const [a, b] of adjacentSeatPairs(p)) {
      for (const [x, y] of [
        [a, b],
        [b, a],
      ] as const) {
        if (!feasible(p, state, i, x)) continue;
        place(state, i, x);
        const ok = feasible(p, state, j, y);
        const value = ok ? incrementalValue(p, state, i, x) + incrementalValue(p, state, j, y) : -Infinity;
        state.seatOf[i] = EMPTY;
        state.studentAt[x] = EMPTY;
        if (value > bestValue) {
          bestValue = value;
          bestA = x;
          bestB = y;
        }
      }
    }

    if (bestA !== EMPTY) {
      place(state, i, bestA);
      place(state, j, bestB);
    }
  }

  return fillGreedy(p, state, rng) ? state.seatOf : null;
}

/** Gegenseitige Wunschpaare und harte Nachbarpaare, absteigend nach Gewicht. */
function mutualPairs(p: SolverProblem, rng: Rng): Array<[number, number]> {
  const pairs: Array<{ i: number; j: number; weight: number }> = [];

  for (let i = 0; i < p.n; i++) {
    for (let k = p.wishStart[i]!, end = p.wishStart[i + 1]!; k < end; k++) {
      const j = p.wishTarget[k]!;
      if (j <= i) continue;
      let back = 0;
      for (let k2 = p.wishStart[j]!, jEnd = p.wishStart[j + 1]!; k2 < jEnd; k2++) {
        if (p.wishTarget[k2] === i) back = p.wishBase[k2]!;
      }
      if (back > 0) pairs.push({ i, j, weight: p.wishBase[k]! + back + rng() });
    }
  }

  // Harte „muss neben X“-Regeln haben Vorrang vor allen Wünschen.
  for (const { a, b } of p.togetherRules) {
    pairs.push({ i: Math.min(a, b), j: Math.max(a, b), weight: 1e6 + rng() });
  }

  pairs.sort((a, b) => b.weight - a.weight);
  return pairs.map(({ i, j }) => [i, j]);
}

const adjacentCache = new WeakMap<SolverProblem, Array<[number, number]>>();

/** Alle Platzpaare, die unmittelbar nebeneinander liegen. */
function adjacentSeatPairs(p: SolverProblem): Array<[number, number]> {
  const cached = adjacentCache.get(p);
  if (cached) return cached;

  const pairs: Array<[number, number]> = [];
  for (let a = 0; a < p.m; a++) {
    for (let b = a + 1; b < p.m; b++) {
      if (p.prox.values[a * p.m + b]! >= 1) pairs.push([a, b]);
    }
  }
  adjacentCache.set(p, pairs);
  return pairs;
}
