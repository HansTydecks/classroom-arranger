/**
 * Bewertung einer Sitzverteilung — inklusive inkrementeller Delta-Auswertung.
 *
 * Bewertung je Person i:
 *
 *   Für jeden Wunsch (i -> j):  c = wishBase * w(seat[i], seat[j])
 *   Beiträge absteigend sortiert, mit abnehmendem Grenznutzen gewichtet:
 *       satScore(i) = c(1)*d0 + c(2)*d1 + c(3)*d2
 *   fairness(i)  = -noWishPenalty, falls kein Wunsch die Nähe-Schwelle erreicht
 *   special(i)   = Bonus der weichen Platzregeln für den belegten Platz
 *   pair(i)      = Bonus bzw. Malus der Beziehungsregeln, die i trägt („neben X“ /
 *                  „nicht neben X“), plus die hohe Strafe für ein verletztes
 *                  hartes „muss neben X“
 *
 *   Gesamt = Summe über alle Personen.
 *
 * Harte Regeln (Pins, harte Platzregeln, Trennungen) erscheinen *nicht* in der
 * Bewertung. Sie werden als Zulässigkeit geprüft: unzulässige Züge entstehen erst
 * gar nicht. Damit kann die Suche sie strukturell nicht „erkaufen“.
 *
 * Der entscheidende Trick für die Geschwindigkeit: Wenn Person i den Platz wechselt,
 * ändert sich die Bewertung nur für i selbst und für alle, die sich i wünschen
 * (`affected`). Das sind typisch ~4 statt 30 Personen.
 */

import { PAIR_MUST_NEAR, PAIR_WANT_APART, PAIR_WANT_NEAR } from './problem';
import type { SolverProblem } from './problem';

export const EMPTY = -1;

/**
 * Strafe für eine verletzte „muss neben / am selben Tisch sitzen“-Regel. Sie ist so
 * hoch, dass die Suche sie nie gegen Wünsche eintauscht — und wird dennoch nur als
 * Strafe geführt, weil sich ein Paar nicht durch das Verbieten einzelner Züge
 * zusammenhalten lässt (jeder Einzelzug trennt es zunächst).
 */
export const MUST_NEAR_PENALTY = 10_000;

export class Evaluator {
  readonly problem: SolverProblem;
  /** Platz je Person, `EMPTY` wenn nicht platziert. */
  readonly seatOf: Int32Array;
  /** Person je Platz, `EMPTY` wenn frei. */
  readonly studentAt: Int32Array;
  /** Aktuelle Einzelbewertung je Person. */
  readonly perStudent: Float64Array;
  total = 0;

  // Puffer für die Delta-Auswertung; werden wiederverwendet, nie neu alloziert.
  private readonly stamp: Int32Array;
  private generation = 0;
  private readonly affectedBuf: Int32Array;
  private readonly newScores: Float64Array;
  /** Bis zu drei gleichzeitig bewegte Personen und ihre alten Plätze. */
  private readonly moveIn = new Int32Array(3);
  private readonly targetIn = new Int32Array(3);
  private readonly moverBuf = new Int32Array(3);
  private readonly oldSeatBuf = new Int32Array(3);
  private pendingMoved = 0;
  private pendingCount = 0;
  private pendingDelta = 0;
  private hasPending = false;

  constructor(problem: SolverProblem) {
    this.problem = problem;
    this.seatOf = new Int32Array(problem.n).fill(EMPTY);
    this.studentAt = new Int32Array(problem.m).fill(EMPTY);
    this.perStudent = new Float64Array(problem.n);
    this.stamp = new Int32Array(problem.n).fill(-1);
    this.affectedBuf = new Int32Array(problem.n);
    this.newScores = new Float64Array(problem.n);
  }

  // -------------------------------------------------------------------------
  // Zustand setzen
  // -------------------------------------------------------------------------

  /** Übernimmt eine vollständige Zuordnung (Platz je Person) und bewertet neu. */
  setAssignment(seatOf: Int32Array): void {
    this.seatOf.set(seatOf);
    this.studentAt.fill(EMPTY);
    for (let i = 0; i < this.problem.n; i++) {
      const s = this.seatOf[i]!;
      if (s !== EMPTY) this.studentAt[s] = i;
    }
    this.recomputeAll();
    this.hasPending = false;
  }

  /** Bewertet alle Personen neu und setzt `total`. Nur für Initialisierung und Tests. */
  recomputeAll(): number {
    let total = 0;
    for (let i = 0; i < this.problem.n; i++) {
      const score = this.scoreStudent(i);
      this.perStudent[i] = score;
      total += score;
    }
    this.total = total;
    return total;
  }

  /** Bewertung einer einzelnen Person beim aktuellen Sitzplan. */
  scoreStudent(i: number): number {
    const p = this.problem;
    const seat = this.seatOf[i]!;
    if (seat === EMPTY) return 0;

    const m = p.m;
    let score = p.unary[i * m + seat]!;

    // Die drei besten Wunschbeiträge, absteigend.
    let c0 = 0;
    let c1 = 0;
    let c2 = 0;
    let bestProximity = 0;

    const from = p.wishStart[i]!;
    const to = p.wishStart[i + 1]!;
    const row = seat * m;

    for (let k = from; k < to; k++) {
      const partnerSeat = this.seatOf[p.wishTarget[k]!]!;
      if (partnerSeat === EMPTY) continue;
      const w = p.prox.values[row + partnerSeat]!;
      if (w <= 0) continue;
      if (w > bestProximity) bestProximity = w;

      const c = p.wishBase[k]! * w;
      if (c > c0) {
        c2 = c1;
        c1 = c0;
        c0 = c;
      } else if (c > c1) {
        c2 = c1;
        c1 = c;
      } else if (c > c2) {
        c2 = c;
      }
    }

    const d = p.weights.diminishing;
    score += c0 * d[0] + c1 * d[1] + c2 * d[2];

    // Fairness: Wer Wünsche abgegeben hat, von denen keiner aufgeht, wird bestraft.
    if (to > from && bestProximity < p.weights.fulfilledProximity) {
      score -= p.weights.noWishPenalty;
    }

    // Beziehungsregeln, die diese Person trägt.
    for (let k = p.pairStart[i]!, end = p.pairStart[i + 1]!; k < end; k++) {
      const partnerSeat = this.seatOf[p.pairPartner[k]!]!;
      if (partnerSeat === EMPTY) continue;
      const w = p.prox.values[row + partnerSeat]!;
      const threshold = p.pairThreshold[k]!;
      switch (p.pairMode[k]) {
        case PAIR_WANT_NEAR:
          score += p.pairWeight[k]! * Math.min(1, w / threshold);
          break;
        case PAIR_WANT_APART:
          if (w >= threshold) score -= p.pairWeight[k]!;
          break;
        case PAIR_MUST_NEAR:
          score -= MUST_NEAR_PENALTY * (1 - Math.min(1, w / threshold));
          break;
      }
    }

    return score;
  }

  // -------------------------------------------------------------------------
  // Zulässigkeit
  // -------------------------------------------------------------------------

  /** Darf Person i überhaupt auf Platz s (harte Sonderwünsche, Pin)? */
  isAllowed(i: number, seat: number): boolean {
    return this.problem.allowed[i * this.problem.m + seat] === 1;
  }

  /** Hält Person i auf ihrem *aktuellen* Platz alle harten Trennungen ein? */
  private separationsOk(i: number): boolean {
    const p = this.problem;
    const seat = this.seatOf[i]!;
    if (seat === EMPTY) return true;
    const row = seat * p.m;
    for (let k = p.sepStart[i]!, end = p.sepStart[i + 1]!; k < end; k++) {
      const partnerSeat = this.seatOf[p.sepPartner[k]!]!;
      if (partnerSeat === EMPTY) continue;
      if (p.prox.values[row + partnerSeat]! >= p.sepThreshold[k]!) return false;
    }
    return true;
  }

  // -------------------------------------------------------------------------
  // Züge
  //
  // Alle Zugarten laufen über `proposeReassign`. Ein Zug wird *vorläufig*
  // angewandt; mit `commit()` wird er behalten, mit `rollback()` verworfen.
  // `perStudent` und `total` ändern sich erst beim Commit.
  // -------------------------------------------------------------------------

  /**
   * Setzt `movers[0..count-1]` gleichzeitig auf `targets[0..count-1]` um.
   * Gibt die Bewertungsänderung zurück oder `null`, wenn der Zug unzulässig ist
   * (dann bleibt der Zustand unverändert).
   */
  proposeReassign(movers: Int32Array, targets: Int32Array, count: number): number | null {
    for (let k = 0; k < count; k++) {
      if (!this.isAllowed(movers[k]!, targets[k]!)) return null;
    }

    // Erst alle alten Plätze räumen, dann alle neuen belegen — sonst würden sich
    // Tausch- und Rotationszüge gegenseitig überschreiben.
    for (let k = 0; k < count; k++) {
      const i = movers[k]!;
      const old = this.seatOf[i]!;
      this.moverBuf[k] = i;
      this.oldSeatBuf[k] = old;
      if (old !== EMPTY) this.studentAt[old] = EMPTY;
    }
    // Nach dem Räumen muss jedes Ziel frei sein. Sonst wäre der Zug widersprüchlich
    // (zwei Personen auf einen Platz) und würde den Zustand still beschädigen.
    for (let k = 0; k < count; k++) {
      if (this.studentAt[targets[k]!] !== EMPTY) {
        this.pendingMoved = count;
        this.undoMoves();
        return null;
      }
    }

    for (let k = 0; k < count; k++) {
      const i = movers[k]!;
      const target = targets[k]!;
      this.seatOf[i] = target;
      this.studentAt[target] = i;
    }
    this.pendingMoved = count;

    for (let k = 0; k < count; k++) {
      if (!this.separationsOk(movers[k]!)) {
        this.undoMoves();
        return null;
      }
    }

    return this.finishProposal(count);
  }

  /** Tauscht die Plätze zweier Personen. */
  proposeSwap(i: number, j: number): number | null {
    const seatI = this.seatOf[i]!;
    const seatJ = this.seatOf[j]!;
    if (i === j || seatI === seatJ || seatI === EMPTY || seatJ === EMPTY) return null;
    this.moveIn[0] = i;
    this.moveIn[1] = j;
    this.targetIn[0] = seatJ;
    this.targetIn[1] = seatI;
    return this.proposeReassign(this.moveIn, this.targetIn, 2);
  }

  /** Setzt eine Person auf einen freien Platz um. */
  proposeMove(i: number, seat: number): number | null {
    if (this.seatOf[i] === seat || this.studentAt[seat] !== EMPTY) return null;
    this.moveIn[0] = i;
    this.targetIn[0] = seat;
    return this.proposeReassign(this.moveIn, this.targetIn, 1);
  }

  /**
   * Dreier-Rotation: i erhält den Platz von j, j den von k, k den von i.
   * Bringt die Suche über lokale Optima hinweg, die ein reiner Tausch nicht verlässt —
   * besonders dann, wenn kein Platz frei ist.
   */
  proposeRotate3(i: number, j: number, k: number): number | null {
    const seatI = this.seatOf[i]!;
    const seatJ = this.seatOf[j]!;
    const seatK = this.seatOf[k]!;
    if (i === j || j === k || i === k) return null;
    if (seatI === EMPTY || seatJ === EMPTY || seatK === EMPTY) return null;
    this.moveIn[0] = i;
    this.moveIn[1] = j;
    this.moveIn[2] = k;
    this.targetIn[0] = seatJ;
    this.targetIn[1] = seatK;
    this.targetIn[2] = seatI;
    return this.proposeReassign(this.moveIn, this.targetIn, 3);
  }

  /** Sammelt die betroffenen Personen und bewertet sie neu. */
  private finishProposal(count: number): number {
    const p = this.problem;
    const generation = ++this.generation;
    let affectedCount = 0;

    for (let k = 0; k < count; k++) {
      const i = this.moverBuf[k]!;
      for (let a = p.affectedStart[i]!, end = p.affectedStart[i + 1]!; a < end; a++) {
        const u = p.affected[a]!;
        if (this.stamp[u] !== generation) {
          this.stamp[u] = generation;
          this.affectedBuf[affectedCount++] = u;
        }
      }
    }

    let delta = 0;
    for (let k = 0; k < affectedCount; k++) {
      const u = this.affectedBuf[k]!;
      const score = this.scoreStudent(u);
      this.newScores[k] = score;
      delta += score - this.perStudent[u]!;
    }

    this.pendingCount = affectedCount;
    this.pendingDelta = delta;
    this.hasPending = true;
    return delta;
  }

  /** Setzt die Sitzplätze des vorgeschlagenen Zugs zurück. */
  private undoMoves(): void {
    for (let k = 0; k < this.pendingMoved; k++) {
      this.studentAt[this.seatOf[this.moverBuf[k]!]!] = EMPTY;
    }
    for (let k = 0; k < this.pendingMoved; k++) {
      const i = this.moverBuf[k]!;
      const old = this.oldSeatBuf[k]!;
      this.seatOf[i] = old;
      if (old !== EMPTY) this.studentAt[old] = i;
    }
    this.pendingMoved = 0;
  }

  /** Übernimmt den vorgeschlagenen Zug endgültig. */
  commit(): void {
    if (!this.hasPending) return;
    for (let k = 0; k < this.pendingCount; k++) {
      this.perStudent[this.affectedBuf[k]!] = this.newScores[k]!;
    }
    this.total += this.pendingDelta;
    this.hasPending = false;
    this.pendingMoved = 0;
  }

  /** Macht den vorgeschlagenen Zug rückgängig. */
  rollback(): void {
    if (!this.hasPending) return;
    this.undoMoves();
    this.hasPending = false;
  }

  /** Kopie der aktuellen Zuordnung. */
  snapshot(): Int32Array {
    return Int32Array.from(this.seatOf);
  }
}
