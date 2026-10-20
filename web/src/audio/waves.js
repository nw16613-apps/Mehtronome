import { SOUNDS } from './music.js';

// All costly waveform maths happens once, before playback. Interpolated tables
// also limit upper harmonics at high pitches and lower sample rates.
export const TABLE_SIZE = 4096;
export const BANDS = [1, 3, 6, 12];
function table(partials, limit) {
  const values = new Float32Array(TABLE_SIZE + 1);
  let peak = 0;
  for (let i = 0; i < TABLE_SIZE; i++) {
    let value = 0;
    for (let h = 0; h < Math.min(partials.length, limit); h++) {
      value += partials[h] * Math.sin(2 * Math.PI * (h + 1) * i / TABLE_SIZE);
    }
    values[i] = value;
    peak = Math.max(peak, Math.abs(value));
  }
  for (let i = 0; i < TABLE_SIZE; i++) values[i] /= peak || 1;
  values[TABLE_SIZE] = values[0];
  return values;
}
export const SINE = table([1], 1);
export const BASS_WAVE = table([1, .3, .12, .04], 4);
export const SEQUENCE_WAVE = table([1, .18, .05], 3);
export const WAVES = Object.fromEntries(Object.entries(SOUNDS).map(([id, sound]) => [
  id, BANDS.map(limit => table(sound.partials || [1, ...sound.harmonics], limit)),
]));
export function readWave(values, phase) {
  const position = phase * TABLE_SIZE;
  const index = position | 0;
  return values[index] + (values[index + 1] - values[index]) * (position - index);
}
export function bandFor(frequency, rate) {
  const budget = rate * .45 / frequency;
  return budget >= 12 ? 3 : budget >= 6 ? 2 : budget >= 3 ? 1 : 0;
}
