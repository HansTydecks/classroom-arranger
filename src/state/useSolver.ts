/**
 * Anbindung des Solvers im Web Worker an die Oberfläche.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ValidationIssue } from '../domain/validation';
import type { SolveOptions } from '../solver/solve';
import type { SolvedVariant, SolverMessage } from '../solver/worker';
import type { ClassData } from '../types/model';

export type SolverStatus =
  | { kind: 'idle' }
  | { kind: 'running'; fraction: number }
  | { kind: 'blocked'; issues: ValidationIssue[] }
  | { kind: 'error'; message: string }
  | {
      kind: 'done';
      variants: SolvedVariant[];
      issues: ValidationIssue[];
      elapsedMs: number;
      succeeded: number;
      attempted: number;
    };

export function useSolver() {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<SolverStatus>({ kind: 'idle' });

  useEffect(() => {
    const worker = new Worker(new URL('../solver/worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent<SolverMessage>) => {
      const message = event.data;
      switch (message.type) {
        case 'progress':
          setStatus({ kind: 'running', fraction: message.fraction });
          break;
        case 'blocked':
          setStatus({ kind: 'blocked', issues: message.issues });
          break;
        case 'error':
          setStatus({ kind: 'error', message: message.message });
          break;
        case 'done':
          setStatus({
            kind: 'done',
            variants: message.variants,
            issues: message.issues,
            elapsedMs: message.elapsedMs,
            succeeded: message.succeeded,
            attempted: message.attempted,
          });
          break;
      }
    };

    worker.onerror = (event) =>
      setStatus({ kind: 'error', message: event.message || 'Solver error' });

    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const run = useCallback((data: ClassData, options?: SolveOptions) => {
    setStatus({ kind: 'running', fraction: 0 });
    // Der Worker erhält eine einfache Kopie; ClassData enthält nur Klartextdaten.
    workerRef.current?.postMessage({ type: 'solve', data: structuredClone(data), options });
  }, []);

  const reset = useCallback(() => setStatus({ kind: 'idle' }), []);

  return { status, run, reset };
}
