import { GuitarStrum } from './guitar.js';
import { WAVES, WAVE_LAYERS, SINE, readWave, bandFor } from './waves.js';
import { Rhythm } from './rhythm.js';
import { Sequence } from './sequence.js';
import { pedalNotes, SOUNDS, harmonyAt, progressionStep } from './music.js';
import { modalPentatonicPcs } from '../guitar/superimposition.js';
const NOOP = () => {};
// A single sample clock drives clicks, count-in and chord changes. No UI timers.
export const DEFAULTS = {
  gapEnabled:false, gapPlayBars:4, gapMuteBars:1, gapTarget:'all',
  loopEnabled:false, loopStart:0, loopEnd:3,
  bpm: 90, beats: 4, key: 0, minor: false, progression: false,
  trainerEnabled:false, trainerBars:4, trainerIncrement:2, trainerTarget:120,
  drums:false, drumGroove:'straight', drumsVolume:.35, bass:false, bassPattern:'roots', bassVolume:.4,
  sequence:false, sequenceSource:'chord', sequenceRegister:12, sequencePattern:'sparse', sequenceRate:2, sequenceSwing:0, sequenceDensity:.65, sequenceVolume:.25,
  click: 0.5, harmony: 0.35, countIn: true, sound: 'warm', padMovement:'evolving', padDepth:'wide', padBrightness:'balanced', template: 'parallel1', subdivision: 1, accent: true,
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

export function melodicNotePool(source, harmony, chordMidi) {
  if(source==='guide') return chordMidi.length>3 ? [chordMidi[1],chordMidi[3]] : chordMidi.slice(1,3);
  if(source==='mode'||source==='pentatonic'){
    const root=chordMidi[0]+((harmony.scalePcs[0]-chordMidi[0])%12+12)%12;
    const scale=harmony.scalePcs.map(pc=>root+((pc-harmony.scalePcs[0]+12)%12));
    if(source==='pentatonic'){
      const selected=modalPentatonicPcs(harmony);
      return selected.map(pc=>root+((pc-harmony.scalePcs[0]+12)%12));
    }
    return scale;
  }
  return chordMidi;
}

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
    this.rhythm.installKit(kit);
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
    // Six sounding chord tones plus six release tails: common notes keep their
    // oscillator phase; changed notes crossfade at their true pitches.
    this.voices = Array.from({length:12}, (_, index) => ({
      phase:0, detuned:0, haloPhase:0, subPhase:0, frequency:0, level:0, targetLevel:0,
      filter:0, sideFilter:0, coefficient:0, coefficientDelta:0, pan:0, panDelta:0,
      detune:0, detuneDelta:0, gain:1, gainDelta:0, mix:.3, mixDelta:0,
      width:0, widthDelta:0, halo:0, haloDelta:0, band:3, index,
    }));
    this.waveCurrent = WAVES[this.settings.sound] || WAVES.warm;
    this.wavePrevious = this.waveCurrent;
    this.layerCurrent = WAVE_LAYERS[this.settings.sound] || WAVE_LAYERS.warm;
    this.layerPrevious = this.layerCurrent;
    this.soundBlend = 1;
    this.chordSignature = null;
    this.chordAge = 0;
    this.breath = 1;
    this.breathDelta = 0;
    this.phraseArc = 1;
    this.phraseArcDelta = 0;
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
      this.layerPrevious = this.layerCurrent;
      this.waveCurrent = WAVES[s.sound] || WAVES.warm;
      this.layerCurrent = WAVE_LAYERS[s.sound] || WAVE_LAYERS.warm;
      this.soundBlend = 0;
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
      this.assignPadVoices();
      if (acoustic) this.guitar = new GuitarStrum(this.rate, notes);
    }
  }

  setChord(step) {
    this.step = step;
    const s = this.settings;
    const signature = `${s.key}/${s.minor}/${s.mode}/${s.chord}/${s.progression}/${s.template}/${s.sequenceSource}/${step}`;
    if (signature === this.chordSignature) return;
    this.chordSignature = signature;
    this.chordAge = 0;
    const harmony=harmonyAt(this.settings,step);
    this.chordMidi = this.settings.progression ? harmony.midi : pedalNotes(this.settings);
    this.frequencies = this.chordMidi.map(note => 440 * 2 ** ((note - 69) / 12));
    this.assignPadVoices();
    const bar = Math.floor(Math.max(0,this.beat-this.remainingCount)/s.beats);
    const nextHarmony=s.progression ? harmonyAt(s,progressionStep(s,bar+1)) : harmony;
    this.nextChordMidi = s.progression ? nextHarmony.midi : this.chordMidi;
    this.sequenceNotes=melodicNotePool(s.sequenceSource,harmony,this.chordMidi);
    this.nextSequenceNotes=melodicNotePool(s.sequenceSource,nextHarmony,this.nextChordMidi);
  }

  assignPadVoices() {
    for (const voice of this.voices) voice.targetLevel = 0;
    for (let index=0;index<this.frequencies.length;index++) {
      const frequency=this.frequencies[index];
      let voice=this.voices.find(candidate=>candidate.frequency===frequency && candidate.targetLevel===0);
      if (!voice) {
        voice=this.voices.find(candidate=>candidate.level<.000001 && candidate.targetLevel===0);
        if (!voice) for (const candidate of this.voices) if (candidate.targetLevel===0 && (!voice || candidate.level<voice.level)) voice=candidate;
        // A quiet release can be stolen after unusually rapid UI chord changes.
        voice.frequency=frequency;
        voice.phase=(index*.173+frequency*.001)%1;
        voice.detuned=(voice.phase+.19)%1;
        voice.haloPhase=voice.phase;
        voice.subPhase=(voice.phase+.37)%1;
        voice.filter=0;voice.sideFilter=0;
      }
      voice.index=index;
      voice.targetLevel=1/this.frequencies.length;
      voice.band=bandFor(frequency,this.rate);
    }
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
    const movement={still:.28,evolving:1,expansive:1.5}[s.padMovement]||1;
    const depth={intimate:.55,wide:1,epic:1.35}[s.padDepth]||1;
    const brightness={dark:.62,balanced:1,luminous:1.35}[s.padBrightness]||1;
    const echoTarget = Math.min(.2,(sound.echo || 0)*depth);
    const attack = 1-Math.exp(-1/(this.rate*sound.attack));
    const release = 1-Math.exp(-1/(this.rate*sound.release));
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
        const nextHarmony=s.progression ? harmonyAt(s,progressionStep(s,bar+1)) : harmonyAt(s,this.step);
        this.nextChordMidi = s.progression ? nextHarmony.midi : this.chordMidi;
        this.nextSequenceNotes=melodicNotePool(s.sequenceSource,nextHarmony,this.nextChordMidi);
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
        this.sequence.tick(s,Math.max(0,this.beat-this.remainingCount),this.phase/(60*this.rate),this.sequenceNotes,this.age,this.step,onSequence,this.nextSequenceNotes);
      }
      if (s.sequence || this.sequenceLevel > .000001) this.sequence.render();
      else { this.sequence.left = 0; this.sequence.right = 0; }
      this.sequenceLevel+=((s.sequence && !this.auditioning && backingActive?s.sequenceVolume:0)-this.sequenceLevel)*smoothing;
      const rhythmActive=backingActive && !this.auditioning;
      if ((s.drums || s.bass) && rhythmActive) this.rhythm.tick(this.clockSettings,Math.max(0,this.beat-this.remainingCount),this.phase/(60*this.rate),this.chordMidi,this.age,this.step,onRhythm,this.nextChordMidi);
      this.drumsLevel+=((s.drums && rhythmActive?s.drumsVolume:0)-this.drumsLevel)*smoothing;
      this.bassLevel+=((s.bass && rhythmActive?s.bassVolume:0)-this.bassLevel)*smoothing;
      this.rhythm.render(this.drumsLevel>.000001,this.bassLevel>.000001);
      const rhythmSample=this.level*(.36*this.drumsLevel*this.rhythm.drums+.2*this.bassLevel*this.rhythm.bass);
      // Control-rate updates are independent of callback block boundaries.
      // Interpolated motion changes colour and width over several time scales.
      if ((this.age & 31) === 0) {
        const time = this.age * inverseRate;
        const breathDepth=sound.depth*movement;
        const breath = 1-breathDepth*.5+breathDepth*.5*Math.sin(2*Math.PI*sound.speed*movement*time);
        this.breathDelta=(breath-this.breath)/32;
        const musicalBeat=Math.max(0,this.beat-this.remainingCount)+this.phase/(60*this.rate);
        const arc=1-(sound.arc||0)*movement*.5+(sound.arc||0)*movement*.5*Math.sin(2*Math.PI*musicalBeat/(Math.max(1,s.beats)*8)-Math.PI/2);
        this.phraseArcDelta=(arc-this.phraseArc)/32;
        for (const voice of this.voices) {
          if (!voice.targetLevel && voice.level<.000001) continue;
          const offset=voice.index*1.31;
          const motion=.5+.5*Math.sin(time*.19+offset);
          const slow=.5+.5*Math.sin(time*.071+offset*1.73);
          const cutoff=Math.min(this.rate*.32,(sound.filterBase+sound.filterSweep*movement*(motion*.62+slow*.38))*brightness);
          const coefficient=1-Math.exp(-2*Math.PI*cutoff*inverseRate);
          const pan=.18*depth*Math.sin(time*.11*movement+offset);
          const detune=sound.detune*(.8+.2*Math.sin(time*.23+offset*1.4));
          const mix=sound.morph+sound.morphDepth*movement*(slow-.5)*2;
          const glass=s.sound==='atmosphere'||s.sound==='glass';
          const gain=(.92+.08*Math.sin(time*.31+offset*.8))*(glass?.82+.18*Math.exp(-this.chordAge*inverseRate/1.4):1);
          const halo=sound.halo*brightness*(.35+.65*motion*motion)*movement;
          voice.coefficientDelta=(coefficient-voice.coefficient)/32;
          voice.panDelta=(pan-voice.pan)/32;
          voice.detuneDelta=(detune-voice.detune)/32;
          voice.gainDelta=(gain-voice.gain)/32;
          voice.mixDelta=(mix-voice.mix)/32;
          voice.widthDelta=(sound.width-voice.width)/32;
          voice.haloDelta=(halo-voice.halo)/32;
        }
      }
      this.breath+=this.breathDelta;
      this.phraseArc+=this.phraseArcDelta;
      if (this.soundBlend < 1) {
        this.soundBlend += (1-this.soundBlend)*this.blendSmoothing;
        if (this.soundBlend>.9999) this.soundBlend=1;
      }
      let chord=0,chordRight=0;
      for (const voice of this.voices) {
        voice.level+=(voice.targetLevel-voice.level)*(voice.targetLevel>voice.level?attack:release);
        if (!voice.targetLevel && voice.level<.000001) { voice.level=0; continue; }
        const increment=voice.frequency*inverseRate;
        voice.coefficient+=voice.coefficientDelta;
        voice.pan+=voice.panDelta;
        voice.detune+=voice.detuneDelta;
        voice.gain+=voice.gainDelta;
        voice.mix+=voice.mixDelta;
        voice.width+=voice.widthDelta;
        voice.halo+=voice.haloDelta;
        voice.phase+=increment*(1-voice.detune*.5);
        voice.detuned+=increment*(1+voice.detune*.5);
        voice.haloPhase+=increment*2;
        voice.subPhase+=increment*.5;
        if(voice.phase>=1)voice.phase-=Math.floor(voice.phase);
        if(voice.detuned>=1)voice.detuned-=Math.floor(voice.detuned);
        if(voice.haloPhase>=1)voice.haloPhase-=Math.floor(voice.haloPhase);
        if(voice.subPhase>=1)voice.subPhase-=Math.floor(voice.subPhase);
        let base=readWave(this.waveCurrent[voice.band],voice.phase);
        let layer=readWave(this.layerCurrent[voice.band],voice.detuned);
        if(this.soundBlend<1){
          const previous=readWave(this.wavePrevious[voice.band],voice.phase);
          const previousLayer=readWave(this.layerPrevious[voice.band],voice.detuned);
          base=previous+(base-previous)*this.soundBlend;
          layer=previousLayer+(layer-previousLayer)*this.soundBlend;
        }
        const halo=voice.frequency*2<this.rate*.45?readWave(SINE,voice.haloPhase)*voice.halo:0;
        const foundation=voice.index===0&&sound.foundation?readWave(SINE,voice.subPhase)*sound.foundation*depth:0;
        const wave=(base*(1-voice.mix)+layer*voice.mix)*(1-voice.halo)+halo+foundation;
        voice.filter+=(wave-voice.filter)*voice.coefficient;
        // The difference between two pitched layers provides a restrained side
        // signal. The shared centre keeps the pad full when summed to mono.
        const side=(base-layer)*voice.width*.18;
        voice.sideFilter+=(side-voice.sideFilter)*voice.coefficient;
        const gain=voice.level*voice.gain;
        chord+=(voice.filter+voice.sideFilter)*gain*(1-voice.pan);
        chordRight+=(voice.filter-voice.sideFilter)*gain*(1+voice.pan);
      }
      const clickSample = this.level * .3 * this.clickLevel * (this.auditioning ? 0 : click) * this.clickStrength;
      let left=.4*this.harmonyLevel*chord*this.breath*this.phraseArc+.15*this.sequenceLevel*this.sequence.left;
      let right=.4*this.harmonyLevel*chordRight*this.breath*this.phraseArc+.15*this.sequenceLevel*this.sequence.right;
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
