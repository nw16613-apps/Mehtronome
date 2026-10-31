import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,CHORDS,harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
import {recommendedMode} from '../src/practice/custom-progression.js';
const shapes=['C','A','G','E','D'];
const run=(hs,ss,ds,study='positionalscale',rhythm='triplets',motion='ascending',startTone='default',phrase=undefined)=>progressionExerciseGroups(hs,ds,fretboardFor(hs[0],ss[0]),{study,rhythm,motion,startTone,phrase,positionPath:hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i%ss.length])),geometryShape:ss[i%ss.length]}))});
const pitches=gs=>gs.flatMap(g=>g.notes.map(n=>n.midi));
test('triplet scales use the complete consecutive-note cycle in every catalogue mode, key, position and direction',()=>{
 for(const [mode,def]of Object.entries(MODES))for(let key=0;key<12;key++)for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode,chord:def.chord}),board=fretboardFor(h,shape);
  const span=cagedStudy(board,h,'positionalscale','seventh','ascending').flatMap(c=>c.notes.map(n=>n.midi));
  const ordered=motion==='descending'?span.toReversed():span,cycle=[...ordered,...ordered.slice(1,-1).toReversed()];
  const gs=run([h,h,h,h],[shape],[4,4,4,4],'positionalscale','triplets',motion);
  assert.deepEqual(pitches(gs),Array.from({length:48},(_,i)=>cycle[i%cycle.length]));
  assert.ok(gs.every(g=>g.notes.length===12));
  for(let i=1;i<48;i++)assert.equal(Math.abs(span.indexOf(pitches(gs)[i])-span.indexOf(pitches(gs)[i-1])),1);
 }
});
test('triplets and straight rhythms keep identical note order and starts across mixed chords and assigned positions',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:0,mode:'mixolydian',chord:'dom13'}),harmonyAt({key:3,mode:'major',chord:'maj9'}),harmonyAt({key:6,mode:'minor_pentatonic',chord:'min7'})];
 for(const study of ['positional','positionalscale'])for(const motion of ['ascending','descending'])for(const start of ['default','1:0','3:0','5:0','7:0']){
  const triplets=run(hs,['D','C','A','G'],[4,8,4,4],study,'triplets',motion,start);
  for(const [rhythm,ratio]of [['eighths',1.5],['sixteenths',.75]]){
   const straight=run(hs,['D','C','A','G'],[4,8,4,4].map(d=>d*ratio),study,rhythm,motion,start);
   assert.deepEqual(triplets.map(g=>g.notes),straight.map(g=>g.notes));
  }
  for(const g of triplets)for(const n of g.notes)assert.ok(g.board.notes.some(p=>p.midi===n.midi&&p.string===n.string&&p.fret===n.fret));
 }
});
test('arpeggio triplets retain the same span and degree rotations for every chord quality and position',()=>{
 for(const chord of Object.keys(CHORDS))for(const key of [0,9])for(const shape of shapes)for(const motion of ['ascending','descending'])for(const start of ['default','1:0','3:0','5:0','7:0']){
  const h=harmonyAt({key,mode:recommendedMode(chord),chord});
  const a=run([h],[shape],[16],'positional','triplets',motion,start)[0],b=run([h],[shape],[24],'positional','eighths',motion,start)[0];
  assert.deepEqual(a.notes,b.notes);assert.deepEqual(a.positionalSpan,b.positionalSpan);
 }
});
test('splitting repeated harmony at bars does not reset or pad either positional traversal',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});
 for(const study of ['positional','positionalscale'])for(const motion of ['ascending','descending'])for(const start of ['default','3:0','5:0']){
  const split=run(Array(6).fill(h),['C'],[1,2,4,1,3,5],study,'triplets',motion,start),whole=run([h],['C'],[16],study,'triplets',motion,start);
  assert.deepEqual(pitches(split),pitches(whole));
  const plan=progressionStudyPlan(split,[0,1,2,3,4,5],[.25,.5,1,.25,.75,1.25],4,study,'triplets');
  assert.equal(plan.events.length,48);assert.equal(plan.duration,16);
  for(const [i,e]of plan.events.entries())assert.ok(Math.abs(e.start-i/3)<1e-8);
 }
});
test('reported Position II minor-third scale start continues upward at bar two instead of restarting on A-string G',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),gs=run(Array(4).fill(h),['C'],[4,4,4,4],'positionalscale','triplets','ascending','3:0');
 assert.deepEqual(gs[0].notes.map(n=>n.midi),[48,50,52,54,55,57,59,60,62,64,66,67]);
 assert.deepEqual(gs[1].notes.slice(0,5).map(n=>n.midi),[69,71,72,74,72]);
});
test('retired triplet phrase values cannot change the new pitch traversal or explicit degree start',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});
 for(const study of ['positional','positionalscale'])for(const phrase of ['balanced','balanced2','balanced3','balancedcycle','turnaround'])for(const start of ['default','3:0','5:0']){
  assert.deepEqual(run([h,h],['C','A'],[4,4],study,'triplets','ascending',start,phrase),run([h,h],['C','A'],[4,4],study,'triplets','ascending',start));
 }
});
