/**
 * Katalog der Regeln, die sich einem Kind per Auswahlmenü zuordnen lassen.
 *
 * Die Reihenfolge der Gruppen und der Regeln innerhalb der Gruppen ist die
 * Reihenfolge im Auswahlmenü — sie ist bewusst nach Themen sortiert, damit sich eine
 * Regel schnell finden lässt.
 */

import type { SpecialKind, SpecialRequest } from '../types/model';

export type RuleGroupId = 'position' | 'features' | 'neighbours';

export interface RuleGroup {
  id: RuleGroupId;
  kinds: SpecialKind[];
}

export const RULE_GROUPS: RuleGroup[] = [
  {
    id: 'position',
    kinds: ['front', 'notBack', 'back', 'maxRow', 'minRow', 'leftSide', 'rightSide', 'center'],
  },
  {
    id: 'features',
    kinds: ['window', 'notWindow', 'aisle', 'notAisle', 'nearDoor', 'notDoor'],
  },
  {
    id: 'neighbours',
    kinds: ['notNextTo', 'notSameTable', 'nextTo', 'sameTable'],
  },
];

/** Regeln, die sich auf ein zweites Kind beziehen. */
const PAIR_KINDS: ReadonlySet<SpecialKind> = new Set([
  'notNextTo',
  'notSameTable',
  'nextTo',
  'sameTable',
]);

/** Regeln mit einer Reihengrenze. */
const ROW_KINDS: ReadonlySet<SpecialKind> = new Set(['maxRow', 'minRow']);

/** Pair-Regeln, die Nähe verbieten. */
const APART_KINDS: ReadonlySet<SpecialKind> = new Set(['notNextTo', 'notSameTable']);

export function isPairRule(kind: SpecialKind): boolean {
  return PAIR_KINDS.has(kind);
}

export function isRowRule(kind: SpecialKind): boolean {
  return ROW_KINDS.has(kind);
}

/** `true` bei „nicht neben / nicht am selben Tisch“. */
export function isApartRule(kind: SpecialKind): boolean {
  return APART_KINDS.has(kind);
}

/** Reichweite einer Beziehungsregel: direkt nebeneinander oder gesamter Tisch. */
export function pairRadius(kind: SpecialKind): 'adjacent' | 'table' {
  return kind === 'notNextTo' || kind === 'nextTo' ? 'adjacent' : 'table';
}

/** Neue Regel mit sinnvollen Voreinstellungen. */
export function newRule(kind: SpecialKind, target?: string): SpecialRequest {
  if (isPairRule(kind)) {
    // Trennungen sind in der Praxis fast immer verbindlich, Nachbarwünsche nicht.
    return { kind, hard: isApartRule(kind), ...(target ? { target } : {}) };
  }
  if (isRowRule(kind)) return { kind, hard: false, row: 1 };
  return { kind, hard: false };
}

/** Ein Kind darf jede Platzregel nur einmal haben; Beziehungsregeln beliebig oft. */
export function isDuplicate(existing: SpecialRequest[], kind: SpecialKind): boolean {
  return !isPairRule(kind) && existing.some((rule) => rule.kind === kind);
}
