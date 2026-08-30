/**
 * Orchestrierung: mehrere unabhängige Läufe, Auswahl der besten und untereinander
 * möglichst verschiedenen Lösungen.
 *
 * Warum mehrere Varianten? Ein einzelner „optimaler“ Plan ist für die Lehrkraft eine
 * Blackbox. Drei gute, deutlich verschiedene Vorschläge machen die Entscheidung
 * wieder zu ihrer eigenen.
 */

import { anneal, hillClimb } from './anneal';
import { constructGreedy, constructPairFirst } from './construct';
import { Evaluator } from './objective';
import type { SolverProblem } from './problem';
import { makeRng } from './random';

export interface SolveOptions {
  /** Unabhängige Neustarts. */
  restarts?: number;
  /** Annealing-Schritte je Neustart. */
  iterations?: number;
  /** Startwert des Zufallsgenerators — gleicher Wert, gleiches Ergebnis. */
  seed?: number;
  /** Wie viele Varianten zurückgegeben werden. */
  variants?: number;
  /** Fortschritt zwischen 0 und 1. */
  onProgress?: (fraction: number) => void;
}

export interface Solution {
  /** Platzindex je Personenindex. */
  assignment: Int32Array;
  score: number;
}

export interface SolveResult {
  /** Beste Lösung zuerst. */
  variants: Solution[];
  /** Anzahl der Neustarts, die eine zulässige Lösung gefunden haben. */
  succeeded: number;
  attempted: number;
  elapsedMs: number;
}

export const DEFAULT_SOLVE_OPTIONS = {
  restarts: 20,
  iterations: 40_000,
  seed: 1,
  variants: 3,
} as const;

/** Mindestabstand zweier Varianten, als Anteil der Personenzahl. */
const DIVERSITY_RATIO = 0.2;

export function solve(problem: SolverProblem, options: SolveOptions = {}): SolveResult {
  const restarts = options.restarts ?? DEFAULT_SOLVE_OPTIONS.restarts;
  const iterations = options.iterations ?? DEFAULT_SOLVE_OPTIONS.iterations;
  const seed = options.seed ?? DEFAULT_SOLVE_OPTIONS.seed;
  const variants = options.variants ?? DEFAULT_SOLVE_OPTIONS.variants;

  const startedAt = Date.now();
  const evaluator = new Evaluator(problem);
  const solutions: Solution[] = [];

  for (let run = 0; run < restarts; run++) {
    const rng = makeRng(seed + run * 7919);
    // Beide Aufbauverfahren abwechselnd — sie führen in unterschiedliche Täler.
    const start = run % 2 === 0 ? constructPairFirst(problem, rng) : constructGreedy(problem, rng);

    if (start) {
      evaluator.setAssignment(start);
      anneal(evaluator, rng, iterations);
      hillClimb(evaluator);
      solutions.push({ assignment: evaluator.snapshot(), score: evaluator.total });
    }

    options.onProgress?.((run + 1) / restarts);
  }

  solutions.sort((a, b) => b.score - a.score);

  return {
    variants: pickDiverse(solutions, variants, problem.n),
    succeeded: solutions.length,
    attempted: restarts,
    elapsedMs: Date.now() - startedAt,
  };
}

/**
 * Wählt aus den sortierten Lösungen die beste, danach jeweils die beste, die sich
 * von allen bereits gewählten deutlich unterscheidet. Reicht das nicht für die
 * gewünschte Anzahl, wird mit den nächstbesten aufgefüllt.
 */
function pickDiverse(sorted: Solution[], count: number, n: number): Solution[] {
  if (sorted.length === 0) return [];

  const minDistance = Math.max(1, Math.round(n * DIVERSITY_RATIO));
  const picked: Solution[] = [];

  for (const candidate of sorted) {
    if (picked.length >= count) break;
    const distinct = picked.every(
      (chosen) => hammingDistance(chosen.assignment, candidate.assignment) >= minDistance,
    );
    if (distinct) picked.push(candidate);
  }

  for (const candidate of sorted) {
    if (picked.length >= count) break;
    if (!picked.includes(candidate)) picked.push(candidate);
  }

  return picked;
}

/** Anzahl Personen, die in den beiden Plänen auf verschiedenen Plätzen sitzen. */
export function hammingDistance(a: Int32Array, b: Int32Array): number {
  let distance = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) distance++;
  return distance;
}
