/// <reference lib="webworker" />

/**
 * Web Worker um den Solver herum.
 *
 * Die Berechnung dauert zwar nur Bruchteile einer Sekunde, blockiert im Hauptthread
 * aber trotzdem die Oberfläche. Im Worker bleibt die Seite bedienbar und kann den
 * Fortschritt anzeigen.
 */

import { buildRoom } from '../domain/roomTemplates';
import { validate } from '../domain/validation';
import type { ValidationIssue } from '../domain/validation';
import { compileProblem } from './problem';
import { solve } from './solve';
import type { SolveOptions } from './solve';
import type { ClassData } from '../types/model';

export interface SolveRequest {
  type: 'solve';
  data: ClassData;
  options?: SolveOptions;
}

export interface SolvedVariant {
  /** Platzindex je Personenindex, in der Reihenfolge von `data.students`. */
  assignment: number[];
  score: number;
}

export type SolverMessage =
  | { type: 'progress'; fraction: number }
  | { type: 'blocked'; issues: ValidationIssue[] }
  | {
      type: 'done';
      variants: SolvedVariant[];
      issues: ValidationIssue[];
      elapsedMs: number;
      succeeded: number;
      attempted: number;
    }
  | { type: 'error'; message: string };

const post = (message: SolverMessage) => self.postMessage(message);

self.onmessage = (event: MessageEvent<SolveRequest>) => {
  if (event.data?.type !== 'solve') return;

  try {
    const { data, options } = event.data;
    const room = buildRoom(data.room);
    const { problem, warnings } = compileProblem(data, room);
    const validation = validate(data, room, problem, warnings);

    if (!validation.solvable) {
      post({ type: 'blocked', issues: validation.issues });
      return;
    }

    const result = solve(problem, {
      ...options,
      onProgress: (fraction) => post({ type: 'progress', fraction }),
    });

    post({
      type: 'done',
      issues: validation.issues,
      elapsedMs: result.elapsedMs,
      succeeded: result.succeeded,
      attempted: result.attempted,
      // Der Bericht wird im Hauptthread erzeugt: Er muss nach jedem manuellen
      // Umsetzen ohnehin neu berechnet werden, und das kostet nur Millisekunden.
      variants: result.variants.map((variant) => ({
        assignment: Array.from(variant.assignment),
        score: variant.score,
      })),
    });
  } catch (error) {
    post({ type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
};
