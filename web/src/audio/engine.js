import {extensionChoices,extensionBlend} from './extensions.js';
import {beatStrength, subdivisionAt, progressiveGap} from '../practice/pulse.js';
import { GuitarStrum } from './guitar.js';
import { WAVES, WAVE_LAYERS, SINE, readWave, bandFor } from './waves.js';
import { Rhythm } from './rhythm.js';
import { CompingInstrument, compingHook } from './comping.js';
import { Sequence } from './sequence.js';
import { pedalNotes, SOUNDS, harmonyAt, progressionStepAtBeat, characteristicNotes } from './music.js';
import { modalPentatonicPcs } from '../guitar/superimposition.js';
const NOOP = () => {};
// A single sample clock drives clicks, count-in and chord changes. No UI timers.
export const DEFAULTS = {
  mutedChannels:'', extensionMorph:true, extensionBars:8,
  clickSound: 'beep', beatAccents:'', clickSwing:0, polyBeats:0, polyBase:2, sessionSeconds:0, sessionFinishBar:true, gapProgressive:false, gapMaxBars:8,
  gapEnabled:false, gapPlayBars:4, gapMuteBars:1, gapTarget:'all',
  loopEnabled:false, loopStart:0, loopEnd:3,
  bpm: 90, beats: 4, key: 0, minor: false, progression: false,
  trainerEnabled:false, trainerBars:4, trainerIncrement:2, trainerTarget:120,
  drums:false, drumGroove:'straight', drumsVolume:.35, bass:false, bassPattern:'roots', bassVolume:.4,
  comping:false, compingPattern:'sparse', compingTone:'warmTine', compingVolume:.3, compingMovement:'modal', compingMovementAmount:.5, compingHookLength:3,
  sequence:false, sequenceRole:'modalHook', sequencePhraseBars:4, sequenceDevelopment:'subtle', sequenceInteraction:'independent', sequenceSource:'chord', sequenceRegister:12, sequencePattern:'sparse', sequenceRate:2, sequenceSwing:0, sequenceDensity:.5, sequenceVolume:.25,
  click: 0.5, harmony: 0.35, countIn: true, sound: 'warm', padMovement:'evolving', padDepth:'wide', padDepthMotion:'breathing', padDepthAmount:.65, padBrightness:'balanced', template: 'parallel1', subdivision: 1, accent: true,
};
export function gapAt(settings, bar) {
  if (!settings.gapEnabled) return false;
  return progressiveGap(settings,bar).muted;
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

export function melodicRoleContext(settings,harmony,nextHarmony,chordMidi,nextChordMidi){
  const anchor=harmonyAt({...settings,progression:false},0),modal=melodicNotePool('mode',anchor,anchor.midi);
  const root=modal[0],colourPc=characteristicNotes(anchor)[0]?.pc??anchor.scalePcs[3];
  const colour=root+((colourPc-anchor.scalePcs[0]+12)%12),fifth=modal[Math.min(4,modal.length-1)];
  return {modalHook:[root,fifth,colour,fifth],chordResponse:[...chordMidi],counterline:modal,
    guideLine:melodicNotePool('guide',harmony,chordMidi),ambientPulse:[root,colour],nextChord:[...nextChordMidi]};
}

export function chordNotes(key, isMinor, degree = 0) {
  const scale = isMinor ? minor : major;
  return [degree, degree + 2, degree + 4].map(i =>
    48 + key + scale[i % 7] + 12 * Math.floor(i / 7));
}

export const PIANO_VOICINGS={
  major:[0,7,16],maj7:[0,7,11,16],maj9:[0,7,11,14,16],six:[0,7,9,16],sixNine:[0,7,9,14,16],
  maj7sharp11:[0,7,11,16,18],maj9sharp11:[0,7,11,14,16,18],minor:[0,7,15],min7:[0,7,10,15],
  min9:[0,7,10,14,15],min11:[0,7,10,14,15,17],min6:[0,7,9,15],min13:[0,7,10,14,15,21],
  min11b9:[0,10,15,17,25],min13b9:[0,10,15,21,25],min11b13:[0,10,14,15,17,20],min13sharp11:[0,10,14,15,18,21],
  dom7:[0,10,16,19],dom9:[0,10,14,16,19],dom13:[0,10,14,16,21],sus2:[0,7,14],sus4:[0,7,17],
  sevenSus:[0,7,10,17],nineSus:[0,7,10,14,17],halfDim:[0,6,10,15],halfDim11:[0,6,10,15,17],
  halfDim9:[0,6,10,14,15],minMaj7:[0,7,11,15],minMaj9:[0,7,11,14,15],augmented:[0,8,16],
  halfDim13:[0,6,10,15,17,21],
  augMaj7:[0,8,11,16],augMaj9:[0,8,11,14,16],dom9sharp11:[0,10,14,16,18],dom7b9:[0,10,16,19,25],
  dom9b13:[0,10,14,16,20],dom7b9b13:[0,10,16,20,25],maj7sharp9sharp11:[0,11,16,18,27],
  dom7alt:[0,10,16,18,20,25,27],dim7:[0,6,9,15],fifth:[0,7,12],
};

export function padVoicing(chordMidi, depth='wide', chordId='') {
  if(!chordMidi.length)return [];
  const root=chordMidi[0],relative=note=>((note-root)%12+12)%12;
  const layout=PIANO_VOICINGS[chordId];
  if(layout){
    const bass=depth==='intimate'?root:root-12;
    const notes=layout.map((interval,index)=>index?root+interval:bass);
    if(depth==='epic'&&layout.some(interval=>interval%12===7))notes.splice(1,0,root-5);
    if(depth==='epic'&&!notes.includes(root+24))notes.push(root+24);
    return [...new Set(notes)].sort((a,b)=>a-b).map((midi,index)=>{
      const pc=((midi-root)%12+12)%12;
      const role=index===0?'foundation':midi>=root+24?'air':[3,4,10,11].includes(pc)?'body':midi>root+12?'colour':pc===7?'foundation':'body';
      const weight=role==='foundation'?(index===0?(depth==='epic'?1.7:1.4):.72):role==='air'?.5:role==='colour'?.76:1;
      return {midi,role,weight};
    });
  }
  if(depth==='intimate')return chordMidi.map((midi,index)=>({midi,role:index?'body':'root',weight:index?1:1.15}));
  const fifth=chordMidi.find(note=>relative(note)===7);
  const inner=chordMidi.filter(note=>note!==root&&note!==fifth);
  const entries=[{midi:root-12,role:'foundation',weight:depth==='epic'?1.7:1.4}];
  if(fifth!==undefined)entries.push({midi:depth==='epic'?fifth-12:fifth,role:'foundation',weight:depth==='epic'?.9:.7});
  for(const note of inner)entries.push({midi:note,role:relative(note)>11?'colour':'body',weight:relative(note)>11?.72:1});
  if(depth==='epic')entries.push({midi:root+24,role:'air',weight:.55});
  return entries.sort((a,b)=>a.midi-b.midi);
}

const depthIndex=depth=>({intimate:0,wide:.5,epic:1}[depth]??.5);
const depthWeight=(weights,position)=>position<=.5
  ?weights.intimate+(weights.wide-weights.intimate)*position*2
  :weights.wide+(weights.epic-weights.wide)*(position-.5)*2;

export function padDepthMotionState(settings,musicalBeat=0){
  const base=depthIndex(settings.padDepth),amount=Math.max(0,Math.min(1,Number(settings.padDepthAmount)||0));
  const bars=musicalBeat/Math.max(1,settings.beats||4),mode=settings.padDepthMotion||'fixed';
  let target=base,foundation=1,body=1,air=1;
  if(mode==='expansion')target=.5-.5*Math.cos(2*Math.PI*bars/16);
  if(mode==='breathing')target=.12+.88*Math.sin(Math.PI*(bars%8)/8)**2;
  if(mode==='bloom'){
    const bloom=Math.sin(Math.PI*(bars%4)/4)**2;
    foundation=1+1.8*amount*bloom;body=1-.12*amount*bloom;air=1-.25*amount*bloom;
  }
  if(mode==='drift'){
    const drift=Math.sin(2*Math.PI*bars/12);
    target=.5+.42*drift;foundation=1-.55*amount*drift;air=1+1.05*amount*drift;body=1-.1*amount*Math.abs(drift);
  }
  return {position:Math.max(0,Math.min(1,base+(target-base)*amount)),foundation,body,air};
}

export function movingPadVoicing(chordMidi,chordId=''){
  const sets={intimate:padVoicing(chordMidi,'intimate',chordId),wide:padVoicing(chordMidi,'wide',chordId),epic:padVoicing(chordMidi,'epic',chordId)};
  const byMidi=new Map();
  for(const depth of Object.keys(sets))for(const entry of sets[depth]){
    const item=byMidi.get(entry.midi)||{midi:entry.midi,role:entry.role,weight:entry.weight,depthWeights:{intimate:0,wide:0,epic:0}};
    item.depthWeights[depth]=entry.weight;
    if(entry.role==='foundation'||entry.role==='air')item.role=entry.role;
    byMidi.set(entry.midi,item);
  }
  return [...byMidi.values()].sort((a,b)=>a.midi-b.midi);
}

export function padMotionNotes(chordMidi) {
  if(!chordMidi.length)return [];
  const source=chordMidi.length>2?chordMidi.slice(1):chordMidi;
  return source.map(note=>{
    let midi=note;
    while(midi<67)midi+=12;
    while(midi>86)midi-=12;
    return midi;
  }).filter((note,index,notes)=>notes.indexOf(note)===index);
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
    this.comping = new CompingInstrument(this.rate);
    this.drumsLevel = 0;
    this.meterPeaks = new Float32Array(12);
    this.bassLevel = 0;
    this.compingLevel = 0;
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
    this.motionPhase = 0;
    this.motionCell = -1;
    this.depthMotionState={position:depthIndex(this.settings.padDepth),foundation:1,body:1,air:1};
    this.motionFrequency = 0;
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
    this.sessionFrames = 0;
    this.sessionFinished = false;
    this.polyAge = this.rate;
    this.lastPoly = -1;
    this.age = 0;
    this.step = 0;
    this.configure({});
  }

  configure(settings) {
    const previousTrainer = [this.settings.bpm,this.settings.trainerEnabled,this.settings.trainerBars,this.settings.trainerIncrement,this.settings.trainerTarget,this.settings.beats].join('/');
    const previousDrums=this.settings.drums, previousBass=this.settings.bass, previousComping=this.settings.comping, previousGroove=this.settings.drumGroove;
    const previousSound=this.settings.sound;
    const previousSequenceRate=this.settings.sequenceRate;
    const previousSwing=this.settings.sequenceSwing;
    const previousSequence=this.settings.sequence;
    const previousSubdivision = this.settings.subdivision;
    const previousPoly = `${this.settings.polyBeats}/${this.settings.polyBase}`;
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
    if (!previousComping && s.comping) this.comping.clear();
    if (previousDrums!==s.drums || previousBass!==s.bass || previousGroove!==s.drumGroove) {
      this.rhythm.lastBassGrid=this.beat>=this.remainingCount ? this.rhythm.bassGridAt(this.beat-this.remainingCount,this.phase/(60*this.rate)) : -1;
      this.rhythm.lastGrid=this.beat>=this.remainingCount ? this.rhythm.gridAt(s,this.beat-this.remainingCount,this.phase/(60*this.rate)) : -1;
    }
    this.muted=new Set(String(s.mutedChannels||'').split(','));
    s.extensionBars=[4,8,16].includes(Number(s.extensionBars))?Number(s.extensionBars):8;
    s.clickSwing=Math.max(0,Math.min(1,Number(s.clickSwing)||0));
    s.polyBeats=[0,2,3,4,5,7].includes(Number(s.polyBeats))?Number(s.polyBeats):0;
    s.polyBase=[2,3,4].includes(Number(s.polyBase))?Number(s.polyBase):2;
    s.sessionSeconds=Math.max(0,Math.min(10800,Number(s.sessionSeconds)||0));
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
    if (previousSubdivision !== s.subdivision) this.lastSubdivision = subdivisionAt(this.phase/(60*this.rate),s.subdivision,s.clickSwing);
    if(previousPoly!==`${s.polyBeats}/${s.polyBase}`){
      this.lastPoly=this.beat>=this.remainingCount?Math.floor(((this.beat-this.remainingCount)+this.phase/(60*this.rate))*s.polyBeats/s.polyBase+1e-10):-1;
      this.polyAge=this.rate;
    }
    if(!previousSequence && s.sequence) for(const voice of this.sequence.voices) voice.age=Infinity;
    if(previousSequenceRate!==s.sequenceRate || previousSequence!==s.sequence || previousSwing!==s.sequenceSwing){
      this.sequence.lastGrid=this.beat>=this.remainingCount ? this.sequence.gridAt(s,this.beat-this.remainingCount,this.phase/(60*this.rate)) : -1;
    }
    const bar = Math.floor(Math.max(0, this.beat - this.remainingCount) / s.beats);
    this.gapMuted = !this.auditioning && this.beat >= this.remainingCount && gapAt(s,bar);
    this.setChord(this.auditioning ? this.step : s.progression ? progressionStepAtBeat(s,Math.max(0,this.beat-this.remainingCount)) : 0);
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
      this.padVoicing=notes.map((midi,index)=>({midi,role:index?'body':'root',weight:1}));
      this.motionNotes=padMotionNotes(notes);
      this.motionCell=-1;
      this.assignPadVoices();
      if (acoustic) this.guitar = new GuitarStrum(this.rate, notes);
    }
  }

  setChord(step) {
    this.step = step;
    const s = this.settings;
    const customSignature=s.template==='custom'?s.customProgression?.steps?.map(item=>`${item.root}:${item.chord}:${item.mode}:${item.bars}:${item.beats}:${item.bass}`).join(','):'';
    const signature = `${s.key}/${s.minor}/${s.mode}/${s.chord}/${s.progression}/${s.template}/${s.sequenceSource}/${s.padDepth}/${s.padDepthMotion}/${s.bass}/${s.compingMovement}/${s.compingHookLength}/${step}/${s.extensionMorph}/${customSignature}`;
    if (signature === this.chordSignature) return;
    this.chordSignature = signature;
    this.chordAge = 0;
    const harmony=harmonyAt(this.settings,step);
    this.chordMidi = this.settings.progression ? harmony.midi : pedalNotes(this.settings);
    this.rhythmChordMidi = Number.isFinite(harmony.bassMidi)?[harmony.bassMidi,...this.chordMidi]:this.chordMidi;
    this.frequencies = this.chordMidi.map(note => 440 * 2 ** ((note - 69) / 12));
    const chordId=harmony.chordId || s.chord;
    this.padVoicing=s.padDepthMotion==='fixed'?padVoicing(this.chordMidi,s.padDepth,chordId):movingPadVoicing(this.chordMidi,chordId);
    if(Number.isFinite(harmony.bassMidi)){
      const foundation=this.padVoicing.find(entry=>entry.role==='foundation');
      if(foundation)foundation.midi=harmony.bassMidi;
      else this.padVoicing.unshift({midi:harmony.bassMidi,role:'foundation',weight:1.35});
      this.padVoicing.sort((a,b)=>a.midi-b.midi);
    }
    this.compingVoicing=this.padVoicing.filter(note=>!['foundation','air'].includes(note.role)).map(note=>note.midi);
    this.extensionBeat=Math.max(0,this.beat-this.remainingCount)+this.phase/(60*this.rate);
    this.extensionCandidates=s.extensionMorph?extensionChoices(harmony):[];
    if(s.extensionMorph){
      const allowed=new Set(harmony.scalePcs);
      this.padVoicing=this.padVoicing.filter(entry=>allowed.has((entry.midi%12+12)%12));
      this.extensionCandidates.forEach((choice,index)=>{
        const existing=this.padVoicing.filter(entry=>entry.midi%12===choice.midi%12);
        if(existing.length)existing.forEach(entry=>{entry.extensionIndex=index;});
        else if(this.padVoicing.length<10)this.padVoicing.push({midi:choice.midi,role:'colour',weight:.7,extensionIndex:index});
      });
    }
    this.motionNotes=padMotionNotes(s.extensionMorph?this.chordMidi.filter(midi=>harmony.scalePcs.includes(midi%12)):this.chordMidi);
    this.motionCell=-1;
    const bar = Math.floor(Math.max(0,this.beat-this.remainingCount)/s.beats);
    this.assignPadVoices(this.depthMotionState);
    const nextHarmony=s.progression ? harmonyAt(s,progressionStepAtBeat(s,s.template==='custom'?Math.max(0,this.beat-this.remainingCount)+1:(bar+1)*s.beats)) : harmony;
    harmony.characteristicPcs=characteristicNotes(harmony).map(note=>note.pc);
    nextHarmony.characteristicPcs=characteristicNotes(nextHarmony).map(note=>note.pc);
    this.compingNotes=compingHook(harmony,nextHarmony,s.compingMovement,s.compingHookLength);
    this.nextChordMidi = s.progression ? nextHarmony.midi : this.chordMidi;
    this.nextRhythmChordMidi = Number.isFinite(nextHarmony.bassMidi)?[nextHarmony.bassMidi,...this.nextChordMidi]:this.nextChordMidi;
    this.sequenceNotes=melodicNotePool(s.sequenceSource,harmony,this.chordMidi);
    this.nextSequenceNotes=melodicNotePool(s.sequenceSource,nextHarmony,this.nextChordMidi);
    this.sequenceRoleContext=melodicRoleContext(s,harmony,nextHarmony,this.chordMidi,this.nextChordMidi);
  }

  padEntryWeight(entry,state=this.depthMotionState) {
    const base=entry.depthWeights?depthWeight(entry.depthWeights,state.position):entry.weight;
    const roleScale=entry.role==='foundation'?state.foundation:entry.role==='air'?state.air:state.body;
    const extension=entry.extensionIndex===undefined?1:extensionBlend(entry.extensionIndex,this.extensionCandidates.length,this.extensionBeat,this.settings.beats,this.settings.extensionBars);
    return base*extension*roleScale*(this.settings.bass&&entry.role==='foundation'?.28:1);
  }

  assignPadVoices(state=this.depthMotionState) {
    for (const voice of this.voices) voice.targetLevel = 0;
    const entries=this.padVoicing||this.frequencies.map((frequency,index)=>({midi:69+12*Math.log2(frequency/440),role:index?'body':'root',weight:1}));
    const adjusted=entries.map(entry=>({...entry,weight:Math.max(.0001,this.padEntryWeight(entry,state))}));
    const total=adjusted.reduce((sum,entry)=>sum+entry.weight,0)||1;
    for (let index=0;index<adjusted.length;index++) {
      const entry=adjusted[index],frequency=440*2**((entry.midi-69)/12);
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
      voice.role=entry.role;
      voice.targetLevel=entry.weight/total;
      voice.band=bandFor(frequency,this.rate);
    }
  }

  applyPadDepthState(state){
    this.depthMotionState=state;
    const weighted=this.padVoicing.map(entry=>({entry,weight:this.padEntryWeight(entry,state)}));
    const total=weighted.reduce((sum,item)=>sum+item.weight,0)||1;
    for(const voice of this.voices){
      const match=weighted.find(item=>Math.abs(440*2**((item.entry.midi-69)/12)-voice.frequency)<.0001);
      voice.targetLevel=match?match.weight/total:0;
      if(match)voice.role=match.entry.role;
    }
  }

  render(output, onBeat = NOOP, harmonyOutput = null, harmonyRight = null, onSequence = NOOP, rhythmOutput = null, onRhythm = NOOP, gapOutput = null, onPulse = NOOP) {
    const s = this.settings;
    const clickVolume=this.muted.has('click')?0:s.click;
    const harmonyVolume=this.muted.has('harmony')?0:s.harmony;
    const drumsVolume=this.muted.has('drums')?0:s.drumsVolume,bassVolume=this.muted.has('bass')?0:s.bassVolume;
    const compingVolume=this.muted.has('comping')?0:s.compingVolume,sequenceVolume=this.muted.has('sequence')?0:s.sequenceVolume;
    if (this.guitar) {
      // Guitar bypasses pad layers and echoes, but feeds the shared room reverb.
      for (let i = 0; i < output.length; i++) {
        this.level += ((this.running ? 1 : 0) - this.level) * this.smoothing;
        const value = this.guitar.sample() * this.level * harmonyVolume;
        this.meterPeaks[2]=Math.max(this.meterPeaks[2],Math.abs(value));
        this.meterPeaks[3]=Math.max(this.meterPeaks[3],Math.abs(value));
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
    const movement={still:.08,evolving:1,expansive:2}[s.padMovement]||1;
    let depth=.4+1.4*(this.depthMotionState?.position??depthIndex(s.padDepth));
    const brightness={dark:.38,balanced:1,luminous:1.75}[s.padBrightness]||1;
    let echoTarget = Math.min(.2,(sound.echo || 0)*depth);
    const attack = 1-Math.exp(-1/(this.rate*sound.attack));
    const release = 1-Math.exp(-1/(this.rate*sound.release));
    const inverseRate = this.inverseRate;
    for (let i = 0; i < output.length; i++) {
      const sessionActive=this.running&&!this.auditioning&&this.beat>=this.remainingCount;
      if(sessionActive&&s.sessionSeconds>0&&this.sessionFrames>=Math.round(s.sessionSeconds*this.rate)
        &&(!s.sessionFinishBar||(this.nextBeat&&(this.beat+1-this.remainingCount)%s.beats===0))){
        this.running=false;this.sessionFinished=true;onPulse({type:'session-complete',elapsed:this.sessionFrames/this.rate});
      }
      if (this.running && this.nextBeat && !this.auditioning) {
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
        const step = s.progression ? progressionStepAtBeat(s,Math.max(0,this.beat-this.remainingCount)) : 0;
        this.setChord(step);
        const nextHarmony=s.progression ? harmonyAt(s,progressionStepAtBeat(s,s.template==='custom'?Math.max(0,this.beat-this.remainingCount)+1:(bar+1)*s.beats)) : harmonyAt(s,this.step);
        this.nextChordMidi = s.progression ? nextHarmony.midi : this.chordMidi;
        this.nextRhythmChordMidi = Number.isFinite(nextHarmony.bassMidi)?[nextHarmony.bassMidi,...this.nextChordMidi]:this.nextChordMidi;
        this.nextSequenceNotes=melodicNotePool(s.sequenceSource,nextHarmony,this.nextChordMidi);
        this.clickAge = 0;
        const strength=beatStrength(s,this.beat%s.beats,counting);
        this.clickFrequency = strength===2 ? 1500 : 1000;
        this.clickStrength = strength===0?0:strength===2?1:.72;
        this.lastSubdivision = 0;
        this.gapMuted = !counting && gapAt(s, bar);
        onBeat({ gap:this.gapMuted, counting, beat: this.beat % s.beats, bar: bar + 1, step,
          extensions:s.extensionMorph?this.extensionCandidates.filter((_,index)=>extensionBlend(index,this.extensionCandidates.length,musicalBeat,s.beats,s.extensionBars)>.65).map(choice=>choice.label):[],
          bpm:this.currentBpm, trainerTargetReached:!!s.trainerEnabled && !counting && this.currentBpm >= Math.max(s.bpm,s.trainerTarget) });
      }
      const subdivision = subdivisionAt(this.phase/(60*this.rate),s.subdivision,s.clickSwing);
      if (!this.auditioning && subdivision !== this.lastSubdivision && subdivision > 0) {
        this.lastSubdivision = subdivision;
        this.clickAge = 0;
        this.clickFrequency = 800;
        this.clickStrength = beatStrength(s,this.beat%s.beats,this.beat<this.remainingCount)===0?0:.45;
      }
      const playing = this.running ? 1 : 0;
      this.level += (playing - this.level) * smoothing;
      this.clickLevel += (clickVolume - this.clickLevel) * smoothing;
      const backing = this.auditioning || this.beat >= this.remainingCount ? harmonyVolume : 0;
      this.harmonyLevel += (backing - this.harmonyLevel) * smoothing;
      const t = this.clickAge++ / this.rate;
      const frequency=this.clickFrequency;
      let click=0;
      if(t<.09){
        if(s.clickSound==='wood')click=(Math.sin(2*Math.PI*frequency*.65*t)+.45*Math.sin(2*Math.PI*frequency*1.47*t))*Math.exp(-155*t);
        else if(s.clickSound==='rim')click=(Math.sin(2*Math.PI*frequency*1.8*t)+.6*Math.sin(2*Math.PI*frequency*2.93*t))*Math.exp(-230*t);
        else if(s.clickSound==='soft')click=.8*Math.sin(2*Math.PI*frequency*.5*t)*Math.exp(-65*t)*Math.min(1,t/.002);
        else if(t<.06)click=Math.sin(2*Math.PI*frequency*t)*Math.exp(-100*t);
      }
      if(this.running&&!this.auditioning&&this.beat>=this.remainingCount){
        const polyIndex=Math.floor(((this.beat-this.remainingCount)+this.phase/(60*this.rate))*s.polyBeats/s.polyBase+1e-10);
        if(s.polyBeats&&polyIndex!==this.lastPoly){
          this.lastPoly=polyIndex;this.polyAge=0;
          onPulse({type:'polyrhythm',beat:polyIndex%s.polyBeats,total:s.polyBeats});
        }
        if(this.sessionFrames%Math.max(1,Math.round(this.rate/4))===0)onPulse({type:'session-time',elapsed:this.sessionFrames/this.rate,finishing:s.sessionSeconds>0&&this.sessionFrames>=s.sessionSeconds*this.rate});
        this.sessionFrames++;
      }
      const polyTime=this.polyAge++/this.rate;
      const polyClick=s.polyBeats&&polyTime<.05?Math.sin(2*Math.PI*2200*polyTime)*Math.exp(-140*polyTime):0;
      const backingActive=this.auditioning || this.beat>=this.remainingCount;
      if(s.sequence && backingActive && !this.auditioning){
        this.sequence.tick(s,Math.max(0,this.beat-this.remainingCount),this.phase/(60*this.rate),this.sequenceNotes,this.age,this.step,onSequence,this.nextSequenceNotes,this.sequenceRoleContext);
      }
      if (s.sequence || this.sequenceLevel > .000001) this.sequence.render();
      else { this.sequence.left = 0; this.sequence.right = 0; }
      this.sequenceLevel+=((s.sequence && !this.auditioning && backingActive?sequenceVolume:0)-this.sequenceLevel)*smoothing;
      const rhythmActive=backingActive && !this.auditioning;
      const musicalBeat=Math.max(0,this.beat-this.remainingCount),musicalPhase=this.phase/(60*this.rate);
      if ((s.drums || s.bass) && rhythmActive) this.rhythm.tick(this.clockSettings,musicalBeat,musicalPhase,this.rhythmChordMidi||this.chordMidi,this.age,this.step,onRhythm,this.nextRhythmChordMidi||this.nextChordMidi);
      if(s.comping&&rhythmActive){
        const compNotes=this.compingVoicing;
        this.comping.tick(s,musicalBeat,musicalPhase,compNotes,this.compingNotes||[],this.age,this.step,onRhythm);
      }
      this.drumsLevel+=((s.drums && rhythmActive?drumsVolume:0)-this.drumsLevel)*smoothing;
      this.bassLevel+=((s.bass && rhythmActive?bassVolume:0)-this.bassLevel)*smoothing;
      this.compingLevel+=((s.comping && rhythmActive?compingVolume:0)-this.compingLevel)*smoothing;
      this.rhythm.render(this.drumsLevel>.000001,this.bassLevel>.000001);
      const comping=this.comping.render();
      // The sampled rhythm section needs enough headroom to sit in front of the
      // wide, sustained pad. These trims keep the mixer controls perceptually
      // useful without forcing users to turn the harmony almost all the way down.
      const rhythmSample=this.level*(.5*this.drumsLevel*this.rhythm.drums+.3*this.bassLevel*this.rhythm.bass+.24*this.compingLevel*comping);
      // Control-rate updates are independent of callback block boundaries.
      // Interpolated motion changes colour and width over several time scales.
      if ((this.age & 31) === 0) {
        const time = this.age * inverseRate;
        const breathDepth=sound.depth*movement;
        const breath = 1-breathDepth*.5+breathDepth*.5*Math.sin(2*Math.PI*sound.speed*movement*time);
        this.breathDelta=(breath-this.breath)/32;
        const musicalBeat=Math.max(0,this.beat-this.remainingCount)+this.phase/(60*this.rate);
        if((this.age&2047)===0){
          this.extensionBeat=musicalBeat;
          const depthState=padDepthMotionState(s,musicalBeat);
          this.applyPadDepthState(depthState);
          depth=.4+1.4*depthState.position;
          echoTarget=Math.min(.2,(sound.echo||0)*depth);
        }
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
        const foundation=voice.role==='foundation'&&sound.foundation?readWave(SINE,voice.subPhase)*sound.foundation*depth*(s.bass?.25:1):0;
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
      // A high inner voice moves between chord colours in slow, breath-like
      // swells. Pitches change at the silent edge of each cell, avoiding
      // retrigger clicks while keeping a pedal chord gently alive.
      if(this.motionNotes?.length){
        const cellLengthBeats=s.padMovement==='expansive'?1:2;
        const position=this.chordAge*this.currentBpm/(60*this.rate*cellLengthBeats);
        const cell=Math.floor(position),fraction=position-cell;
        if(cell!==this.motionCell){
          this.motionCell=cell;
          const midi=this.motionNotes[(cell+this.step)%this.motionNotes.length];
          this.motionFrequency=440*2**((midi-69)/12);
        }
        this.motionPhase+=this.motionFrequency*inverseRate;
        if(this.motionPhase>=1)this.motionPhase-=Math.floor(this.motionPhase);
        const swell=Math.sin(Math.PI*fraction)**2;
        const motionGain={still:.018,evolving:.04,expansive:.065}[s.padMovement]||.04;
        const motion=readWave(SINE,this.motionPhase)*swell*motionGain;
        const motionPan=.36*Math.sin(cell*1.7);
        chord+=motion*(1-motionPan);chordRight+=motion*(1+motionPan);
      }
      const clickSample = this.level * .3 * (this.auditioning ? 0 : this.clickLevel*(click*this.clickStrength + 1.4*polyClick));
      // Give transients and bass fundamentals a little room against the pad.
      // The existing smoothed bus levels make this duck inaudible as a control
      // change while improving the perceived balance of the full ensemble.
      const rhythmDucking=1-.12*Math.max(this.drumsLevel,this.bassLevel);
      let left=.37*this.harmonyLevel*chord*this.breath*this.phraseArc*rhythmDucking+.15*this.sequenceLevel*this.sequence.left;
      let right=.37*this.harmonyLevel*chordRight*this.breath*this.phraseArc*rhythmDucking+.15*this.sequenceLevel*this.sequence.right;
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
      // Post-fader, post-gap dry channel peaks. Monitoring never alters audio.
      const peak=this.meterPeaks,gate=this.level*backingGate;
      const clickPeak=Math.abs(clickSample*clickGate*.92);
      peak[0]=Math.max(peak[0],clickPeak);peak[1]=Math.max(peak[1],clickPeak);
      peak[2]=Math.max(peak[2],Math.abs(gate*.37*this.harmonyLevel*chord*this.breath*this.phraseArc*rhythmDucking));
      peak[3]=Math.max(peak[3],Math.abs(gate*.37*this.harmonyLevel*chordRight*this.breath*this.phraseArc*rhythmDucking));
      const drumPeak=Math.abs(gate*.5*this.drumsLevel*this.rhythm.drums),bassPeak=Math.abs(gate*.3*this.bassLevel*this.rhythm.bass),compPeak=Math.abs(gate*.24*this.compingLevel*comping);
      peak[4]=Math.max(peak[4],drumPeak);peak[5]=Math.max(peak[5],drumPeak);
      peak[6]=Math.max(peak[6],bassPeak);peak[7]=Math.max(peak[7],bassPeak);
      peak[8]=Math.max(peak[8],compPeak);peak[9]=Math.max(peak[9],compPeak);
      peak[10]=Math.max(peak[10],Math.abs(gate*.15*this.sequenceLevel*this.sequence.left));
      peak[11]=Math.max(peak[11],Math.abs(gate*.15*this.sequenceLevel*this.sequence.right));
      if (gapOutput) gapOutput[i] = backingGate;
      const backingSample=this.level*left*backingGate;
      const rightSample=this.level*right*backingGate;
      const combined=(harmonyOutput ? clickSample*clickGate : clickSample*clickGate + backingSample) + (rhythmOutput ? 0 : rhythmSample*backingGate);
      output[i]=combined*.92;
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
