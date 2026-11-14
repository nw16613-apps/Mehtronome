import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {neckExerciseCells,neckExerciseGroups} from '../src/practice/neck-exercises.js';import {cagedStudy} from '../src/guitar/exercises.js';import {normalizeTraversal,traversalControls,traversalLabel} from '../src/guitar/neck-traversal.js';import {exerciseFavouriteKey,readExerciseFavourites} from '../src/practice/exercise-favourites.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),base={study:'positionalscale',material:'seventh',traversal:'diagonal',traversalPositionOrder:'roundtrip',traversalStrings:'2,3,4,5',traversalShiftStrings:2,traversalStart:5,traversalEnd:17,rhythm:'sixteenths',motion:'ascending',sequenceOrder:'normal',traversalTurn:'note'};
const stamp=gs=>gs.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret,n.neckCell.id,!!n.boundaryTurn]));
const leg=(route,down,study)=>{const blocks=route.blocks||[route];return (down?blocks.toReversed():blocks).flatMap(b=>cagedStudy(b.board,h,study,'seventh',down?'descending':'ascending').flatMap(c=>c.notes.map(n=>[n.midi,n.string,n.fret,b.degree,false])));};
test('each position plays both complete legs before the next, in both traversal types and starting directions',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const motion of ['ascending','descending'])for(const study of ['positionalscale','groups3','thirds']){
  const v={...base,traversal,motion,study},routes=neckExerciseCells(h,v),ordered=motion==='descending'?routes.toReversed():routes,expected=ordered.flatMap(r=>[...leg(r,motion==='descending',study),...leg(r,motion!=='descending',study)]);
  const actual=stamp(neckExerciseGroups([h],[expected.length/4],v));
  // Non-scalar motifs can require explicit approach/repeat notes at the local turn;
  // compare their complete unmodified cells independently of these markers.
  const clean=actual.filter(n=>!n[4]);assert.deepEqual(clean,expected.slice(0,clean.length),`${traversal} ${motion} ${study}`);
 }
});
test('continuous roundtrips share the local turning note only when repeat is disabled',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const motion of ['ascending','descending']){
  const v={...base,traversal,motion,traversalTurn:'position'},routes=neckExerciseCells(h,v),ordered=motion==='descending'?routes.toReversed():routes,expected=ordered.flatMap(r=>[...leg(r,motion==='descending',v.study),...leg(r,motion!=='descending',v.study).slice(1)]);
  assert.deepEqual(stamp(neckExerciseGroups([h],[expected.length/4],v)),expected);
 }
});
test('roundtrip phase survives bar splits and works with a single available route',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const motion of ['ascending','descending'])for(const study of ['positionalscale','groups3','thirds','arpseq_groups3','harmonized'])for(const traversalTurn of ['note','position']){
  const v={...base,traversal,motion,study,traversalTurn};assert.deepEqual(stamp(neckExerciseGroups([h],[32],v)),stamp(neckExerciseGroups([h,h,h],[2.75,9.25,20],v)));
 }
 const v={...base,traversalStart:7,traversalEnd:14};assert.equal(neckExerciseCells(h,v).length,1);const gs=neckExerciseGroups([h],[16],v);assert.equal(gs.flatMap(g=>g.notes).length,64);assert.ok(gs.every(g=>!g.warning));
});
test('menus, labels and favourites preserve and distinguish the third position order',()=>{
 assert.equal(normalizeTraversal({...base}).traversalPositionOrder,'roundtrip');assert.match(traversalControls(base),/value="roundtrip" selected>Up and down each position/);assert.match(traversalLabel(base),/up and down each position/);assert.notEqual(exerciseFavouriteKey(base),exerciseFavouriteKey({...base,traversalPositionOrder:'follow'}));assert.equal(readExerciseFavourites(JSON.stringify([base]))[0].traversalPositionOrder,'roundtrip');
});
test('roundtrips preserve exact phase on all string-block sizes and return along the neck',()=>{
 for(const traversalStrings of ['0,1','2,3,4,5','0,1,2,3,4,5'])for(let size=1;size<=traversalStrings.split(',').length;size++)for(const motion of ['ascending','descending']){
  const v={...base,traversalStrings,traversalShiftStrings:size,motion,traversalEnd:22},whole=neckExerciseGroups([h],[40],v);assert.deepEqual(stamp(whole),stamp(neckExerciseGroups([h,h,h],[3.25,14.75,22],v)));assert.equal(whole.flatMap(g=>g.notes).length,160);
 }
 const v={...base,traversal:'horizontal'},routes=neckExerciseCells(h,v),order=[...routes,...routes.slice(0,-1).toReversed()],expected=order.flatMap(r=>[...leg(r,false,v.study),...leg(r,true,v.study)]);assert.deepEqual(stamp(neckExerciseGroups([h],[expected.length/4],v)),expected);
 const single={...base,traversalStart:7,traversalEnd:14,traversalTurn:'position'},r=neckExerciseCells(h,single)[0],cycle=[...leg(r,false,single.study),...leg(r,true,single.study).slice(1)],expectedSingle=[...cycle,...cycle.slice(1)];assert.deepEqual(stamp(neckExerciseGroups([h],[expectedSingle.length/4],single)),expectedSingle);
});
