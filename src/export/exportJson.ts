/**
 * Sicherung und Austausch der Klassendaten als JSON-Datei.
 *
 * Das ist der einzige Weg, auf dem Daten dieses Programms den Browser verlassen —
 * und er wird bewusst von Hand ausgelöst, mit einer Datei, die auf dem eigenen
 * Rechner landet.
 */

import type { ClassData } from '../types/model';

const FORMAT = 'classroom-arranger/1';

/** Fehler beim Einlesen einer Sicherung; `key` ist ein Übersetzungsschlüssel. */
export class ImportError extends Error {
  constructor(readonly key: string) {
    super(key);
  }
}

export function downloadClass(data: ClassData): void {
  const payload = JSON.stringify({ format: FORMAT, exportedAt: new Date().toISOString(), data }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `seating-plan-${slug(data.name) || 'class'}-${stamp}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

/** Liest eine zuvor gesicherte Datei. Wirft einen `ImportError`. */
export async function readClassFile(file: File): Promise<ClassData> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new ImportError('import.invalidJson');
  }

  const wrapper = parsed as { format?: string; data?: ClassData };
  const data = wrapper?.format === FORMAT ? wrapper.data : (parsed as ClassData);

  if (!data || !Array.isArray(data.students) || !data.room) {
    throw new ImportError('import.noClassData');
  }
  return data;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[äöü]/g, (m) => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' })[m] ?? m)
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
