/**
 * Nähe-Kernel: Wie stark zählt es, wenn zwei Personen auf den Plätzen s und t sitzen?
 *
 * Der Wert liegt zwischen 0 (kein Kontakt) und 1 (direkt nebeneinander). Bewusst
 * *gestuft* statt binär: Das glättet die Zielfunktion, sodass die lokale Suche nicht
 * auf Plateaus stecken bleibt — und es bildet ab, dass „am selben Gruppentisch“
 * pädagogisch ein halb erfüllter Wunsch ist.
 *
 * Die Matrix wird einmalig aus der Raumgeometrie berechnet; sie ist symmetrisch und
 * hat auf der Diagonalen 0.
 */

import type { Facing, RoomLayout, Seat } from '../types/model';

/** Gewichte der Nachbarschaftsbeziehungen. */
export const PROXIMITY = {
  /** Direkt nebeneinander (gleicher Tisch oder lückenlos anschließend). */
  adjacent: 1.0,
  /** Gleicher Tisch, gegenüber oder über Eck. */
  sameTable: 0.6,
  /** Gleicher Tisch, aber weiter entfernt (großer Gruppentisch). */
  sameTableFar: 0.4,
  /** Direkt davor oder dahinter. */
  behind: 0.35,
  /** Diagonal versetzt in der Nachbarreihe. */
  diagonal: 0.2,
} as const;

/**
 * Schwellen für harte Trennungen. Ein Platzpaar ist verboten, wenn `w >= Schwelle`.
 * `table` liegt auf `sameTableFar`, deckt also den gesamten Tisch ab.
 */
export const SEPARATION_THRESHOLD = {
  adjacent: PROXIMITY.adjacent,
  table: PROXIMITY.sameTableFar,
} as const;

type Axis = 'vertical' | 'horizontal';

function axisOf(facing: Facing): Axis {
  return facing === 'up' || facing === 'down' ? 'vertical' : 'horizontal';
}

/**
 * Nähe zweier verschiedener Plätze.
 *
 * Maßgeblich ist die Blickrichtung: Sie legt fest, welche Rasterachse
 * „nebeneinander“ bedeutet und welche „davor/dahinter“. In Frontalreihen sitzt der
 * Nachbar in derselben Rasterzeile, am Arm einer U-Form dagegen in derselben Spalte.
 * Ob beide am selben Tisch sitzen, entscheidet dann nur noch über die Abstufung.
 */
export function seatProximity(s: Seat, t: Seat): number {
  if (s.id === t.id) return 0;

  const dRow = Math.abs(s.row - t.row);
  const dCol = Math.abs(s.col - t.col);
  const sameTable = s.tableId === t.tableId;

  // Achsen unterschiedlich — das gibt es nur an der Ecke einer U-Form.
  if (axisOf(s.facing) !== axisOf(t.facing)) {
    const chebyshev = Math.max(dRow, dCol);
    if (sameTable) return chebyshev <= 1 ? PROXIMITY.adjacent : PROXIMITY.sameTableFar;
    if (chebyshev === 1) return PROXIMITY.sameTable;
    if (chebyshev === 2) return PROXIMITY.diagonal;
    return 0;
  }

  // Blickrichtung entscheidet, welche Rasterachse „nebeneinander“ bedeutet:
  // in Frontalreihen die Spalte, am Arm einer U-Form die Zeile.
  const vertical = axisOf(s.facing) === 'vertical';
  const along = vertical ? dRow : dCol;
  const across = vertical ? dCol : dRow;

  if (sameTable) {
    if (across === 1 && along === 0) return PROXIMITY.adjacent;
    if (along === 1 && across <= 1) return PROXIMITY.sameTable;
    return PROXIMITY.sameTableFar;
  }

  // Verschiedene Tische: Die Gangspalten im Raster sorgen dafür, dass
  // „nebeneinander“ hier nur ohne Gang dazwischen entsteht.
  if (across === 1 && along === 0) return PROXIMITY.adjacent;
  if (across === 0 && along === 1) return PROXIMITY.behind;
  if (across === 1 && along === 1) return PROXIMITY.diagonal;
  return 0;
}

export interface ProximityMatrix {
  /** Anzahl Plätze. */
  size: number;
  /** Zeilenweise gespeicherte Matrix der Größe `size * size`. */
  values: Float64Array;
  /** `true`, wenn beide Plätze am selben Tisch liegen. */
  sameTable: Uint8Array;
  at(a: number, b: number): number;
}

/** Berechnet die vollständige Nähe-Matrix für ein Raumlayout. */
export function buildProximityMatrix(room: RoomLayout): ProximityMatrix {
  const seats = room.seats;
  const size = seats.length;
  const values = new Float64Array(size * size);
  const sameTable = new Uint8Array(size * size);

  for (let a = 0; a < size; a++) {
    const sa = seats[a]!;
    for (let b = a + 1; b < size; b++) {
      const sb = seats[b]!;
      const w = seatProximity(sa, sb);
      values[a * size + b] = w;
      values[b * size + a] = w;
      const same = sa.tableId === sb.tableId ? 1 : 0;
      sameTable[a * size + b] = same;
      sameTable[b * size + a] = same;
    }
  }

  return {
    size,
    values,
    sameTable,
    at: (a, b) => values[a * size + b]!,
  };
}
