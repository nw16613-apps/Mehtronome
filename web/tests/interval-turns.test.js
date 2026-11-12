import {test} from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {fretboardFor} from '../src/guitar/fretboard.js';
import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';

// Independent ordinal walk: finish an interval, then enter the return leg
// one scale/chord step inside its reached boundary (no repeated apex).
function expectedPairs(line,allowed,span,direction,count){
 const pairs=dir=>line.map((m,i)=>[m,line[i+span*dir]]).filter(p=>p.every(n=>allowed.has(n))).sort((a,b)=>(a[0]-b[0])*dir);
 let cells=pairs(direction),index=0;const result=[];
 if(!cells.length)return result;
 while(result.length<count){
  const cell=cells[index++];result.push(...cell);
  if(index===cells.length){const edge=direction>0?Math.max(...cell):Math.min(...cell);direction=-direction;cells=pairs(direction);index=cells.findIndex(p=>(p[0]-edge)*direction>0);if(index<0)index=0;}
 }
 return result.slice(0,count);
}
test('every interval pair returns from the reached edge without missing inward pairs',()=>{
 const intervals=['seconds','thirds','fourths','fifths','sixths','sevenths','octaves'];
 for(const mode of ['dorian','major','harmonic_minor','minor_pentatonic'])for(const key of [0,4,9])for(const shape of ['E','D','C','A','G'])for(const prefix of ['','arpseq_'])for(const [i,id]of intervals.entries())for(const direction of [1,-1]){
  const h=harmonyAt({key,mode,chord:mode==='major'?'maj7':'min7'}),board=fretboardFor(h,shape),pcs=prefix?arpeggioHarmony(h).chordPcs:h.scalePcs;
  const line=Array.from({length:128},(_,i)=>i).filter(m=>pcs.includes(m%12)),allowed=new Set(board.notes.filter(n=>pcs.includes(n.pc)).map(n=>n.midi));
  const expected=expectedPairs(line,allowed,i+1,direction,192);if(!expected.length)continue;
  const make=ds=>progressionExerciseGroups(ds.map(()=>h),ds,board,{study:prefix+id,motion:direction>0?'ascending':'descending',rhythm:'sixteenths',boardFor:()=>board}).flatMap(g=>g.notes.map(n=>n.midi));
  const label=`${mode} ${key} ${shape} ${prefix+id} ${direction}`;
  assert.deepEqual(make([48]),expected,label);
  assert.deepEqual(make([1,2,1,3,1,40]),expected,label+' split bars');
 }
});
test('seconds and thirds include the previously skipped pairs at both boundaries',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'D');
 for(const [study,motion,expected]of [
  ['seconds','ascending',[[71,72],[71,69],[69,67]]],
  ['seconds','descending',[[47,45],[47,48],[48,50]]],
  ['thirds','ascending',[[69,72],[71,67],[69,66]]],
  ['thirds','descending',[[48,45],[47,50],[48,52]]],
 ]){
  const g=progressionExerciseGroups([h],[48],board,{study,motion,rhythm:'sixteenths',boardFor:()=>board})[0],turn=g.sequenceDirections.findIndex((d,i)=>i&&d!==g.sequenceDirections[i-1]);
  assert.deepEqual(Array.from({length:3},(_,i)=>g.notes.slice((turn-1+i)*2,(turn+i)*2).map(n=>n.midi)),expected);
 }
});
