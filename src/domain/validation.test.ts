import { describe, expect, it } from 'vitest';

import { buildRoom } from './roomTemplates';
import { validate } from './validation';
import { demoClass } from '../fixtures/demoClass';
import { compileProblem } from '../solver/problem';
import type { ClassData, RoomConfig, SpecialRequest, Student } from '../types/model';
import { DEFAULT_WEIGHTS } from '../types/model';

function classWith(
  students: Array<{ id: string; specials?: SpecialRequest[]; wishes?: string[] }>,
  config: Partial<RoomConfig> = {},
  separations: ClassData['separations'] = [],
): ClassData {
  return {
    name: 'Test',
    room: {
      template: 'doubleRows',
      rowCount: 3,
      tablesPerRow: 2,
      seatsPerTable: 2,
      windowSide: 'left',
      doorPosition: 'frontRight',
      ...config,
    },
    students: students.map(
      (s): Student => ({
        id: s.id,
        firstName: s.id,
        wishes: s.wishes ?? [],
        specials: s.specials ?? [],
      }),
    ),
    separations,
    weights: { ...DEFAULT_WEIGHTS },
    nameDisplay: 'firstName',
  };
}

function check(data: ClassData) {
  const room = buildRoom(data.room);
  const { problem, warnings } = compileProblem(data, room);
  return validate(data, room, problem, warnings);
}

describe('Vorabprüfung', () => {
  it('hält die Demo-Klasse für lösbar', () => {
    const data = demoClass();
    const result = check(data);
    expect(result.solvable).toBe(true);
    expect(result.issues.filter((i) => i.severity === 'error')).toHaveLength(0);
  });

  it('meldet zu wenige Plätze', () => {
    const data = classWith(
      Array.from({ length: 9 }, (_, i) => ({ id: `p${i}` })),
      { rowCount: 2, tablesPerRow: 2, seatsPerTable: 2 }, // 8 Plätze
    );
    const result = check(data);
    expect(result.solvable).toBe(false);
    expect(result.issues.some((i) => i.message.includes('Es fehlen 1 Plätze'))).toBe(true);
  });

  it('meldet eine Person, für die kein Platz zulässig ist', () => {
    const data = classWith([{ id: 'anna', specials: [{ kind: 'window', hard: true }] }], {
      windowSide: 'none',
    });
    const result = check(data);
    expect(result.solvable).toBe(false);
    expect(result.issues.some((i) => i.studentIds?.includes('anna'))).toBe(true);
  });

  /**
   * Der Kern der Hall-Prüfung: Mehr Personen wollen zwingend nach vorne, als es
   * vorne Plätze gibt. Der einzelne Sonderwunsch ist jeweils erfüllbar — nur eben
   * nicht alle gleichzeitig.
   */
  it('erkennt, wenn zu viele Personen zwingend in die erste Reihe müssen', () => {
    const front: SpecialRequest[] = [{ kind: 'front', hard: true }];
    const data = classWith(
      [
        { id: 'a', specials: front },
        { id: 'b', specials: front },
        { id: 'c', specials: front },
        { id: 'd', specials: front },
        { id: 'e', specials: front },
        { id: 'f' },
        { id: 'g' },
      ],
      { rowCount: 3, tablesPerRow: 2, seatsPerTable: 2 }, // 4 Plätze in Reihe 0
    );

    const result = check(data);
    expect(result.solvable).toBe(false);

    const issue = result.issues.find((i) => i.message.includes('benötigen wegen harter Vorgaben'));
    expect(issue).toBeDefined();
    // Genau die fünf Betroffenen werden benannt, nicht die übrigen.
    expect(issue!.studentIds?.sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(issue!.message).toContain('nur 4');
  });

  it('erkennt eine unerfüllbare Trennung', () => {
    const data = classWith(
      [{ id: 'a' }, { id: 'b' }],
      { rowCount: 1, tablesPerRow: 1, seatsPerTable: 2 }, // genau zwei Plätze, nebeneinander
      [{ a: 'a', b: 'b', radius: 'adjacent' }],
    );
    const result = check(data);
    expect(result.solvable).toBe(false);
    expect(result.issues.some((i) => i.message.includes('lassen sich nicht trennen'))).toBe(true);
  });

  it('erkennt eine Trennungs-Gruppe, die mehr Tische braucht als vorhanden', () => {
    const data = classWith(
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      { rowCount: 1, tablesPerRow: 2, seatsPerTable: 2 }, // 2 Tische
      [
        { a: 'a', b: 'b', radius: 'table' },
        { a: 'b', b: 'c', radius: 'table' },
        { a: 'a', b: 'c', radius: 'table' },
      ],
    );
    const result = check(data);
    expect(result.solvable).toBe(false);
    expect(result.issues.some((i) => i.message.includes('nur 2 Tische'))).toBe(true);
  });

  it('warnt, wenn kein Platz frei bleibt', () => {
    const data = classWith(
      Array.from({ length: 8 }, (_, i) => ({ id: `p${i}` })),
      { rowCount: 2, tablesPerRow: 2, seatsPerTable: 2 },
    );
    const result = check(data);
    expect(result.solvable).toBe(true);
    expect(result.issues.some((i) => i.message.includes('Alle Plätze sind belegt'))).toBe(true);
  });

  it('warnt bei Wünschen auf unbekannte Namen', () => {
    const data = classWith([{ id: 'a', wishes: ['gibtesnicht'] }, { id: 'b' }]);
    const result = check(data);
    expect(result.solvable).toBe(true);
    expect(result.issues.some((i) => i.message.includes('unbekannten Namen'))).toBe(true);
  });
});
