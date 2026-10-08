/**
 * Erzeugt aus einer `RoomConfig` die konkrete Sitzordnung.
 *
 * Rasterkonventionen:
 *  - Zeile 0 ist vorne (Tafel), Spalte 0 ist links aus Schülerperspektive.
 *  - Zwischen zwei Tischblöcken einer Reihe liegt genau eine leere Gangspalte.
 *    Daran erkennt die Nachbarschaftsberechnung Gänge, ohne sie extra zu speichern.
 *  - Zwischen Tischreihen liegt *keine* Leerzeile: wer direkt hinter mir sitzt,
 *    ist ein (schwacher) Nachbar.
 */

import type {
  DoorPosition,
  Facing,
  RoomConfig,
  RoomLayout,
  Seat,
  SeatTag,
  WindowSide,
} from '../types/model';

/** Abmessungen eines Tischblocks im Raster. */
function tableShape(config: RoomConfig): { width: number; height: number } {
  switch (config.template) {
    case 'groups4':
    case 'groups6':
      // Gruppentische sind zweireihig: Die Hälften sitzen einander gegenüber.
      return { width: Math.ceil(config.seatsPerTable / 2), height: 2 };
    default:
      return { width: config.seatsPerTable, height: 1 };
  }
}

/** Voreinstellungen je Vorlage; die Oberfläche kann sie überschreiben. */
export const TEMPLATE_DEFAULTS: Record<RoomConfig['template'], Partial<RoomConfig>> = {
  rows: { rowCount: 4, tablesPerRow: 6, seatsPerTable: 1 },
  doubleRows: { rowCount: 4, tablesPerRow: 3, seatsPerTable: 2 },
  groups4: { rowCount: 2, tablesPerRow: 3, seatsPerTable: 4 },
  groups6: { rowCount: 2, tablesPerRow: 2, seatsPerTable: 6 },
  uShape: { rowCount: 4, tablesPerRow: 3, seatsPerTable: 2 },
};

/** Reihenfolge der Vorlagen im Auswahlmenü; die Bezeichnungen stehen in `i18n/locales`. */
export const TEMPLATE_IDS = Object.keys(TEMPLATE_DEFAULTS) as Array<RoomConfig['template']>;

export function defaultRoomConfig(): RoomConfig {
  return {
    template: 'doubleRows',
    rowCount: 4,
    tablesPerRow: 3,
    seatsPerTable: 2,
    windowSide: 'left',
    doorPosition: 'frontRight',
  };
}

/** Begrenzt die Konfiguration auf sinnvolle Werte. */
export function normalizeRoomConfig(config: RoomConfig): RoomConfig {
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, Math.round(Number.isFinite(v) ? v : lo)));
  return {
    ...config,
    rowCount: clamp(config.rowCount, 1, 10),
    tablesPerRow: clamp(config.tablesPerRow, 1, 10),
    seatsPerTable: clamp(config.seatsPerTable, 1, 8),
  };
}

export function buildRoom(rawConfig: RoomConfig): RoomLayout {
  const config = normalizeRoomConfig(rawConfig);
  return config.template === 'uShape' ? buildUShape(config) : buildGrid(config);
}

// ---------------------------------------------------------------------------
// Rastervorlagen: Reihen, Doppelreihen, Gruppentische
// ---------------------------------------------------------------------------

function buildGrid(config: RoomConfig): RoomLayout {
  const { width, height } = tableShape(config);
  const gridCols = config.tablesPerRow * width + (config.tablesPerRow - 1);
  const gridRows = config.rowCount * height;
  const seats: Seat[] = [];

  for (let tRow = 0; tRow < config.rowCount; tRow++) {
    for (let tCol = 0; tCol < config.tablesPerRow; tCol++) {
      const tableId = 't' + tRow + '-' + tCol;
      const baseCol = tCol * (width + 1);
      const baseRow = tRow * height;

      for (let k = 0; k < config.seatsPerTable; k++) {
        const sx = k % width;
        const sy = Math.floor(k / width);
        const col = baseCol + sx;
        const row = baseRow + sy;
        seats.push({
          id: 's' + row + '-' + col,
          tableId,
          indexInTable: k,
          row,
          col,
          tableRow: tRow,
          // Am Gruppentisch sitzt die hintere Hälfte mit dem Rücken zur Tafel.
          facing: height === 2 && sy === 1 ? 'down' : 'up',
          tags: [],
        });
      }
    }
  }

  applyTags(seats, config, gridCols, gridRows);
  return { config, seats, gridCols, gridRows, tableRowCount: config.rowCount };
}

// ---------------------------------------------------------------------------
// U-Form
// ---------------------------------------------------------------------------

/**
 * Die Öffnung des U zeigt zur Tafel. `rowCount` bestimmt die Länge der Arme,
 * `tablesPerRow * seatsPerTable` die Breite der hinteren Reihe. Die Plätze jedes
 * Segments werden fortlaufend zu Tischen mit `seatsPerTable` Plätzen gebündelt.
 */
function buildUShape(config: RoomConfig): RoomLayout {
  const armLength = config.rowCount;
  const backWidth = Math.max(2, config.tablesPerRow * config.seatsPerTable);
  const gridCols = backWidth;
  const gridRows = armLength + 1;
  const seats: Seat[] = [];

  const pushSegment = (
    prefix: string,
    positions: Array<{ row: number; col: number; tableRow: number }>,
    facing: Facing,
  ) => {
    positions.forEach((pos, i) => {
      seats.push({
        id: 's' + pos.row + '-' + pos.col,
        tableId: prefix + Math.floor(i / config.seatsPerTable),
        indexInTable: i % config.seatsPerTable,
        row: pos.row,
        col: pos.col,
        tableRow: pos.tableRow,
        facing,
        tags: [],
      });
    });
  };

  const left = Array.from({ length: armLength }, (_, r) => ({ row: r, col: 0, tableRow: r }));
  const right = Array.from({ length: armLength }, (_, r) => ({
    row: r,
    col: gridCols - 1,
    tableRow: r,
  }));
  const back = Array.from({ length: backWidth }, (_, c) => ({
    row: armLength,
    col: c,
    tableRow: armLength,
  }));

  pushSegment('uL', left, 'right');
  pushSegment('uR', right, 'left');
  pushSegment('uB', back, 'up');

  applyTags(seats, config, gridCols, gridRows);
  return { config, seats, gridCols, gridRows, tableRowCount: armLength + 1 };
}

// ---------------------------------------------------------------------------
// Platz-Eigenschaften
// ---------------------------------------------------------------------------

function applyTags(
  seats: Seat[],
  config: RoomConfig,
  gridCols: number,
  gridRows: number,
): void {
  const occupied = new Set(seats.map((s) => s.row + ':' + s.col));
  const maxTableRow = seats.reduce((m, s) => Math.max(m, s.tableRow), 0);

  for (const seat of seats) {
    const tags: SeatTag[] = [];

    if (seat.tableRow === 0) tags.push('front');
    if (seat.tableRow === maxTableRow) tags.push('back');

    if (isWindowSeat(seat, config.windowSide, gridCols)) tags.push('window');

    // Am Gang: links oder rechts ist keine Sitzfläche — also Wandgang oder
    // die Lücke zwischen zwei Tischblöcken.
    const leftFree = seat.col === 0 || !occupied.has(seat.row + ':' + (seat.col - 1));
    const rightFree =
      seat.col === gridCols - 1 || !occupied.has(seat.row + ':' + (seat.col + 1));
    if (leftFree || rightFree) tags.push('aisle');

    if (isNearDoor(seat, config.doorPosition, gridCols, gridRows)) tags.push('door');

    seat.tags = tags;
  }
}

function isWindowSeat(seat: Seat, side: WindowSide, gridCols: number): boolean {
  if (side === 'left') return seat.col === 0;
  if (side === 'right') return seat.col === gridCols - 1;
  return false;
}

/** Plätze in unmittelbarer Nähe der Tür. */
function isNearDoor(
  seat: Seat,
  door: DoorPosition,
  gridCols: number,
  gridRows: number,
): boolean {
  const doorRow = door.startsWith('front') ? 0 : gridRows - 1;
  const doorCol = door.endsWith('Left') ? 0 : gridCols - 1;
  return Math.abs(seat.row - doorRow) + Math.abs(seat.col - doorCol) <= 1;
}
