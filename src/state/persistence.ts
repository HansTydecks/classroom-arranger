/**
 * Speicherung im Browser — bewusst *nur* dort.
 *
 * Die Anwendung hat keinen Server und sendet nichts über das Netz. Alle Namen und
 * Wünsche liegen ausschließlich in der IndexedDB dieses Browsers und lassen sich
 * jederzeit vollständig löschen.
 */

import type { ClassData } from '../types/model';

const DB_NAME = 'classroom-arranger';
const DB_VERSION = 1;
const STORE = 'classes';
const CURRENT_KEY = 'current';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = action(transaction.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
      }),
  );
}

/** Speichert den aktuellen Stand. Fehler werden geschluckt — Speichern darf nie stören. */
export async function saveClass(data: ClassData): Promise<void> {
  try {
    await withStore('readwrite', (store) => store.put(data, CURRENT_KEY));
  } catch {
    // Privates Fenster, gesperrter Speicher: Die Anwendung funktioniert weiter,
    // nur ohne Wiederherstellung beim nächsten Aufruf.
  }
}

export async function loadClass(): Promise<ClassData | null> {
  try {
    const stored = await withStore<ClassData | undefined>('readonly', (store) =>
      store.get(CURRENT_KEY),
    );
    return stored ?? null;
  } catch {
    return null;
  }
}

/** Löscht alle gespeicherten Daten unwiderruflich. */
export async function clearAll(): Promise<void> {
  try {
    await withStore('readwrite', (store) => store.clear());
  } catch {
    // ignorieren
  }
}
