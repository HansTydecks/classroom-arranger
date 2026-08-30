/**
 * Zustand der Anwendung: eine Klasse, die fortlaufend im Browser gesichert wird.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { defaultRoomConfig } from '../domain/roomTemplates';
import { clearAll, loadClass, saveClass } from './persistence';
import type {
  ClassData,
  RoomConfig,
  Separation,
  SpecialKind,
  SpecialRequest,
  Student,
  Weights,
} from '../types/model';
import { DEFAULT_WEIGHTS, MAX_WISHES } from '../types/model';

export function emptyClass(): ClassData {
  return {
    name: '',
    room: defaultRoomConfig(),
    students: [],
    separations: [],
    weights: { ...DEFAULT_WEIGHTS },
    nameDisplay: 'firstName',
  };
}

let idCounter = 0;
function newId(): string {
  idCounter += 1;
  return `s${Date.now().toString(36)}${idCounter.toString(36)}`;
}

/**
 * Ergänzt fehlende Felder aus älteren Ständen, damit ein gespeicherter Datensatz
 * nach einer Erweiterung des Modells nicht die Anwendung lahmlegt.
 */
function migrate(stored: ClassData): ClassData {
  const base = emptyClass();
  return {
    ...base,
    ...stored,
    room: { ...base.room, ...stored.room },
    weights: { ...base.weights, ...stored.weights },
    students: (stored.students ?? []).map((student) => ({
      ...student,
      wishes: student.wishes ?? [],
      specials: student.specials ?? [],
    })),
    separations: stored.separations ?? [],
  };
}

export interface ClassStore {
  data: ClassData;
  /** `false`, solange der gespeicherte Stand noch geladen wird. */
  ready: boolean;
  setName(name: string): void;
  setNameDisplay(mode: ClassData['nameDisplay']): void;
  setRoom(patch: Partial<RoomConfig>): void;
  setWeights(patch: Partial<Weights>): void;
  resetWeights(): void;
  addStudents(names: string[]): void;
  updateStudent(id: string, patch: Partial<Student>): void;
  removeStudent(id: string): void;
  setWish(id: string, rank: number, targetId: string | null): void;
  toggleSpecial(id: string, kind: SpecialKind): void;
  setSpecialHard(id: string, kind: SpecialKind, hard: boolean): void;
  setSpecialRow(id: string, kind: SpecialKind, row: number): void;
  setPinnedSeat(id: string, seatId: string | undefined): void;
  clearPins(): void;
  addSeparation(separation: Separation): void;
  removeSeparation(index: number): void;
  replaceAll(data: ClassData): void;
  reset(): Promise<void>;
}

export function useClassStore(): ClassStore {
  const [data, setData] = useState<ClassData>(emptyClass);
  const [ready, setReady] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadClass().then((stored) => {
      if (cancelled) return;
      if (stored) setData(migrate(stored));
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Verzögertes Speichern, damit Tippen nicht bei jedem Zeichen die Datenbank trifft.
  useEffect(() => {
    if (!ready || !dirty.current) return;
    const timer = setTimeout(() => void saveClass(data), 400);
    return () => clearTimeout(timer);
  }, [data, ready]);

  const update = useCallback((change: (current: ClassData) => ClassData) => {
    dirty.current = true;
    setData(change);
  }, []);

  const patchStudent = useCallback(
    (id: string, change: (student: Student) => Student) => {
      update((current) => ({
        ...current,
        students: current.students.map((student) =>
          student.id === id ? change(student) : student,
        ),
      }));
    },
    [update],
  );

  const patchSpecial = useCallback(
    (id: string, kind: SpecialKind, change: (special: SpecialRequest) => SpecialRequest) => {
      patchStudent(id, (student) => ({
        ...student,
        specials: student.specials.map((special) =>
          special.kind === kind ? change(special) : special,
        ),
      }));
    },
    [patchStudent],
  );

  return useMemo<ClassStore>(
    () => ({
      data,
      ready,

      setName: (name) => update((current) => ({ ...current, name })),
      setNameDisplay: (nameDisplay) => update((current) => ({ ...current, nameDisplay })),
      setRoom: (patch) =>
        update((current) => ({ ...current, room: { ...current.room, ...patch } })),
      setWeights: (patch) =>
        update((current) => ({ ...current, weights: { ...current.weights, ...patch } })),
      resetWeights: () => update((current) => ({ ...current, weights: { ...DEFAULT_WEIGHTS } })),

      addStudents: (names) =>
        update((current) => ({
          ...current,
          students: [
            ...current.students,
            ...names
              .map((name) => name.trim())
              .filter(Boolean)
              .map((name): Student => {
                const parts = name.split(/\s+/);
                const firstName = parts[0]!;
                const lastName = parts.slice(1).join(' ');
                return {
                  id: newId(),
                  firstName,
                  ...(lastName ? { lastName } : {}),
                  wishes: [],
                  specials: [],
                };
              }),
          ],
        })),

      updateStudent: (id, patch) => patchStudent(id, (student) => ({ ...student, ...patch })),

      // Beim Entfernen müssen auch alle Verweise verschwinden, sonst zeigen Wünsche
      // und Trennungen ins Leere.
      removeStudent: (id) =>
        update((current) => ({
          ...current,
          students: current.students
            .filter((student) => student.id !== id)
            .map((student) => ({
              ...student,
              wishes: student.wishes.map((wish) => (wish === id ? '' : wish)),
            })),
          separations: current.separations.filter((sep) => sep.a !== id && sep.b !== id),
        })),

      setWish: (id, rank, targetId) =>
        patchStudent(id, (student) => {
          const wishes = [...student.wishes];
          while (wishes.length < MAX_WISHES) wishes.push('');
          wishes[rank] = targetId ?? '';
          return { ...student, wishes };
        }),

      toggleSpecial: (id, kind) =>
        patchStudent(id, (student) => {
          const existing = student.specials.find((special) => special.kind === kind);
          return {
            ...student,
            specials: existing
              ? student.specials.filter((special) => special.kind !== kind)
              : [
                  ...student.specials,
                  kind === 'maxRow'
                    ? { kind, hard: false, row: 1 }
                    : { kind, hard: false },
                ],
          };
        }),

      setSpecialHard: (id, kind, hard) =>
        patchSpecial(id, kind, (special) => ({ ...special, hard })),

      setSpecialRow: (id, kind, row) =>
        patchSpecial(id, kind, (special) => ({ ...special, row })),

      setPinnedSeat: (id, seatId) =>
        patchStudent(id, (student) => {
          const next = { ...student };
          if (seatId) next.pinnedSeat = seatId;
          else delete next.pinnedSeat;
          return next;
        }),

      clearPins: () =>
        update((current) => ({
          ...current,
          students: current.students.map((student) => {
            const next = { ...student };
            delete next.pinnedSeat;
            return next;
          }),
        })),

      addSeparation: (separation) =>
        update((current) =>
          current.separations.some(
            (existing) =>
              (existing.a === separation.a && existing.b === separation.b) ||
              (existing.a === separation.b && existing.b === separation.a),
          )
            ? current
            : { ...current, separations: [...current.separations, separation] },
        ),

      removeSeparation: (index) =>
        update((current) => ({
          ...current,
          separations: current.separations.filter((_, i) => i !== index),
        })),

      replaceAll: (next) => update(() => migrate(next)),

      reset: async () => {
        dirty.current = false;
        setData(emptyClass());
        await clearAll();
      },
    }),
    [data, ready, update, patchStudent, patchSpecial],
  );
}
