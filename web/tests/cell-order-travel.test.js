import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor} from '../src/guitar/fretboard.js';
import {SCALE_SEQUENCES} from '../src/guitar/scale-sequences.js';import {cagedStudy} from '../src/guitar/exercises.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';import {exerciseFavouriteKey} from '../src/practice/exercise-favourites.js';
const notes=cells=>cells.map(c=>c.notes.map(n=>[n.midi,n.string,n.fret]));
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});
test('every generated scale/chord-tone cell keeps identical written and reversed notes on both travelling legs',()=>{
 for(const mode of ['dorian','harmonic_minor','minor_pentatonic'])for(const key of [0,4,9])for(const shape of ['E','D','C','A','G'])for(const prefix of ['','arpseq_'])for(const id of Object.keys(SCALE_SEQUENCES))for(const order of ['normal','reverse']){
  const harmony=harmonyAt({key,mode,chord:'min7'}),board=fretboardFor(harmony,shape),up=cagedStudy(board,harmony,prefix+id,'seventh','ascending',{sequenceOrder:order}),down=cagedStudy(board,harmony,prefix+id,'seventh','descending',{sequenceOrder:order});
  assert.deepEqual(notes(down),notes(up.toReversed()),`${mode} ${key} ${shape} ${prefix+id} ${order}`);
 }
});
test('generated pentatonic orders preserve written cells, alternating phase, bar splits and favourites',()=>{
 const board=fretboardFor(h,'E');
 for(const pattern of ['groups3','groups4','groups5','groups6','thirds','digital1324','rolling','alternating3','alternating4','cascade64','cascade456'])for(const motion of ['ascending','descending'])for(const sequenceOrder of ['normal','reverse','alternate','rotate']){
  const options={study:'pentatonic',pattern,motion,sequenceOrder,rhythm:'sixteenths'};
  const make=ds=>progressionExerciseGroups(ds.map(()=>h),ds,board,{...options,boardFor:()=>board});
  const split=make([1,2,1,4]),whole=make([8]);assert.deepEqual(split.flatMap(g=>g.notes),whole.flatMap(g=>g.notes),`${pattern} ${motion} ${sequenceOrder}`);
  for(const g of split)assert.equal(g.notes.length,[4,8,4,16][g.slot]);
  if(sequenceOrder==='normal')assert.notEqual(exerciseFavouriteKey(options),exerciseFavouriteKey({...options,sequenceOrder:'reverse'}));
 }
 for(const pattern of ['groups3','groups4','digital1324','rolling','cascade64'])for(const sequenceOrder of ['normal','reverse'])assert.deepEqual(notes(cagedStudy(board,h,'pentatonic','seventh','descending',{pattern,sequenceOrder})),notes(cagedStudy(board,h,'pentatonic','seventh','ascending',{pattern,sequenceOrder}).toReversed()));
});
test('whole-arpeggio root order reverses complete arpeggios without changing their chosen internal notes or approach targets',()=>{
 const board=fretboardFor(h,'E');
 for(const material of ['triad','seventh'])for(const source of ['diatonic','chordRoots'])for(const sequence of ['thirds','groups3','digital1324','return3','pedalLower'])for(const motion of ['ascending','descending'])for(const arpeggioApproach of ['none','below']){
  const options={arpeggioPattern:material==='triad'?'cell3_1353':'perm4_5731',arpeggioClose:false,arpeggioSource:source,arpeggioSequence:sequence,arpeggioApproach};
  const original=cagedStudy(board,h,'harmonized',material,motion,options),reversed=cagedStudy(board,h,'harmonized',material,motion,{...options,sequenceOrder:'reverse'});
  assert.equal(reversed.length,original.length);
  for(let i=0;i<original.length;i++){
   assert.deepEqual(reversed[i].rootSequence,original[i].rootSequence.toReversed());
   assert.deepEqual(reversed[i].notes,original[i].rootParts.toReversed().flatMap(p=>p.notes));
   if(arpeggioApproach==='below')for(const target of reversed[i].targetIndices)assert.equal(reversed[i].notes[target].midi-reversed[i].notes[target-1].midi,1);
  }
  if(arpeggioApproach==='none')for(const sequenceOrder of ['normal','reverse','alternate','rotate']){
   const run=ds=>progressionExerciseGroups(ds.map(()=>h),ds,board,{study:'harmonized',material,motion,rhythm:'sixteenths',...options,sequenceOrder,boardFor:()=>board}).flatMap(g=>g.notes);
   assert.deepEqual(run([1,2,1,4]),run([8]));
  }
 }
 const options={study:'harmonized',material:'seventh',motion:'descending',arpeggioSequence:'groups3'};
 assert.equal(normalizeExerciseOptions({...options}).arpeggioPattern,'perm4_1357');assert.notEqual(exerciseFavouriteKey({...options,sequenceOrder:'normal'}),exerciseFavouriteKey({...options,sequenceOrder:'reverse'}));
});
test('enclosures retain chosen approaches on both legs, and chromatic side changes preserve the final target',()=>{
 for(const shape of ['E','D','C','A','G']){
  const board=fretboardFor(h,shape);
  for(const study of ['enclosures','enclosuresbelowabove','enclosureschromatic','enclosures4','enclosures5']){
   const up=cagedStudy(board,h,study,'seventh','ascending'),down=cagedStudy(board,h,study,'seventh','descending');
   assert.deepEqual(notes(down),notes(up.toReversed()),shape+' '+study);
   for(const cell of down)assert.equal(cell.notes.at(-1).midi,cell.sequenceAnchor);
  }
  for(const study of ['doubleapproach','chromaticneighbors'])for(const order of ['normal','reverse']){
   const up=cagedStudy(board,h,study,'seventh','ascending',{sequenceOrder:order}),down=cagedStudy(board,h,study,'seventh','descending',{sequenceOrder:order});
   assert.deepEqual(notes(down),notes(up.toReversed()));
   const expected=study==='doubleapproach'?(order==='reverse'?[2,1,0]:[-2,-1,0]):order==='reverse'?[0,-1,0,1,0]:[0,1,0,-1,0];
   for(const cell of down)assert.deepEqual(cell.notes.map(n=>n.midi-cell.sequenceAnchor),expected);
   assert.notEqual(exerciseFavouriteKey({study,sequenceOrder:'normal'}),exerciseFavouriteKey({study,sequenceOrder:'reverse'}));
  }
 }
});
