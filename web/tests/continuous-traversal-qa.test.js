import {test} from 'node:test';import assert from 'node:assert/strict';import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {perStringExerciseGroups} from '../src/practice/per-string-exercises.js';import {progressionStudyPlan} from '../src/practice/progression-timing.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'C'),position=cagedPositionFor(board);
test('incomplete old traversal presets restore without crashing and retain supported defaults',()=>{for(const snapshot of [{},{stage:'cell'},{startTone:'3:2'},{study:null},{study:''}]){const view=normalizeExerciseOptions(snapshot);assert.equal(view.study,'positional');assert.equal(view.stage,'full');}});
test('continuous scale/core material cannot silently play the other material through a mismatched fingering',()=>{
 for(const fingering of ['three','oneTwo','twoOne','drop2','drop3']){assert.equal(normalizeExerciseOptions({study:'positionalscale',fingering}).fingering,'three');const core=normalizeExerciseOptions({study:'positional',fingering});assert.notEqual(core.fingering,'three');}
 assert.equal(normalizeExerciseOptions({study:'positional',fingering:'three',inversion:6}).inversion,0);
 for(const study of ['positional','positionalscale'])assert.equal(normalizeExerciseOptions({study,fingering:'caged'}).fingering,'caged');
});
test('continuous core-tone leg brackets retain their cell size and phase through short chord slots',()=>{
 for(const rhythm of ['eighths','triplets','sixteenths']){const groups=progressionExerciseGroups(Array(8).fill(h),Array(8).fill(1),board,{study:'positional',rhythm,positionPath:Array(8).fill(position)}),plan=progressionStudyPlan(groups,Array.from({length:8},(_,i)=>i),Array(8).fill(.25),4,'positional',rhythm);
  for(const id of new Set(plan.events.map(e=>e.cellId))){const notes=plan.events.filter(e=>e.cellId===id);assert.ok(notes.length<=8);assert.deepEqual(notes.map(e=>e.cellOffset),Array.from({length:notes.length},(_,i)=>i));assert.ok(notes.every(e=>e.cellSize===8));}
 }
});
test('non-CAGED continuous legs retain their phase without repeating string/fret endpoints',()=>{
 for(const fingering of ['three','oneTwo','twoOne','drop2','drop3'])for(const rhythm of ['eighths','triplets','sixteenths'])for(const motion of ['ascending','descending']){
  const options={study:fingering==='three'?'positionalscale':'positional',fingering,fingeringFret:5,inversion:0,rhythm,motion},groups=perStringExerciseGroups(Array(8).fill(h),Array(8).fill(1),Array(8).fill(position),options),plan=progressionStudyPlan(groups,Array.from({length:8},(_,i)=>i),Array(8).fill(.25),4,options.study,rhythm);
  for(const g of groups){assert.equal(g.cellLengths.reduce((a,b)=>a+b,0),g.notes.length);for(let i=0;i<g.cellLengths.length;i++)assert.ok(g.cellOffsets[i]+g.cellLengths[i]<=g.cellSizes[i]);}
  for(let i=1;i<plan.events.length;i++)assert.notEqual(plan.events[i].note.midi,plan.events[i-1].note.midi);
 }
});
