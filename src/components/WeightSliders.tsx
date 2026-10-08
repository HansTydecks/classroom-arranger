/**
 * Feineinstellung der Zielfunktion.
 *
 * Die Voreinstellung ist „Fairness zuerst“: möglichst niemand ohne einen erfüllten
 * Wunsch, danach erst die Summe maximieren. Wer das anders gewichten möchte,
 * verschiebt hier die Regler und rechnet neu.
 */

import { useState } from 'react';

import { useI18n } from '../i18n/I18nContext';
import type { ClassStore } from '../state/store';
import type { Weights } from '../types/model';

interface SliderSpec {
  id: string;
  min: number;
  max: number;
  step: number;
  get(weights: Weights): number;
  set(value: number): Partial<Weights>;
}

const SLIDERS: SliderSpec[] = [
  {
    id: 'fairness',
    min: 0,
    max: 60,
    step: 1,
    get: (w) => w.noWishPenalty,
    set: (value) => ({ noWishPenalty: value }),
  },
  {
    id: 'mutual',
    min: 1,
    max: 3,
    step: 0.1,
    get: (w) => w.mutualFactor,
    set: (value) => ({ mutualFactor: value }),
  },
  {
    id: 'first',
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
    id: 'rules',
    min: 0,
    max: 25,
    step: 1,
    get: (w) => w.specialBonus,
    set: (value) => ({ specialBonus: value }),
  },
  {
    id: 'diminishing',
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
  const { t } = useI18n();
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
          {open ? '▾' : '▸'} {t('weights.title')}
        </button>
      </h2>

      {open && (
        <>
          <p className="hint">{t('weights.hint')}</p>

          {SLIDERS.map((slider) => (
            <div className="field" key={slider.id}>
              <label htmlFor={`weight-${slider.id}`}>
                {t(`weights.${slider.id}.label`)}: <strong>{slider.get(weights)}</strong>
              </label>
              <input
                id={`weight-${slider.id}`}
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={slider.get(weights)}
                onChange={(event) => store.setWeights(slider.set(Number(event.target.value)))}
              />
              <p className="hint">{t(`weights.${slider.id}.hint`)}</p>
            </div>
          ))}

          <div className="button-row">
            <button
              type="button"
              className="button primary"
              onClick={onRecalculate}
              disabled={disabled}
            >
              {t('weights.recalculate')}
            </button>
            <button type="button" className="button" onClick={store.resetWeights}>
              {t('weights.reset')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
