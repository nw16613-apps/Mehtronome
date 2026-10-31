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
const shiftedScaleCycle=(span,down,shift)=>[down?span.toReversed():span,down?span:span.toReversed()].flatMap(ordered=>{
 if(ordered.length<=12){const pad=run=>[...Array(12-run.length).fill(run[0]),...run];return [...pad(ordered),...pad(ordered.length>1?ordered.slice(0,-1):ordered)];}
 return [...ordered.slice(shift,shift+12),...ordered.slice(ordered.length-13+shift,ordered.length-1+shift)];
});
test('triplet degree entries shift every run window while retaining bar alignment and full-range coverage',()=>{
 for(const [mode,def]of Object.entries(MODES))for(const key of [0,9])for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode,chord:def.chord}),base=run(h,shape,'triplets','default',motion),span=base.positionalSpan;
  for(const degree of ['1','3','5','7']){const state=scaleStartingState(span,h,motion==='descending',degree+':0',true),g=run(h,shape,'triplets',degree+':0',motion);if(!state.supported){assert.deepEqual(g.notes,base.notes);assert.ok(g.warning);continue;}assert.deepEqual(g.notes,shiftedScaleCycle(span,motion==='descending',state.index));assert.equal(g.phrasePhase,0);assert.equal(g.phraseCycleLength,48);assert.deepEqual([...new Set(g.notes.map(n=>n.midi))].sort((a,b)=>a-b),span.map(n=>n.midi));for(let start=0;start<48;start+=12){const down=(motion==='descending')!==(start>=24);for(let i=start+1;i<start+12;i++)assert.ok(down?g.notes[i].midi<=g.notes[i-1].midi:g.notes[i].midi>=g.notes[i-1].midi);}}
 }
});
test('reported Position II minor-third start matches both twelve-note ascents and mirrored descents',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),g=run(h,'C','triplets','3:0');
 assert.deepEqual(g.notes.map(n=>n.midi),[48,50,52,54,55,57,59,60,62,64,66,67,55,57,59,60,62,64,66,67,69,71,72,74,72,71,69,67,66,64,62,60,59,57,55,54,66,64,62,60,59,57,55,54,52,50,48,47]);
 assert.deepEqual([g.notes[0].string,g.notes[0].fret,g.notes[11].string,g.notes[11].fret,g.notes[12].string,g.notes[12].fret],[0,8,4,8,1,10]);
});
test('degree-based scale traversal remains continuous through mixed chord and assigned-position changes',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:0,mode:'dorian',chord:'min7'}),harmonyAt({key:3,mode:'mixolydian',chord:'dom7'})],ss=['D','E','A'],ds=[1,3,4];
 for(const rhythm of ['eighths','sixteenths','triplets'])for(const degree of ['1','3','5','7']){const path=hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i])),geometryShape:ss[i]})),gs=progressionExerciseGroups(hs,ds,fretboardFor(hs[0],'D'),{study:'positionalscale',rhythm,startTone:degree+':0',positionPath:path});for(const [i,g]of gs.entries()){assert.equal(g.notes.length,ds[i]*(rhythm==='eighths'?2:rhythm==='triplets'?3:4));for(const n of g.notes)assert.ok(g.board.notes.some(p=>p.midi===n.midi&&p.string===n.string&&p.fret===n.fret));}}
});
test('bar-aligned triplet windows carry the same elapsed phase through changed chords and CAGED positions',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:2,mode:'mixolydian',chord:'dom13'}),harmonyAt({key:7,mode:'lydian',chord:'maj9sharp11'}),harmonyAt({key:0,mode:'minor_pentatonic',chord:'min7'})],ss=['D','C','A','G'],ds=[3,5,2,6];
 for(const motion of ['ascending','descending'])for(const degree of ['1','3','5','7']){const gs=progressionExerciseGroups(hs,ds,fretboardFor(hs[0],ss[0]),{study:'positionalscale',rhythm:'triplets',motion,startTone:degree+':0',positionPath:hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i])),geometryShape:ss[i]}))});let cursor=0;for(const [i,g]of gs.entries()){const span=run(hs[i],ss[i],'triplets','default',motion).positionalSpan,state=scaleStartingState(span,hs[i],motion==='descending',degree+':0',true),original=shiftedScaleCycle(span,motion==='descending',state.supported?state.index:0);assert.deepEqual(g.notes,Array.from({length:ds[i]*3},(_,n)=>original[(cursor+n)%original.length]));assert.equal(g.phrasePhase,cursor%original.length);cursor+=g.notes.length;}}
});
