import {test} from 'node:test';import assert from 'node:assert/strict';
import {DEFAULTS} from '../src/audio/engine.js';import {harmonyAt} from '../src/audio/music.js';import {TUNING} from '../src/guitar/fretboard.js';import {traversalScaleCells} from '../src/guitar/neck-cells.js';
const h=key=>harmonyAt({...DEFAULTS,key,progression:false},0);
test('each two-string scale cell has exactly six consecutive pitches, three per string, in every key',()=>{
 for(let key=0;key<12;key++)for(let lower=0;lower<5;lower++){
  const harmony=h(key),shapes=traversalScaleCells(harmony,{traversal:'horizontal',traversalStrings:`${lower},${lower+1}`,traversalStart:1,traversalEnd:24});
  assert.equal(new Set(shapes.map(s=>s.scaleDegree)).size,7);
  assert.deepEqual(shapes.map(s=>s.board.firstFret),shapes.map(s=>s.board.firstFret).toSorted((a,b)=>a-b));
  for(const shape of shapes){const notes=shape.board.notes;assert.equal(notes.length,6);assert.equal(notes.filter(n=>n.string===lower).length,3);assert.equal(notes.filter(n=>n.string===lower+1).length,3);assert.equal(notes[0].pc,harmony.scalePcs[shape.scaleDegree]);
   notes.forEach((n,i)=>{assert.equal(n.midi,TUNING[n.string]+n.fret);assert.ok(n.fret>=1&&n.fret<=24);assert.ok(harmony.scalePcs.includes(n.pc));if(i){let next=notes[i-1].midi+1;while(!harmony.scalePcs.includes(next%12))next++;assert.equal(n.midi,next);}});
  }
 }
});
test('string sets and ranges rebuild actual cells, without clipping or adding open frets',()=>{
 const harmony=h(9),base={traversal:'horizontal',traversalStart:5,traversalEnd:17};
 for(const set of ['0','0,1','1,2','4,5','0,1,2','0,1,2,3,4,5']){
  const strings=set.split(',').map(Number),shapes=traversalScaleCells(harmony,{...base,traversalStrings:set});assert.ok(shapes.length);
  for(const shape of shapes){assert.equal(shape.board.notes.length,strings.length*3);assert.ok(shape.board.notes.every(n=>strings.includes(n.string)&&n.fret>=5&&n.fret<=17));}
 }
 assert.deepEqual(traversalScaleCells(harmony,{...base,traversalStrings:'0,1',traversalStart:5,traversalEnd:6}),[]);
});
