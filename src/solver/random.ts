/**
 * Kleiner, schneller PRNG mit setzbarem Startwert (mulberry32).
 * Ein fester Startwert macht Läufe reproduzierbar — wichtig für Tests und dafür,
 * dass dieselbe Klasse bei erneutem Rechnen denselben Plan ergibt.
 */
export interface Rng {
  (): number;
  int(maxExclusive: number): number;
}

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng = next as Rng;
  rng.int = (maxExclusive: number) => Math.floor(next() * maxExclusive);
  return rng;
}
