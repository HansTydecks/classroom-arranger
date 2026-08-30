/**
 * Vorabprüfung, bevor gerechnet wird.
 *
 * Ein Solver, der an widersprüchlichen harten Vorgaben scheitert, liefert entweder
 * gar nichts oder — schlimmer — still einen Plan, der eine Vorgabe verletzt. Deshalb
 * werden die Widersprüche vorher gesucht und im Klartext benannt, mit den beteiligten
 * Namen.
 */

import type { ClassData, RoomLayout } from '../types/model';
import { displayName } from '../solver/problem';
import type { SolverProblem } from '../solver/problem';

export type IssueSeverity = 'error' | 'warning';

export interface ValidationIssue {
  severity: IssueSeverity;
  message: string;
  /** Beteiligte Personen, damit die Oberfläche sie hervorheben kann. */
  studentIds?: string[];
}

export interface ValidationResult {
  issues: ValidationIssue[];
  /** `true`, wenn kein `error` vorliegt — erst dann lohnt sich das Rechnen. */
  solvable: boolean;
}

export function validate(
  data: ClassData,
  room: RoomLayout,
  problem: SolverProblem,
  compileWarnings: string[] = [],
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const { n, m, students } = problem;

  for (const message of compileWarnings) issues.push({ severity: 'warning', message });

  // --- 1. Reichen die Plätze überhaupt? ------------------------------------

  if (n > m) {
    issues.push({
      severity: 'error',
      message: `Der Raum hat ${m} Plätze, die Klasse zählt aber ${n} Personen. Es fehlen ${n - m} Plätze.`,
    });
  } else if (n === m && n > 0) {
    issues.push({
      severity: 'warning',
      message:
        'Alle Plätze sind belegt. Ohne freien Platz hat der Algorithmus kaum Spielraum — ' +
        'ein oder zwei zusätzliche Plätze verbessern das Ergebnis oft deutlich.',
    });
  }

  // --- 2. Personen ohne erlaubten Platz ------------------------------------

  for (let i = 0; i < n; i++) {
    if (problem.domainSize[i] === 0) {
      issues.push({
        severity: 'error',
        message: `${displayName(students[i]!)}: Die harten Vorgaben schließen jeden Platz im Raum aus.`,
        studentIds: [students[i]!.id],
      });
    }
  }

  // --- 3. Hall-Bedingung: Passen alle harten Platzvorgaben zusammen? -------

  const blocking = findOversubscribedGroup(problem);
  if (blocking) {
    const names = blocking.students.map((i) => displayName(students[i]!));
    issues.push({
      severity: 'error',
      message:
        `${names.length} Personen (${names.join(', ')}) benötigen wegen harter Vorgaben Plätze, ` +
        `von denen es nur ${blocking.seatCount} gibt. Lockern Sie eine der Vorgaben oder ` +
        'vergrößern Sie den passenden Bereich.',
      studentIds: blocking.students.map((i) => students[i]!.id),
    });
  }

  // --- 4. Trennungen: paarweise erfüllbar? ---------------------------------

  for (const separation of data.separations) {
    const a = problem.studentIndex.get(separation.a);
    const b = problem.studentIndex.get(separation.b);
    if (a === undefined || b === undefined || a === b) continue;
    if (!separablePair(problem, a, b)) {
      issues.push({
        severity: 'error',
        message:
          `${displayName(students[a]!)} und ${displayName(students[b]!)} lassen sich nicht trennen: ` +
          'Ihre harten Platzvorgaben lassen nur Plätze zu, die zu nah beieinander liegen.',
        studentIds: [students[a]!.id, students[b]!.id],
      });
    }
  }

  // --- 5. Trennungs-Cliquen gegen die Zahl der Tische ----------------------

  const tableCount = new Set(room.seats.map((s) => s.tableId)).size;
  const clique = largestTableSeparationClique(data, problem);
  if (clique.length > tableCount) {
    const names = clique.map((i) => displayName(students[i]!));
    issues.push({
      severity: 'error',
      message:
        `${names.join(', ')} müssen alle voneinander getrennt sitzen, es gibt aber nur ` +
        `${tableCount} Tische. Mindestens zwei von ihnen müssten sich einen Tisch teilen.`,
      studentIds: clique.map((i) => students[i]!.id),
    });
  }

  // --- 6. Hinweise ----------------------------------------------------------

  const nobodyWants = students.filter(
    (_, i) => problem.affectedStart[i + 1]! - problem.affectedStart[i]! === 1,
  );
  if (nobodyWants.length > 0) {
    issues.push({
      severity: 'warning',
      message:
        `Niemand hat sich ${listNames(nobodyWants.map(displayName))} als Sitznachbarn gewünscht. ` +
        'Der Plan versucht trotzdem, die eigenen Wünsche dieser Personen zu erfüllen — ' +
        'ein Blick lohnt sich aber.',
      studentIds: nobodyWants.map((s) => s.id),
    });
  }

  return { issues, solvable: !issues.some((issue) => issue.severity === 'error') };
}

function listNames(names: string[]): string {
  if (names.length === 1) return names[0]!;
  return names.slice(0, -1).join(', ') + ' und ' + names[names.length - 1]!;
}

// ---------------------------------------------------------------------------
// Hall-Bedingung über ein bipartites Matching (Algorithmus von Kuhn)
// ---------------------------------------------------------------------------

/**
 * Sucht eine Gruppe von Personen, deren zulässige Plätze zusammen nicht ausreichen.
 * Gibt `null` zurück, wenn sich alle Personen gleichzeitig platzieren lassen
 * (Trennungen bleiben hier außen vor — die prüft Schritt 4 und 5).
 */
function findOversubscribedGroup(
  problem: SolverProblem,
): { students: number[]; seatCount: number } | null {
  const { n, m, allowed } = problem;
  const seatOwner = new Int32Array(m).fill(-1);
  const visitedSeat = new Uint8Array(m);
  const visitedStudent = new Uint8Array(n);

  const augment = (i: number): boolean => {
    visitedStudent[i] = 1;
    for (let seat = 0; seat < m; seat++) {
      if (allowed[i * m + seat] !== 1 || visitedSeat[seat] === 1) continue;
      visitedSeat[seat] = 1;
      const owner = seatOwner[seat]!;
      if (owner === -1 || augment(owner)) {
        seatOwner[seat] = i;
        return true;
      }
    }
    return false;
  };

  for (let i = 0; i < n; i++) {
    visitedSeat.fill(0);
    visitedStudent.fill(0);
    if (augment(i)) continue;

    // Die während der gescheiterten Suche besuchten Personen bilden eine Gruppe,
    // deren gemeinsame Platzmenge zu klein ist — genau die Hall-Verletzung.
    const group: number[] = [];
    for (let s = 0; s < n; s++) if (visitedStudent[s] === 1) group.push(s);
    let seatCount = 0;
    for (let seat = 0; seat < m; seat++) if (visitedSeat[seat] === 1) seatCount++;
    return { students: group, seatCount };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Trennungen
// ---------------------------------------------------------------------------

/** Gibt es überhaupt ein zulässiges Platzpaar, das die beiden weit genug auseinanderbringt? */
function separablePair(problem: SolverProblem, a: number, b: number): boolean {
  const { m, allowed, prox } = problem;
  let threshold = Infinity;
  for (let k = problem.sepStart[a]!, end = problem.sepStart[a + 1]!; k < end; k++) {
    if (problem.sepPartner[k] === b) threshold = Math.min(threshold, problem.sepThreshold[k]!);
  }
  if (!Number.isFinite(threshold)) return true;

  for (let s = 0; s < m; s++) {
    if (allowed[a * m + s] !== 1) continue;
    for (let t = 0; t < m; t++) {
      if (s === t || allowed[b * m + t] !== 1) continue;
      if (prox.values[s * m + t]! < threshold) return true;
    }
  }
  return false;
}

/**
 * Größte Gruppe von Personen, die paarweise *tischweit* getrennt werden müssen.
 * Eine solche Gruppe braucht ebenso viele Tische. Der Trennungsgraph ist winzig,
 * daher genügt eine einfache erschöpfende Suche (Bron–Kerbosch).
 */
function largestTableSeparationClique(data: ClassData, problem: SolverProblem): number[] {
  const adjacency = new Map<number, Set<number>>();
  const addEdge = (a: number, b: number) => {
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    if (!adjacency.has(b)) adjacency.set(b, new Set());
    adjacency.get(a)!.add(b);
    adjacency.get(b)!.add(a);
  };

  for (const separation of data.separations) {
    if (separation.radius !== 'table') continue;
    const a = problem.studentIndex.get(separation.a);
    const b = problem.studentIndex.get(separation.b);
    if (a === undefined || b === undefined || a === b) continue;
    addEdge(a, b);
  }

  let best: number[] = [];
  const expand = (current: number[], candidates: Set<number>) => {
    if (candidates.size === 0) {
      if (current.length > best.length) best = [...current];
      return;
    }
    for (const vertex of [...candidates]) {
      const neighbours = adjacency.get(vertex) ?? new Set<number>();
      expand(
        [...current, vertex],
        new Set([...candidates].filter((c) => c !== vertex && neighbours.has(c))),
      );
      candidates.delete(vertex);
    }
    if (current.length > best.length) best = [...current];
  };

  expand([], new Set(adjacency.keys()));
  return best;
}
