import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const make=(h,shapes,durations,rhythm,motion='ascending',extra={})=>progressionExerciseGroups(shapes.map(()=>h),durations,fretboardFor(h,shapes[0]),{study:'positional',rhythm,motion,positionPath:shapes.map(shape=>({...cagedPositionFor(fretboardFor(h,shape)),geometryShape:shape})),...extra});
test('reported Aadd9 triplet bar three starts on low-string C sharp in Position III',()=>{
 const h=harmonyAt({key:9,chord:'add9',mode:'major'}),groups=make(h,['E','D','C','A'],[4,4,4,4],'triplets');
 assert.deepEqual([groups[2].notes[0].name,groups[2].notes[0].string,groups[2].notes[0].fret],['C♯',0,9]);
 assert.deepEqual(groups.map(g=>g.phrasePhase),[0,0,0,0]);assert.deepEqual(groups.map(g=>g.notes.length),[12,12,12,12]);
});
test('new triad and seventh-chord positions enter at the chosen range edge in all rhythms',()=>{
 for(const [chord,mode]of [['major','major'],['minor','minor'],['add9','major'],['min7','dorian']])for(const rhythm of ['eighths','triplets','sixteenths'])for(const motion of ['ascending','descending']){
  const h=harmonyAt({key:9,chord,mode});for(const g of make(h,['E','D','C','A'],[1,3,2,4],rhythm,motion))assert.equal(g.notes[0].midi,motion==='ascending'?g.positionalSpan[0].midi:g.positionalSpan.at(-1).midi);
 }
});
test('unchanged bars retain their cursor and explicit Pattern start still takes precedence',()=>{
 const h=harmonyAt({key:9,chord:'add9',mode:'major'});
 for(const rhythm of ['eighths','triplets','sixteenths']){
  const split=make(h,['E','E','E'],[1,2,3],rhythm),whole=make(h,['E'],[6],rhythm);assert.deepEqual(split.flatMap(g=>g.notes),whole[0].notes);
  const chosen=make(h,['E','D','C','A'],[4,4,4,4],rhythm,'ascending',{startTone:'5:0',startTones:['inherit','inherit','default','3:0']});
  assert.equal(chosen[0].notes[0].pc,4);assert.equal(chosen[1].notes[0].pc,4);assert.equal(chosen[2].notes[0].midi,chosen[2].positionalSpan[0].midi);assert.equal(chosen[3].notes[0].pc,1);
 }
});
