/**
 * Anzeigenamen — mit Datenminimierung im Blick.
 *
 * Für den Aushang im Klassenraum reicht meist der Vorname. Kommt ein Vorname
 * mehrfach vor, wird er automatisch um den Anfangsbuchstaben des Nachnamens
 * ergänzt: Sparsamkeit darf nicht zu Verwechslungen führen.
 */

import type { NameDisplay, Student } from '../types/model';

function fullName(student: Student): string {
  return student.lastName ? `${student.firstName} ${student.lastName}` : student.firstName;
}

function withInitial(student: Student): string {
  return student.lastName
    ? `${student.firstName} ${student.lastName.trim().charAt(0)}.`
    : student.firstName;
}

/** Anzeigename je Personen-ID, eindeutig innerhalb der Klasse. */
export function buildLabels(students: Student[], mode: NameDisplay): Map<string, string> {
  const firstNameCounts = new Map<string, number>();
  for (const student of students) {
    const key = student.firstName.trim().toLowerCase();
    firstNameCounts.set(key, (firstNameCounts.get(key) ?? 0) + 1);
  }

  const labels = new Map<string, string>();
  for (const student of students) {
    const ambiguous = (firstNameCounts.get(student.firstName.trim().toLowerCase()) ?? 0) > 1;
    if (mode === 'full') labels.set(student.id, fullName(student));
    else if (mode === 'initial') labels.set(student.id, withInitial(student));
    else labels.set(student.id, ambiguous ? withInitial(student) : student.firstName);
  }
  return labels;
}
