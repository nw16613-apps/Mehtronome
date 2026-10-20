import { BASS_WAVE, readWave } from './waves.js';

export const DRUM_GROOVES = {
  straight: 'Straight eighths', shuffle: 'Shuffle', swing: 'Swing ride', halftime: 'Half-time',
};
export const BASS_PATTERNS = {
  roots: 'Root pulse', fifths: 'Root & fifth', walk: 'Chord-tone walk',
};
const KITS = new Map();
function drumSamples(rate) {
  if (KITS.has(rate)) return KITS.get(rate);
  const kit = {};
  for (const [name, duration] of [['kick', .45], ['snare', .24], ['hat', .09], ['ride', .55]]) {
    const samples = new Float32Array(Math.ceil(rate * duration));
    let seed = 27, low = 0, phase = 0, peak = 0;
    for (let i = 0; i < samples.length; i++) {
      const t = i / rate;
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = seed / 2147483648 - 1;
      low += .3 * (noise - low);
      const high = noise - low;
      let value;
      if (name === 'kick') {
        phase += 2 * Math.PI * (46 + 100 * Math.exp(-t / .025)) / rate;
        value = Math.sin(phase) * Math.exp(-t / .105);
      } else if (name === 'snare') {
        value = .8 * high * Math.exp(-t / .055) + .25 * Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t / .04);
      } else {
        const decay = name === 'ride' ? .16 : .023;
        value = (.7 * high + .15 * Math.sin(2 * Math.PI * Math.min(4200, rate * .38) * t)) * Math.exp(-t / decay);
      }
      samples[i] = value * Math.min(1, t / .0015);
      peak = Math.max(peak, Math.abs(samples[i]));
    }
    for (let i = 0; i < samples.length; i++) samples[i] *= .85 / (peak || 1);
    kit[name] = samples;
  }
  KITS.set(rate, kit);
  return kit;
}

// All scheduling uses the metronome's sample clock. Drum synthesis is cached
// ahead of playback; realtime rendering uses sample reads and table lookups.
export class Rhythm {
  constructor(rate) {
    this.rate = rate;
    this.kit = drumSamples(rate);
    this.bassDecay = Math.exp(-1 / (rate * .85));
    this.releaseDecay = Math.exp(-1 / (rate * .025));
    this.attackFrames = Math.max(1, Math.round(rate * .006));
    this.lastGrid = -1;
    this.drumCursor = 0;
    this.bassCursor = 0;
    this.drumVoices = Array.from({length:12}, () => ({sample:null, position:0, gain:0}));
    this.bassVoices = Array.from({length:2}, () => ({phase:0, increment:0, age:Infinity, envelope:0, releasing:false}));
    this.drums = 0;
    this.bass = 0;
  }
  gridAt(settings, beat, phase) {
    const shuffled = settings.drumGroove === 'shuffle' || settings.drumGroove === 'swing';
    return beat * 2 + (phase >= (shuffled ? 2 / 3 : .5) ? 1 : 0);
  }
  clearDrums() { for (const voice of this.drumVoices) voice.sample = null; }
  clearBass() { for (const voice of this.bassVoices) { voice.age = Infinity; voice.envelope = 0; } }
  tick(settings, beat, phase, notes, sample, step, onEvent) {
    const grid = this.gridAt(settings, beat, phase);
    if (grid === this.lastGrid) return;
    this.lastGrid = grid;
    const down = grid % 2 === 0;
    const inBar = beat % settings.beats;
    if (settings.drums) {
      const groove = settings.drumGroove;
      const hit = (name, gain) => {
        const voice = this.drumVoices[this.drumCursor++ % this.drumVoices.length];
        voice.sample = this.kit[name]; voice.position = 0; voice.gain = gain;
        onEvent({type:name, sample, step, beat:inBar});
      };
      if (down) {
        const backbeat = groove === 'halftime' ? inBar === Math.floor(settings.beats / 2) : inBar % 2 === 1;
        if (backbeat) hit('snare', groove === 'swing' ? .32 : .65);
        if (inBar === 0 || !backbeat && inBar % 2 === 0) hit('kick', groove === 'swing' ? .45 : .8);
      }
      if (groove !== 'swing' || down || inBar % 2 === 1) {
        hit(groove === 'swing' ? 'ride' : 'hat', down ? .27 : .18);
      }
    }
    if (settings.bass && down && (settings.bassPattern !== 'roots' || inBar % 2 === 0)) {
      const root = notes[0] % 12;
      const fifth = notes.findIndex(note => [6,7,8].includes((note - notes[0]) % 12));
      const index = settings.bassPattern === 'walk' ? inBar % notes.length : settings.bassPattern === 'fifths' && inBar % 2 ? Math.max(0, fifth) : 0;
      const midi = 36 + notes[index] % 12;
      for (const voice of this.bassVoices) voice.releasing = true;
      const voice = this.bassVoices[this.bassCursor++ % this.bassVoices.length];
      Object.assign(voice, {phase:0, increment:440 * 2 ** ((midi - 69) / 12) / this.rate, age:0, envelope:1, releasing:false});
      onEvent({type:'bass', sample, step, beat:inBar, midi, root});
    }
  }
  render(drumsActive, bassActive) {
    let drums = 0, bass = 0;
    if (drumsActive) for (const voice of this.drumVoices) {
      if (!voice.sample) continue;
      drums += voice.sample[voice.position++] * voice.gain;
      if (voice.position === voice.sample.length) voice.sample = null;
    }
    if (bassActive) for (const voice of this.bassVoices) {
      if (voice.envelope < .00001 || !Number.isFinite(voice.age)) continue;
      const envelope = Math.min(1, voice.age / this.attackFrames) * voice.envelope;
      bass += readWave(BASS_WAVE, voice.phase) * envelope;
      voice.phase += voice.increment;
      if (voice.phase >= 1) voice.phase -= 1;
      voice.envelope *= voice.releasing ? this.releaseDecay : this.bassDecay;
      voice.age++;
    }
    this.drums = drums;
    this.bass = bass;
  }
}
