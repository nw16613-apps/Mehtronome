import {test} from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const path=hs=>hs.map(h=>({...cagedPositionFor(fretboardFor(h,'C')),geometryShape:'C'}));
test('long slots turn through intact opposite tetrads without empty bars or a range reset',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min13'}),board=fretboardFor(h,'C');
 for(const study of ['harmonized','alternating','chordtones','chordtonesalternating'])for(const motion of ['ascending','descending','up-down','down-up']){
  const hs=Array(8).fill(h),gs=progressionExerciseGroups(hs,hs.map(()=>4),board,{study,motion,rhythm:'sixteenths',positionPath:path(hs)});
  assert.ok(gs.every(g=>g.notes.length===16),`${study} ${motion}: every bar filled`);
  const cells=gs.flatMap(g=>g.sequenceAnchors.map((anchor,i)=>({anchor,direction:g.sequenceDirections[i]})));
  assert.ok(cells.some(c=>c.direction===1)&&cells.some(c=>c.direction===-1),'both traversal legs');
  let offset=0,next=motion==='ascending'||motion==='up-down';
  for(const g of gs){offset=0;for(let i=0;i<g.cellLengths.length;i++){
   const n=g.notes.slice(offset,offset+g.cellLengths[i]);offset+=n.length;
   const leg=g.sequenceDirections[i]>0?'ascending':'descending';
   const source=cagedStudy(board,h,study,'seventh',leg).filter(c=>c.sequenceAnchor===g.sequenceAnchors[i]);
   assert.ok(source.some(c=>[c.notes,[...c.notes].reverse()].some(ns=>JSON.stringify(ns.map(x=>x.midi))===JSON.stringify(n.map(x=>x.midi)))),'intact cell');
   if(study.includes('alternating')){assert.equal(n[1].midi>n[0].midi,next);next=!next;}
  }}
 }
});
test('reported minor-third progression has no exhausted empty bars in either reported exercise',()=>{
 const hs=[9,9,0,0,3,3,6,6].map(key=>harmonyAt({key,mode:'dorian',chord:'min13'}));
 for(const study of ['alternating','chordtones']){
  const gs=progressionExerciseGroups(hs,hs.map(()=>4),fretboardFor(hs[0],'C'),{study,rhythm:'sixteenths',positionPath:path(hs)});
  assert.ok(gs.every(g=>g.notes.length===16));
 }
});
test('chord-tone starting roots use core seventh tones; short-cell scope remains one cell',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min13'}),board=fretboardFor(h,'C');
 for(const motion of ['ascending','descending']){
  const cs=cagedStudy(board,h,'chordtones','seventh',motion);
  for(const c of cs)assert.ok(h.chordPcs.slice(0,4).includes((motion==='ascending'?c.notes[0]:c.notes.at(-1)).pc));
 }
 const gs=progressionExerciseGroups([h,h],[16,16],board,{study:'alternating',stage:'cell',positionPath:path([h,h])});
 assert.ok(gs.every(g=>g.notes.length===4));
});
