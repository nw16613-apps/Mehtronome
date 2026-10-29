import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeExerciseOptions,exerciseMenuOptions} from '../src/practice/exercise-options.js';
test('legacy favourites retain their starting direction and map removed studies to available exercises',()=>{
 for(const study of ['grip','guidetones','connections','harmonized','alternating'])for(const motion of ['ascending','descending','up-down','down-up']){
  const v=normalizeExerciseOptions({study,motion,material:'triad'});
  assert.equal(v.study,study==='grip'?'positional':['guidetones','connections'].includes(study)?'harmonized':study);
  assert.equal(v.motion,['descending','down-up'].includes(motion)?'descending':'ascending');
  assert.equal(v.material,'triad');
 }
 assert.equal(normalizeExerciseOptions({study:'triadpairs',motion:'down-up'}).motion,'down-up');
});
test('menus expose only controls with distinct effects',()=>{
 for(const study of ['positional','harmonized','alternating','chordtones','pentatonic','enclosures'])assert.deepEqual(exerciseMenuOptions(study).directions.map(d=>d[0]),['ascending','descending']);
 assert.equal(exerciseMenuOptions('triadpairs').directions.length,4);
 for(const study of ['positional','upperstructure','triadpairs','pentatonic','thirds','enclosures'])assert.equal(exerciseMenuOptions(study).material,false);
 for(const study of ['harmonized','alternating','chordtones','inversions','approach','approacheverytone'])assert.equal(exerciseMenuOptions(study).material,true);
});
