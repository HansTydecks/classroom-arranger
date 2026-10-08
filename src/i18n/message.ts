/**
 * Sprachneutrale Meldungen.
 *
 * Solver, Validierung und Bericht erzeugen keine fertigen Sätze, sondern einen
 * Schlüssel mit Parametern. Erst die Oberfläche setzt daraus Text in der gerade
 * gewählten Sprache zusammen — so bleibt eine bereits berechnete Meldung korrekt,
 * wenn die Sprache danach gewechselt wird, und der Solver (Web Worker) braucht keine
 * Sprachkenntnis.
 */

export type MsgParam =
  | string
  | number
  /** Liste von Namen — wird in der Zielsprache als „A, B und C“ zusammengesetzt. */
  | string[]
  /** Liste von Regel-IDs — wird zu den übersetzten Regelnamen aufgelöst. */
  | { rules: string[] };

export interface Msg {
  key: string;
  params?: Record<string, MsgParam>;
}

export function msg(key: string, params?: Record<string, MsgParam>): Msg {
  return params ? { key, params } : { key };
}
