import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt} from '../src/audio/music.js';
import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
const shapes=['C','A','G','E','D'];
const path=(hs,ss)=>hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i%ss.length])),geometryShape:ss[i%ss.length]}));
const available=g=>[...new Set(g.board.notes.filter(n=>arpeggioHarmony(g.harmony).chordPcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b);
const groups=(hs,ss,durations,phrase,motion='ascending',rhythm='triplets')=>progressionExerciseGroups(hs,durations,fretboardFor(hs[0],ss[0]),{study:'positional',rhythm,motion,phrase,positionPath:path(hs,ss)});
test('reported Position II variations start at A-string frets seven and ten and retain two-beat halves',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});
 for(const [phrase,line,fret]of [['balanced2',[52,55,57,60,64,67,69],7],['balanced3',[55,57,60,64,67,69,72],10]]){
  const gs=groups([h,h,h,h],['C'],[4,4,4,4],phrase),expected=[...line,...line.slice(1,-1).toReversed()];
  for(const g of gs)assert.deepEqual(g.notes.map(n=>n.midi),expected);
  assert.deepEqual([gs[0].notes[0].string,gs[0].notes[0].fret],[1,fret]);
  const plan=progressionStudyPlan(gs,[0,1,2,3],[1,1,1,1],4,'positional','triplets');assert.equal(plan.events[6].start,2);assert.equal(plan.events[12].start,4);assert.equal(plan.duration,16);
 }
});
test('all modes, roots, positions and starting directions choose the requested consecutive seven-note window',()=>{
 for(const [mode,def]of Object.entries(MODES))for(let key=0;key<12;key++)for(const shape of shapes)for(const motion of ['ascending','descending'])for(const offset of [1,2]){
  const h=harmonyAt({key,mode,chord:def.chord}),[g]=groups([h],[shape],[4],`balanced${offset+1}`,motion),line=available(g),size=Math.min(7,line.length),last=line.length-size,index=motion==='ascending'?Math.min(offset,last):last-Math.min(offset,last),span=line.slice(index,index+size),ordered=motion==='ascending'?span:span.toReversed(),cycle=[...ordered,...ordered.slice(1,-1).toReversed()];
  assert.deepEqual(g.positionalSpan.map(n=>n.midi),span);assert.equal(g.phraseCycleLength,2*(size-1));assert.deepEqual(g.notes.map(n=>n.midi),Array.from({length:12},(_,i)=>cycle[i%cycle.length]));
  assert.equal(g.warning.includes('nearest available span'),offset>last);
  for(const n of g.notes)assert.ok(g.board.notes.some(p=>p.midi===n.midi&&p.string===n.string&&p.fret===n.fret));
 }
});
test('mixed chord, scale and position changes preserve the selected variation at partial-bar phase',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:2,mode:'mixolydian',chord:'dom13'}),harmonyAt({key:7,mode:'lydian',chord:'maj9sharp11'}),harmonyAt({key:0,mode:'minor_pentatonic',chord:'min7'})];
 for(const phrase of ['balanced2','balanced3'])for(const motion of ['ascending','descending']){
  const gs=groups(hs,['C','A','E','D'],[1,3,2,4],phrase,motion);let cursor=0;
  for(const g of gs){const span=g.positionalSpan.map(n=>n.midi),ordered=motion==='ascending'?span:span.toReversed(),cycle=[...ordered,...ordered.slice(1,-1).toReversed()];assert.equal(g.phrasePhase,cursor%cycle.length);assert.deepEqual(g.notes.map(n=>n.midi),Array.from({length:g.notes.length},(_,i)=>cycle[(cursor+i)%cycle.length]));cursor+=g.notes.length;}
 }
});
test('balanced triplet variations do not affect eighth or sixteenth note phrases',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});
 for(const rhythm of ['eighths','sixteenths'])for(const phrase of ['balanced2','balanced3'])assert.deepEqual(groups([h,h],['C','A'],[4,4],phrase,'ascending',rhythm).map(g=>g.notes),groups([h,h],['C','A'],[4,4],'balanced','ascending',rhythm).map(g=>g.notes));
});
