import { describe, expect, it } from 'vitest';

import { buildRoom } from '../domain/roomTemplates';
import { compileProblem } from './problem';
import { buildReport } from './report';
import type { ClassData, SpecialRequest } from '../types/model';
import { DEFAULT_WEIGHTS } from '../types/model';

/** Fünf Reihen à 2 Tische à 2 Plätze = 20 Plätze, Fenster links. */
function classWithSpecial(specials: SpecialRequest[]): ClassData {
  return {
    name: 'Test',
    room: {
      template: 'doubleRows',
      rowCount: 5,
      tablesPerRow: 2,
      seatsPerTable: 2,
      windowSide: 'left',
      doorPosition: 'frontRight',
    },
    students: [{ id: 'a', firstName: 'Anna', wishes: [], specials }],
    separations: [],
    weights: { ...DEFAULT_WEIGHTS },
    nameDisplay: 'firstName',
  };
}

/** Setzt Anna gezielt auf den Platz in Rasterzeile `row`, Spalte `col`. */
function reportFor(specials: SpecialRequest[], row: number, col: number) {
  const data = classWithSpecial(specials);
  const room = buildRoom(data.room);
  const { problem } = compileProblem(data, room);
  const seatIndex = room.seats.findIndex((seat) => seat.row === row && seat.col === col);
  expect(seatIndex).toBeGreaterThanOrEqual(0);
  return buildReport(problem, Int32Array.from([seatIndex]));
}

const satisfied = (specials: SpecialRequest[], row: number, col: number) =>
  reportFor(specials, row, col).perStudent[0]!.specials[0]!.satisfied;

describe('Bericht: Sonderwünsche', () => {
  /**
   * Ein weicher Wunsch „lieber vorne“ ist der Sache nach erfüllt, wenn die Person in
   * der besseren Hälfte des Raums sitzt — nicht erst in der allerersten Reihe.
   */
  describe('weiche Wünsche werden nach der besseren Raumhälfte bewertet', () => {
    const front: SpecialRequest[] = [{ kind: 'front', hard: false }];

    it('erste Reihe zählt als erfüllt', () => expect(satisfied(front, 0, 0)).toBe(true));
    it('mittlere Reihe zählt als erfüllt', () => expect(satisfied(front, 2, 0)).toBe(true));
    it('vorletzte Reihe zählt nicht mehr', () => expect(satisfied(front, 3, 0)).toBe(false));
    it('letzte Reihe zählt nicht', () => expect(satisfied(front, 4, 0)).toBe(false));
  });

  describe('harte Wünsche bleiben streng', () => {
    const front: SpecialRequest[] = [{ kind: 'front', hard: true }];

    it('erste Reihe erfüllt', () => expect(satisfied(front, 0, 0)).toBe(true));
    it('mittlere Reihe erfüllt nicht', () => expect(satisfied(front, 2, 0)).toBe(false));
  });

  it('bewertet den Fensterwunsch nur am Fenster als erfüllt', () => {
    const window: SpecialRequest[] = [{ kind: 'window', hard: false }];
    expect(satisfied(window, 0, 0)).toBe(true);
    expect(satisfied(window, 0, 1)).toBe(false);
  });

  it('bewertet „nicht hinten“ überall außer in der letzten Reihe als erfüllt', () => {
    const notBack: SpecialRequest[] = [{ kind: 'notBack', hard: false }];
    expect(satisfied(notBack, 0, 0)).toBe(true);
    expect(satisfied(notBack, 3, 0)).toBe(true);
    expect(satisfied(notBack, 4, 0)).toBe(false);
  });

  it('meldet keine Verstöße, solange alle harten Regeln eingehalten sind', () => {
    const report = reportFor([{ kind: 'front', hard: true }], 0, 0);
    expect(report.hardViolations).toEqual([]);
  });

  /** Nach einem Umsetzen von Hand muss ein Bruch einer harten Vorgabe sichtbar werden. */
  it('meldet eine verletzte harte Vorgabe im Klartext', () => {
    const report = reportFor([{ kind: 'front', hard: true }], 4, 0);
    expect(report.hardViolations).toHaveLength(1);
    expect(report.hardViolations[0]?.params?.name).toBe('Anna');
  });
});
