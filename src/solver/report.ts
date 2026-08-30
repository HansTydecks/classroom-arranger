/**
 * Auswertung einer fertigen Sitzverteilung.
 *
 * Ein Sitzplan ohne Begründung ist für die Lehrkraft eine Blackbox. Der Bericht
 * beantwortet deshalb pro Person „welcher Wunsch ist aufgegangen und welcher nicht“
 * und liefert die Kennzahlen, an denen sich ein Plan beurteilen lässt.
 */

import { Evaluator } from './objective';
import { displayName, specialAllows, specialBonus } from './problem';
import type { SolverProblem } from './problem';
import type { RoomLayout, Seat, SpecialKind, SpecialRequest } from '../types/model';

export interface WishOutcome {
  targetId: string;
  targetName: string;
  /** 0 = Erstwunsch. */
  rank: number;
  /** Erreichte Nähe zwischen 0 und 1. */
  proximity: number;
  fulfilled: boolean;
  /** Wünscht die andere Person umgekehrt ebenfalls? */
  mutual: boolean;
}

export interface SpecialOutcome {
  kind: SpecialKind;
  hard: boolean;
  satisfied: boolean;
}

export interface StudentReport {
  studentId: string;
  name: string;
  seatId: string | null;
  /** Logische Tischreihe, 0 = vorne. */
  tableRow: number | null;
  wishes: WishOutcome[];
  specials: SpecialOutcome[];
  fulfilledCount: number;
  /** Rang des besten erfüllten Wunsches, oder `null`. */
  bestFulfilledRank: number | null;
  score: number;
}

export interface SolutionStats {
  score: number;
  studentCount: number;
  seatCount: number;
  /** Personen, die überhaupt Wünsche abgegeben haben. */
  withWishes: number;
  withAtLeastOneFulfilled: number;
  /** Anteil in Prozent, bezogen auf `withWishes`. */
  fulfilledShare: number;
  firstChoiceFulfilled: number;
  secondChoiceFulfilled: number;
  mutualPairsTotal: number;
  mutualPairsRealized: number;
  softSpecialsTotal: number;
  softSpecialsSatisfied: number;
  hardSpecialsTotal: number;
  separationsTotal: number;
  separationsRespected: number;
}

export interface SolutionReport {
  perStudent: StudentReport[];
  stats: SolutionStats;
  /** Personen mit Wünschen, von denen keiner aufgegangen ist. */
  unfulfilled: StudentReport[];
  /**
   * Verletzte harte Regeln im Klartext. Der Solver erzeugt nie welche — nach einem
   * manuellen Umsetzen per Ziehen &amp; Ablegen kann die Lehrkraft aber bewusst eine
   * Vorgabe brechen, und das muss sichtbar sein.
   */
  hardViolations: string[];
}

export function buildReport(problem: SolverProblem, assignment: Int32Array): SolutionReport {
  const { n, m, room, students, weights, prox } = problem;

  // Einzelbewertungen für die Anzeige: derselbe Evaluator wie in der Suche.
  const evaluator = new Evaluator(problem);
  evaluator.setAssignment(assignment);
  const threshold = weights.fulfilledProximity;
  const perStudent: StudentReport[] = [];

  let withWishes = 0;
  let withAtLeastOneFulfilled = 0;
  let firstChoiceFulfilled = 0;
  let secondChoiceFulfilled = 0;
  let softSpecialsTotal = 0;
  let softSpecialsSatisfied = 0;
  let hardSpecialsTotal = 0;

  for (let i = 0; i < n; i++) {
    const student = students[i]!;
    const seatIdx = assignment[i]!;
    const seat = seatIdx >= 0 ? room.seats[seatIdx]! : null;

    const wishes: WishOutcome[] = [];
    let fulfilledCount = 0;
    let bestFulfilledRank: number | null = null;

    for (let k = problem.wishStart[i]!, end = problem.wishStart[i + 1]!; k < end; k++) {
      const target = problem.wishTarget[k]!;
      const targetSeat = assignment[target]!;
      const proximity =
        seatIdx >= 0 && targetSeat >= 0 ? prox.values[seatIdx * m + targetSeat]! : 0;
      const fulfilled = proximity >= threshold;
      const rank = problem.wishRank[k]!;

      if (fulfilled) {
        fulfilledCount++;
        if (bestFulfilledRank === null || rank < bestFulfilledRank) bestFulfilledRank = rank;
        if (rank === 0) firstChoiceFulfilled++;
        if (rank === 1) secondChoiceFulfilled++;
      }

      wishes.push({
        targetId: students[target]!.id,
        targetName: displayName(students[target]!),
        rank,
        proximity,
        fulfilled,
        mutual: wishesBack(problem, target, i),
      });
    }

    if (wishes.length > 0) {
      withWishes++;
      if (fulfilledCount > 0) withAtLeastOneFulfilled++;
    }

    const specials: SpecialOutcome[] = student.specials.map((special) => {
      const satisfied = !seat
        ? false
        : special.hard
          ? specialAllows(special, seat, room)
          : softSatisfied(special, seat, room, weights.specialBonus);
      if (special.hard) hardSpecialsTotal++;
      else {
        softSpecialsTotal++;
        if (satisfied) softSpecialsSatisfied++;
      }
      return { kind: special.kind, hard: special.hard, satisfied };
    });

    perStudent.push({
      studentId: student.id,
      name: displayName(student),
      seatId: seat?.id ?? null,
      tableRow: seat?.tableRow ?? null,
      wishes,
      specials,
      fulfilledCount,
      bestFulfilledRank,
      score: evaluator.perStudent[i]!,
    });
  }

  const mutual = countMutualPairs(problem, assignment, threshold);
  const separations = countSeparations(problem, assignment);

  return {
    perStudent,
    hardViolations: findHardViolations(problem, assignment, perStudent),
    unfulfilled: perStudent.filter((r) => r.wishes.length > 0 && r.fulfilledCount === 0),
    stats: {
      score: evaluator.total,
      studentCount: n,
      seatCount: m,
      withWishes,
      withAtLeastOneFulfilled,
      fulfilledShare: withWishes === 0 ? 100 : (withAtLeastOneFulfilled / withWishes) * 100,
      firstChoiceFulfilled,
      secondChoiceFulfilled,
      mutualPairsTotal: mutual.total,
      mutualPairsRealized: mutual.realized,
      softSpecialsTotal,
      softSpecialsSatisfied,
      hardSpecialsTotal,
      separationsTotal: separations.total,
      separationsRespected: separations.respected,
    },
  };
}

function wishesBack(problem: SolverProblem, from: number, to: number): boolean {
  for (let k = problem.wishStart[from]!, end = problem.wishStart[from + 1]!; k < end; k++) {
    if (problem.wishTarget[k] === to) return true;
  }
  return false;
}

function countMutualPairs(
  problem: SolverProblem,
  assignment: Int32Array,
  threshold: number,
): { total: number; realized: number } {
  let total = 0;
  let realized = 0;

  for (let i = 0; i < problem.n; i++) {
    for (let k = problem.wishStart[i]!, end = problem.wishStart[i + 1]!; k < end; k++) {
      const j = problem.wishTarget[k]!;
      if (j <= i || !wishesBack(problem, j, i)) continue;
      total++;
      const a = assignment[i]!;
      const b = assignment[j]!;
      if (a >= 0 && b >= 0 && problem.prox.values[a * problem.m + b]! >= threshold) realized++;
    }
  }

  return { total, realized };
}

/**
 * Zählt die eingehaltenen Trennungen. Der Solver kann sie strukturell nicht verletzen;
 * die Prüfung dient als Sicherheitsnetz und macht die Zusicherung im Bericht sichtbar.
 */
function countSeparations(
  problem: SolverProblem,
  assignment: Int32Array,
): { total: number; respected: number } {
  let total = 0;
  let respected = 0;

  for (let i = 0; i < problem.n; i++) {
    for (let k = problem.sepStart[i]!, end = problem.sepStart[i + 1]!; k < end; k++) {
      const j = problem.sepPartner[k]!;
      if (j <= i) continue;
      total++;
      const a = assignment[i]!;
      const b = assignment[j]!;
      const proximity = a >= 0 && b >= 0 ? problem.prox.values[a * problem.m + b]! : 0;
      if (proximity < problem.sepThreshold[k]!) respected++;
    }
  }

  return { total, respected };
}

/** Sammelt alle verletzten harten Regeln im Klartext. */
function findHardViolations(
  problem: SolverProblem,
  assignment: Int32Array,
  perStudent: StudentReport[],
): string[] {
  const violations: string[] = [];
  const { m, room, students } = problem;

  for (let i = 0; i < problem.n; i++) {
    const seat = assignment[i]!;
    const name = displayName(students[i]!);

    if (seat >= 0 && problem.allowed[i * m + seat] !== 1) {
      const pinned = students[i]!.pinnedSeat;
      const unmet = perStudent[i]!.specials
        .filter((special) => special.hard && !special.satisfied)
        .map((special) => special.kind);
      violations.push(
        pinned && room.seats[seat]!.id !== pinned
          ? `${name} sitzt nicht auf dem festgehaltenen Platz.`
          : `${name}: harte Vorgabe nicht eingehalten (${unmet.join(', ') || 'Platzvorgabe'}).`,
      );
    }

    for (let k = problem.sepStart[i]!, end = problem.sepStart[i + 1]!; k < end; k++) {
      const j = problem.sepPartner[k]!;
      if (j <= i) continue;
      const partnerSeat = assignment[j]!;
      if (seat < 0 || partnerSeat < 0) continue;
      if (problem.prox.values[seat * m + partnerSeat]! >= problem.sepThreshold[k]!) {
        violations.push(
          `${name} und ${displayName(students[j]!)} sitzen zu nah beieinander — die Trennung ist verletzt.`,
        );
      }
    }
  }

  return violations;
}

/**
 * Gilt ein *weicher* Sonderwunsch als erfüllt?
 *
 * Die harte Lesart wäre zu streng: Wer „lieber vorne“ möchte und bei fünf Reihen in
 * der zweiten sitzt, hat seinen Wunsch der Sache nach bekommen — nach der harten
 * Regel („erste Reihe“) stünde dort trotzdem ein Kreuz. Maßstab ist deshalb, ob der
 * Platz mindestens in der besseren Hälfte dessen liegt, was in diesem Raum für diesen
 * Wunsch überhaupt erreichbar ist.
 */
function softSatisfied(
  special: SpecialRequest,
  seat: Seat,
  room: RoomLayout,
  base: number,
): boolean {
  let lowest = Infinity;
  let highest = -Infinity;

  for (const candidate of room.seats) {
    const value = specialBonus(special, candidate, room, base);
    if (value < lowest) lowest = value;
    if (value > highest) highest = value;
  }

  // Kein Platz ist besser als ein anderer — dann ist nichts zu erfüllen.
  if (highest <= lowest) return true;

  return specialBonus(special, seat, room, base) >= (lowest + highest) / 2;
}
