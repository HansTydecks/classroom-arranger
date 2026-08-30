/**
 * Demo-Klasse zum Ausprobieren und für die Tests.
 *
 * Bewusst so gebaut, dass sie die schwierigen Fälle enthält:
 *  - dichte Freundesgruppen mit gegenseitigen Wünschen,
 *  - einseitige Wünsche auf beliebte Kinder (David, Quirin, Ute),
 *  - Kinder, die niemand nennt,
 *  - harte Sonderwünsche, die knappe Plätze beanspruchen (erste Reihe),
 *  - Trennungen, die *gegen* starke gegenseitige Wünsche stehen
 *    (Vincent/Yannik, Anton/Bela) — genau dort muss der Solver sauber abwägen.
 *
 * 28 Personen auf 30 Plätzen: zwei Plätze bleiben frei.
 */

import type { ClassData, SpecialRequest, Student } from '../types/model';
import { DEFAULT_WEIGHTS } from '../types/model';

function student(
  id: string,
  firstName: string,
  wishes: string[],
  specials: SpecialRequest[] = [],
): Student {
  return { id, firstName, wishes, specials };
}

const students: Student[] = [
  // Freundesgruppe 1
  student('amelie', 'Amelie', ['emma', 'mia']),
  student('emma', 'Emma', ['amelie', 'sophie']),
  student('mia', 'Mia', ['sophie', 'amelie']),
  student('sophie', 'Sophie', ['mia', 'emma']),

  // Freundesgruppe 2
  student('ben', 'Ben', ['paul', 'jonas']),
  student('paul', 'Paul', ['ben', 'leon']),
  student('jonas', 'Jonas', ['leon', 'ben']),
  student('leon', 'Leon', ['jonas', 'paul']),

  // Freundesgruppe 3
  student('charlotte', 'Charlotte', ['hannah', 'greta']),
  student('hannah', 'Hannah', ['charlotte', 'ida']),
  student('greta', 'Greta', ['ida', 'charlotte'], [{ kind: 'window', hard: false }]),
  student('ida', 'Ida', ['greta', 'hannah'], [{ kind: 'front', hard: true }]),

  // Freundesgruppe 4
  student('felix', 'Felix', ['noah', 'david']),
  student('noah', 'Noah', ['felix', 'tim']),
  student('tim', 'Tim', ['ole', 'noah'], [{ kind: 'notBack', hard: false }]),
  student('ole', 'Ole', ['tim', 'vincent'], [{ kind: 'aisle', hard: false }]),

  // Freundesgruppe 5
  student('vincent', 'Vincent', ['yannik', 'ole']),
  student('yannik', 'Yannik', ['vincent', 'anton'], [{ kind: 'notDoor', hard: false }]),
  student('anton', 'Anton', ['bela', 'yannik']),
  student('bela', 'Bela', ['anton', 'quirin']),

  // Freundesgruppe 6
  student('klara', 'Klara', ['rosa', 'wanda'], [{ kind: 'maxRow', hard: true, row: 1 }]),
  student('rosa', 'Rosa', ['klara', 'xenia']),
  student('wanda', 'Wanda', ['xenia', 'klara']),
  student('xenia', 'Xenia', ['wanda', 'rosa']),

  // Einseitige Wünsche: Diese drei nennt niemand von sich aus.
  student('david', 'David', ['felix', 'noah'], [{ kind: 'front', hard: false }]),
  student('quirin', 'Quirin', ['bela', 'anton']),
  student('ute', 'Ute', ['zoe', 'klara']),

  // Zoe wünscht sich in eine Gruppe hinein, die sie nicht zurückwünscht.
  student('zoe', 'Zoe', ['rosa', 'xenia'], [{ kind: 'window', hard: false }]),
];

export function demoClass(): ClassData {
  return {
    name: '7b',
    room: {
      template: 'doubleRows',
      rowCount: 5,
      tablesPerRow: 3,
      seatsPerTable: 2,
      windowSide: 'left',
      doorPosition: 'frontRight',
    },
    students: students.map((s) => ({ ...s, wishes: [...s.wishes], specials: [...s.specials] })),
    separations: [
      // Reden zu viel miteinander — trotz gegenseitigem Erstwunsch.
      { a: 'vincent', b: 'yannik', radius: 'table' },
      { a: 'anton', b: 'bela', radius: 'adjacent' },
      { a: 'ben', b: 'leon', radius: 'table' },
    ],
    weights: { ...DEFAULT_WEIGHTS },
    nameDisplay: 'firstName',
  };
}
