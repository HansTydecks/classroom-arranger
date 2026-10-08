/**
 * Übersetzt das Eingabemodell (`types/model.ts`) einmalig in eine index- und
 * typed-array-basierte Form, mit der die Suche ohne Objektzugriffe und ohne
 * Allokationen arbeiten kann.
 *
 * Personen und Plätze werden durchnummeriert; alle Verweise sind ab hier Zahlen.
 */

import { buildProximityMatrix, SEPARATION_THRESHOLD } from '../domain/proximity';
import type { ProximityMatrix } from '../domain/proximity';
import { isApartRule, isPairRule, pairRadius } from '../domain/rules';
import { msg } from '../i18n/message';
import type { Msg } from '../i18n/message';
import type {
  ClassData,
  RoomLayout,
  Seat,
  SpecialKind,
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
  /** Alle harten Trennungen einmal je Paar — für Vorabprüfung und Bericht. */
  separations: SeparationPair[];

  /**
   * Weiche und „muss zusammen“-Beziehungsregeln im CSR-Format über die Person, die
   * die Regel trägt. Der Wert gehört nur zu dieser Person (nicht zum Partner).
   */
  pairStart: Int32Array;
  pairPartner: Int32Array;
  /** Nähe, ab der die Regel als erfüllt gilt. */
  pairThreshold: Float64Array;
  /** `PAIR_*`-Modus der Regel. */
  pairMode: Int8Array;
  /** Gewicht des Bonus bzw. Malus (nur weiche Modi). */
  pairWeight: Float64Array;
  /** Regeln im Klartext, parallel zu den CSR-Feldern — für den Bericht. */
  pairKind: SpecialKind[];
  /** Hartes „zusammen“: Gesamtliste je Paar für Vorabprüfung und Bericht. */
  togetherRules: Array<{ a: number; b: number; threshold: number }>;
}

export interface SeparationPair {
  a: number;
  b: number;
  radius: 'adjacent' | 'table';
}

/** Weiche Regel „soll nah beieinander sitzen“: Bonus, graduell mit der Nähe. */
export const PAIR_WANT_NEAR = 1;
/** Harte Regel „muss nah beieinander sitzen“: sehr hohe Strafe, wenn nicht erfüllt. */
export const PAIR_MUST_NEAR = 2;
/** Weiche Regel „soll nicht nah beieinander sitzen“: Malus, wenn doch. */
export const PAIR_WANT_APART = 3;

export interface CompileResult {
  problem: SolverProblem;
  /** Hinweise auf ignorierte Eingaben (unbekannte Namen, Selbstwünsche, Dubletten). */
  warnings: Msg[];
}

/** Baut die Solver-Darstellung aus Klassendaten und fertigem Raumlayout. */
export function compileProblem(data: ClassData, room: RoomLayout): CompileResult {
  const warnings: Msg[] = [];
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
        warnings.push(msg('warn.wishUnknown', { name: displayName(student) }));
        return;
      }
      if (target === i) {
        warnings.push(msg('warn.wishSelf', { name: displayName(student) }));
        return;
      }
      if (seen.has(target)) {
        warnings.push(msg('warn.wishDuplicate', { name: displayName(student) }));
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
      warnings.push(msg('warn.pinnedMissing', { name: displayName(student) }));
    }

    for (let s = 0; s < m; s++) {
      const seat = seats[s]!;
      let bonus = 0;
      let ok = pinned === undefined || pinned === s;

      for (const special of student.specials) {
        // Beziehungsregeln betreffen kein einzelnes Platzmerkmal.
        if (isPairRule(special.kind)) continue;
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
      warnings.push(msg('warn.noSeatAllowed', { name: displayName(student) }));
    }
  }

  // --- Beziehungsregeln: Trennungen und Nachbarwünsche -----------------------

  const separations: SeparationPair[] = [];
  const sepSeen = new Set<string>();
  const addSeparation = (a: number, b: number, radius: 'adjacent' | 'table') => {
    const key = `${Math.min(a, b)}:${Math.max(a, b)}:${radius}`;
    if (sepSeen.has(key)) return;
    sepSeen.add(key);
    separations.push({ a, b, radius });
  };

  // Alte Form: Trennungen als eigene Liste.
  for (const sep of data.separations ?? []) {
    const a = studentIndex.get(sep.a);
    const b = studentIndex.get(sep.b);
    if (a === undefined || b === undefined || a === b) {
      warnings.push(msg('warn.separationUnknown'));
      continue;
    }
    addSeparation(a, b, sep.radius);
  }

  const pairLists: Array<
    Array<{ partner: number; threshold: number; mode: number; weight: number; kind: SpecialKind }>
  > = Array.from({ length: n }, () => []);
  const ruleBy: number[][] = Array.from({ length: n }, () => []);
  const togetherRules: SolverProblem['togetherRules'] = [];

  for (let i = 0; i < n; i++) {
    for (const rule of students[i]!.specials) {
      if (!isPairRule(rule.kind)) continue;
      const target = rule.target ? studentIndex.get(rule.target) : undefined;
      if (target === undefined) {
        warnings.push(msg('warn.ruleUnknown', { name: displayName(students[i]!) }));
        continue;
      }
      if (target === i) {
        warnings.push(msg('warn.ruleSelf', { name: displayName(students[i]!) }));
        continue;
      }

      const radius = pairRadius(rule.kind);
      const threshold = SEPARATION_THRESHOLD[radius];

      if (isApartRule(rule.kind)) {
        if (rule.hard) {
          addSeparation(i, target, radius);
          continue;
        }
        pairLists[i]!.push({
          partner: target,
          threshold,
          mode: PAIR_WANT_APART,
          weight: weights.specialBonus,
          kind: rule.kind,
        });
      } else if (rule.hard) {
        pairLists[i]!.push({
          partner: target,
          threshold,
          mode: PAIR_MUST_NEAR,
          weight: 0,
          kind: rule.kind,
        });
        togetherRules.push({ a: i, b: target, threshold });
      } else {
        pairLists[i]!.push({
          partner: target,
          threshold,
          mode: PAIR_WANT_NEAR,
          weight: weights.specialBonus,
          kind: rule.kind,
        });
      }
      ruleBy[target]!.push(i);
    }
  }

  const sepLists: Array<Array<{ partner: number; threshold: number }>> = Array.from(
    { length: n },
    () => [],
  );
  for (const sep of separations) {
    const threshold = SEPARATION_THRESHOLD[sep.radius];
    sepLists[sep.a]!.push({ partner: sep.b, threshold });
    sepLists[sep.b]!.push({ partner: sep.a, threshold });
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

  const pairStart = new Int32Array(n + 1);
  const pairPartnerList: number[] = [];
  const pairThresholdList: number[] = [];
  const pairModeList: number[] = [];
  const pairWeightList: number[] = [];
  const pairKind: SpecialKind[] = [];
  for (let i = 0; i < n; i++) {
    pairStart[i] = pairPartnerList.length;
    for (const entry of pairLists[i]!) {
      pairPartnerList.push(entry.partner);
      pairThresholdList.push(entry.threshold);
      pairModeList.push(entry.mode);
      pairWeightList.push(entry.weight);
      pairKind.push(entry.kind);
    }
  }
  pairStart[n] = pairPartnerList.length;

  // Wer eine Beziehungsregel zu j trägt, ist betroffen, wenn j den Platz wechselt.
  const affectedWithRules: number[] = [];
  const affectedStartWithRules = new Int32Array(n + 1);
  for (let i = 0; i < n; i++) {
    affectedStartWithRules[i] = affectedWithRules.length;
    for (let a = affectedStart[i]!; a < affectedStart[i + 1]!; a++) {
      affectedWithRules.push(affectedList[a]!);
    }
    for (const holder of ruleBy[i]!) {
      if (!affectedWithRules.includes(holder, affectedStartWithRules[i]!)) {
        affectedWithRules.push(holder);
      }
    }
  }
  affectedStartWithRules[n] = affectedWithRules.length;

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
      affectedStart: affectedStartWithRules,
      affected: Int32Array.from(affectedWithRules),
      unary,
      allowed,
      domainSize,
      sepStart,
      sepPartner: Int32Array.from(sepPartnerList),
      sepThreshold: Float64Array.from(sepThresholdList),
      separations,
      pairStart,
      pairPartner: Int32Array.from(pairPartnerList),
      pairThreshold: Float64Array.from(pairThresholdList),
      pairMode: Int8Array.from(pairModeList),
      pairWeight: Float64Array.from(pairWeightList),
      pairKind,
      togetherRules,
    },
    warnings: dedupe(warnings),
  };
}

// ---------------------------------------------------------------------------
// Sonderwünsche
// ---------------------------------------------------------------------------

/** Mittlere Rasterspalte; Bezugspunkt für links / rechts / Mitte. */
function middleColumn(room: RoomLayout): number {
  return (room.gridCols - 1) / 2;
}

/** Erfüllt der Platz einen *harten* Platzwunsch? Beziehungsregeln erlauben jeden Platz. */
export function specialAllows(
  special: SpecialRequest,
  seat: Seat,
  room: RoomLayout,
): boolean {
  const middle = middleColumn(room);
  switch (special.kind) {
    case 'front':
      return seat.tableRow === 0;
    case 'notBack':
      return !seat.tags.includes('back');
    case 'back':
      return seat.tags.includes('back');
    case 'maxRow':
      return seat.tableRow <= (special.row ?? room.tableRowCount - 1);
    case 'minRow':
      return seat.tableRow >= (special.row ?? 0);
    case 'leftSide':
      return seat.col <= middle;
    case 'rightSide':
      return seat.col >= middle;
    case 'center':
      return Math.abs(seat.col - middle) <= middle / 2;
    case 'window':
      return seat.tags.includes('window');
    case 'notWindow':
      return !seat.tags.includes('window');
    case 'aisle':
      return seat.tags.includes('aisle');
    case 'notAisle':
      return !seat.tags.includes('aisle');
    case 'nearDoor':
      return seat.tags.includes('door');
    case 'notDoor':
      return !seat.tags.includes('door');
    case 'notNextTo':
    case 'notSameTable':
    case 'nextTo':
    case 'sameTable':
      return true;
  }
}

/**
 * Bonus für einen *weichen* Platzwunsch. Gestuft statt binär, damit Reihe 2 besser
 * bewertet wird als Reihe 5, wenn Reihe 1 schon voll ist.
 */
export function specialBonus(
  special: SpecialRequest,
  seat: Seat,
  room: RoomLayout,
  base: number,
): number {
  const lastRow = Math.max(1, room.tableRowCount - 1);
  const middle = middleColumn(room);
  const lastCol = Math.max(1, room.gridCols - 1);

  switch (special.kind) {
    case 'front':
      return base * (1 - seat.tableRow / lastRow);
    case 'notBack':
      return seat.tags.includes('back') ? -base : 0;
    case 'back':
      return base * (seat.tableRow / lastRow);
    case 'maxRow': {
      const limit = special.row ?? room.tableRowCount - 1;
      return seat.tableRow > limit ? -base : 0;
    }
    case 'minRow': {
      const limit = special.row ?? 0;
      return seat.tableRow < limit ? -base : 0;
    }
    case 'leftSide':
      return base * (1 - seat.col / lastCol);
    case 'rightSide':
      return base * (seat.col / lastCol);
    case 'center':
      return base * (1 - Math.abs(seat.col - middle) / Math.max(1, middle));
    case 'window': {
      if (seat.tags.includes('window')) return base;
      return inWindowHalf(seat, room) ? base * 0.375 : 0;
    }
    case 'notWindow':
      return seat.tags.includes('window') ? -base : 0;
    case 'aisle':
      return seat.tags.includes('aisle') ? base : 0;
    case 'notAisle':
      return seat.tags.includes('aisle') ? -base : 0;
    case 'nearDoor':
      return seat.tags.includes('door') ? base : 0;
    case 'notDoor':
      return seat.tags.includes('door') ? -base : 0;
    case 'notNextTo':
    case 'notSameTable':
    case 'nextTo':
    case 'sameTable':
      return 0;
  }
}

function inWindowHalf(seat: Seat, room: RoomLayout): boolean {
  const side = room.config.windowSide;
  if (side === 'none') return false;
  const middle = middleColumn(room);
  return side === 'left' ? seat.col < middle : seat.col > middle;
}

/** Entfernt doppelte Meldungen (gleicher Schlüssel, gleiche Parameter). */
function dedupe(messages: Msg[]): Msg[] {
  const seen = new Set<string>();
  return messages.filter((message) => {
    const key = JSON.stringify(message);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function displayName(student: Student): string {
  return student.lastName
    ? `${student.firstName} ${student.lastName}`
    : student.firstName;
}
