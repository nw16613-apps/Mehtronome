import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {neckExerciseGroups,neckExerciseCells} from '../src/practice/neck-exercises.js';import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';import {hasRouteTurnOptions} from '../src/guitar/neck-traversal.js';import {exerciseFavouriteKey} from '../src/practice/exercise-favourites.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),base={study:'groups4',material:'seventh',traversal:'horizontal',traversalStrings:'0,1',traversalStart:5,traversalEnd:17,sequenceOrder:'directional',rhythm:'sixteenths'};
function segments(g){let offset=0;return g.cellLengths.map((size,i)=>{const notes=g.notes.slice(offset,offset+size);offset+=size;return {notes,dir:g.sequenceDirections[i],id:notes[0].neckCell.id};});}
const coords=gs=>gs.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret,n.neckCell.id]));
test('boundary-note turns repeat the actual extremity and retain the complete reversed pattern',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const motion of ['ascending','descending'])for(const study of ['groups3','groups4','thirds','positionalscale','arpseq_groups3','pentatonic']){
  const view={...base,traversal,motion,study,pattern:'groups4',traversalTurn:'note'},groups=neckExerciseGroups([h],null,view),list=segments(groups[0]),turn=list.findIndex((s,i)=>i&&s.dir!==list[i-1].dir);assert.ok(turn>0,`${traversal} ${motion} ${study}`);assert.equal(list[turn].notes[0].midi,list[turn-1].notes.at(-1).midi);assert.equal(list[turn].id,list[turn-1].id);
  for(const segment of list)assert.ok(segment.notes.every(n=>n.fret>=5&&n.fret<=17&&[0,1].includes(n.string)));
 }
});
test('position-entry turns make the terminal position descend/ascend from its first pattern',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const motion of ['ascending','descending']){
  const view={...base,traversal,motion,traversalTurn:'position'},cells=neckExerciseCells(h,view),g=neckExerciseGroups([h],null,view)[0],list=segments(g),end=motion==='descending'?cells[0]:cells.at(-1),first=list.findIndex(s=>s.id===end.degree);assert.ok(first>0);assert.equal(list[first].dir,motion==='descending'?1:-1);assert.ok(list.filter(s=>s.id===end.degree).every(s=>s.dir===list[first].dir));
  const extremity=motion==='descending'?Math.min(...end.board.notes.map(n=>n.midi)):Math.max(...end.board.notes.map(n=>n.midi));assert.equal(list[first].notes[0].midi,extremity);assert.notEqual(list[first-1].notes.at(-1).midi,extremity);
 }
});
test('alternating positions complete one entire sweep then reverse for each neighbouring position',()=>{
 for(const motion of ['ascending','descending'])for(const study of ['groups4','positionalscale','arpseq_groups3']){
  const view={...base,traversal:'alternate',study,motion},g=neckExerciseGroups([h],null,view)[0],list=segments(g);let lastId=null,visits=[];
  for(const segment of list){if(lastId!==segment.id){visits.push({id:segment.id,dir:segment.dir,notes:[]});lastId=segment.id;}visits.at(-1).notes.push(...segment.notes);assert.equal(segment.dir,visits.at(-1).dir);}
  assert.ok(visits.length>3);for(let i=1;i<visits.length;i++)assert.equal(visits[i].dir,-visits[i-1].dir);assert.equal(visits[0].dir,motion==='descending'?-1:1);
  for(const visit of visits){const midis=visit.notes.map(n=>n.midi);assert.equal(Math.sign(midis.at(-1)-midis[0]),visit.dir);}
 }
});
test('turn policy and alternate-position phase survive beat splits, harmony changes and favourites',()=>{
 for(const traversal of ['horizontal','diagonal','alternate'])for(const traversalTurn of ['note','position'])for(const motion of ['ascending','descending']){
  const view={...base,traversal,traversalTurn,motion};assert.deepEqual(coords(neckExerciseGroups([h],[32],view)),coords(neckExerciseGroups([h,h,h,h],[1.25,5.75,8,17],view)));
 }
 const harmonies=[0,1,2].map(i=>harmonyAt({key:9,mode:'dorian',chord:'min7',progression:true,template:'major251altered'},i));
 for(const traversal of ['horizontal','diagonal','alternate'])for(const traversalTurn of ['note','position'])for(const g of neckExerciseGroups(harmonies,[5,3,8],{...base,traversal,traversalTurn}))for(const n of g.notes)assert.ok(n.neckCell&&[0,1].includes(n.string));
 assert.notEqual(exerciseFavouriteKey({...base,traversalTurn:'note'}),exerciseFavouriteKey({...base,traversalTurn:'position'}));assert.equal(normalizeExerciseOptions({...base,traversalTurn:'nonsense'}).traversalTurn,'note');const legacy=normalizeExerciseOptions({...base,traversal:'alternate'});assert.equal(legacy.traversal,'horizontal');assert.equal(legacy.traversalPositionOrder,'alternate');assert.equal(hasRouteTurnOptions({...base,study:'enclosures4'}),false);
});
test('strict note turns reach and repeat the boundary even when advancing by two or three',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const sequenceAdvance of [2,3])for(const motion of ['ascending','descending']){
  const view={...base,traversal,traversalTurn:'note',sequenceAdvance,motion,traversalEnd:24},list=segments(neckExerciseGroups([h],null,view)[0]),turn=list.findIndex((s,i)=>i&&s.dir!==list[i-1].dir);assert.ok(turn>0);assert.equal(list[turn].notes[0].midi,list[turn-1].notes.at(-1).midi);
 }
});
test('strict boundary patterns keep their phase when a bar or chord slot splits the last pattern',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const sequenceAdvance of [2,3]){
  const view={...base,traversal,traversalTurn:'note',sequenceAdvance,traversalEnd:24},whole=neckExerciseGroups([h],[32],view),g=whole[0],turn=g.sequenceDirections.findIndex((d,i,a)=>i&&d!==a[i-1]),turnBeat=g.cellLengths.slice(0,turn).reduce((a,b)=>a+b,0)/4;
  for(const split of [turnBeat-.25,turnBeat])assert.deepEqual(coords(whole),coords(neckExerciseGroups([h,h],[split,32-split],view)));
 }
});
