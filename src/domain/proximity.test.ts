import { describe, expect, it } from 'vitest';

import { buildProximityMatrix, PROXIMITY, seatProximity } from './proximity';
import { buildRoom } from './roomTemplates';
import type { RoomConfig, RoomLayout } from '../types/model';

function room(config: Partial<RoomConfig>): RoomLayout {
  return buildRoom({
    template: 'doubleRows',
    rowCount: 2,
    tablesPerRow: 2,
    seatsPerTable: 2,
    windowSide: 'left',
    doorPosition: 'frontRight',
    ...config,
  });
}

function at(layout: RoomLayout, row: number, col: number) {
  const seat = layout.seats.find((s) => s.row === row && s.col === col);
  if (!seat) throw new Error(`Kein Platz bei ${row}/${col}`);
  return seat;
}

function w(layout: RoomLayout, a: [number, number], b: [number, number]): number {
  return seatProximity(at(layout, ...a), at(layout, ...b));
}

describe('Nähe-Kernel', () => {
  it('ist symmetrisch und auf der Diagonalen null', () => {
    for (const template of ['rows', 'doubleRows', 'groups4', 'groups6', 'uShape'] as const) {
      const layout = room({ template, rowCount: 3, tablesPerRow: 3, seatsPerTable: template === 'groups6' ? 6 : template === 'groups4' ? 4 : 2 });
      const matrix = buildProximityMatrix(layout);

      for (let a = 0; a < matrix.size; a++) {
        expect(matrix.at(a, a)).toBe(0);
        for (let b = 0; b < matrix.size; b++) {
          expect(matrix.at(a, b)).toBe(matrix.at(b, a));
        }
      }
    }
  });

  describe('Doppelreihen', () => {
    const layout = room({ template: 'doubleRows', rowCount: 2, tablesPerRow: 2, seatsPerTable: 2 });

    it('erkennt Sitznachbarn am selben Tisch', () => {
      expect(w(layout, [0, 0], [0, 1])).toBe(PROXIMITY.adjacent);
    });

    it('trennt über den Gang hinweg vollständig', () => {
      // Spalte 2 ist die Gangspalte zwischen den beiden Tischblöcken.
      expect(w(layout, [0, 1], [0, 3])).toBe(0);
    });

    it('wertet die Reihe dahinter schwach', () => {
      expect(w(layout, [0, 0], [1, 0])).toBe(PROXIMITY.behind);
      expect(w(layout, [0, 0], [1, 1])).toBe(PROXIMITY.diagonal);
    });
  });

  describe('Gruppentische', () => {
    const layout = room({ template: 'groups4', rowCount: 1, tablesPerRow: 2, seatsPerTable: 4 });

    it('setzt Sitznachbarn auf voll, Gegenüber und Ecke auf halb', () => {
      expect(w(layout, [0, 0], [0, 1])).toBe(PROXIMITY.adjacent);
      expect(w(layout, [0, 0], [1, 0])).toBe(PROXIMITY.sameTable);
      expect(w(layout, [0, 0], [1, 1])).toBe(PROXIMITY.sameTable);
    });

    it('trennt benachbarte Gruppentische über den Gang', () => {
      expect(w(layout, [0, 1], [0, 3])).toBe(0);
    });
  });

  describe('U-Form', () => {
    const layout = room({ template: 'uShape', rowCount: 3, tablesPerRow: 2, seatsPerTable: 2 });

    it('erkennt Nachbarn am Arm, obwohl sie im Raster untereinander liegen', () => {
      // Am Arm sitzt der Nachbar in derselben Spalte — hier entscheidet die
      // Blickrichtung, nicht die Rasterzeile.
      expect(w(layout, [0, 0], [1, 0])).toBe(PROXIMITY.adjacent);
      expect(w(layout, [1, 0], [2, 0])).toBe(PROXIMITY.adjacent);
    });

    it('verbindet die Ecke zwischen Arm und Rückreihe', () => {
      expect(w(layout, [2, 0], [3, 0])).toBe(PROXIMITY.sameTable);
    });

    it('lässt die gegenüberliegenden Arme unverbunden', () => {
      expect(w(layout, [0, 0], [0, layout.gridCols - 1])).toBe(0);
    });
  });
});

describe('Raumvorlagen', () => {
  it('erzeugt die erwartete Platzzahl', () => {
    const layout = room({ template: 'doubleRows', rowCount: 5, tablesPerRow: 3, seatsPerTable: 2 });
    expect(layout.seats).toHaveLength(30);
    expect(layout.tableRowCount).toBe(5);
  });

  it('markiert Fenster-, Vorne- und Hinten-Plätze', () => {
    const layout = room({ template: 'doubleRows', rowCount: 3, tablesPerRow: 2, seatsPerTable: 2, windowSide: 'left' });
    expect(at(layout, 0, 0).tags).toContain('window');
    expect(at(layout, 0, 0).tags).toContain('front');
    expect(at(layout, 2, 0).tags).toContain('back');
    expect(at(layout, 0, 1).tags).not.toContain('window');
  });

  it('markiert Plätze am Gang', () => {
    const layout = room({ template: 'doubleRows', rowCount: 1, tablesPerRow: 2, seatsPerTable: 2 });
    // Spalte 1 grenzt rechts an die Gangspalte 2.
    expect(at(layout, 0, 1).tags).toContain('aisle');
  });

  it('begrenzt unsinnige Konfigurationen', () => {
    const layout = room({ rowCount: 999, tablesPerRow: 0, seatsPerTable: 99 });
    expect(layout.config.rowCount).toBeLessThanOrEqual(10);
    expect(layout.config.tablesPerRow).toBeGreaterThanOrEqual(1);
    expect(layout.config.seatsPerTable).toBeLessThanOrEqual(8);
  });
});
