import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {neckExerciseCells,neckExerciseGroups} from '../src/practice/neck-exercises.js';import {cagedStudy} from '../src/guitar/exercises.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),base={study:'positionalscale',material:'seventh',traversal:'diagonal',traversalPositionOrder:'alternate',traversalStrings:'2,3,4,5',traversalShiftStrings:2,traversalStart:5,traversalEnd:17,traversalTurn:'position',motion:'ascending',rhythm:'sixteenths',sequenceOrder:'normal'};
const coords=gs=>gs.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret,n.neckCell.id,!!n.boundaryTurn]));
const positionNotes=(route,down,study='positionalscale')=>(down?route.blocks.toReversed():route.blocks).flatMap(b=>cagedStudy(b.board,h,study,'seventh',down?'descending':'ascending').flatMap(c=>c.notes.map(n=>[n.midi,n.string,n.fret,b.degree,false])));
test('continuous traversal ascends a whole diagonal position, descends the next, then ascends the next',()=>{
 const routes=neckExerciseCells(h,base),start=routes.findIndex(r=>r.degree==='0:7'),v={...base,traversalCell:routes[start].degree},expected=routes.slice(start,start+3).flatMap((r,i)=>positionNotes(r,i%2===1));assert.equal(expected.length,36);
 const g=neckExerciseGroups([h],[expected.length/4],v);assert.deepEqual(coords(g),expected);assert.deepEqual(g[0].notes.slice(0,12).map(n=>n.string),[2,2,2,3,3,3,4,4,4,5,5,5]);assert.deepEqual(g[0].notes.slice(12,24).map(n=>n.string),[5,5,5,4,4,4,3,3,3,2,2,2]);
});
test('descending first starts at the top of the selected route and alternates whole routes towards lower positions',()=>{
 const routes=neckExerciseCells(h,base),expected=routes.toReversed().slice(0,3).flatMap((r,i)=>positionNotes(r,i%2===0));assert.deepEqual(coords(neckExerciseGroups([h],[expected.length/4],{...base,motion:'descending'})),expected);
});
test('musical groups complete every block before the direction changes for a neighbouring full route',()=>{
 const v={...base,study:'groups4'},routes=neckExerciseCells(h,v),expected=routes.slice(0,3).flatMap((r,i)=>positionNotes(r,i%2===1,'groups4'));assert.deepEqual(coords(neckExerciseGroups([h],[expected.length/4],v)),expected);
});
test('whole-route alternation retains exact note and position phase through bar splits and both boundary policies',()=>{
 for(const study of ['positionalscale','groups3','groups4','thirds'])for(const motion of ['ascending','descending'])for(const traversalTurn of ['position','note']){
  const v={...base,study,motion,traversalTurn},whole=neckExerciseGroups([h],[24],v),split=neckExerciseGroups([h,h,h,h],[2.75,.5,8.75,12],v);assert.deepEqual(coords(split),coords(whole),`${study} ${motion} ${traversalTurn}`);
  for(const g of split)g.notes.forEach((n,i)=>{assert.ok([2,3,4,5].includes(n.string));assert.ok(n.fret>=5&&n.fret<=17);if(n.boundaryRepeat&&i)assert.equal(n.midi,g.notes[i-1].midi);});
 }
});
test('at the fret-range limit the next neighbouring route is still traversed in its entirety',()=>{
 const routes=neckExerciseCells(h,base),order=[0,1,2,3,2,1,0,1],expected=order.flatMap((r,i)=>positionNotes(routes[r],i%2===1));assert.deepEqual(coords(neckExerciseGroups([h],[expected.length/4],base)),expected);
});
