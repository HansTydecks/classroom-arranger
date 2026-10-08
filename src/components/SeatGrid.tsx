/**
 * Darstellung des Raums als Raster — geteilt von Raumeditor (leer, mit
 * Platz-Eigenschaften) und Ergebnisansicht (belegt, mit Farbcodierung).
 */

import { useState } from 'react';
import type { DragEvent } from 'react';

import { useI18n } from '../i18n/I18nContext';
import type { RoomLayout, Seat } from '../types/model';

export interface SeatOccupant {
  studentId: string;
  name: string;
  /**
   * Rang des besten erfüllten Wunsches (0 = Erstwunsch), `null` wenn kein Wunsch
   * aufgegangen ist, `undefined` wenn die Person keine Wünsche abgegeben hat.
   */
  bestRank: number | null | undefined;
  pinned: boolean;
}

interface SeatGridProps {
  room: RoomLayout;
  occupants?: Map<string, SeatOccupant>;
  /** Spalten spiegeln — Sitzplan aus Sicht der Lehrkraft. */
  mirrored?: boolean;
  /** Platz-Eigenschaften unter dem Namen anzeigen. */
  showTags?: boolean;
  /** Zwei Plätze tauschen (Ziehen & Ablegen). Ohne diese Funktion ist das Raster starr. */
  onSwapSeats?: (seatA: string, seatB: string) => void;
  onTogglePin?: (studentId: string) => void;
}

function rankClass(occupant: SeatOccupant | undefined): string {
  if (!occupant) return 'empty';
  if (occupant.bestRank === undefined) return '';
  if (occupant.bestRank === null) return 'rank-none';
  return occupant.bestRank === 0 ? 'rank-0' : 'rank-1';
}

export function SeatGrid({
  room,
  occupants,
  mirrored = false,
  showTags = false,
  onSwapSeats,
  onTogglePin,
}: SeatGridProps) {
  const { t } = useI18n();
  const tagLabel = (seat: Seat) => seat.tags.map((tag) => t(`seat.tag.${tag}`));
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const seatAt = new Map<string, Seat>();
  for (const seat of room.seats) seatAt.set(`${seat.row}:${seat.col}`, seat);

  // Beim Spiegeln wird die Spaltenreihenfolge umgekehrt statt die Fläche per
  // CSS-Transform zu drehen — sonst stünde die Schrift spiegelverkehrt.
  const columnOrder = Array.from({ length: room.gridCols }, (_, index) =>
    mirrored ? room.gridCols - 1 - index : index,
  );

  const handleDrop = (event: DragEvent, targetSeatId: string) => {
    event.preventDefault();
    setDragOver(null);
    const sourceSeatId = event.dataTransfer.getData('text/seat') || dragging;
    setDragging(null);
    if (sourceSeatId && sourceSeatId !== targetSeatId) onSwapSeats?.(sourceSeatId, targetSeatId);
  };

  return (
    <div
      className="room"
      style={{ gridTemplateColumns: `repeat(${room.gridCols}, auto)` }}
      role="group"
      aria-label={t('grid.label')}
    >
      <div className="board">{t('grid.board')}{mirrored ? ` — ${t('grid.viewFromFront')}` : ''}</div>

      {Array.from({ length: room.gridRows }, (_, row) =>
        columnOrder.map((col) => {
          const seat = seatAt.get(`${row}:${col}`);
          if (!seat) return <div className="aisle" key={`${row}:${col}`} aria-hidden="true" />;

          const occupant = occupants?.get(seat.id);
          const interactive = Boolean(onSwapSeats);
          const classes = [
            'seat',
            rankClass(occupant),
            interactive ? 'draggable' : '',
            dragging === seat.id ? 'dragging' : '',
            dragOver === seat.id ? 'drag-over' : '',
            occupant?.pinned ? 'pinned' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={seat.id}
              className={classes}
              draggable={interactive}
              onDragStart={(event) => {
                event.dataTransfer.setData('text/seat', seat.id);
                event.dataTransfer.effectAllowed = 'move';
                setDragging(seat.id);
              }}
              onDragEnd={() => {
                setDragging(null);
                setDragOver(null);
              }}
              onDragOver={(event) => {
                if (!interactive) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setDragOver(seat.id);
              }}
              onDragLeave={() => setDragOver((current) => (current === seat.id ? null : current))}
              onDrop={(event) => handleDrop(event, seat.id)}
              title={tagLabel(seat).join(', ')}
            >
              {occupant ? (
                <>
                  <span className="name">{occupant.name}</span>
                  {onTogglePin && (
                    <button
                      type="button"
                      className="pin-toggle no-print"
                      onClick={() => onTogglePin(occupant.studentId)}
                      title={
                        occupant.pinned
                          ? t('grid.unpinTitle')
                          : t('grid.pinTitle')
                      }
                      aria-label={occupant.pinned ? t('grid.unpin') : t('grid.pin')}
                    >
                      {occupant.pinned ? '📌' : '○'}
                    </button>
                  )}
                </>
              ) : (
                <span className="name">{t('grid.free')}</span>
              )}

              {showTags && seat.tags.length > 0 && (
                <span className="seat-tags">
                  {tagLabel(seat).join(' · ')}
                </span>
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}
