/**
 * Schritt 1: Das Klassenzimmer nachbauen.
 */

import { buildRoom, TEMPLATE_DEFAULTS, TEMPLATE_IDS } from '../domain/roomTemplates';
import { useI18n } from '../i18n/I18nContext';
import { SeatGrid } from './SeatGrid';
import type { ClassStore } from '../state/store';
import type { DoorPosition, RoomTemplateId, WindowSide } from '../types/model';

const WINDOW_SIDES: WindowSide[] = ['left', 'right', 'none'];
const DOOR_POSITIONS: DoorPosition[] = ['frontLeft', 'frontRight', 'backLeft', 'backRight'];

export function RoomEditor({ store }: { store: ClassStore }) {
  const { t } = useI18n();
  const { room } = store.data;
  const layout = buildRoom(room);
  const seatCount = layout.seats.length;
  const studentCount = store.data.students.length;

  const isUShape = room.template === 'uShape';

  return (
    <div className="columns">
      <div className="panel">
        <h2>{t('room.title')}</h2>

        <div className="field">
          <label htmlFor="template">{t('room.layout')}</label>
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
                {t(`room.template.${id}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="rowCount">{isUShape ? t('room.armSeats') : t('room.rows')}</label>
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
              {isUShape ? t('room.backTables') : t('room.tablesPerRow')}
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
            <label htmlFor="seatsPerTable">{t('room.seatsPerTable')}</label>
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
          <label htmlFor="windowSide">{t('room.windowSide')}</label>
          <select
            id="windowSide"
            value={room.windowSide}
            onChange={(event) => store.setRoom({ windowSide: event.target.value as WindowSide })}
          >
            {WINDOW_SIDES.map((side) => (
              <option key={side} value={side}>
                {t(`room.window.${side}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="doorPosition">{t('room.door')}</label>
          <select
            id="doorPosition"
            value={room.doorPosition}
            onChange={(event) =>
              store.setRoom({ doorPosition: event.target.value as DoorPosition })
            }
          >
            {DOOR_POSITIONS.map((position) => (
              <option key={position} value={position}>
                {t(`room.doorPos.${position}`)}
              </option>
            ))}
          </select>
        </div>

        <p className="hint">{t('room.hint')}</p>
      </div>

      <div className="panel">
        <h2>{t('room.preview')}</h2>
        <p className={seatCount < studentCount ? 'notice error' : 'hint'}>
          {studentCount === 0
            ? t('room.seatsOnly', { seats: seatCount })
            : seatCount < studentCount
              ? t('room.seatsMissing', { seats: seatCount, students: studentCount, missing: studentCount - seatCount })
              : seatCount === studentCount
                ? t('room.seatsFull', { seats: seatCount, students: studentCount })
                : t('room.seatsFree', { seats: seatCount, students: studentCount, free: seatCount - studentCount })}
        </p>
        <SeatGrid room={layout} showTags />
      </div>
    </div>
  );
}
