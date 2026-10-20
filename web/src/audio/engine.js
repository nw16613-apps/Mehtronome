import { Sequence } from './sequence.js';
import { pedalNotes, SOUNDS, harmonyAt, progressionStep } from './music.js';
// A single sample clock drives clicks, count-in and chord changes. No UI timers.
export const DEFAULTS = {
  bpm: 90, beats: 4, key: 0, minor: false, progression: false,
  sequence:false, sequencePattern:'sparse', sequenceRate:2, sequenceSwing:0, sequenceDensity:.65, sequenceVolume:.25,
  click: 0.5, harmony: 0.35, countIn: true, sound: 'warm', template: 'parallel1', subdivision: 1, accent: true,
};
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
    this.reset();
  }

  reset() {
    this.auditioning = false;
    this.sequence = new Sequence(this.rate);
    this.audioFrequencies=Array(6).fill(0);
    this.filters=Array(6).fill(0);
    this.evolution=0;
    this.sequenceLevel=0;
    this.echoLeft=new Float32Array(this.rate);
    this.echoRight=new Float32Array(this.rate);
    this.echoIndex=0;
    this.echoMix=0;
    this.phase = 0;
    this.beat = -1;
    this.remainingCount = this.settings.countIn ? this.settings.beats : 0;
    this.nextBeat = true;
    this.clickAge = this.rate;
    this.clickFrequency = 1500;
    this.clickStrength = 1;
    this.lastSubdivision = 0;
    this.phases = Array(6).fill(0);
    this.detunedPhases = Array(6).fill(0);
    this.voiceLevels = Array(6).fill(0);
    const sound = SOUNDS[this.settings.sound] || SOUNDS.warm;
    this.timbre = [sound.harmonics[0], sound.harmonics[1], sound.detune, sound.speed, sound.depth];
    this.breathPhase = 0;
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
    const previousSound=this.settings.sound;
    const previousSequenceRate=this.settings.sequenceRate;
    const previousSwing=this.settings.sequenceSwing;
    const previousSequence=this.settings.sequence;
    const previousSubdivision = this.settings.subdivision;
    Object.assign(this.settings, settings);
    const s = this.settings;
    if(previousSound!==s.sound){this.echoLeft.fill(0);this.echoRight.fill(0);}
    s.bpm = Math.max(30, Math.min(240, Number(s.bpm) || 90));
    if (previousSubdivision !== s.subdivision) this.lastSubdivision = Math.floor(this.phase * s.subdivision / (60 * this.rate));
    if(previousSequenceRate!==s.sequenceRate || previousSequence!==s.sequence || previousSwing!==s.sequenceSwing){
      this.sequence.lastGrid=this.beat>=this.remainingCount ? this.sequence.gridAt(s,this.beat-this.remainingCount,this.phase/(60*this.rate)) : -1;
    }
    const bar = Math.floor(Math.max(0, this.beat - this.remainingCount) / s.beats);
    this.setChord(this.auditioning ? this.step : s.progression ? progressionStep(s, bar) : 0);
  }

  audition(step) {
    this.reset();
    this.auditioning = true;
    this.nextBeat = false;
    this.setChord(step);
  }

  setChord(step) {
    this.step = step;
    this.chordMidi = this.settings.progression ? harmonyAt(this.settings, step).midi : pedalNotes(this.settings);
    this.frequencies = this.chordMidi.map(note => 440 * 2 ** ((note - 69) / 12));
  }

  render(output, onBeat = () => {}, harmonyOutput = null, harmonyRight = null, onSequence = () => {}) {
    const s = this.settings;
    const smoothing = 1 - Math.exp(-1 / (this.rate * 0.018));
    const voiceSmoothing = 1 - Math.exp(-1 / (this.rate * .15));
    const sound = SOUNDS[s.sound] || SOUNDS.warm;
    const targetTimbre = [sound.harmonics[0], sound.harmonics[1], sound.detune, sound.speed, sound.depth];
    for (let i = 0; i < output.length; i++) {
      if (this.nextBeat && !this.auditioning) {
        this.nextBeat = false;
        this.beat++;
        const counting = this.beat < this.remainingCount;
        const musicalBeat = Math.max(0, this.beat - this.remainingCount);
        const bar = Math.floor(musicalBeat / s.beats);
        const step = s.progression ? progressionStep(s, bar) : 0;
        this.setChord(step);
        this.clickAge = 0;
        this.clickFrequency = s.accent && this.beat % s.beats === 0 ? 1500 : 1000;
        this.clickStrength = 1;
        this.lastSubdivision = 0;
        onBeat({ counting, beat: this.beat % s.beats, bar: bar + 1, step });
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
      this.sequence.render();
      this.sequenceLevel+=((s.sequence && !this.auditioning && backingActive?s.sequenceVolume:0)-this.sequenceLevel)*smoothing;
      this.evolution+=((sound.evolve||0)-this.evolution)*voiceSmoothing;
      let chord = 0, chordRight = 0;
      for (let parameter = 0; parameter < 5; parameter++) this.timbre[parameter] += (targetTimbre[parameter] - this.timbre[parameter]) * voiceSmoothing;
      const [h0, h1, detune, speed, depth] = this.timbre;
      this.breathPhase = (this.breathPhase + 2 * Math.PI * speed / this.rate) % (2 * Math.PI);
      const breath = 1 - depth / 2 + depth / 2 * Math.sin(this.breathPhase);
      for (let voice = 0; voice < 6; voice++) {
        const active = voice < this.frequencies.length;
        const targetFrequency = this.frequencies[voice] || this.frequencies[0];
        if(!this.audioFrequencies[voice]) this.audioFrequencies[voice]=targetFrequency;
        this.audioFrequencies[voice]+=(targetFrequency-this.audioFrequencies[voice])*voiceSmoothing;
        const frequency=targetFrequency*(1-this.evolution)+this.audioFrequencies[voice]*this.evolution;
        const drift=Math.sin(this.age/this.rate*(.17+voice*.031)+voice*1.7);
        this.voiceLevels[voice] += ((active ? 1 / this.frequencies.length : 0) - this.voiceLevels[voice]) * voiceSmoothing;
        this.phases[voice] = (this.phases[voice] + 2 * Math.PI * frequency / this.rate) % (2 * Math.PI);
        this.detunedPhases[voice] = (this.detunedPhases[voice] + 2 * Math.PI * frequency * (1 + detune*(1+.25*drift*this.evolution)) / this.rate) % (2 * Math.PI);
        const p = this.phases[voice];
        const pure = .72 * Math.sin(p) + .28 * Math.sin(this.detunedPhases[voice]);
        const motion=.5+.5*Math.sin(this.breathPhase*.63+voice*1.1);
        const colour=1+this.evolution*(motion-.5)*.9;
        const wave=(pure+h0*colour*Math.sin(2*p)+h1*colour*Math.sin(3*p)+this.evolution*.1*Math.sin(4*p))/1.5;
        const cutoff=350+(sound.brightness||.6)*1800+motion*1600;
        const coefficient=1-Math.exp(-2*Math.PI*Math.min(this.rate*.3,cutoff)/this.rate);
        this.filters[voice]+=(wave-this.filters[voice])*coefficient;
        const shaped=wave*(1-this.evolution)+this.filters[voice]*this.evolution;
        const pan=Math.sin(this.breathPhase*.47+voice*1.4)*.32*this.evolution;
        chord+=shaped*this.voiceLevels[voice]*(1-pan);
        chordRight+=shaped*this.voiceLevels[voice]*(1+pan);
      }
      const clickSample = this.level * .3 * this.clickLevel * (this.auditioning ? 0 : click) * this.clickStrength;
      let left=.4*this.harmonyLevel*chord*breath+.15*this.sequenceLevel*this.sequence.left;
      let right=.4*this.harmonyLevel*chordRight*breath+.15*this.sequenceLevel*this.sequence.right;
      this.echoMix+=((sound.echo||0)-this.echoMix)*voiceSmoothing;
      if(this.echoMix>.00001){
        // Slowly moving stereo delay taps add space without affecting dry clicks.
        const tapLeft=(this.echoIndex-(.31+.02*Math.sin(this.breathPhase*.31))*this.rate+this.rate)%this.rate;
        const tapRight=(this.echoIndex-(.43+.025*Math.sin(this.breathPhase*.27+1))*this.rate+this.rate)%this.rate;
        const iLeft=Math.floor(tapLeft),iRight=Math.floor(tapRight);
        const echoL=this.echoLeft[iLeft]*(1-tapLeft+iLeft)+this.echoLeft[(iLeft+1)%this.rate]*(tapLeft-iLeft);
        const echoR=this.echoRight[iRight]*(1-tapRight+iRight)+this.echoRight[(iRight+1)%this.rate]*(tapRight-iRight);
        this.echoLeft[this.echoIndex]=left+echoR*.28;
        this.echoRight[this.echoIndex]=right+echoL*.28;
        left+=echoL*this.echoMix;right+=echoR*this.echoMix;
        this.echoIndex=(this.echoIndex+1)%this.rate;
      }
      const backingSample=this.level*left;
      const rightSample=this.level*right;
      output[i] = harmonyOutput ? clickSample : clickSample + backingSample;
      if (harmonyOutput) harmonyOutput[i] = backingSample;
      if (harmonyRight) harmonyRight[i] = rightSample;
      // Integer units avoid drift and preserve position when the tempo changes.
      this.phase += s.bpm;
      if (this.phase >= 60 * this.rate) {
        this.phase -= 60 * this.rate;
        this.nextBeat = true;
      }
      this.age++;
    }
  }
}
