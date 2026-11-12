import {ENCLOSURE_PATTERNS} from '../src/guitar/enclosures.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeExerciseOptions,exerciseMenuOptions,exerciseCollectionLabels} from '../src/practice/exercise-options.js';
test('legacy favourites retain their starting direction and map removed studies to available exercises',()=>{
 for(const study of ['grip','guidetones','connections','harmonized','alternating'])for(const motion of ['ascending','descending','up-down','down-up']){
  const v=normalizeExerciseOptions({study,motion,material:'triad'});
  assert.equal(v.study,study==='grip'?'positional':['guidetones','connections','alternating'].includes(study)?'harmonized':study);
  assert.equal(v.motion,['descending','down-up'].includes(motion)?'descending':'ascending');
  assert.equal(v.material,'triad');
 }
 assert.equal(normalizeExerciseOptions({study:'triadpairs',motion:'down-up'}).motion,'down-up');
});
test('menus expose only controls with distinct effects',()=>{
 for(const study of ['positionalscale','positional','harmonized','alternating','chordtones','pentatonic','enclosures'])assert.deepEqual(exerciseMenuOptions(study).directions.map(d=>d[0]),['ascending','descending']);
 assert.equal(exerciseMenuOptions('triadpairs').directions.length,4);
 for(const study of ['positionalscale','upperstructure','triadpairs','pentatonic','thirds','enclosures'])assert.equal(exerciseMenuOptions(study).material,false);
 for(const study of ['positional','harmonized','alternating','chordtones','inversions','approach','approacheverytone'])assert.equal(exerciseMenuOptions(study).material,true);
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

test('saved triplet phrase formulas retire without changing explicit Pattern start or direction',()=>{
 for(const phrase of ['balanced','balanced2','balanced3','balancedcycle','turnaround','unknown']){
  const view=normalizeExerciseOptions({study:'positional',rhythm:'triplets',phrase,startTone:'5:0',motion:'descending'});
  assert.equal(view.phrase,undefined);assert.equal(view.startTone,'5:0');assert.equal(view.motion,'descending');
 }
});

test('retired musical phrasing favourites restore to positional arpeggios',()=>{
 for(const study of ['motifspace','changetargets','questionanswer']){const view=normalizeExerciseOptions({study,motion:'descending',rhythm:'triplets'});assert.equal(view.study,'positional');assert.equal(view.motion,'descending');assert.equal(view.rhythm,'triplets');}
});
test('saved four- and five-note enclosure exercises migrate to the same exact order in grouped menus',()=>{
 for(const [study,motion,expected]of [['enclosuresdouble','ascending',[2,1,-1,0]],['enclosuresdouble','descending',[-2,-1,1,0]],['enclosuresfiveone','ascending',[-1,2,1,-1,0]],['enclosuresfivetwo','ascending',[1,-2,-1,1,0]],['enclosuresfivethree','ascending',[-2,1,-2,-1,0]],['enclosuresfivefour','ascending',[2,-1,2,1,0]]]){
  const view=normalizeExerciseOptions({study,motion});assert.ok(['enclosures4','enclosures5'].includes(view.study));assert.deepEqual(ENCLOSURE_PATTERNS[view.study][view.enclosurePattern],expected);
 }
});

test('retired closure and cell-label settings cannot restore removed exercise options',()=>{
 for(const close of [true,false]){const view=normalizeExerciseOptions({study:'harmonized',material:'triad',arpeggioPattern:'perm3_513',arpeggioClose:close,cellLabels:'order'});assert.equal(view.arpeggioClose,false);assert.equal(view.cellLabels,undefined);}
});
