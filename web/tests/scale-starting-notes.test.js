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
test('triplet degree entries preserve twelve-note runs, directional blocks and full positional coverage',()=>{
 for(const [mode,def]of Object.entries(MODES))for(const key of [0,9])for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode,chord:def.chord}),base=run(h,shape,'triplets','default',motion),span=base.positionalSpan;
  for(const degree of ['1','3','5','7']){const state=scaleStartingState(span,h,motion==='descending',degree+':0',true),g=run(h,shape,'triplets',degree+':0',motion);if(!state.supported){assert.deepEqual(g.notes,base.notes);assert.ok(g.warning);continue;}assert.equal(g.notes[0].midi,state.note.midi);assert.deepEqual([...new Set(g.notes.map(n=>n.midi))].sort((a,b)=>a-b),span.map(n=>n.midi));for(let start=0;start<48;start+=12){const down=(motion==='descending')!==(start>=24);for(let i=start+1;i<start+12;i++)assert.ok(down?g.notes[i].midi<=g.notes[i-1].midi:g.notes[i].midi>=g.notes[i-1].midi);}}
 }
});
test('degree-based scale traversal remains continuous through mixed chord and assigned-position changes',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:0,mode:'dorian',chord:'min7'}),harmonyAt({key:3,mode:'mixolydian',chord:'dom7'})],ss=['D','E','A'],ds=[1,3,4];
 for(const rhythm of ['eighths','sixteenths','triplets'])for(const degree of ['1','3','5','7']){const path=hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i])),geometryShape:ss[i]})),gs=progressionExerciseGroups(hs,ds,fretboardFor(hs[0],'D'),{study:'positionalscale',rhythm,startTone:degree+':0',positionPath:path});for(const [i,g]of gs.entries()){assert.equal(g.notes.length,ds[i]*(rhythm==='eighths'?2:rhythm==='triplets'?3:4));for(const n of g.notes)assert.ok(g.board.notes.some(p=>p.midi===n.midi&&p.string===n.string&&p.fret===n.fret));}}
});
