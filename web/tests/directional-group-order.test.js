import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,fullFretboardFor} from '../src/guitar/fretboard.js';import {SCALE_SEQUENCES,hasDirectionalCellOrder,scaleCellOrders} from '../src/guitar/scale-sequences.js';import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';import {exerciseFavouriteKey} from '../src/practice/exercise-favourites.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {neckExerciseGroups} from '../src/practice/neck-exercises.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'D');
const pitches=groups=>groups.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret]));
test('direction-following orders are available and restore for every generated scale/arpeggio family',()=>{
 for(const id of Object.keys(SCALE_SEQUENCES))for(const prefix of ['','arpseq_'])for(const sequenceOrder of ['directional','directionalReverse']){
  const view=normalizeExerciseOptions({study:prefix+id,sequenceOrder});assert.equal(view.sequenceOrder,sequenceOrder);assert.ok(hasDirectionalCellOrder(view));assert.ok(scaleCellOrders(prefix+id).some(([id])=>id===sequenceOrder));assert.notEqual(exerciseFavouriteKey(view),exerciseFavouriteKey({...view,sequenceOrder:'normal'}));
 }
 for(const view of [{study:'harmonized',arpeggioSequence:'groups3'},{study:'pentatonic',pattern:'groups4'}])assert.equal(normalizeExerciseOptions({...view,sequenceOrder:'directional'}).sequenceOrder,'directional');
 for(const view of [{study:'enclosures4'},{study:'chromaticneighbors'},{study:'pentatonic',pattern:'lesson4'},{study:'positionalscale'}])assert.equal(normalizeExerciseOptions({...view,sequenceOrder:'directional'}).sequenceOrder,'normal');
});
test('groups, permutations, digital, return, skip and pedal orders follow the structural leg through every turn',()=>{
 const cases=['groups3','groups4','groups5','groups6','groups7','groups8','scaleperm_312','digital1324','cells','return4','expand4','skip2','pedalLower'];
 for(const id of cases)for(const prefix of ['','arpseq_'])for(const sequenceOrder of ['directional','directionalReverse'])for(const motion of ['ascending','descending']){
  const view={study:prefix+id,sequenceOrder,motion,rhythm:'sixteenths'},g=progressionExerciseGroups([h],[32],board,view)[0],reference=progressionExerciseGroups([h],[32],board,{...view,sequenceOrder:'normal'})[0];assert.equal(g.notes.length,reference.notes.length);let offset=0;
  for(let i=0;i<g.cellLengths.length;i++){const size=g.cellLengths[i],reverse=sequenceOrder==='directional'?g.sequenceDirections[i]<0:g.sequenceDirections[i]>0,expected=reference.notes.slice(offset,offset+size);if(size===g.cellSizes[i]&&!g.cellOffsets[i])assert.deepEqual(g.notes.slice(offset,offset+size).map(n=>n.midi),(reverse?expected.toReversed():expected).map(n=>n.midi),`${prefix+id} ${motion} ${sequenceOrder}`);offset+=size;}
 }
});
test('directional group order preserves phase across bars and the new horizontal/diagonal cell routes',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const sequenceOrder of ['directional','directionalReverse']){
  const view={study:'groups4',traversal,traversalStrings:'0,1',traversalStart:5,traversalEnd:17,sequenceOrder,rhythm:'sixteenths'};assert.deepEqual(pitches(neckExerciseGroups([h],[8],view)),pitches(neckExerciseGroups([h,h,h],[1.25,2.75,4],view)));
  const g=neckExerciseGroups([h],null,view)[0];let offset=0;for(const [i,size]of g.cellLengths.entries()){const ns=g.notes.slice(offset,offset+size);if(size===4){const expected=sequenceOrder==='directional'?g.sequenceDirections[i]:-g.sequenceDirections[i];assert.equal(Math.sign(ns[1].midi-ns[0].midi),expected);assert.ok(ns.every(n=>n.neckCell.id===ns[0].neckCell.id));}offset+=size;}
 }
});
test('generated pentatonic cells and whole-arpeggio root groups follow travel without changing literal lessons or internal arpeggio orders',()=>{
 const full=fullFretboardFor(h,1,24);
 for(const options of [{study:'pentatonic',pattern:'groups4'},{study:'harmonized',material:'triad',arpeggioSource:'diatonic',arpeggioPattern:'perm3_513',arpeggioSequence:'groups3'}])for(const sequenceOrder of ['directional','directionalReverse']){
  const make=(ds,order)=>progressionExerciseGroups(ds.map(()=>h),ds,full,{...options,sequenceOrder:order,rhythm:'sixteenths'}),whole=make([16],sequenceOrder),split=make([1,2,3,10],sequenceOrder);assert.deepEqual(pitches(whole),pitches(split));assert.ok(whole[0].notes.length);
  const reversed=make([16],'reverse'),normal=make([16],'normal'),g=whole[0];let offset=0;
  g.cellLengths.forEach((size,i)=>{const reverse=sequenceOrder==='directional'?g.sequenceDirections[i]<0:g.sequenceDirections[i]>0,reference=reverse?reversed[0]:normal[0];assert.deepEqual(g.notes.slice(offset,offset+size).map(n=>n.midi),reference.notes.slice(offset,offset+size).map(n=>n.midi));offset+=size;});
 }
});
