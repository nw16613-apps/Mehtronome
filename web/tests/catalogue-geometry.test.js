import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,TUNING} from '../src/guitar/fretboard.js';import {neckExerciseCells,neckExerciseGroups} from '../src/practice/neck-exercises.js';import {normalizeExerciseOptions,migrateTraversalSnapshot} from '../src/practice/exercise-options.js';import {exerciseFavouriteKey,readExerciseFavourites} from '../src/practice/exercise-favourites.js';import {scaleCellOrders,scaleSequenceCells,orderedScaleCell} from '../src/guitar/scale-sequences.js';import {linkExerciseFingering} from '../src/practice/linked-fingering.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),base={traversalGeometryVersion:3,linkedFingering:true,study:'positionalscale',fingering:'caged',traversal:'horizontal',traversalStrings:'2,3,4,5',traversalStart:1,traversalEnd:24,traversalShiftStrings:2,motion:'ascending',rhythm:'sixteenths',material:'seventh',traversalPositionOrder:'roundtrip',traversalTurn:'note'},stamp=g=>g.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret,n.neckCell.id]));
test('CAGED cells reuse exact modal fretboard geometry, including octave copies and chord subsets',()=>{
 for(const key of [0,3,9])for(const mode of ['dorian','lydian_dominant','harmonic_minor'])for(const study of ['positionalscale','positional']){
  const harmony=harmonyAt({key,mode,chord:'min7'}),v={...base,study},cells=neckExerciseCells(harmony,v);assert.ok(cells.length>3);
  for(const cell of cells){const [,shape,start]=cell.degree.split(':'),board=fretboardFor(harmony,shape),delta=Number(start)-board.start,allowed=study==='positional'?harmony.chordPcs:harmony.scalePcs;assert.equal(Math.abs(delta%12),0);assert.deepEqual(cell.board.notes,board.notes.filter(n=>[2,3,4,5].includes(n.string)&&allowed.includes(n.pc)).map(n=>({...n,midi:n.midi+delta,fret:n.fret+delta})));for(const n of cell.board.notes)assert.equal(n.midi,TUNING[n.string]+n.fret);}
 }
});
test('diagonal blocks use neighbouring CAGED positions and full-string blocks equal horizontal',()=>{
 const cells=neckExerciseCells(h,base),routes=neckExerciseCells(h,{...base,traversal:'diagonal'});assert.equal(routes.length,cells.length-1);
 for(const [i,r]of routes.entries())for(const [j,b]of r.blocks.entries())assert.deepEqual(b.board.notes,cells[i+j].board.notes.filter(n=>(j?[4,5]:[2,3]).includes(n.string)));
 assert.deepEqual(neckExerciseCells(h,{...base,traversal:'diagonal',traversalShiftStrings:4}).map(c=>c.board.notes),cells.map(c=>c.board.notes));assert.equal(exerciseFavouriteKey({...base,traversal:'diagonal',traversalShiftStrings:4}),exerciseFavouriteKey(base));
 assert.notDeepEqual(cells.map(c=>c.board.notes),neckExerciseCells(h,{...base,fingering:'three'}).map(c=>c.board.notes));assert.notEqual(exerciseFavouriteKey(base),exerciseFavouriteKey({...base,fingering:'three'}));
});
test('both geometries preserve physical routes and bar phase for all position orders',()=>{
 for(const fingering of ['caged','three'])for(const traversal of ['horizontal','diagonal'])for(const motion of ['ascending','descending'])for(const traversalPositionOrder of ['follow','alternate','roundtrip'])for(const study of ['positionalscale','positional','groups3','thirds','arpseq_groups3']){
  const v={...base,fingering,traversal,motion,traversalPositionOrder,study},whole=neckExerciseGroups([h],[32],v);assert.ok(whole[0].notes.length||whole[0].warning);assert.deepEqual(stamp(whole),stamp(neckExerciseGroups([h,h,h],[3.25,9.75,19],v)));
 }
});
test('saved recipes retain old 3NPS geometry while new CAGED favourites retain CAGED',()=>{
 const legacy={...base};delete legacy.traversalGeometryVersion;assert.equal(migrateTraversalSnapshot(legacy).fingering,'three');assert.deepEqual(stamp(neckExerciseGroups([h],[8],migrateTraversalSnapshot(legacy))),stamp(neckExerciseGroups([h],[8],{...base,fingering:'three'})));assert.equal(readExerciseFavourites(JSON.stringify([base]))[0].fingering,'caged');assert.equal(readExerciseFavourites(JSON.stringify([legacy]))[0].fingering,'three');
 const v={...base};linkExerciseFingering(v,{kind:'three'},h);assert.equal(normalizeExerciseOptions(v).fingering,'three');assert.equal(normalizeExerciseOptions({...base,study:'positional',fingering:'three'}).fingering,'three');const unavailable=neckExerciseGroups([h],[8],{...base,fingering:'drop2'})[0];assert.equal(unavailable.notes.length,0);assert.match(unavailable.warning,/supports CAGED and 3NPS/);
});
test('explicit patterns absorb redundant reversal controls while preserving musical cells',()=>{
 const board=fretboardFor(h,'E');for(const study of ['scaleperm_123','scaleperm_132','scaleperm_4321','expand4','contract5'])for(const sequenceOrder of ['reverse','alternateReverse','directionalReverse']){const old={study,sequenceOrder},v=normalizeExerciseOptions({...old});assert.ok(!['reverse','alternateReverse','directionalReverse'].includes(v.sequenceOrder));for(const direction of ['ascending','descending']){const before=scaleSequenceCells(board,h,study,direction),after=scaleSequenceCells(board,h,v.study,direction);assert.deepEqual(before.map((c,i)=>orderedScaleCell(c,sequenceOrder,i).pcs),after.map((c,i)=>orderedScaleCell(c,v.sequenceOrder,i).pcs));}assert.ok(!scaleCellOrders(study).some(([id])=>['reverse','alternateReverse','directionalReverse'].includes(id)));}
 for(const [a,b]of [['groups3','scaleperm_123'],['groups4','scaleperm_1234']])assert.deepEqual(scaleSequenceCells(board,h,a,'ascending').map(c=>c.notes),scaleSequenceCells(board,h,b,'ascending').map(c=>c.notes));
 assert.equal(exerciseFavouriteKey({study:'groups3',sequenceOrder:'reverse'}),exerciseFavouriteKey({study:'scaleperm_321',sequenceOrder:'normal'}));assert.equal(exerciseFavouriteKey({study:'expand4',sequenceOrder:'reverse'}),exerciseFavouriteKey({study:'contract4',sequenceOrder:'normal'}));
});

test('3NPS arpeggios are a subset of the selected modal shapes rather than rebuilt chord-tone fingerings',()=>{
 for(const traversal of ['horizontal','diagonal']){const v={...base,traversal,fingering:'three'},scale=neckExerciseCells(h,v),core=neckExerciseCells(h,{...v,study:'positional'});for(const cell of core){const parent=scale.find(r=>r.degree===cell.degree);assert.deepEqual(cell.board.notes,parent.board.notes.filter(n=>h.chordPcs.includes(n.pc)));}}
 const old=migrateTraversalSnapshot({...base,traversalGeometryVersion:2,study:'positional'});assert.equal(old.traversalLegacyCore,true);assert.equal(readExerciseFavourites(JSON.stringify([old]))[0].traversalLegacyCore,true);
});
