import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHORDS,harmonyAt} from '../src/audio/music.js';
import {recommendedMode} from '../src/practice/custom-progression.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
const shapes=['C','A','G','E','D'];
const pathFor=(hs,shapes)=>hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,shapes[i])),geometryShape:shapes[i]}));
const run=(hs,shapes,durations,motion='ascending')=>progressionExerciseGroups(hs,durations,fretboardFor(hs[0],shapes[0]),{study:'positional',motion,rhythm:'sixteenths',positionPath:pathFor(hs,shapes)});
test('reported II, II, III, III phrase starts bar 3 on low E and keeps the two-beat halves',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=Array(4).fill(h),groups=run(hs,['C','C','A','A'],[4,4,4,4]);
 const first=[48,52,55,57,60,64,67,69,72,69,67,64,60,57,55,52],second=[52,55,57,60,64,67,69,72,76,72,69,67,64,60,57,55];
 assert.deepEqual(groups.map(g=>g.notes.map(n=>n.midi)),[first,first,second,second]);
 assert.deepEqual([groups[2].notes[0].string,groups[2].notes[0].fret,groups[2].notes[0].name],[0,12,'E']);
 const plan=progressionStudyPlan(groups,[0,1,2,3],[1,1,1,1],4,'positional','sixteenths');
 assert.equal(plan.events.find(e=>e.start===8).note.midi,52);assert.equal(plan.events.find(e=>e.start===10).note.midi,76);
 assert.ok(groups.every(g=>g.notes.length===16));
});
test('all positions retain every arpeggio pitch and ordinary turns never duplicate an endpoint',()=>{
 for(let key=0;key<12;key++)for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode:'dorian',chord:'min7'}),gs=run([h,h],[shape,shape],[16,16],motion),notes=gs.flatMap(g=>g.notes),available=[...new Set(gs[0].board.notes.filter(n=>h.chordPcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b);
  assert.deepEqual([...new Set(notes.map(n=>n.midi))].sort((a,b)=>a-b),available);
  for(let i=1;i<notes.length;i++)assert.notEqual(notes[i].midi,notes[i-1].midi,`${key} ${shape} ${motion} ${i}`);
 }
});
test('all position transitions rearticulate a shared boundary only when forced to reverse',()=>{
 let sharedBottom=0,sharedTop=0;
 for(const chord of Object.keys(CHORDS))for(const key of [0,6,9])for(const from of shapes)for(const to of shapes)if(from!==to)for(const motion of ['ascending','descending'])for(const duration of [1,2,4]){
  const h=harmonyAt({key,mode:recommendedMode(chord),chord}),[before,after]=run([h,h],[from,to],[duration,4],motion),last=before.notes.at(-1).midi,direction=Math.sign(last-before.notes.at(-2).midi),available=[...new Set(after.board.notes.filter(n=>h.chordPcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>(a-b)*direction);
  const forward=available.filter(midi=>(midi-last)*direction>0);
  if(!forward.length&&available.includes(last)){
   assert.equal(after.notes[0].midi,last,`${key} ${from}->${to} ${motion} ${duration}`);
   assert.equal(Math.sign(after.notes[1].midi-after.notes[0].midi),-direction);
   if(direction<0)sharedBottom++;else sharedTop++;
  }else if(forward.length)assert.equal(after.notes[0].midi,forward[0]);
 }
 assert.ok(sharedBottom>0&&sharedTop>0,'exercise both shared-edge reversals');
});

test('the mirrored high-boundary turn retains the downward-first two-beat halves',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),groups=run(Array(4).fill(h),['A','A','C','C'],[4,4,4,4],'descending');
 const before=[76,72,69,67,64,60,57,55,52,55,57,60,64,67,69,72],after=[72,69,67,64,60,57,55,52,48,52,55,57,60,64,67,69];
 assert.deepEqual(groups.map(g=>g.notes.map(n=>n.midi)),[before,before,after,after]);
 assert.deepEqual([groups[2].notes[0].string,groups[2].notes[0].fret],[5,8]);
});
test('shared-boundary entry is independent of subdivision and slots keep their time',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=Array(4).fill(h),positionPath=pathFor(hs,['C','C','A','A']);
 for(const [rhythm,division]of [['eighths',2],['triplets',3],['sixteenths',4]]){
  const groups=progressionExerciseGroups(hs,[8,8,8,8],fretboardFor(h,'C'),{study:'positional',rhythm,positionPath});
  const plan=progressionStudyPlan(groups,[0,1,2,3],[2,2,2,2],4,'positional',rhythm);
  assert.equal(groups[2].notes[0].midi,52);assert.equal(groups[2].notes[8].midi,76);
  assert.ok(groups.every(g=>g.notes.length===8*division));assert.equal(plan.duration,32);assert.equal(plan.events.find(e=>e.slot===2).start,16);
 }
});
