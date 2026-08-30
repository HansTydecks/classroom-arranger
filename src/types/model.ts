/**
 * Datenmodell der Anwendung (Eingabeseite).
 *
 * Dieses Modell ist auf Lesbarkeit und Bearbeitbarkeit in der Oberfläche
 * ausgelegt und arbeitet durchgehend mit String-IDs. Für die Optimierung wird
 * es in `solver/problem.ts` einmalig in eine index- und typed-array-basierte
 * Form übersetzt.
 */

// ---------------------------------------------------------------------------
// Raum
// ---------------------------------------------------------------------------

/** Eigenschaften eines Platzes, die für Sonderwünsche ausgewertet werden. */
export type SeatTag =
  | 'window' // unmittelbar an der Fensterseite
  | 'door'   // unmittelbar neben der Tür
  | 'aisle'  // grenzt an einen Gang
  | 'front'  // in der vordersten Reihe
  | 'back';  // in der hintersten Reihe

/**
 * Blickrichtung. Entscheidet, welche Nachbarschaft „nebeneinander“ ist und
 * welche „davor/dahinter“ — in Frontalreihen sitzt der Nachbar in derselben
 * Rasterzeile, an einem U-Form-Arm dagegen in derselben Rasterspalte.
 */
export type Facing = 'up' | 'down' | 'left' | 'right';

export interface Seat {
  id: string;
  /** Tisch, zu dem der Platz gehört. Plätze am selben Tisch gelten als Nachbarn. */
  tableId: string;
  /** Position innerhalb des Tisches, 0-basiert. */
  indexInTable: number;
  /** Rasterzeile, 0 = ganz vorne (an der Tafel). */
  row: number;
  /** Rasterspalte, 0 = ganz links aus Schülerperspektive. */
  col: number;
  /**
   * Logische Tischreihe, 0 = vorderste. Anders als `row` zählt sie Gruppentische
   * als *eine* Reihe und ist damit die Bezugsgröße für Vorne-/Hinten-Wünsche.
   */
  tableRow: number;
  /** Blickrichtung; `up` = zur Tafel. */
  facing: Facing;
  tags: SeatTag[];
}

export type RoomTemplateId =
  | 'rows'       // Frontalreihen, Einzeltische
  | 'doubleRows' // Doppelreihen (klassisch, 2er-Tische)
  | 'groups4'    // 4er-Gruppentische
  | 'groups6'    // 6er-Gruppentische
  | 'uShape';    // U-Form

export type WindowSide = 'left' | 'right' | 'none';
export type DoorPosition = 'frontLeft' | 'frontRight' | 'backLeft' | 'backRight';

export interface RoomConfig {
  template: RoomTemplateId;
  /** Anzahl der Tischreihen (von der Tafel nach hinten). */
  rowCount: number;
  /** Anzahl der Tischblöcke pro Reihe. Zwischen den Blöcken liegt jeweils ein Gang. */
  tablesPerRow: number;
  /** Plätze pro Tischblock. */
  seatsPerTable: number;
  windowSide: WindowSide;
  doorPosition: DoorPosition;
}

/** Aus einer `RoomConfig` erzeugte, konkrete Sitzordnung. */
export interface RoomLayout {
  config: RoomConfig;
  seats: Seat[];
  /** Rastergröße für die Darstellung. */
  gridCols: number;
  gridRows: number;
  /** Anzahl logischer Tischreihen (höchstes `tableRow` + 1). */
  tableRowCount: number;
}

// ---------------------------------------------------------------------------
// Klasse
// ---------------------------------------------------------------------------

export type SpecialKind =
  | 'front'   // möchte weit vorne sitzen
  | 'notBack' // möchte nicht in der letzten Reihe sitzen
  | 'window'  // möchte am Fenster sitzen
  | 'aisle'   // möchte am Gang sitzen
  | 'notDoor' // möchte nicht neben der Tür sitzen
  | 'maxRow'; // höchstens bis Reihe N (für Attest / Nachteilsausgleich)

export interface SpecialRequest {
  kind: SpecialKind;
  /**
   * Harte Sonderwünsche schränken die erlaubten Plätze vorab ein und können vom
   * Solver nicht verletzt werden (Attest, Sehschwäche, Nachteilsausgleich).
   * Weiche fließen nur als Bonus in die Bewertung ein.
   */
  hard: boolean;
  /** Nur für `maxRow`: höchste erlaubte Reihe, 0-basiert. */
  row?: number;
}

export interface Student {
  id: string;
  firstName: string;
  lastName?: string;
  /** Gewünschte Sitznachbarn, absteigend nach Priorität. Index 0 = Erstwunsch. */
  wishes: string[];
  specials: SpecialRequest[];
  /** Fest zugewiesener Platz. Wird wie eine harte Regel behandelt. */
  pinnedSeat?: string;
}

/**
 * Von der Lehrkraft gesetzte Trennung. Immer hart — der Solver verletzt sie nie.
 * `radius` legt fest, wie weit die Trennung reicht.
 */
export interface Separation {
  a: string;
  b: string;
  /** `adjacent`: nur direkt nebeneinander verboten. `table`: gesamter Tisch verboten. */
  radius: 'adjacent' | 'table';
}

// ---------------------------------------------------------------------------
// Gewichte
// ---------------------------------------------------------------------------

export interface Weights {
  /** Grundwert für Erst-, Zweit- und Drittwunsch. */
  wishRank: [number, number, number];
  /** Faktor, wenn der Wunsch beidseitig ist (A wünscht B und B wünscht A). */
  mutualFactor: number;
  /**
   * Abnehmender Grenznutzen: Der beste erfüllte Wunsch einer Person zählt voll,
   * der zweite nur noch anteilig, der dritte kaum noch.
   */
  diminishing: [number, number, number];
  /** Strafe für eine Person, bei der kein Wunsch erfüllt ist. */
  noWishPenalty: number;
  /**
   * Nähe, ab der ein Wunsch als „erfüllt“ gilt — für die Fairness-Strafe und den
   * Bericht. 0.6 bedeutet: mindestens am selben Tisch.
   */
  fulfilledProximity: number;
  /** Grundwert für einen erfüllten weichen Sonderwunsch. */
  specialBonus: number;
}

/** Voreinstellung „Fairness zuerst“. */
export const DEFAULT_WEIGHTS: Weights = {
  wishRank: [10, 6, 3],
  mutualFactor: 1.6,
  diminishing: [1.0, 0.4, 0.16],
  noWishPenalty: 25,
  fulfilledProximity: 0.6,
  specialBonus: 8,
};

// ---------------------------------------------------------------------------
// Gesamtzustand einer Klasse
// ---------------------------------------------------------------------------

/**
 * Wie Namen auf dem Bildschirm und im Ausdruck erscheinen. `firstName` und
 * `initial` dienen der Datenminimierung: Für den Aushang im Klassenraum reicht
 * meist der Vorname.
 */
export type NameDisplay = 'full' | 'firstName' | 'initial';

export interface ClassData {
  /** Anzeigename, z. B. „7b“. */
  name: string;
  room: RoomConfig;
  students: Student[];
  separations: Separation[];
  weights: Weights;
  nameDisplay: NameDisplay;
}

/** Maximale Anzahl Wünsche pro Person, die die Oberfläche erfasst. */
export const MAX_WISHES = 3;
