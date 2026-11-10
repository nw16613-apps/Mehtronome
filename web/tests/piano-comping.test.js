import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pianoVoicings} from '../src/audio/piano-voicings.js';
import {harmonyAt,CHORDS} from '../src/audio/music.js';
import {recommendedMode,normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {DEFAULTS} from '../src/audio/engine.js';
import {referencePlan,referenceChart} from '../src/audio/reference-performances.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
import {COMPING_TRIMS} from '../src/audio/mix-balance.js';
import {CompingInstrument} from '../src/audio/comping.js';
import {readSampleBank} from '../scripts/read-sample-bank.mjs';
const settings=id=>{const c=referenceChart(id);return {...DEFAULTS,...BACKING_STYLES[id].settings,...backingStyleInstruments(id),automaticBacking:true,backingStyle:id,key:c.key,beats:c.beats,progression:true,template:'custom',customProgression:normalizeCustomProgression(c.progression),sequenceActivity:'supporting'};};
test('piano vocabulary retains defining tones and offers mode-compatible colour combinations in every key',()=>{
 for(let key=0;key<12;key++)for(const [chord,mode]of [['min7','dorian'],['maj7','lydian'],['dom7','mixolydian'],['halfDim','locrian']]){
  const h={...harmonyAt({key,chord,mode}),root:key,chord},choices=pianoVoicings(h),ints=CHORDS[chord].intervals;assert.ok(choices.length>=12,chord);
  assert.ok(new Set(choices.map(v=>v.map(n=>n%12).sort().join(','))).size>=4,chord+' multiple colours');
  for(const notes of choices){const pcs=notes.map(n=>n%12);for(const degree of [ints[1],ints.find(n=>n>=9&&n<=11),...ints.filter(n=>n===6||n===8)])assert.ok(pcs.includes((key+degree)%12));assert.ok(pcs.every(n=>h.chordPcs.includes(n)||h.scalePcs.includes(n)));assert.ok(notes.length>=3&&notes.length<=4);if(ints.includes(4))assert.ok(!pcs.includes((key+5)%12));}
 }
 for(const chord of ['major','minor','sus4','augmented','fifth']){const h=harmonyAt({key:0,chord,mode:recommendedMode(chord)}),choices=pianoVoicings({...h,root:0,chord});assert.ok(choices.length);assert.ok(choices.every(v=>v.every(n=>h.chordPcs.includes(n%12))));}
});
test('acoustic-piano styles retain authored attacks throughout melody coordination and later session contrasts',()=>{
 for(const id of Object.keys(BACKING_STYLES)){
  const s=settings(id);if(s.compingTone!=='acousticPiano')continue;
  const score=referencePlan(s).score;assert.equal(score.interaction.collisionsRemoved,0,id);
  assert.ok(score.comping.flat().every(e=>e.notes.length>=3&&e.notes.length<=4),id+' full chords');
  for(const variant of score.sessionPerformance.variants.slice(1))for(const [grid,events]of Object.entries(variant.comping||{}))assert.ok(!score.comping[grid].length||events.length,id+' no second hidden piano dropout');
  if(id==='traditionalJazz'){
   for(let bar=0;bar<score.bars;bar++)assert.ok(score.comping.slice(bar*48,(bar+1)*48).flat().length>=2,'at least two strokes per jazz bar');
   assert.ok(new Set(score.comping.flat().map(e=>e.notes.join(','))).size>=8,'voicing movement');
  }
 }
});
const rate=8000,kit=await readSampleBank(rate);
test('recorded acoustic piano has clear dynamic layers and natural damper releases',()=>{
 const instrument=new CompingInstrument(rate);instrument.installKit(kit);instrument.soundLibrary='expanded';
 for(const velocity of [.2,.4,.7]){instrument.clear();instrument.strike([60],.4,velocity,120,0,0,undefined,'comping','acousticPiano',0,null,'damped');const voice=instrument.voices.find(v=>v.active);assert.equal(voice.sourceId.match(/v(\d)/)[1],velocity===.2?'2':velocity===.4?'3':'4');assert.equal(voice.gain,velocity*.65*COMPING_TRIMS.acousticPiano);assert.ok(voice.shape.attackFrames<rate*.005);assert.ok(voice.releaseFactor>Math.exp(-1/(rate*.035)));}
 const tail=expression=>{instrument.clear();instrument.strike([60,64,67],.4,.5,120,0,0,undefined,'comping','acousticPiano',0,null,expression);let energy=0;for(let i=0;i<rate;i++){const value=instrument.render();assert.ok(Number.isFinite(value));if(i>rate*.4)energy+=value*value;}return energy;};
 assert.ok(tail('damped')>.001);assert.ok(tail('ringing')>tail('damped')*2);
});
