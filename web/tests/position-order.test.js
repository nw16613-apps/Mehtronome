import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {neckExerciseGroups} from '../src/practice/neck-exercises.js';import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';import {exerciseFavouriteKey,readExerciseFavourites} from '../src/practice/exercise-favourites.js';import {hasRouteTurnOptions,traversalControls,traversalLabel} from '../src/guitar/neck-traversal.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),base={study:'groups4',material:'seventh',traversalStrings:'0,1',traversalStart:5,traversalEnd:17,rhythm:'sixteenths',sequenceOrder:'directional'};
const notes=g=>g.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret,n.neckCell.id]));
test('legacy alternating-position favourites migrate to horizontal with the shared alternate setting',()=>{
 const legacy={...base,traversal:'alternate'},current={...base,traversal:'horizontal',traversalPositionOrder:'alternate'},v=normalizeExerciseOptions({...legacy});assert.equal(v.traversal,'horizontal');assert.equal(v.traversalPositionOrder,'alternate');assert.equal(exerciseFavouriteKey(legacy),exerciseFavouriteKey(current));assert.equal(readExerciseFavourites(JSON.stringify([legacy,current])).length,1);
 assert.deepEqual(notes(neckExerciseGroups([h],[16],legacy)),notes(neckExerciseGroups([h],[16],current)));
});
test('both traversal routes alternate complete positions while preserving selected strings and bar phase',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const sequenceAdvance of [1,2,3])for(const motion of ['ascending','descending']){
  const view={...base,traversal,traversalPositionOrder:'alternate',sequenceAdvance,motion},g=neckExerciseGroups([h],[16],view)[0];assert.ok(g.notes.length);assert.deepEqual(notes([g]),notes(neckExerciseGroups([h,h],[5.25,10.75],view)));
  let offset=0,lastId=null,previousDirection=null;for(let i=0;i<g.cellLengths.length;i++){const n=g.notes[offset],id=n.neckCell.id;if(lastId!==id){if(previousDirection!==null)assert.equal(g.sequenceDirections[i],-previousDirection);lastId=id;previousDirection=g.sequenceDirections[i];}assert.ok([0,1].includes(n.string));offset+=g.cellLengths[i];}
 }
 assert.notEqual(exerciseFavouriteKey({...base,traversal:'horizontal',traversalPositionOrder:'alternate'}),exerciseFavouriteKey({...base,traversal:'diagonal',traversalPositionOrder:'alternate'}));
});
test('controls keep only position/horizontal/diagonal routes, with alternation as a nested shared choice',()=>{
 for(const traversal of ['horizontal','diagonal']){
  const view={...base,traversal,traversalPositionOrder:'alternate'},html=traversalControls(view);assert.match(html,/data-neck-field="traversalPositionOrder"/);assert.doesNotMatch(html,/<option value="alternate"[^>]*>Alternating positions[^<]*<\/option><\/select><\/label><label[^>]*>Traversal/);assert.equal(hasRouteTurnOptions(view),true);assert.match(traversalLabel(view),/alternating positions/);
  assert.equal(html.split('data-neck-field="traversal"')[1].split('</select>')[0].includes('value="alternate"'),false);
 }
});
