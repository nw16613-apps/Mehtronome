import { GuitarStrum } from './guitar.js';
import { WAVES, readWave, bandFor } from './waves.js';
import { Rhythm } from './rhythm.js';
import { Sequence } from './sequence.js';
import { pedalNotes, SOUNDS, harmonyAt, progressionStep } from './music.js';
const NOOP = () => {};
// A single sample clock drives clicks, count-in and chord changes. No UI timers.
export const DEFAULTS = {
  gapEnabled:false, gapPlayBars:4, gapMuteBars:1, gapTarget:'all',
  loopEnabled:false, loopStart:0, loopEnd:3,
  bpm: 90, beats: 4, key: 0, minor: false, progression: false,
  trainerEnabled:false, trainerBars:4, trainerIncrement:2, trainerTarget:120,
  drums:false, drumGroove:'straight', drumsVolume:.35, bass:false, bassPattern:'roots', bassVolume:.4,
  sequence:false, sequencePattern:'sparse', sequenceRate:2, sequenceSwing:0, sequenceDensity:.65, sequenceVolume:.25,
  click: 0.5, harmony: 0.35, countIn: true, sound: 'warm', template: 'parallel1', subdivision: 1, accent: true,
};
export function gapAt(settings, bar) {
  if (!settings.gapEnabled) return false;
  const audible = Math.max(1,Math.min(16,Math.floor(Number(settings.gapPlayBars) || 4)));
  const silent = Math.max(1,Math.min(16,Math.floor(Number(settings.gapMuteBars) || 1)));
  return bar % (audible + silent) >= audible;
}
export const DEGREES = [0, 5, 3, 4];
export const major = [0, 2, 4, 5, 7, 9, 11];
export const minor = [0, 2, 3, 5, 7, 8, 10];

export function chordNotes(key, isMinor, degree = 0) {
  const scale = isMinor ? minor : major;
  return [degree, degree + 2, degree + 4].map(i =>
    48 + key + scale[i % 7] + 12 * Math.floor(i / 7));
}

export class Engine {
  constructor(rate = 48000) {
    this.rate = rate;
    this.settings = { ...DEFAULTS };
    this.smoothing = 1 - Math.exp(-1 / (rate * .018));
    this.voiceSmoothing = 1 - Math.exp(-1 / (rate * .15));
    this.blendSmoothing = 1 - Math.exp(-1 / (rate * .04));
    this.inverseRate = 1 / rate;
    this.gapSlew = 1 / (rate * .005);
    this.reset();
  }

  installDrumKit(kit) {
    this.drumKit = kit;
    this.rhythm.clearDrums();
    this.rhythm.kit = kit;
  }

  reset() {
    this.auditioning = false;
    this.guitar = null;
    this.gapGain = 1;
    this.gapMuted = false;
    this.sequence = new Sequence(this.rate);
    this.rhythm = new Rhythm(this.rate, this.drumKit);
    this.drumsLevel = 0;
    this.bassLevel = 0;
    this.sequenceLevel = 0;
    this.echoLeft = this.echoLeft || new Float32Array(this.rate);
    this.echoRight = this.echoRight || new Float32Array(this.rate);
    this.echoLeft.fill(0); this.echoRight.fill(0);
    this.echoIndex = 0;
    this.echoMix = 0;
    this.tapLeft = Math.round(.31 * this.rate);
    this.tapRight = Math.round(.43 * this.rate);
    this.voices = Array.from({length:6}, (_, index) => ({
      phase:0, detuned:0, frequency:0, level:0, filter:0,
      coefficient:1, coefficientDelta:0, pan:0, panDelta:0,
      detune:0, detuneDelta:0, gain:1, gainDelta:0, band:3, index,
    }));
    this.waveCurrent = WAVES[this.settings.sound] || WAVES.warm;
    this.wavePrevious = this.waveCurrent;
    this.soundBlend = 1;
    this.chordSignature = null;
    this.chordAge = 0;
    this.breath = 1;
    this.phase = 0;
    this.currentBpm = this.settings.bpm;
    this.trainerNextBar = this.settings.trainerBars;
    this.beat = -1;
    this.remainingCount = this.settings.countIn ? this.settings.beats : 0;
    this.nextBeat = true;
    this.clickAge = this.rate;
    this.clickFrequency = 1500;
    this.clickStrength = 1;
    this.lastSubdivision = 0;
    this.frequencies = [0, 0, 0];
    this.level = 0;
    this.clickLevel = 0;
    this.harmonyLevel = 0;
    this.running = true;
    this.age = 0;
    this.step = 0;
    this.configure({});
  }

  configure(settings) {
    const previousTrainer = [this.settings.bpm,this.settings.trainerEnabled,this.settings.trainerBars,this.settings.trainerIncrement,this.settings.trainerTarget,this.settings.beats].join('/');
    const previousDrums=this.settings.drums, previousBass=this.settings.bass, previousGroove=this.settings.drumGroove;
    const previousSound=this.settings.sound;
    const previousSequenceRate=this.settings.sequenceRate;
    const previousSwing=this.settings.sequenceSwing;
    const previousSequence=this.settings.sequence;
    const previousSubdivision = this.settings.subdivision;
    Object.assign(this.settings, settings);
    const s = this.settings;
    if(previousSound!==s.sound){
      this.wavePrevious = this.waveCurrent;
      this.waveCurrent = WAVES[s.sound] || WAVES.warm;
      this.soundBlend = 0;
      this.echoLeft.fill(0); this.echoRight.fill(0);
    }
    if (!previousDrums && s.drums) this.rhythm.clearDrums();
    if (!previousBass && s.bass) this.rhythm.clearBass();
    if (previousDrums!==s.drums || previousBass!==s.bass || previousGroove!==s.drumGroove) {
      this.rhythm.lastBassGrid=this.beat>=this.remainingCount ? this.rhythm.bassGridAt(this.beat-this.remainingCount,this.phase/(60*this.rate)) : -1;
      this.rhythm.lastGrid=this.beat>=this.remainingCount ? this.rhythm.gridAt(s,this.beat-this.remainingCount,this.phase/(60*this.rate)) : -1;
    }
    s.bpm = Math.max(30, Math.min(240, Number(s.bpm) || 90));
    s.trainerBars = Math.max(1,Math.min(32,Math.floor(Number(s.trainerBars)||4)));
    s.trainerIncrement = Math.max(1,Math.min(30,Math.floor(Number(s.trainerIncrement)||2)));
    s.trainerTarget = Math.max(30,Math.min(240,Number(s.trainerTarget)||120));
    const nextTrainer = [s.bpm,s.trainerEnabled,s.trainerBars,s.trainerIncrement,s.trainerTarget,s.beats].join('/');
    if (previousTrainer !== nextTrainer) {
      this.currentBpm = s.bpm;
      const musicalBeat = this.beat - this.remainingCount;
      const bar = Math.max(0,Math.floor(musicalBeat / s.beats));
      // A mid-bar edit waits until the next complete bar before counting.
      const partial = musicalBeat >= 0 && (musicalBeat % s.beats !== 0 || this.phase !== 0);
      this.trainerNextBar = bar + (partial ? 1 : 0) + s.trainerBars;
    }
    // Rhythm envelopes need the current tempo; the public setting remains the
    // user's starting tempo so unrelated UI edits never reset a trained tempo.
    this.clockSettings = this.clockSettings || {};
    Object.assign(this.clockSettings,s,{bpm:this.currentBpm});
    if (previousSubdivision !== s.subdivision) this.lastSubdivision = Math.floor(this.phase * s.subdivision / (60 * this.rate));
    if(!previousSequence && s.sequence) for(const voice of this.sequence.voices) voice.age=Infinity;
    if(previousSequenceRate!==s.sequenceRate || previousSequence!==s.sequence || previousSwing!==s.sequenceSwing){
      this.sequence.lastGrid=this.beat>=this.remainingCount ? this.sequence.gridAt(s,this.beat-this.remainingCount,this.phase/(60*this.rate)) : -1;
    }
    const bar = Math.floor(Math.max(0, this.beat - this.remainingCount) / s.beats);
    this.gapMuted = !this.auditioning && this.beat >= this.remainingCount && gapAt(s,bar);
    this.setChord(this.auditioning ? this.step : s.progression ? progressionStep(s, bar) : 0);
  }

  /** @param {number[] | null} [notes] */
  audition(step, notes = null, acoustic = false) {
    this.reset();
    this.auditioning = true;
    this.nextBeat = false;
    this.setChord(step);
    if (Array.isArray(notes) && notes.length >= 3 && notes.length <= 4 && notes.every(n=>Number.isInteger(n) && n>=40 && n<=88)) {
      this.chordMidi = [...notes];
      this.frequencies = notes.map(note=>440 * 2 ** ((note - 69) / 12));
      if (acoustic) this.guitar = new GuitarStrum(this.rate, notes);
    }
  }

  setChord(step) {
    this.step = step;
    const s = this.settings;
    const signature = `${s.key}/${s.minor}/${s.mode}/${s.chord}/${s.progression}/${s.template}/${step}`;
    if (signature === this.chordSignature) return;
    this.chordSignature = signature;
    this.chordAge = 0;
    this.chordMidi = this.settings.progression ? harmonyAt(this.settings, step).midi : pedalNotes(this.settings);
    this.frequencies = this.chordMidi.map(note => 440 * 2 ** ((note - 69) / 12));
  }

  render(output, onBeat = NOOP, harmonyOutput = null, harmonyRight = null, onSequence = NOOP, rhythmOutput = null, onRhythm = NOOP, gapOutput = null) {
    const s = this.settings;
    if (this.guitar) {
      // Guitar bypasses pad layers and echoes, but feeds the shared room reverb.
      for (let i = 0; i < output.length; i++) {
        this.level += ((this.running ? 1 : 0) - this.level) * this.smoothing;
        const value = this.guitar.sample() * this.level * s.harmony;
        output[i] = harmonyOutput ? 0 : value;
        if (harmonyOutput) harmonyOutput[i] = value;
        if (harmonyRight) harmonyRight[i] = value;
        if (rhythmOutput) rhythmOutput[i] = 0;
        if (gapOutput) gapOutput[i] = 1;
      }
      return;
    }
    const smoothing = this.smoothing;
    const voiceSmoothing = this.voiceSmoothing;
    const sound = SOUNDS[s.sound] || SOUNDS.warm;
    const evolving = !!sound.evolve;
    const echoTarget = sound.echo || 0;
    const inverseRate = this.inverseRate;
    for (let i = 0; i < output.length; i++) {
      if (this.nextBeat && !this.auditioning) {
        this.nextBeat = false;
        this.beat++;
        const counting = this.beat < this.remainingCount;
        const musicalBeat = Math.max(0, this.beat - this.remainingCount);
        const bar = Math.floor(musicalBeat / s.beats);
        if (this.running && !counting && s.trainerEnabled && musicalBeat % s.beats === 0 && bar >= this.trainerNextBar) {
          this.currentBpm = Math.min(Math.max(s.bpm,s.trainerTarget),this.currentBpm+s.trainerIncrement);
          this.clockSettings.bpm = this.currentBpm;
          this.trainerNextBar = bar + s.trainerBars;
        }
        const step = s.progression ? progressionStep(s, bar) : 0;
        this.setChord(step);
        this.clickAge = 0;
        this.clickFrequency = s.accent && this.beat % s.beats === 0 ? 1500 : 1000;
        this.clickStrength = 1;
        this.lastSubdivision = 0;
        this.gapMuted = !counting && gapAt(s, bar);
        onBeat({ gap:this.gapMuted, counting, beat: this.beat % s.beats, bar: bar + 1, step,
          bpm:this.currentBpm, trainerTargetReached:!!s.trainerEnabled && !counting && this.currentBpm >= Math.max(s.bpm,s.trainerTarget) });
      }
      const subdivision = Math.floor(this.phase * s.subdivision / (60 * this.rate));
      if (!this.auditioning && subdivision !== this.lastSubdivision && subdivision > 0) {
        this.lastSubdivision = subdivision;
        this.clickAge = 0;
        this.clickFrequency = 800;
        this.clickStrength = .6;
      }
      const playing = this.running ? 1 : 0;
      this.level += (playing - this.level) * smoothing;
      this.clickLevel += (s.click - this.clickLevel) * smoothing;
      const backing = this.auditioning || this.beat >= this.remainingCount ? s.harmony : 0;
      this.harmonyLevel += (backing - this.harmonyLevel) * smoothing;
      const t = this.clickAge++ / this.rate;
      const click = t < .06 ? Math.sin(2 * Math.PI * this.clickFrequency * t) * Math.exp(-100 * t) : 0;
      const backingActive=this.auditioning || this.beat>=this.remainingCount;
      if(s.sequence && backingActive && !this.auditioning){
        this.sequence.tick(s,Math.max(0,this.beat-this.remainingCount),this.phase/(60*this.rate),this.chordMidi,this.age,this.step,onSequence);
      }
      if (s.sequence || this.sequenceLevel > .000001) this.sequence.render();
      else { this.sequence.left = 0; this.sequence.right = 0; }
      this.sequenceLevel+=((s.sequence && !this.auditioning && backingActive?s.sequenceVolume:0)-this.sequenceLevel)*smoothing;
      const rhythmActive=backingActive && !this.auditioning;
      if ((s.drums || s.bass) && rhythmActive) this.rhythm.tick(this.clockSettings,Math.max(0,this.beat-this.remainingCount),this.phase/(60*this.rate),this.chordMidi,this.age,this.step,onRhythm);
      this.drumsLevel+=((s.drums && rhythmActive?s.drumsVolume:0)-this.drumsLevel)*smoothing;
      this.bassLevel+=((s.bass && rhythmActive?s.bassVolume:0)-this.bassLevel)*smoothing;
      this.rhythm.render(this.drumsLevel>.000001,this.bassLevel>.000001);
      const rhythmSample=this.level*(.28*this.drumsLevel*this.rhythm.drums+.2*this.bassLevel*this.rhythm.bass);
      // Control-rate updates are independent of callback block boundaries.
      // Interpolate their results per sample to avoid audible stepping.
      if ((this.age & 31) === 0) {
        const time = this.age * inverseRate;
        this.breath = 1 - sound.depth / 2 + sound.depth / 2 * Math.sin(2 * Math.PI * sound.speed * time);
        for (const voice of this.voices) {
          const target = this.frequencies[voice.index] || this.frequencies[0];
          const motion = .5 + .5 * Math.sin(time * .22 + voice.index * 1.1);
          const coefficient = evolving ? 1 - Math.exp(-2 * Math.PI * Math.min(this.rate * .3, sound.filterBase + motion * sound.filterSweep) * inverseRate) : 1;
          const pan = evolving ? .3 * Math.sin(time * .14 + voice.index * 1.4) : 0;
          const detune = sound.detune * (evolving ? 1 + .2 * Math.sin(time * .17 + voice.index * 1.7) : 1);
          const glass = s.sound === 'atmosphere';
          const gain = glass ? (.7 + .3 * Math.exp(-this.chordAge * inverseRate / 1.1)) * (.8 + .2 * motion * motion) : 1;
          voice.coefficientDelta = (coefficient - voice.coefficient) / 32;
          voice.panDelta = (pan - voice.pan) / 32;
          voice.detuneDelta = (detune - voice.detune) / 32;
          voice.gainDelta = (gain - voice.gain) / 32;
          voice.band = bandFor(Math.max(target, voice.frequency), this.rate);
        }
      }
      if (this.soundBlend < 1) {
        this.soundBlend += (1 - this.soundBlend) * this.blendSmoothing;
        if (this.soundBlend > .9999) this.soundBlend = 1;
      }
      let chord = 0, chordRight = 0;
      for (const voice of this.voices) {
        const active = voice.index < this.frequencies.length;
        voice.level += ((active ? 1 / this.frequencies.length : 0) - voice.level) * voiceSmoothing;
        if (!active && voice.level < .000001) continue;
        const target = this.frequencies[voice.index] || this.frequencies[0];
        if (!voice.frequency) voice.frequency = target;
        voice.frequency += (target - voice.frequency) * voiceSmoothing;
        const increment = (evolving ? voice.frequency : target) * inverseRate;
        voice.coefficient += voice.coefficientDelta;
        voice.pan += voice.panDelta;
        voice.detune += voice.detuneDelta;
        voice.gain += voice.gainDelta;
        voice.phase += increment;
        if (voice.phase >= 1) voice.phase -= 1;
        voice.detuned += increment * (1 + voice.detune);
        if (voice.detuned >= 1) voice.detuned -= 1;
        const table = this.waveCurrent[voice.band];
        let wave = .7 * readWave(table, voice.phase) + .3 * readWave(table, voice.detuned);
        if (this.soundBlend < 1) {
          const previous = this.wavePrevious[voice.band];
          const old = .7 * readWave(previous, voice.phase) + .3 * readWave(previous, voice.detuned);
          wave = old + (wave - old) * this.soundBlend;
        }
        voice.filter += (wave - voice.filter) * voice.coefficient;
        const shaped = voice.filter * voice.level * voice.gain;
        chord += shaped * (1 - voice.pan);
        chordRight += shaped * (1 + voice.pan);
      }
      const clickSample = this.level * .3 * this.clickLevel * (this.auditioning ? 0 : click) * this.clickStrength;
      let left=.4*this.harmonyLevel*chord*this.breath+.15*this.sequenceLevel*this.sequence.left;
      let right=.4*this.harmonyLevel*chordRight*this.breath+.15*this.sequenceLevel*this.sequence.right;
      this.echoMix+=(echoTarget-this.echoMix)*voiceSmoothing;
      if(this.echoMix>.00001){
        // Fixed, precomputed stereo taps avoid pitch wobble and expensive
        // interpolated delay modulation on the realtime thread.
        let iLeft = this.echoIndex - this.tapLeft;
        let iRight = this.echoIndex - this.tapRight;
        if (iLeft < 0) iLeft += this.rate;
        if (iRight < 0) iRight += this.rate;
        const echoL = this.echoLeft[iLeft], echoR = this.echoRight[iRight];
        this.echoLeft[this.echoIndex]=left+echoR*.28;
        this.echoRight[this.echoIndex]=right+echoL*.28;
        left+=echoL*this.echoMix;right+=echoR*this.echoMix;
        this.echoIndex++;
        if (this.echoIndex === this.rate) this.echoIndex = 0;
      }
      // Oscillators, echoes and progression clocks keep running through gaps.
      const target = this.auditioning || !this.gapMuted ? 1 : 0;
      this.gapGain = target ? Math.min(1,this.gapGain+this.gapSlew) : Math.max(0,this.gapGain-this.gapSlew);
      const clickGate = s.gapTarget === 'backing' ? 1 : this.gapGain;
      const backingGate = s.gapTarget === 'click' ? 1 : this.gapGain;
      if (gapOutput) gapOutput[i] = backingGate;
      const backingSample=this.level*left*backingGate;
      const rightSample=this.level*right*backingGate;
      output[i] = (harmonyOutput ? clickSample*clickGate : clickSample*clickGate + backingSample) + (rhythmOutput ? 0 : rhythmSample*backingGate);
      if (rhythmOutput) rhythmOutput[i] = rhythmSample*backingGate;
      if (harmonyOutput) harmonyOutput[i] = backingSample;
      if (harmonyRight) harmonyRight[i] = rightSample;
      // Integer units avoid drift and preserve position when the tempo changes.
      this.phase += this.currentBpm;
      if (this.phase >= 60 * this.rate) {
        this.phase -= 60 * this.rate;
        this.nextBeat = true;
      }
      this.age++;
      this.chordAge++;
    }
  }
}
