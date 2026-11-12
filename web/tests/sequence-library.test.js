import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';import {cagedStudy} from '../src/guitar/exercises.js';
import {SCALE_SEQUENCES,orderedScaleCell} from '../src/guitar/scale-sequences.js';import {ARPEGGIO_ROOT_SEQUENCES} from '../src/guitar/arpeggio-sequences.js';import {SCALE_SEQUENCE_FAMILIES,libraryExerciseValue,resolveLibraryExercise} from '../src/practice/exercise-library.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {exerciseFavouriteKey,readExerciseFavourites} from '../src/practice/exercise-favourites.js';import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';
const shapes=['E','D','C','A','G'],h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'C'),position=cagedPositionFor(board);
const generate=(study,ds,options={})=>progressionExerciseGroups(ds.map(()=>h),ds,board,{study,rhythm:'sixteenths',positionPath:ds.map(()=>position),...options});
test('catalogue contains complete interval/group ranges and exhaustive three/four-note orders',()=>{
 assert.equal(SCALE_SEQUENCE_FAMILIES.intervals.length,7);assert.equal(SCALE_SEQUENCE_FAMILIES.groups.length,6);
 for(const n of [3,4]){const items=SCALE_SEQUENCE_FAMILIES['permutations'+n];assert.equal(items.length,n===3?6:24);const patterns=items.map(([id])=>SCALE_SEQUENCES[id].offsets);assert.equal(new Set(patterns.map(p=>p.join(','))).size,items.length);for(const p of patterns)assert.deepEqual(p.toSorted((a,b)=>a-b),Array.from({length:n},(_,i)=>i));}
 assert.deepEqual(SCALE_SEQUENCES.return3.offsets,[0,1,2,1]);assert.deepEqual(SCALE_SEQUENCES.return3closed.offsets,[0,1,2,1,0]);assert.deepEqual(SCALE_SEQUENCES.skip2.offsets,[0,2,1,3,2,4]);
 assert.equal(libraryExerciseValue('arpseq_groups5'),'arpeggioSequences');assert.equal(resolveLibraryExercise('arpeggioSequences'),'arpseq_groups3');
});
test('overlapping arpeggio groups are consecutive chord tones, not successive whole arpeggios or added extensions',()=>{
 for(const size of [3,4,5,6,7,8]){const cells=cagedStudy(board,h,'arpseq_groups'+size),core=arpeggioHarmony(h),line=Array.from({length:128},(_,i)=>i).filter(m=>core.chordPcs.includes(m%12));assert.ok(cells.length);for(const cell of cells){const i=line.indexOf(cell.sequenceAnchor);assert.deepEqual(cell.notes.map(n=>n.midi),line.slice(i,i+size));}}
 const triad=cagedStudy(board,h,'arpseq_groups4','triad');assert.ok(triad.length);for(const cell of triad)assert.ok(cell.notes.every(n=>h.chordPcs.slice(0,3).includes(n.pc)));
 assert.deepEqual(cagedStudy(board,h,'arpseq_groups3')[0].notes.map(n=>n.name),['C','E','G']);
 const h13=harmonyAt({key:9,mode:'dorian',chord:'min13'});assert.deepEqual(cagedStudy(board,h,'arpseq_groups5').map(c=>c.notes.map(n=>n.midi)),cagedStudy(fretboardFor(h13,'C'),h13,'arpseq_groups5').map(c=>c.notes.map(n=>n.midi)));
});
test('every scale/arpeggio recipe retains theoretical steps, written order and physical pitches in both directions',()=>{
 for(const mode of ['dorian','major','harmonic_minor','minor_pentatonic'])for(const key of [0,4,9])for(const shape of shapes){const harmony=harmonyAt({key,mode,chord:mode==='major'?'maj7':'min7'}),b=fretboardFor(harmony,shape);
  for(const prefix of ['','arpseq_'])for(const [id,def]of Object.entries(SCALE_SEQUENCES))for(const direction of [1,-1]){
   const pcs=prefix?arpeggioHarmony(harmony).chordPcs:harmony.scalePcs,line=Array.from({length:128},(_,i)=>i).filter(m=>pcs.includes(m%12)),cells=cagedStudy(b,harmony,prefix+id,'seventh',direction>0?'ascending':'descending');
   for(const cell of cells){assert.ok(cell.notes.length);for(const n of cell.notes){assert.ok(b.notes.some(p=>p.string===n.string&&p.fret===n.fret&&p.midi===n.midi));assert.equal(n.midi,[40,45,50,55,59,64][n.string]+n.fret);assert.ok(pcs.includes(n.pc));}
    if(!def.pedal){const start=line.indexOf(cell.sequenceAnchor);assert.deepEqual(cell.notes.map(n=>n.midi),def.offsets.map(i=>line[start+i*(def.family==='intervals'?1:direction)]),`${mode} ${shape} ${prefix+id}`);}else{assert.equal(cell.notes[1].midi,cell.sequenceAnchor);assert.equal(cell.notes[0].midi,def.pedal==='lower'?Math.min(...b.notes.filter(n=>pcs.includes(n.pc)).map(n=>n.midi)):Math.max(...b.notes.filter(n=>pcs.includes(n.pc)).map(n=>n.midi)));}
   }
  }
 }
});
test('order and advance survive bar splits and turn without losing cell phase',()=>{
 for(const study of ['groups5','scaleperm_312','return4closed','expand4','pedalLower','arpseq_groups5','arpseq_scaleperm_3142'])for(const sequenceOrder of ['normal','reverse','alternate','alternateReverse','rotate','cycle'])for(const sequenceAdvance of [1,2,3])for(const motion of ['ascending','descending']){
  const options={sequenceOrder,sequenceAdvance,motion},a=generate(study,[1,2,1,4],options),b=generate(study,[8],options);assert.deepEqual(a.flatMap(g=>g.notes.map(n=>n.midi)),b.flatMap(g=>g.notes.map(n=>n.midi)),`${study} ${sequenceOrder} ${sequenceAdvance}`);
  let ordinal=0;for(const g of a){let offset=0;for(let i=0;i<g.cellLengths.length;i++){const cell=cagedStudy(g.board,g.harmony,study,'seventh',g.sequenceDirections[i]>0?'ascending':'descending',{sequenceAdvance}).find(c=>c.sequenceAnchor===g.sequenceAnchors[i]);assert.ok(cell);const written=orderedScaleCell(cell,sequenceOrder,ordinal);assert.deepEqual(g.notes.slice(offset,offset+g.cellLengths[i]).map(n=>n.midi),written.notes.slice(g.cellOffsets[i],g.cellOffsets[i]+g.cellLengths[i]).map(n=>n.midi));offset+=g.cellLengths[i];if(g.cellOffsets[i]+g.cellLengths[i]===g.cellSizes[i])ordinal++;}}
 }
});
test('whole-arpeggio root motifs retain each complete chosen order and target preparation',()=>{
 for(const source of ['diatonic','chordRoots','selectedChord'])for(const material of ['triad','seventh'])for(const motion of ['ascending','descending'])for(const sequence of ['thirds','groups3','digital1324','return3','pedalLower']){
  const options=normalizeExerciseOptions({study:'harmonized',material,motion,arpeggioPattern:material==='triad'?'perm3_513':'perm4_5731',arpeggioClose:false,arpeggioSource:source,arpeggioSequence:sequence,arpeggioApproach:'below'});
  const base=cagedStudy(board,h,'harmonized',material,motion,{...options,arpeggioSequence:'stepwise'}),cells=cagedStudy(board,h,'harmonized',material,motion,options),length=(material==='triad'?3:4)*2;
  for(const cell of cells){assert.equal(cell.notes.length,cell.rootSequence.length*length);for(let i=0;i<cell.rootSequence.length;i++){const original=base.find(c=>c.sequenceAnchor===cell.rootSequence[i]);assert.ok(original);assert.deepEqual(cell.notes.slice(i*length,(i+1)*length).map(n=>n.midi),original.notes.map(n=>n.midi));}for(const i of cell.targetIndices)assert.equal(cell.notes[i].midi-cell.notes[i-1].midi,1);}
 }
 const options={study:'harmonized',material:'triad',arpeggioPattern:'perm3_135',arpeggioClose:false,arpeggioSequence:'thirds'};assert.ok(cagedStudy(board,h,'harmonized','triad','ascending',options).length);
 const a=generate('harmonized',[1,2,1,4],options),b=generate('harmonized',[8],options);assert.deepEqual(a.flatMap(g=>g.notes.map(n=>n.midi)),b.flatMap(g=>g.notes.map(n=>n.midi)));
});
test('sequence favourites distinguish axes and recover legacy overlapping groups',()=>{
 const a={study:'arpseq_groups3',motion:'ascending',rhythm:'eighths'};assert.equal(normalizeExerciseOptions({study:'arpgroups3'}).study,'arpseq_groups3');
 for(const changes of [{sequenceAdvance:2},{sequenceOrder:'alternate'},{study:'groups3'}])assert.notEqual(exerciseFavouriteKey(a),exerciseFavouriteKey({...a,...changes}));
 assert.equal(exerciseFavouriteKey({...a,study:'arpseq_scaleperm_123'}),exerciseFavouriteKey(a));
 const arp={study:'harmonized',material:'triad',arpeggioPattern:'perm3_135'};assert.notEqual(exerciseFavouriteKey(arp),exerciseFavouriteKey({...arp,arpeggioSequence:'groups3'}));
 assert.equal(readExerciseFavourites(JSON.stringify([a,{...a,sequenceAdvance:2}])).length,2);
});
