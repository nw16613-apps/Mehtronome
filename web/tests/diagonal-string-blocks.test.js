import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {TUNING} from '../src/guitar/fretboard.js';import {normalizeTraversal,routeMapSvg,neckRouteBoard} from '../src/guitar/neck-traversal.js';import {traversalScaleCells} from '../src/guitar/neck-cells.js';import {neckExerciseCells,neckExerciseGroups,neckCellHarmony} from '../src/practice/neck-exercises.js';import {cagedStudy} from '../src/guitar/exercises.js';import {exerciseFavouriteKey,readExerciseFavourites} from '../src/practice/exercise-favourites.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),base={study:'groups4',material:'seventh',traversal:'diagonal',traversalStrings:'0,1,2,3,4,5',traversalShiftStrings:2,traversalStart:5,traversalEnd:22,rhythm:'sixteenths',motion:'ascending',sequenceOrder:'normal',traversalTurn:'note'};
const stamp=gs=>gs.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret,n.neckCell?.id,!!n.boundaryTurn]));
test('shift interval is an integer bounded by the existing selected string set, including one string',()=>{
 for(const set of ['5','4,5','2,3,4,5','0,1,2,3,4,5'])for(const size of [-3,0,1,2,3,4,5,6,99]){const v=normalizeTraversal({...base,traversalStrings:set,traversalShiftStrings:size});assert.equal(v.traversalStrings,set);assert.ok(Number.isInteger(v.traversalShiftStrings)&&v.traversalShiftStrings>=1&&v.traversalShiftStrings<=set.split(',').length);}
 assert.equal(normalizeTraversal({...base,traversalStrings:'4,5',traversalShiftStrings:6}).traversalShiftStrings,2);
});
test('successive non-overlapping string blocks use successive actual positions',()=>{
 for(const set of ['2,3,4,5','0,1,2,3,4,5'])for(const size of [1,2,3]){
  const v={...base,traversalStrings:set,traversalShiftStrings:size},positions=traversalScaleCells(h,v),routes=neckExerciseCells(h,v),strings=set.split(',').map(Number);assert.ok(routes.length);
  routes.forEach((r,start)=>{assert.deepEqual(r.blocks.flatMap(b=>b.strings),strings);r.blocks.forEach((b,i)=>{assert.equal(b.parentId,positions[start+i].degree);assert.deepEqual(b.board.notes,positions[start+i].board.notes.filter(n=>b.strings.includes(n.string)));assert.equal(b.board.notes.length,b.strings.length*3);assert.ok(b.board.notes.every(n=>n.midi===TUNING[n.string]+n.fret&&n.fret>=5&&n.fret<=22));});});
 }
});
test('groups of four finish every group on each pair, then restart in the next position and pair',()=>{
 const route=neckExerciseCells(h,base)[0],expected=route.blocks.flatMap(b=>cagedStudy(b.board,h,'groups4','seventh','ascending').flatMap(c=>c.notes.map(n=>[n.midi,n.string,n.fret,b.degree,false]))),g=neckExerciseGroups([h],[expected.length/4],base);
 assert.deepEqual(stamp(g),expected);assert.deepEqual([...new Set(g[0].notes.map(n=>n.neckCell.blockIndex))],[0,1,2]);
 const down={...base,motion:'descending',traversalCell:route.degree},expectedDown=route.blocks.toReversed().flatMap(b=>cagedStudy(b.board,h,'groups4','seventh','descending').flatMap(c=>c.notes.map(n=>[n.midi,n.string,n.fret,b.degree,false])));assert.deepEqual(stamp(neckExerciseGroups([h],[expectedDown.length/4],down)),expectedDown);
});
test('block and pattern phase survive bar splits, and returns retrace the same physical blocks',()=>{
 for(const study of ['groups3','groups4','thirds','harmonized','positionalscale','positional'])for(const motion of ['ascending','descending'])for(const sequenceOrder of ['normal','reverse','directional']){
  const v={...base,study,motion,sequenceOrder,arpeggioClose:false,material:study==='harmonized'?'triad':'seventh',arpeggioSource:study==='harmonized'?'diatonic':'selectedChord',arpeggioPattern:study==='harmonized'?'perm3_135':'perm4_1357'},whole=neckExerciseGroups([h],[24],v),split=neckExerciseGroups([h,h,h],[1.25,6.75,16],v);assert.deepEqual(stamp(split),stamp(whole));
  const ids=whole[0].notes.filter(n=>!n.boundaryTurn).map(n=>n.neckCell.blockIndex),visits=ids.filter((id,i)=>!i||id!==ids[i-1]);assert.deepEqual(visits.slice(0,5),motion==='ascending'?[0,1,2,1,0]:[2,1,0,1,2],study);
 }
});
test('an incomplete final string block is explicit and cannot silently lose part of the pattern',()=>{
 const v={...base,traversalStrings:'2,3,4,5',traversalShiftStrings:3},route=neckExerciseCells(h,v)[0];assert.deepEqual(route.blocks.map(b=>b.strings.length),[3,1]);const g=neckExerciseGroups([h],[16],v)[0];assert.equal(g.notes.length,0);assert.match(g.warning,/Block 2/);assert.match(g.warning,/Strings before position change/);
});
test('one block spanning the selected strings behaves like horizontal position traversal',()=>{
 const v={...base,traversalStrings:'2,3,4,5',traversalShiftStrings:4};assert.deepEqual(stamp(neckExerciseGroups([h],[24],v)),stamp(neckExerciseGroups([h],[24],{...v,traversal:'horizontal'})));
});
test('saved routes retain their block size and the full map draws all numbered blocks',()=>{
 assert.notEqual(exerciseFavouriteKey(base),exerciseFavouriteKey({...base,traversalShiftStrings:3}));assert.equal(readExerciseFavourites(JSON.stringify([base]))[0].traversalShiftStrings,2);const r=neckExerciseCells(h,base)[0],board=neckRouteBoard(h,base),svg=routeMapSvg(board,true,[],r.label,r.board.notes,r.blocks);assert.equal((svg.match(/class="neck-route-block"/g)||[]).length,3);
});
test('harmony changes keep the current string block and use the incoming mode at the chosen fret region',()=>{
 const next=harmonyAt({key:11,mode:'dorian',chord:'min7'}),route=neckExerciseCells(h,base)[0],v={...base,traversalCell:route.degree},groups=neckExerciseGroups([h,next],[4,8],v);assert.equal(groups[0].notes.at(-1).neckCell.blockIndex,1);assert.equal(groups[1].notes[0].neckCell.blockIndex,1);
 for(const g of groups)for(const n of g.notes){assert.ok(g.harmony.scalePcs.includes(n.pc));assert.equal(n.midi,TUNING[n.string]+n.fret);assert.ok(n.fret>=5&&n.fret<=22);}
});
