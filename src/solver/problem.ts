/**
 * Übersetzt das Eingabemodell (`types/model.ts`) einmalig in eine index- und
 * typed-array-basierte Form, mit der die Suche ohne Objektzugriffe und ohne
 * Allokationen arbeiten kann.
 *
 * Personen und Plätze werden durchnummeriert; alle Verweise sind ab hier Zahlen.
 */

import { buildProximityMatrix, SEPARATION_THRESHOLD } from '../domain/proximity';
import type { ProximityMatrix } from '../domain/proximity';
import type {
  ClassData,
  RoomLayout,
  Seat,
  SpecialRequest,
  Student,
  Weights,
} from '../types/model';
import { MAX_WISHES } from '../types/model';

export interface SolverProblem {
  /** Anzahl Personen. */
  n: number;
  /** Anzahl Plätze. */
  m: number;
  room: RoomLayout;
  students: Student[];
  studentIndex: Map<string, number>;
  seatIndex: Map<string, number>;
  weights: Weights;
  prox: ProximityMatrix;

  /** Wünsche im CSR-Format: Person i besitzt `wishStart[i] .. wishStart[i+1]`. */
  wishStart: Int32Array;
  /** Zielperson des Wunsches. */
  wishTarget: Int32Array;
  /** Grundwert des Wunsches: Rangwert, ggf. mit Gegenseitigkeitsfaktor. */
  wishBase: Float64Array;
  /** Rang des Wunsches (0 = Erstwunsch) — nur für den Bericht. */
  wishRank: Int32Array;

  /**
   * Personen, deren Bewertung sich ändert, wenn Person i den Platz wechselt:
   * i selbst und alle, die sich i wünschen. (Wen i sich wünscht, ist irrelevant —
   * deren eigene Bewertung hängt nur an ihren eigenen Wünschen.)
   */
  affectedStart: Int32Array;
  affected: Int32Array;

  /** Bonus für weiche Sonderwünsche: `unary[i * m + s]`. */
  unary: Float64Array;
  /** Erlaubte Plätze aus harten Sonderwünschen und Pins: `allowed[i * m + s]`. */
  allowed: Uint8Array;
  /** Anzahl erlaubter Plätze je Person — für die Sortierung nach Eingeschränktheit. */
  domainSize: Int32Array;

  /** Harte Trennungen im CSR-Format über die Personen. */
  sepStart: Int32Array;
  sepPartner: Int32Array;
  /** Verbotene Nähe: Platzpaare mit `w >= sepThreshold` sind untersagt. */
  sepThreshold: Float64Array;
}

export interface CompileResult {
  problem: SolverProblem;
  /** Hinweise auf ignorierte Eingaben (unbekannte Namen, Selbstwünsche, Dubletten). */
  warnings: string[];
}

/** Baut die Solver-Darstellung aus Klassendaten und fertigem Raumlayout. */
export function compileProblem(data: ClassData, room: RoomLayout): CompileResult {
  const warnings: string[] = [];
  const students = data.students;
  const n = students.length;
  const seats = room.seats;
  const m = seats.length;

  const studentIndex = new Map(students.map((s, i) => [s.id, i]));
  const seatIndex = new Map(seats.map((s, i) => [s.id, i]));
  const prox = buildProximityMatrix(room);
  const weights = data.weights;

  // --- Wünsche einlesen, bereinigen, Gegenseitigkeit bestimmen ---------------

  const rawWishes: Array<Array<{ target: number; rank: number }>> = [];
  const wishSets: Array<Set<number>> = [];

  for (let i = 0; i < n; i++) {
    const student = students[i]!;
    const seen = new Set<number>();
    const list: Array<{ target: number; rank: number }> = [];

    student.wishes.slice(0, MAX_WISHES).forEach((wishId, rank) => {
      if (!wishId) return;
      const target = studentIndex.get(wishId);
      if (target === undefined) {
        warnings.push(`${displayName(student)}: Wunsch verweist auf einen unbekannten Namen.`);
        return;
      }
      if (target === i) {
        warnings.push(`${displayName(student)}: Wunsch auf sich selbst wird ignoriert.`);
        return;
      }
      if (seen.has(target)) {
        warnings.push(`${displayName(student)}: Doppelter Wunsch wird nur einmal gezählt.`);
        return;
      }
      seen.add(target);
      list.push({ target, rank });
    });

    rawWishes.push(list);
    wishSets.push(seen);
  }

  const totalWishes = rawWishes.reduce((sum, list) => sum + list.length, 0);
  const wishStart = new Int32Array(n + 1);
  const wishTarget = new Int32Array(totalWishes);
  const wishBase = new Float64Array(totalWishes);
  const wishRank = new Int32Array(totalWishes);

  let cursor = 0;
  for (let i = 0; i < n; i++) {
    wishStart[i] = cursor;
    for (const { target, rank } of rawWishes[i]!) {
      const rankValue = weights.wishRank[Math.min(rank, weights.wishRank.length - 1)] ?? 0;
      const mutual = wishSets[target]!.has(i);
      wishTarget[cursor] = target;
      wishRank[cursor] = rank;
      wishBase[cursor] = rankValue * (mutual ? weights.mutualFactor : 1);
      cursor++;
    }
  }
  wishStart[n] = cursor;

  // --- Rückwärtsindex: wer wünscht sich Person i? ---------------------------

  const wishedBy: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (const { target } of rawWishes[i]!) wishedBy[target]!.push(i);
  }

  const affectedStart = new Int32Array(n + 1);
  const affectedList: number[] = [];
  for (let i = 0; i < n; i++) {
    affectedStart[i] = affectedList.length;
    affectedList.push(i);
    for (const j of wishedBy[i]!) if (j !== i) affectedList.push(j);
  }
  affectedStart[n] = affectedList.length;

  // --- Sonderwünsche: Bonus (weich) und erlaubte Plätze (hart) --------------

  const unary = new Float64Array(n * m);
  const allowed = new Uint8Array(n * m).fill(1);
  const domainSize = new Int32Array(n);

  for (let i = 0; i < n; i++) {
    const student = students[i]!;
    const pinned = student.pinnedSeat ? seatIndex.get(student.pinnedSeat) : undefined;
    if (student.pinnedSeat && pinned === undefined) {
      warnings.push(`${displayName(student)}: Fester Platz existiert im Raum nicht mehr.`);
    }

    for (let s = 0; s < m; s++) {
      const seat = seats[s]!;
      let bonus = 0;
      let ok = pinned === undefined || pinned === s;

      for (const special of student.specials) {
        if (special.hard) {
          if (!specialAllows(special, seat, room)) ok = false;
        } else {
          bonus += specialBonus(special, seat, room, weights.specialBonus);
        }
      }

      unary[i * m + s] = bonus;
      allowed[i * m + s] = ok ? 1 : 0;
      if (ok) domainSize[i]!++;
    }

    if (domainSize[i] === 0) {
      warnings.push(
        `${displayName(student)}: Die harten Vorgaben lassen keinen einzigen Platz zu.`,
      );
    }
  }

  // --- Harte Trennungen -----------------------------------------------------

  const sepLists: Array<Array<{ partner: number; threshold: number }>> = Array.from(
    { length: n },
    () => [],
  );
  for (const sep of data.separations) {
    const a = studentIndex.get(sep.a);
    const b = studentIndex.get(sep.b);
    if (a === undefined || b === undefined || a === b) {
      warnings.push('Eine Trennung verweist auf einen unbekannten Namen und wird ignoriert.');
      continue;
    }
    const threshold = SEPARATION_THRESHOLD[sep.radius];
    sepLists[a]!.push({ partner: b, threshold });
    sepLists[b]!.push({ partner: a, threshold });
  }

  const sepStart = new Int32Array(n + 1);
  const sepPartnerList: number[] = [];
  const sepThresholdList: number[] = [];
  for (let i = 0; i < n; i++) {
    sepStart[i] = sepPartnerList.length;
    for (const { partner, threshold } of sepLists[i]!) {
      sepPartnerList.push(partner);
      sepThresholdList.push(threshold);
    }
  }
  sepStart[n] = sepPartnerList.length;

  return {
    problem: {
      n,
      m,
      room,
      students,
      studentIndex,
      seatIndex,
      weights,
      prox,
      wishStart,
      wishTarget,
      wishBase,
      wishRank,
      affectedStart,
      affected: Int32Array.from(affectedList),
      unary,
      allowed,
      domainSize,
      sepStart,
      sepPartner: Int32Array.from(sepPartnerList),
      sepThreshold: Float64Array.from(sepThresholdList),
    },
    warnings: [...new Set(warnings)],
  };
}

// ---------------------------------------------------------------------------
// Sonderwünsche
// ---------------------------------------------------------------------------

/** Erfüllt der Platz einen *harten* Sonderwunsch? */
export function specialAllows(
  special: SpecialRequest,
  seat: Seat,
  room: RoomLayout,
): boolean {
  switch (special.kind) {
    case 'front':
      return seat.tableRow === 0;
    case 'notBack':
      return !seat.tags.includes('back');
    case 'window':
      return seat.tags.includes('window');
    case 'aisle':
      return seat.tags.includes('aisle');
    case 'notDoor':
      return !seat.tags.includes('door');
    case 'maxRow':
      return seat.tableRow <= (special.row ?? room.tableRowCount - 1);
  }
}

/**
 * Bonus für einen *weichen* Sonderwunsch. Gestuft statt binär, damit Reihe 2 besser
 * bewertet wird als Reihe 5, wenn Reihe 1 schon voll ist.
 */
export function specialBonus(
  special: SpecialRequest,
  seat: Seat,
  room: RoomLayout,
  base: number,
): number {
  const lastRow = Math.max(1, room.tableRowCount - 1);

  switch (special.kind) {
    case 'front':
      return base * (1 - seat.tableRow / lastRow);
    case 'notBack':
      return seat.tags.includes('back') ? -base : 0;
    case 'window': {
      if (seat.tags.includes('window')) return base;
      return inWindowHalf(seat, room) ? base * 0.375 : 0;
    }
    case 'aisle':
      return seat.tags.includes('aisle') ? base : 0;
    case 'notDoor':
      return seat.tags.includes('door') ? -base : 0;
    case 'maxRow': {
      const limit = special.row ?? room.tableRowCount - 1;
      return seat.tableRow > limit ? -base : 0;
    }
  }
}

function inWindowHalf(seat: Seat, room: RoomLayout): boolean {
  const side = room.config.windowSide;
  if (side === 'none') return false;
  const middle = (room.gridCols - 1) / 2;
  return side === 'left' ? seat.col < middle : seat.col > middle;
}

export function displayName(student: Student): string {
  return student.lastName
    ? `${student.firstName} ${student.lastName}`
    : student.firstName;
}
