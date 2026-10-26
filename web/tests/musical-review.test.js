import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHORDS,MODES,harmonyAt,progressionDefinition} from '../src/audio/music.js';
import {POSITIONS,TUNING,fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {recommendedGrip} from '../src/guitar/grips.js';
import {writtenPitch,staffY,notationAccidental} from '../src/practice/notation-pitch.js';
import {cagedProgressionExercise,exerciseNotationSvg} from '../src/guitar/exercises.js';
import {progressionNotationSvg} from '../src/practice/progression-notation.js';
import {romanForStep} from '../src/practice/custom-progression.js';
const pcOf=name=>{const natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[name[0]];return (natural+[...name.slice(1)].reduce((n,c)=>n+(c==='♯'?1:c==='♭'?-1:0),0)+24)%12;};
test('every mode and key has five distinct root frameworks and correctly spelled physical pitches',()=>{
 for(const [mode,definition]of Object.entries(MODES))for(let key=0;key<12;key++){
  const h=harmonyAt({key,mode,chord:definition.chord}),seen=new Set();
  h.tones.forEach((name,i)=>assert.equal(pcOf(name),h.chordPcs[i],`${mode} ${name}`));
  h.scaleNames.forEach((name,i)=>assert.equal(pcOf(name),h.scalePcs[i]));
  for(const p of POSITIONS){
   const b=fretboardFor(h,p.shape),id=cagedPositionFor(b);seen.add(id.numeral);
   assert.equal(cagedPositionFor(fretboardFor(h,p.shape,true)).numeral,id.numeral);
   for(const n of b.notes){assert.equal(n.midi,TUNING[n.string]+n.fret);assert.equal(pcOf(n.name),n.pc);}
  }
  assert.equal(seen.size,5,`${mode} ${key}: all positions must remain selectable`);
 }
});
test('suggested grips retain quality-defining tones, disclose omissions and respect a requested slash bass',()=>{
 for(const chord of Object.keys(CHORDS))for(let key=0;key<12;key++)for(const p of POSITIONS){
  const h=harmonyAt({key,mode:'major',chord}),g=recommendedGrip(h,fretboardFor(h,p.shape));if(!g)continue;
  assert.equal(new Set(g.notes.map(n=>n.string)).size,g.notes.length);assert.ok(g.span<=3);assert.ok(g.notes.length<=4);
  for(const n of g.notes){assert.equal(n.midi,TUNING[n.string]+n.fret);assert.ok(h.chordPcs.includes(n.pc));assert.equal(pcOf(n.name),n.pc);}
  for(const interval of ['♭3','3','♭5','♯5','6','♭7','7','♭♭7']){const i=h.intervals.indexOf(interval);if(i>=0)assert.ok(g.notes.some(n=>n.pc===h.chordPcs[i]),`${chord}: ${interval}`);}
  assert.deepEqual(g.omitted,h.tones.filter((_,i)=>!g.notes.some(n=>n.pc===h.chordPcs[i])));
 }
 const h=harmonyAt({key:0,mode:'major',chord:'maj7'});
 for(const bass of [0,4,7,11,2])for(const p of POSITIONS){const g=recommendedGrip({...h,bassMidi:36+bass},fretboardFor(h,p.shape));if(g)assert.equal(g.notes.toSorted((a,b)=>a.midi-b.midi)[0].pc,bass);}
});
test('diatonic Roman numerals reflect real qualities and altered scale degrees',()=>{
 for(const [mode,expected]of [['major',['Imaj7','vi7','IVmaj7','V7']],['minor',['i7','♭VImaj7','iv7','v7']],['dorian',['i7','viø7','IV7','v7']],['lydian',['Imaj7','vi7','♯ivø7','Vmaj7']]]){
  for(let key=0;key<12;key++){const s={key,mode,template:'diatonic',progression:true};assert.deepEqual([0,1,2,3].map(i=>harmonyAt(s,i).roman),expected);assert.deepEqual(progressionDefinition(s).roman,expected);}
 }
 assert.equal(romanForStep({root:2,chord:'halfDim9'}),'iiø9');assert.equal(romanForStep({root:6,chord:'dim7'}),'♭v°7');
});
test('ninth arpeggio names retain minor and major seventh quality',()=>{
 const h=harmonyAt({key:0,mode:'major',chord:'maj9'}),names=new Set();
 for(const p of POSITIONS)for(const g of cagedProgressionExercise(fretboardFor(h,p.shape),h,'extensions'))names.add(g.chord);
 assert.ok(names.has('Dm9'));assert.ok(names.has('Cmaj9'));assert.ok(names.has('Em7(♭9)'));assert.ok(!names.has('D9'));
});
test('staff position uses written octave and accidentals cancel within each bar in both renderers',()=>{
 assert.deepEqual(writtenPitch({name:'B♯',midi:60}),{letter:6,alteration:1,octave:3});assert.equal(writtenPitch({name:'C♭',midi:59}).octave,4);assert.equal(staffY({name:'B♯',midi:60}),staffY({name:'B',midi:59}));
 const state=new Map();assert.equal(notationAccidental({name:'F♯',midi:66},state),'♯');assert.equal(notationAccidental({name:'F♯',midi:66},state),'');assert.equal(notationAccidental({name:'F',midi:65},state),'♮');state.clear();assert.equal(notationAccidental({name:'F',midi:65},state),'');
 const notes=[{name:'F♯',midi:66,string:5,fret:2},{name:'F',midi:65,string:5,fret:1}],groups=[{chord:'C',notes}];assert.match(exerciseNotationSvg(groups),/>♮<\/text>/);
 const plan={beats:4,duration:4,division:2,study:'harmonized',slots:[{slot:0,start:0,duration:4,chord:'C',annotation:''}],events:notes.map((note,index)=>({note,index,slot:0,start:index/2,duration:.5}))};assert.match(progressionNotationSvg(plan,'Example'),/>♮<\/text>/);
});
test('guide tones use actual thirds/sevenths rather than arbitrary chord array positions',async()=>{
 const {alignedProgressionGroups}=await import('../src/guitar/exercises.js');
 for(const chord of ['dom7alt','six','sus2','sevenSus','dim7']){
  const h=harmonyAt({key:4,mode:chord==='dom7alt'?'altered':'major',chord});
  for(const p of POSITIONS){const b=fretboardFor(h,p.shape),groups=alignedProgressionGroups(b,[h],'guidetones','seventh','ascending',[b]);for(const n of groups.flatMap(g=>g.notes)){const i=h.chordPcs.indexOf(n.pc);assert.ok(['3','♭3','7','♭7','♭♭7'].includes(h.intervals[i]));assert.equal(n.name,h.tones[i]);}}
 }
});
