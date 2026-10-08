/**
 * Zustand der Anwendung: eine Klasse, die fortlaufend im Browser gesichert wird.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { defaultRoomConfig } from '../domain/roomTemplates';
import { clearAll, loadClass, saveClass } from './persistence';
import type { ClassData, RoomConfig, SpecialRequest, Student, Weights } from '../types/model';
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
export function migrate(stored: ClassData): ClassData {
  const base = emptyClass();
  const students: Student[] = (stored.students ?? []).map((student) => ({
    ...student,
    wishes: student.wishes ?? [],
    specials: [...(student.specials ?? [])],
  }));

  // Trennungen waren früher eine eigene Liste; heute sind sie Regeln am Kind.
  for (const separation of stored.separations ?? []) {
    const holder = students.find((student) => student.id === separation.a);
    if (!holder || !students.some((student) => student.id === separation.b)) continue;
    const kind = separation.radius === 'adjacent' ? 'notNextTo' : 'notSameTable';
    const exists = holder.specials.some(
      (rule) => rule.kind === kind && rule.target === separation.b,
    );
    if (!exists) holder.specials.push({ kind, hard: true, target: separation.b });
  }

  return {
    ...base,
    ...stored,
    room: { ...base.room, ...stored.room },
    weights: { ...base.weights, ...stored.weights },
    students,
    separations: [],
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
  addRule(id: string, rule: SpecialRequest): void;
  updateRule(id: string, index: number, patch: Partial<SpecialRequest>): void;
  removeRule(id: string, index: number): void;
  setPinnedSeat(id: string, seatId: string | undefined): void;
  clearPins(): void;
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
              specials: student.specials.filter((rule) => rule.target !== id),
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

      addRule: (id, rule) =>
        patchStudent(id, (student) => ({ ...student, specials: [...student.specials, rule] })),

      updateRule: (id, index, patch) =>
        patchStudent(id, (student) => ({
          ...student,
          specials: student.specials.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)),
        })),

      removeRule: (id, index) =>
        patchStudent(id, (student) => ({
          ...student,
          specials: student.specials.filter((_, i) => i !== index),
        })),

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

      replaceAll: (next) => update(() => migrate(next)),

      reset: async () => {
        dirty.current = false;
        setData(emptyClass());
        await clearAll();
      },
    }),
    [data, ready, update, patchStudent],
  );
}
