import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compingChordVoicings,CompingInstrument} from '../src/audio/comping.js';
import {CHORDS,MODES,harmonyAt} from '../src/audio/music.js';
import {recommendedMode} from '../src/practice/custom-progression.js';
import {BACKING_STYLES} from '../src/practice/backing-styles.js';
import {DEFAULTS,Engine} from '../src/audio/engine.js';
test('every chord quality and root has compact full-chord variations; no missing third or seventh is invented for dyads/triads',()=>{
 for(const chord of Object.keys(CHORDS))for(let key=0;key<12;key++)for(const movement of ['still','inner','response','voiceLead']){
  const h=harmonyAt({key,mode:recommendedMode(chord),chord}),next=harmonyAt({key:(key+5)%12,mode:'major',chord:'maj7'}),voicings=compingChordVoicings(h,next,movement,4);
  assert.ok(voicings.length);for(const notes of voicings){assert.ok(notes.length>=3&&notes.length<=4);assert.ok(notes.every(n=>n>=55&&n<=84&&h.chordPcs.includes(n%12)));assert.equal(new Set(notes).size,notes.length);assert.ok(notes.at(-1)-notes[0]<=19);}
  assert.deepEqual(voicings,compingChordVoicings(h,next,movement,4));
 }
});
test('modal comping uses complete scale chords sharing a backing guide tone and never anticipates the next chord',()=>{
 let colours=0;
 for(const [mode,def]of Object.entries(MODES))for(const key of [0,9]){
  const h=harmonyAt({key,mode,chord:def.chord}),next=harmonyAt({key:(key+1)%12,mode:'major',chord:'major'}),voicings=compingChordVoicings(h,next,'modal',4);
  const guides=h.chordPcs.filter((_,i)=>['3','7'].includes(h.intervals[i]?.match(/\d+/)?.[0]));
  for(const notes of voicings){assert.ok(notes.length>=3);if(notes.some(n=>!h.chordPcs.includes(n%12))){colours++;assert.ok(notes.every(n=>h.scalePcs.includes(n%12)||h.chordPcs.includes(n%12)));assert.ok(notes.some(n=>guides.includes(n%12)));}}
 }
 assert.ok(colours>0);
});
test('written ninths and thirteenths remain available to comping rather than inheriting the exercise seventh limit',()=>{
 for(const [chord,colour]of [['maj9',2],['min13',9],['dom13',9]]){
  const h=harmonyAt({key:0,mode:recommendedMode(chord),chord});assert.ok(compingChordVoicings(h,h,'still')[0].some(n=>n%12===colour),chord);
 }
});
test('style figures retain their rhythm across voicing settings and combine chord fragments over changes',()=>{
 for(const [id,style]of Object.entries(BACKING_STYLES)){
  const render=amount=>{const e=new Engine(8000);e.configure({...DEFAULTS,...style.settings,comping:true,drums:false,bass:false,sequence:false,click:0,harmony:0,countIn:false,bpm:120,key:9,mode:'dorian',chord:'min7',progression:true,template:'major251essential',compingMovementAmount:amount});e.reset();const events=[];e.render(new Float32Array(64000),undefined,null,null,undefined,new Float32Array(64000),v=>events.push(v));return events;};
  const still=render(0),moving=render(1);assert.ok(moving.length,id);assert.ok(moving.every(e=>e.type==='comping'&&e.notes.length>=1&&e.notes.length<=4),id);
  assert.deepEqual(moving.map(e=>[e.sample,e.duration,e.velocity,e.step]),still.map(e=>[e.sample,e.duration,e.velocity,e.step]),id);
  assert.ok(moving.some(e=>e.notes.length<3),id+' includes individual voices/fragments');
 }
});
test('a legacy single-note hook array cannot produce any one-note comping event',()=>{
 const synth=new CompingInstrument(8000),events=[],s={...DEFAULTS,compingPattern:'fusion',compingMovement:'modal',compingMovementAmount:1};
 for(let beat=0;beat<4;beat++)for(let sub=0;sub<4;sub++)synth.tick(s,beat,sub/4,[60,64,67],[72,74,76],beat*4000+sub*1000,0,e=>events.push(e));
 assert.ok(events.length);assert.ok(events.every(e=>e.type==='comping'&&e.notes.length>=3));
});

test('extension vocabulary retains third and seventh while adding single and combined modal tensions',()=>{
 for(let key=0;key<12;key++)for(const [chord,mode,third,seventh] of [['min7','dorian',3,10],['maj7','lydian',4,11],['dom7','mixolydian',4,10],['halfDim','locrian',3,10]]){
  const h=harmonyAt({key,mode,chord}),vocabulary=compingChordVoicings(h,h,'extensions');assert.ok(vocabulary.length>=5,chord);
  const colours=vocabulary.filter(notes=>notes.some(n=>!h.chordPcs.includes(n%12)));assert.ok(colours.length>=3,chord);
  for(const notes of colours){const pcs=notes.map(n=>n%12);assert.ok(pcs.includes((key+third)%12)&&pcs.includes((key+seventh)%12));assert.ok(pcs.every(pc=>h.chordPcs.includes(pc)||h.scalePcs.includes(pc)));assert.ok(notes.length<=4);}
  if(chord==='min7')assert.ok(colours.some(notes=>[2,9].every(interval=>notes.some(n=>n%12===(key+interval)%12))),'rootless 9 + 13 colour');
  if(chord==='dom7')assert.ok(colours.every(notes=>notes.every(n=>n%12!==(key+5)%12)),'avoid natural 11 against the major third');
 }
});
test('extension movement respects triad, suspended and altered-fifth qualities without inventing a seventh',()=>{
 for(const chord of ['major','minor','sus2','sus4','dim7','halfDim','augmented']){
  const h=harmonyAt({key:0,chord,mode:recommendedMode(chord)}),notes=compingChordVoicings(h,h,'extensions');
  for(const v of notes){assert.ok(v.length>=3&&v.length<=4);assert.ok(v.every(n=>h.chordPcs.includes(n%12)||h.scalePcs.includes(n%12)));}
  if(['major','minor','sus2','sus4','augmented'].includes(chord))for(const v of notes)assert.ok(v.every(n=>![10,11].includes(n%12)),'triad does not acquire a seventh');
 }
});

test('written extended chords can vary between their existing and additional mode-compatible tensions',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min13'}),voicings=compingChordVoicings(h,h,'extensions');
 for(const pc of [11,2,6])assert.ok(voicings.some(notes=>notes.some(n=>n%12===pc)),`Am13 includes colour ${pc}`);
 assert.ok(voicings.some(notes=>[11,6].every(pc=>notes.some(n=>n%12===pc))),'9 and 13 together');
});
