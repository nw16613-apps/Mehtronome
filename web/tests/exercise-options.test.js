import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeExerciseOptions,exerciseMenuOptions,exerciseCollectionLabels} from '../src/practice/exercise-options.js';
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
 for(const study of ['positionalscale','positional','harmonized','alternating','chordtones','pentatonic','enclosures'])assert.deepEqual(exerciseMenuOptions(study).directions.map(d=>d[0]),['ascending','descending']);
 assert.equal(exerciseMenuOptions('triadpairs').directions.length,4);
 for(const study of ['positionalscale','positional','upperstructure','triadpairs','pentatonic','thirds','enclosures'])assert.equal(exerciseMenuOptions(study).material,false);
 for(const study of ['harmonized','alternating','chordtones','inversions','approach','approacheverytone'])assert.equal(exerciseMenuOptions(study).material,true);
});

test('collection-aware labels distinguish scale-step patterns from chord inversions',()=>{
 assert.equal(exerciseCollectionLabels('thirds',true).studies.thirds,'Alternate scale-note pairs');
 assert.deepEqual(exerciseCollectionLabels('harmonized',true).materials,['3-note stacks','4-note stacks']);
 assert.deepEqual(exerciseCollectionLabels('inversions',true).materials,['Up to 3 chord tones','Up to 4 chord tones']);
 assert.deepEqual(exerciseCollectionLabels('harmonized',false).materials,['Triads','Seventh chords']);
});

test('removed ninth stacks and 3-to-9 saved exercises migrate to seventh-chord material',()=>{
 const view=normalizeExerciseOptions({study:'upperstructure',material:'extensions',motion:'descending'});assert.equal(view.study,'harmonized');assert.equal(view.material,'seventh');assert.equal(view.motion,'descending');
});

test('balanced triplet variations survive saved-option normalization',()=>{
 for(const phrase of ['balanced','balanced2','balanced3','balancedcycle','turnaround'])assert.equal(normalizeExerciseOptions({study:'positional',rhythm:'triplets',phrase}).phrase,phrase);
 assert.equal(normalizeExerciseOptions({study:'positional',phrase:'unknown'}).phrase,'balanced');
});
