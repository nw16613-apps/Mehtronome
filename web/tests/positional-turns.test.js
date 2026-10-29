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
test('all five positions use exactly nine consecutive pitches and repeat the two-beat halves',()=>{
 for(let key=0;key<12;key++)for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode:'dorian',chord:'min7'}),gs=run(Array(4).fill(h),Array(4).fill(shape),[4,4,4,4],motion);
  const available=[...new Set(gs[0].board.notes.filter(n=>h.chordPcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b),span=motion==='ascending'?available.slice(0,9):available.slice(-9);
  const forward=motion==='ascending'?span:span.toReversed(),expected=[...forward,...forward.slice(1,-1).toReversed()];
  for(const group of gs){assert.equal(group.positionalSpan.length,9);assert.deepEqual(group.notes.map(n=>n.midi),expected);assert.equal(group.phraseCycleLength,16);assert.deepEqual(group.cellLengths,[8,8]);}
 }
});
test('every position/chord transition retains phrase phase rather than skipping to a new note index',()=>{
 for(const chord of Object.keys(CHORDS))for(const key of [0,6,9])for(const from of shapes)for(const to of shapes)if(from!==to)for(const motion of ['ascending','descending'])for(const duration of [1,2,4]){
  const h=harmonyAt({key,mode:recommendedMode(chord),chord}),gs=run([h,h],[from,to],[duration,4],motion);let cursor=0;
  for(const group of gs){
   const available=[...new Set(group.board.notes.filter(n=>h.chordPcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b),span=group.positionalSpan.map(n=>n.midi),size=Math.min(9,available.length);
   assert.equal(span.length,size);assert.deepEqual(span,available.slice(available.indexOf(span[0]),available.indexOf(span[0])+size));
   const cycleLength=Math.max(1,2*(size-1));assert.equal(group.phrasePhase,cursor%cycleLength);
   for(let i=0;i<group.notes.length;i++){const phase=(cursor+i)%cycleLength,upIndex=phase<size?phase:cycleLength-phase,index=motion==='ascending'?upIndex:size-1-upIndex;assert.equal(group.notes[i].midi,span[index]);}
   if(size<9)assert.ok(group.warning.includes('shorter phrase'));
   cursor+=group.notes.length;
  }
 }
});

test('the mirrored high-boundary turn retains the downward-first two-beat halves',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),groups=run(Array(4).fill(h),['A','A','C','C'],[4,4,4,4],'descending');
 const before=[76,72,69,67,64,60,57,55,52,55,57,60,64,67,69,72],after=[72,69,67,64,60,57,55,52,48,52,55,57,60,64,67,69];
 assert.deepEqual(groups.map(g=>g.notes.map(n=>n.midi)),[before,before,after,after]);
 assert.deepEqual([groups[2].notes[0].string,groups[2].notes[0].fret],[5,8]);
});
test('shared-boundary entry is independent of subdivision and slots keep their time',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=Array(4).fill(h),positionPath=pathFor(hs,['C','C','A','A']);
 for(const [rhythm,division]of [['eighths',2],['sixteenths',4]]){
  const groups=progressionExerciseGroups(hs,[8,8,8,8],fretboardFor(h,'C'),{study:'positional',rhythm,positionPath});
  const plan=progressionStudyPlan(groups,[0,1,2,3],[2,2,2,2],4,'positional',rhythm);
  assert.equal(groups[2].notes[0].midi,52);assert.equal(groups[2].notes[8].midi,76);
  assert.ok(groups.every(g=>g.notes.length===8*division));assert.equal(plan.duration,32);assert.equal(plan.events.find(e=>e.slot===2).start,16);
 }
});

test('arpeggios with fewer available pitches stay inside the diagram and disclose their shorter span',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'minor'}),[g]=run([h],['C'],[4]);
 assert.ok(g.positionalSpan.length<9);assert.ok(g.warning.includes('shorter phrase'));
 assert.ok(g.notes.every(n=>g.board.notes.some(p=>p.midi===n.midi&&p.string===n.string&&p.fret===n.fret)));
});

test('triplets use seven pitches and two-beat halves in every Am7 position and key',()=>{
 for(let key=0;key<12;key++)for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode:'dorian',chord:'min7'}),hs=Array(4).fill(h);
  const gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(h,shape),{study:'positional',motion,rhythm:'triplets',positionPath:pathFor(hs,Array(4).fill(shape))});
  const available=[...new Set(gs[0].board.notes.filter(n=>h.chordPcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b);
  const span=motion==='ascending'?available.slice(0,7):available.slice(-7),ordered=motion==='ascending'?span:span.toReversed(),expected=[...ordered,...ordered.slice(1,-1).toReversed()];
  for(const g of gs){assert.deepEqual(g.positionalSpan.map(n=>n.midi),span);assert.deepEqual(g.notes.map(n=>n.midi),expected);assert.deepEqual(g.cellLengths,[6,6]);assert.equal(g.phraseCycleLength,12);assert.equal(g.phraseSpanSize,7);assert.equal(g.warning,'');}
  const plan=progressionStudyPlan(gs,[0,1,2,3],[1,1,1,1],4,'positional','triplets');
  assert.equal(plan.duration,16);assert.equal(plan.events[6].start,2);assert.equal(plan.events[12].start,4);
 }
});
test('triplet chord and position changes preserve phase and actual notes, including partial-bar changes',()=>{
 for(const chord of Object.keys(CHORDS))for(const from of shapes)for(const to of shapes)for(const motion of ['ascending','descending'])for(const duration of [1,2,4]){
  const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:0,mode:recommendedMode(chord),chord})];
  const gs=progressionExerciseGroups(hs,[duration,4],fretboardFor(hs[0],from),{study:'positional',motion,rhythm:'triplets',positionPath:pathFor(hs,[from,to])});
  let cursor=0;
  for(const g of gs){
   const available=[...new Set(g.board.notes.filter(n=>g.harmony.chordPcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b),span=g.positionalSpan.map(n=>n.midi),size=Math.min(7,available.length),cycleLength=Math.max(1,2*(size-1));
   assert.equal(span.length,size);assert.deepEqual(span,available.slice(available.indexOf(span[0]),available.indexOf(span[0])+size));assert.equal(g.phrasePhase,cursor%cycleLength);
   for(let i=0;i<g.notes.length;i++){const phase=(cursor+i)%cycleLength,index=phase<size?phase:cycleLength-phase;assert.equal(g.notes[i].midi,span[motion==='ascending'?index:size-1-index]);assert.ok(g.board.notes.some(n=>n.midi===g.notes[i].midi&&n.string===g.notes[i].string&&n.fret===g.notes[i].fret));}
   if(size<7)assert.match(g.warning,/shorter phrase/);else assert.equal(g.warning,'');
   cursor+=g.notes.length;
  }
 }
});

test('full-position triplets alternate full-range forms every bar in all positions',()=>{
 for(let key=0;key<12;key++)for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode:'dorian',chord:'min7'}),hs=Array(4).fill(h);
  const gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(h,shape),{study:'positional',rhythm:'triplets',phrase:'turnaround',motion,positionPath:pathFor(hs,Array(4).fill(shape))});
  const available=[...new Set(gs[0].board.notes.filter(n=>h.chordPcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b),ordered=motion==='ascending'?available:available.toReversed();
  const indices=available.length===9?[0,1,2,3,4,5,6,7,8,7,6,7]:[0,1,2,3,4,5,6,7,8,9,8,7],expected=[...indices.map(i=>ordered[i]),...indices.map(i=>ordered[ordered.length-1-i])];
  assert.equal(expected.length,24);assert.deepEqual(gs.flatMap(g=>g.notes.map(n=>n.midi)),[...expected,...expected]);
  for(const g of gs){assert.deepEqual(g.positionalSpan.map(n=>n.midi),available);assert.equal(g.phraseCycleLength,24);assert.equal(g.warning,'');}
  const plan=progressionStudyPlan(gs,[0,1,2,3],[1,1,1,1],4,'positional','triplets');assert.equal(plan.events[24].start,8);assert.equal(plan.duration,16);
 }
});
test('turnarounds keep their 24-note phase through changing chords, ranges and positions',()=>{
 for(const from of shapes)for(const to of shapes)for(const motion of ['ascending','descending'])for(const duration of [1,2,4]){
  const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:0,mode:'dorian',chord:'min7'})];
  const gs=progressionExerciseGroups(hs,[duration,8],fretboardFor(hs[0],from),{study:'positional',rhythm:'triplets',phrase:'turnaround',motion,positionPath:pathFor(hs,[from,to])});let cursor=0;
  for(const g of gs){
   const ordered=motion==='ascending'?g.positionalSpan:g.positionalSpan.toReversed(),indices=ordered.length===9?[0,1,2,3,4,5,6,7,8,7,6,7]:[0,1,2,3,4,5,6,7,8,9,8,7],expected=[...indices.map(i=>ordered[i]),...indices.map(i=>ordered[ordered.length-1-i])];
   assert.equal(g.phrasePhase,cursor%24);assert.deepEqual(g.notes.map(n=>n.midi),Array.from({length:g.notes.length},(_,i)=>expected[(cursor+i)%24].midi));assert.ok(g.notes.every(n=>g.board.notes.some(p=>p.midi===n.midi&&p.string===n.string&&p.fret===n.fret)));cursor+=g.notes.length;
  }
 }
});
test('full-position turnaround handles all chord types without leaving the available range',()=>{
 for(const chord of Object.keys(CHORDS))for(const shape of shapes){
  const h=harmonyAt({key:9,mode:recommendedMode(chord),chord}),[g]=progressionExerciseGroups([h],[16],fretboardFor(h,shape),{study:'positional',rhythm:'triplets',phrase:'turnaround',positionPath:pathFor([h],[shape])});
  const available=[...new Set(g.board.notes.filter(n=>h.chordPcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b);
  assert.deepEqual(g.positionalSpan.map(n=>n.midi),available);assert.ok(g.notes.every(n=>available.includes(n.midi)));if(available.length>1)assert.equal(g.phraseCycleLength%24,0);
 }
});
