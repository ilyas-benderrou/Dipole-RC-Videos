import {Easing, interpolate} from 'remotion';

const ease = Easing.bezier(0.33, 0, 0.2, 1);

/** 0 → 1 entre `start` et `start + dur` (images), adouci. */
export const ramp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** Linéaire, sans adoucissement (tracés de courbes). */
export const lin = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Apparition puis disparition. */
export const window_ = (frame: number, start: number, end: number, fade = 12) =>
  Math.min(ramp(frame, start, fade), 1 - ramp(frame, end - fade, fade));

/** Interpolation par paliers : [[image, valeur], …] (valeur tenue entre les paliers, transition de `dur`). */
export const steps = (frame: number, keys: [number, number][], dur = 15) => {
  let v = keys[0][1];
  for (let k = 1; k < keys.length; k++) v += (keys[k][1] - keys[k - 1][1]) * ramp(frame, keys[k][0], dur);
  return v;
};
