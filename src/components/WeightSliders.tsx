/**
 * Feineinstellung der Zielfunktion.
 *
 * Die Voreinstellung ist „Fairness zuerst“: möglichst niemand ohne einen erfüllten
 * Wunsch, danach erst die Summe maximieren. Wer das anders gewichten möchte,
 * verschiebt hier die Regler und rechnet neu.
 */

import { useState } from 'react';

import type { ClassStore } from '../state/store';
import type { Weights } from '../types/model';

interface SliderSpec {
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  get(weights: Weights): number;
  set(value: number): Partial<Weights>;
}

const SLIDERS: SliderSpec[] = [
  {
    label: 'Fairness',
    hint: 'Wie stark eine Person ins Gewicht fällt, für die kein einziger Wunsch aufgeht. Hoch = niemand geht leer aus, notfalls auf Kosten der Gesamtzahl.',
    min: 0,
    max: 60,
    step: 1,
    get: (w) => w.noWishPenalty,
    set: (value) => ({ noWishPenalty: value }),
  },
  {
    label: 'Gegenseitigkeit',
    hint: 'Zuschlag für Wünsche, die auf Gegenseitigkeit beruhen. Hoch = echte Freundschaftspaare gehen vor einseitigen Wünschen.',
    min: 1,
    max: 3,
    step: 0.1,
    get: (w) => w.mutualFactor,
    set: (value) => ({ mutualFactor: value }),
  },
  {
    label: 'Erstwunsch',
    hint: 'Grundwert eines erfüllten Erstwunsches. Der Zweit- und Drittwunsch bleiben im Verhältnis dazu.',
    min: 1,
    max: 20,
    step: 1,
    get: (w) => w.wishRank[0],
    set: (value) => ({
      wishRank: [value, Math.round(value * 0.6), Math.round(value * 0.3)] as [
        number,
        number,
        number,
      ],
    }),
  },
  {
    label: 'Sonderwünsche',
    hint: 'Gewicht der weichen Sonderwünsche (Fenster, vorne, Gang) gegenüber den Sitznachbar-Wünschen.',
    min: 0,
    max: 25,
    step: 1,
    get: (w) => w.specialBonus,
    set: (value) => ({ specialBonus: value }),
  },
  {
    label: 'Zweiter Wunsch derselben Person',
    hint: 'Anteil, mit dem ein zweiter erfüllter Wunsch derselben Person zählt. Niedrig = die Erfüllung verteilt sich gleichmäßiger über die Klasse.',
    min: 0,
    max: 1,
    step: 0.05,
    get: (w) => w.diminishing[1],
    set: (value) => ({
      diminishing: [1, value, Number((value * value).toFixed(3))] as [number, number, number],
    }),
  },
];

interface WeightSlidersProps {
  store: ClassStore;
  onRecalculate: () => void;
  disabled: boolean;
}

export function WeightSliders({ store, onRecalculate, disabled }: WeightSlidersProps) {
  const [open, setOpen] = useState(false);
  const weights = store.data.weights;

  return (
    <div className="panel no-print">
      <h2>
        <button
          type="button"
          className="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          {open ? '▾' : '▸'} Gewichtung anpassen
        </button>
      </h2>

      {open && (
        <>
          <p className="hint">
            Nach dem Verschieben muss neu gerechnet werden. Die Voreinstellung entspricht dem
            Profil „Fairness zuerst“.
          </p>

          {SLIDERS.map((slider) => (
            <div className="field" key={slider.label}>
              <label htmlFor={`weight-${slider.label}`}>
                {slider.label}: <strong>{slider.get(weights)}</strong>
              </label>
              <input
                id={`weight-${slider.label}`}
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={slider.get(weights)}
                onChange={(event) => store.setWeights(slider.set(Number(event.target.value)))}
              />
              <p className="hint">{slider.hint}</p>
            </div>
          ))}

          <div className="button-row">
            <button
              type="button"
              className="button primary"
              onClick={onRecalculate}
              disabled={disabled}
            >
              Mit neuer Gewichtung rechnen
            </button>
            <button type="button" className="button" onClick={store.resetWeights}>
              Voreinstellung wiederherstellen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
