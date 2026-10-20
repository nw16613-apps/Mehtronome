import { BASS_WAVE, readWave } from './waves.js';

export const DRUM_GROOVES = {
  straight: 'Pop / rock', shuffle: 'Blues shuffle', swing: 'Jazz swing', halftime: 'Neo-soul half-time', bossa: 'Bossa nova',
};
export const BASS_PATTERNS = {
  roots: 'Ambient · sustained roots', fifths: 'Pop / rock · root & fifth', walk: 'Jazz · walking chord tones',
  bossa: 'Bossa nova · syncopated fifths', funk: 'Funk · syncopated chord tones',
};
// Sixteenth-note offsets within a four-beat cell; odd meters restart at their barline.
// Each hit has an intentional velocity, including quiet snare ghost notes.
const GROOVES = {
  straight: [[0,'kick',.8],[6,'kick',.58],[8,'kick',.72],[11,'kick',.48],[4,'snare',.65],[12,'snare',.7],[7,'snare',.12],[15,'snare',.1]],
  shuffle: [[0,'kick',.75],[8,'kick',.65],[10,'kick',.45],[4,'snare',.62],[12,'snare',.68],[3,'snare',.12],[11,'snare',.1]],
  swing: [[0,'kick',.35],[10,'kick',.22],[6,'snare',.22],[12,'snare',.28],[15,'snare',.1]],
  halftime: [[0,'kick',.78],[3,'kick',.48],[10,'kick',.6],[14,'kick',.4],[7,'snare',.12],[11,'snare',.1]],
  bossa: [[0,'kick',.55],[6,'kick',.4],[8,'kick',.5],[14,'kick',.38],[0,'rim',.52],[6,'rim',.62],[12,'rim',.55]],
};
const BASS_LINES = {
  // [sixteenth, chord-tone index (-1 = fifth), octave, length in beats, velocity]
  roots: [[0,0,0,1.5,1],[8,0,0,1.25,.75]],
  fifths: [[0,0,0,.85,1],[6,-1,0,.4,.75],[8,0,1,.6,.85],[11,-1,0,.25,.6],[14,-1,0,.4,.8]],
  walk: [[0,0,0,.9,.95],[4,1,0,.85,.8],[8,2,0,.9,.88],[12,3,0,.8,.8]],
  bossa: [[0,0,0,1.1,1],[6,-1,0,.4,.75],[8,0,0,1,.9],[14,-1,0,.4,.75]],
  funk: [[0,0,0,.35,1],[3,0,1,.2,.62],[6,-1,0,.3,.82],[9,0,0,.22,.7],[11,2,0,.2,.6],[14,0,1,.3,.85],[15,-1,0,.16,.55]],
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
  kit.rim = kit.snare;
  KITS.set(rate, kit);
  return kit;
}

// All scheduling uses the metronome's sample clock. The browser installs decoded
// samples before playback; cached synthesis is the standalone/test fallback.
export class Rhythm {
  constructor(rate, kit = null) {
    this.rate = rate;
    this.kit = kit || drumSamples(rate);
    this.releaseDecay = Math.exp(-1 / (rate * .025));
    this.attackFrames = Math.max(1, Math.round(rate * .006));
    this.lastGrid = -1;
    this.lastBassGrid = -1;
    this.drumCursor = 0;
    this.bassCursor = 0;
    this.drumVoices = Array.from({length:12}, () => ({sample:null, position:0, gain:0}));
    this.bassVoices = Array.from({length:2}, () => ({phase:0, increment:0, age:Infinity, envelope:0, releasing:false, decay:1, gain:1}));
    this.drums = 0;
    this.bass = 0;
  }
  gridAt(settings, beat, phase) {
    const shuffled = settings.drumGroove === 'shuffle' || settings.drumGroove === 'swing';
    const sub = shuffled ? (phase >= 5/6 ? 3 : phase >= 2/3 ? 2 : phase >= 1/3 ? 1 : 0) : Math.min(3, Math.floor(phase * 4));
    return beat * 4 + sub;
  }
  bassGridAt(beat, phase) { return beat * 4 + Math.min(3, Math.floor(phase * 4)); }
  clearDrums() { for (const voice of this.drumVoices) voice.sample = null; }
  clearBass() { for (const voice of this.bassVoices) { voice.age = Infinity; voice.envelope = 0; } }
  tick(settings, beat, phase, notes, sample, step, onEvent) {
    const grid = this.gridAt(settings, beat, phase);
    const bassGrid = this.bassGridAt(beat, phase);
    const inBar = beat % settings.beats;
    const bar = Math.floor(beat / settings.beats);
    if (grid !== this.lastGrid) {
      this.lastGrid = grid;
      if (settings.drums) this.playDrums(settings, grid % 4, inBar, bar, sample, step, onEvent);
    }
    if (bassGrid !== this.lastBassGrid) {
      this.lastBassGrid = bassGrid;
      if (settings.bass) this.playBass(settings, bassGrid % 4, inBar, bar, notes, sample, step, onEvent);
    }
  }
  playDrums(settings, sub, beat, bar, sample, step, onEvent) {
    const groove = settings.drumGroove;
    const cell = (beat * 4 + sub) % 16;
    const hit = (name, gain) => {
      const voice = this.drumVoices[this.drumCursor++ % this.drumVoices.length];
      voice.sample = this.kit[name]; voice.position = 0; voice.gain = gain;
      onEvent({type:name, sample, step, beat, sub, gain});
    };
    for (const [offset,name,gain] of GROOVES[groove] || GROOVES.straight) {
      if (offset === cell) hit(name,gain);
    }
    if (groove === 'halftime' && beat === Math.floor(settings.beats / 2) && sub === 0) hit('snare',.72);
    // A light kick pickup every second bar, and a restrained fourth-bar turnaround.
    if (bar % 2 === 1 && beat === settings.beats - 1 && sub === 2 && groove !== 'bossa') hit('kick',.38);
    if (bar % 4 === 3 && beat === settings.beats - 1 && sub % 2 === 1) hit(groove === 'bossa' ? 'rim' : 'snare',sub === 1 ? .18 : .3);
    if (groove === 'swing') {
      if (sub === 0 || sub === 2 && beat % 2 === 1) hit('ride',sub === 0 ? (beat % 2 ? .31 : .24) : .16);
      if (sub === 0 && beat % 2 === 1) hit('hat',.12);
    } else if (sub % 2 === 0) {
      hit('hat',sub === 0 ? (beat % 2 ? .22 : .28) : .15);
    } else if (groove === 'halftime' && (cell === 5 || cell === 13 || bar % 2 === 1 && cell === 15)) {
      hit('hat',.1);
    }
  }
  playBass(settings, sub, beat, bar, notes, sample, step, onEvent) {
    const pattern = settings.bassPattern;
    const cell = (beat * 4 + sub) % 16;
    let note = (BASS_LINES[pattern] || BASS_LINES.roots).find(event => event[0] === cell);
    // Sparse ambient pickups and a walking turnaround make the phrase span two bars.
    if (pattern === 'roots' && bar % 2 === 1 && beat === settings.beats - 1 && sub === 2) note = [cell,-1,0,.35,.45];
    if (!note) return;
    let [,index,octave,length,gain] = note;
    const fifth = notes.findIndex(n => [6,7,8].includes((n - notes[0]) % 12));
    if (index === -1) index = Math.max(0,fifth);
    else if (pattern === 'walk' && bar % 2 && cell !== 0) index = notes.length - index;
    index = ((index % notes.length) + notes.length) % notes.length;
    // A new bar always states the current chord root, including odd meters.
    if (beat === 0 && sub === 0) { index = 0; octave = 0; }
    const root = notes[0] % 12;
    const midi = 36 + notes[index] % 12 + octave * 12;
    for (const voice of this.bassVoices) voice.releasing = true;
    const voice = this.bassVoices[this.bassCursor++ % this.bassVoices.length];
    const seconds = length * 60 / settings.bpm;
    Object.assign(voice, {phase:0, increment:440 * 2 ** ((midi - 69) / 12) / this.rate, age:0, envelope:1, releasing:false,
      decay:Math.exp(-1 / (this.rate * seconds * .65)), gain, gate:Math.max(1,Math.round(seconds * this.rate))});
    onEvent({type:'bass', sample, step, beat, sub, midi, root, offbeat:sub !== 0, gain});
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
      bass += readWave(BASS_WAVE, voice.phase) * envelope * voice.gain;
      voice.phase += voice.increment;
      if (voice.phase >= 1) voice.phase -= 1;
      voice.envelope *= voice.releasing ? this.releaseDecay : voice.decay;
      voice.age++;
      if (voice.age >= voice.gate) voice.releasing = true;
    }
    this.drums = drums;
    this.bass = bass;
  }
}
