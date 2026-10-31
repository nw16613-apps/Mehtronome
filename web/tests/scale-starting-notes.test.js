import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt} from '../src/audio/music.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {scaleStartingState} from '../src/practice/scale-start.js';
import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';
const shapes=['C','A','G','E','D'];
const run=(h,shape,rhythm,startTone,motion='ascending')=>progressionExerciseGroups([h],[16],fretboardFor(h,shape),{study:'positionalscale',rhythm,startTone,motion,positionPath:[{...cagedPositionFor(fretboardFor(h,shape)),geometryShape:shape}]})[0];
test('restored scope settings always migrate to continuous playback',()=>{for(const stage of ['cell','full','apply',undefined])assert.equal(normalizeExerciseOptions({stage}).stage,'full');});
test('eighth and sixteenth scales start on each available structural degree then follow the same traversal',()=>{
 for(const [mode,def]of Object.entries(MODES))for(const key of [0,9])for(const shape of shapes)for(const motion of ['ascending','descending'])for(const rhythm of ['eighths','sixteenths']){
  const h=harmonyAt({key,mode,chord:def.chord}),span=cagedStudy(fretboardFor(h,shape),h,'positionalscale','seventh','ascending').flatMap(c=>c.notes),ordered=motion==='descending'?span.toReversed():span,cycle=[...ordered,...ordered.slice(1,-1).toReversed()];
  for(const degree of ['1','3','5','7']){const state=scaleStartingState(span,h,motion==='descending',degree+':0'),g=run(h,shape,rhythm,degree+':0',motion);assert.deepEqual(g.notes,Array.from({length:rhythm==='eighths'?32:64},(_,i)=>cycle[(state.index+i)%cycle.length]));}
 }
});
test('triplet degree entries rotate the complete existing cycle, including every later restart and turn',()=>{
 for(const [mode,def]of Object.entries(MODES))for(const key of [0,9])for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode,chord:def.chord}),base=run(h,shape,'triplets','default',motion),span=base.positionalSpan;
  for(const degree of ['1','3','5','7']){const state=scaleStartingState(span,h,motion==='descending',degree+':0',true),g=run(h,shape,'triplets',degree+':0',motion);if(!state.supported){assert.deepEqual(g.notes,base.notes);assert.ok(g.warning);continue;}const offset=base.notes.findIndex(n=>n.midi===state.note.midi);assert.equal(g.notes[0].midi,state.note.midi);assert.equal(g.phraseCycleLength,base.phraseCycleLength);assert.deepEqual(g.notes,[...base.notes.slice(offset),...base.notes.slice(0,offset)]);assert.deepEqual([...new Set(g.notes.map(n=>n.midi))].sort((a,b)=>a-b),span.map(n=>n.midi));}
 }
});
test('degree-based scale traversal remains continuous through mixed chord and assigned-position changes',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:0,mode:'dorian',chord:'min7'}),harmonyAt({key:3,mode:'mixolydian',chord:'dom7'})],ss=['D','E','A'],ds=[1,3,4];
 for(const rhythm of ['eighths','sixteenths','triplets'])for(const degree of ['1','3','5','7']){const path=hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i])),geometryShape:ss[i]})),gs=progressionExerciseGroups(hs,ds,fretboardFor(hs[0],'D'),{study:'positionalscale',rhythm,startTone:degree+':0',positionPath:path});for(const [i,g]of gs.entries()){assert.equal(g.notes.length,ds[i]*(rhythm==='eighths'?2:rhythm==='triplets'?3:4));for(const n of g.notes)assert.ok(g.board.notes.some(p=>p.midi===n.midi&&p.string===n.string&&p.fret===n.fret));}}
});
test('triplet rotation carries the same elapsed phase through changed chords and CAGED positions',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:2,mode:'mixolydian',chord:'dom13'}),harmonyAt({key:7,mode:'lydian',chord:'maj9sharp11'}),harmonyAt({key:0,mode:'minor_pentatonic',chord:'min7'})],ss=['D','C','A','G'],ds=[3,5,2,6];
 for(const motion of ['ascending','descending'])for(const degree of ['1','3','5','7']){const gs=progressionExerciseGroups(hs,ds,fretboardFor(hs[0],ss[0]),{study:'positionalscale',rhythm:'triplets',motion,startTone:degree+':0',positionPath:hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i])),geometryShape:ss[i]}))});let cursor=0;for(const [i,g]of gs.entries()){const original=run(hs[i],ss[i],'triplets','default',motion).notes,state=scaleStartingState(g.positionalSpan,hs[i],motion==='descending',degree+':0'),offset=state.supported?original.findIndex(n=>n.midi===state.note.midi):0;assert.deepEqual(g.notes,Array.from({length:ds[i]*3},(_,n)=>original[(cursor+offset+n)%original.length]));assert.equal(g.phrasePhase,(cursor+offset)%original.length);cursor+=g.notes.length;}}
});
