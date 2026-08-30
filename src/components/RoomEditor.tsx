/**
 * Schritt 1: Das Klassenzimmer nachbauen.
 */

import { buildRoom, TEMPLATE_DEFAULTS, TEMPLATE_LABELS } from '../domain/roomTemplates';
import { SeatGrid } from './SeatGrid';
import type { ClassStore } from '../state/store';
import type { DoorPosition, RoomTemplateId, WindowSide } from '../types/model';

const TEMPLATE_IDS = Object.keys(TEMPLATE_LABELS) as RoomTemplateId[];

const WINDOW_LABELS: Record<WindowSide, string> = {
  left: 'links',
  right: 'rechts',
  none: 'kein Fenster berücksichtigen',
};

const DOOR_LABELS: Record<DoorPosition, string> = {
  frontLeft: 'vorne links',
  frontRight: 'vorne rechts',
  backLeft: 'hinten links',
  backRight: 'hinten rechts',
};

export function RoomEditor({ store }: { store: ClassStore }) {
  const { room } = store.data;
  const layout = buildRoom(room);
  const seatCount = layout.seats.length;
  const studentCount = store.data.students.length;

  const isUShape = room.template === 'uShape';

  return (
    <div className="columns">
      <div className="panel">
        <h2>Klassenzimmer</h2>

        <div className="field">
          <label htmlFor="template">Anordnung</label>
          <select
            id="template"
            value={room.template}
            onChange={(event) => {
              const template = event.target.value as RoomTemplateId;
              store.setRoom({ template, ...TEMPLATE_DEFAULTS[template] });
            }}
          >
            {TEMPLATE_IDS.map((id) => (
              <option key={id} value={id}>
                {TEMPLATE_LABELS[id]}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="rowCount">{isUShape ? 'Plätze je Seitenarm' : 'Tischreihen'}</label>
            <input
              id="rowCount"
              type="number"
              min={1}
              max={10}
              value={room.rowCount}
              onChange={(event) => store.setRoom({ rowCount: Number(event.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="tablesPerRow">
              {isUShape ? 'Tische hinten' : 'Tische je Reihe'}
            </label>
            <input
              id="tablesPerRow"
              type="number"
              min={1}
              max={10}
              value={room.tablesPerRow}
              onChange={(event) => store.setRoom({ tablesPerRow: Number(event.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="seatsPerTable">Plätze je Tisch</label>
            <input
              id="seatsPerTable"
              type="number"
              min={1}
              max={8}
              value={room.seatsPerTable}
              onChange={(event) => store.setRoom({ seatsPerTable: Number(event.target.value) })}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="windowSide">Fensterseite</label>
          <select
            id="windowSide"
            value={room.windowSide}
            onChange={(event) => store.setRoom({ windowSide: event.target.value as WindowSide })}
          >
            {(Object.keys(WINDOW_LABELS) as WindowSide[]).map((side) => (
              <option key={side} value={side}>
                {WINDOW_LABELS[side]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="doorPosition">Tür</label>
          <select
            id="doorPosition"
            value={room.doorPosition}
            onChange={(event) =>
              store.setRoom({ doorPosition: event.target.value as DoorPosition })
            }
          >
            {(Object.keys(DOOR_LABELS) as DoorPosition[]).map((position) => (
              <option key={position} value={position}>
                {DOOR_LABELS[position]}
              </option>
            ))}
          </select>
        </div>

        <p className="hint">
          Die Angaben gelten aus Sicht der Schülerinnen und Schüler, also mit Blick zur Tafel.
          Zwischen den Tischblöcken liegt jeweils ein Gang — über ihn hinweg zählen Personen
          nicht als Sitznachbarn.
        </p>
      </div>

      <div className="panel">
        <h2>Vorschau</h2>
        <p className={seatCount < studentCount ? 'notice error' : 'hint'}>
          {seatCount} Plätze
          {studentCount > 0 && (
            <>
              {' für '}
              {studentCount} {studentCount === 1 ? 'Person' : 'Personen'}
              {seatCount < studentCount
                ? ` — es fehlen ${studentCount - seatCount}.`
                : seatCount === studentCount
                  ? ' — kein Platz bleibt frei.'
                  : ` — ${seatCount - studentCount} bleiben frei.`}
            </>
          )}
        </p>
        <SeatGrid room={layout} showTags />
      </div>
    </div>
  );
}
