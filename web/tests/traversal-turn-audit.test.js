import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {TUNING} from '../src/guitar/fretboard.js';import {hasRouteTurnOptions,traversalControls} from '../src/guitar/neck-traversal.js';import {neckExerciseCells,neckExerciseGroups} from '../src/practice/neck-exercises.js';import {cagedStudy} from '../src/guitar/exercises.js';import {exerciseFavouriteKey,readExerciseFavourites} from '../src/practice/exercise-favourites.js';import {progressionStudyPlan} from '../src/practice/progression-timing.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),base={study:'positionalscale',material:'seventh',traversal:'diagonal',traversalStrings:'2,3,4,5',traversalShiftStrings:2,traversalStart:5,traversalEnd:17,rhythm:'sixteenths',motion:'ascending',sequenceOrder:'normal'};
const stamp=gs=>gs.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret,n.neckCell.id,!!n.boundaryTurn]));
const routeNotes=(r,down,study='positionalscale')=>(down?r.blocks.toReversed():r.blocks).flatMap(b=>cagedStudy(b.board,h,study,'seventh',down?'descending':'ascending').flatMap(c=>c.notes.map(n=>[n.midi,n.string,n.fret,b.degree,false])));
test('alternating positions ignore saved boundary choices across horizontal/diagonal scales and arpeggio patterns',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const motion of ['ascending','descending'])for(const study of ['positionalscale','positional','groups3','groups4','thirds','arpseq_groups3','harmonized','enclosures4']){
  const v={...base,traversal,motion,study,traversalPositionOrder:'alternate',arpeggioClose:false,arpeggioPattern:'perm3_135',material:'triad',arpeggioSource:'diatonic'},note=neckExerciseGroups([h],[32],{...v,traversalTurn:'note'}),plain=neckExerciseGroups([h],[32],{...v,traversalTurn:'position'});assert.deepEqual(stamp(note),stamp(plain),`${traversal} ${study}`);assert.ok(note.every(g=>g.notes.every(n=>!n.boundaryTurn&&!n.boundaryRepeat&&!n.boundaryApproach)));assert.equal(hasRouteTurnOptions(v),false);assert.doesNotMatch(traversalControls(v),/id="exercise-neck-turn"/);
  assert.equal(exerciseFavouriteKey({...v,traversalTurn:'note'}),exerciseFavouriteKey({...v,traversalTurn:'position'}));assert.equal(readExerciseFavourites(JSON.stringify([{...v,traversalTurn:'note'},{...v,traversalTurn:'position'}])).length,1);
 }
});
test('early turns reverse the complete terminal diagonal position rather than its final string block',()=>{
 for(const motion of ['ascending','descending'])for(const study of ['positionalscale','groups3','groups4','thirds']){
  const v={...base,motion,study,traversalTurn:'position'},routes=neckExerciseCells(h,v),ordered=motion==='descending'?routes.toReversed():routes,expected=ordered.flatMap((r,i)=>routeNotes(r,i===ordered.length-1?motion!=='descending':motion==='descending',study));assert.ok(ordered.length>1);assert.deepEqual(stamp(neckExerciseGroups([h],[expected.length/4],v)),expected,`${study} ${motion}`);
 }
});
test('repeat-boundary policy reaches the whole terminal route then retraces it without truncating any block',()=>{
 const v={...base,traversalTurn:'note'},routes=neckExerciseCells(h,v),expected=[...routes.flatMap(r=>routeNotes(r,false)),...routeNotes(routes.at(-1),true)];assert.deepEqual(stamp(neckExerciseGroups([h],[expected.length/4],v)),expected);
});
test('all string-block sizes retain direction within a route, exact timing and coordinates across bar splits',()=>{
 for(const strings of ['0,1','2,3,4,5','0,1,2,3,4,5'])for(let size=1;size<=strings.split(',').length;size++)for(const traversalPositionOrder of ['follow','alternate'])for(const traversalTurn of ['note','position'])for(const motion of ['ascending','descending']){
  const v={...base,traversalStrings:strings,traversalShiftStrings:size,traversalPositionOrder,traversalTurn,motion,traversalEnd:22},whole=neckExerciseGroups([h],[32],v),split=neckExerciseGroups([h,h,h],[2.75,9.25,20],v);assert.deepEqual(stamp(split),stamp(whole));for(const g of whole)for(const n of g.notes){assert.equal(n.midi,TUNING[n.string]+n.fret);assert.ok(strings.split(',').map(Number).includes(n.string));assert.ok(n.fret>=5&&n.fret<=22);}
  const plan=progressionStudyPlan(whole,[0],[8],4,v.study,v.rhythm);assert.equal(plan.duration,32);assert.equal(plan.events.length,whole.flatMap(g=>g.notes).length);
 }
});
test('a single available diagonal route does not reverse again at every new bar',()=>{
 const v={...base,traversalStart:7,traversalEnd:14,traversalTurn:'position'},routes=neckExerciseCells(h,v);assert.equal(routes.length,1);assert.deepEqual(stamp(neckExerciseGroups([h],[16],v)),stamp(neckExerciseGroups([h,h,h],[1,5,10],v)));
 const unavailable=neckExerciseGroups([h],[16],{...v,traversalPositionOrder:'alternate'})[0];assert.equal(unavailable.notes.length,0);assert.match(unavailable.warning,/at least two playable positions/);
});
