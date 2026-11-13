import {test} from 'node:test';import assert from 'node:assert/strict';
import {DEFAULTS} from '../src/audio/engine.js';import {harmonyAt} from '../src/audio/music.js';import {neckExerciseGroups,neckExerciseCells} from '../src/practice/neck-exercises.js';import {cagedStudy} from '../src/guitar/exercises.js';import {orderedScaleCell,SCALE_SEQUENCES} from '../src/guitar/scale-sequences.js';import {TUNING} from '../src/guitar/fretboard.js';
const harmony=(key=9)=>harmonyAt({...DEFAULTS,key,progression:false},0),base={study:'groups4',material:'seventh',traversal:'horizontal',traversalStrings:'0,1',traversalStart:5,traversalEnd:17,rhythm:'sixteenths',motion:'ascending',sequenceOrder:'normal'};
const coords=groups=>groups.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret,n.neckCell?.id]));
test('horizontal completes every valid groups-of-four cell pattern before advancing',()=>{
 const h=harmony(),view={...base},regions=neckExerciseCells(h,view),expected=regions.slice(0,2).flatMap(r=>cagedStudy(r.board,h,'groups4','seventh','ascending').flatMap(c=>c.notes.map(n=>[n.midi,n.string,n.fret,r.degree])));
 const actual=coords(neckExerciseGroups([h],[expected.length/4],view));assert.deepEqual(actual,expected);assert.equal(expected.length,24);
});
test('diagonal joins successive shapes at the next anchor and reverses only at the neck limit',()=>{
 const h=harmony(),view={...base,traversal:'diagonal'},regions=neckExerciseCells(h,view),g=neckExerciseGroups([h],null,view)[0];
 let turned=false,last=null;const directionChanges=g.sequenceDirections.filter((d,i,a)=>i&&d!==a[i-1]);assert.deepEqual(directionChanges,[-1]);
 g.sequenceAnchors.forEach((anchor,i)=>{const direction=g.sequenceDirections[i];if(last!==null)assert.ok((anchor-last)*direction>0);if(direction===-1)turned=true;else assert.equal(turned,false);last=anchor;});
 assert.ok(new Set(g.notes.map(n=>n.neckCell.id)).size===regions.length);
 const lastAscending=g.sequenceDirections.lastIndexOf(1);assert.equal(g.notes[lastAscending*4].neckCell.id,regions.at(-1).degree);
});
test('spatial cell and pattern phase survive a bar split with identical harmony',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const study of ['groups3','groups4','thirds','positionalscale','harmonized']){
  const h=harmony(),view={...base,traversal,study,arpeggioSource:'selectedChord'};assert.deepEqual(coords(neckExerciseGroups([h],[8],view)),coords(neckExerciseGroups([h,h,h],[1.25,2.75,4],view)),`${traversal} ${study}`);
 }
});
test('written/permuted orders and reverse pairs remain inside the actual six-note cell',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const motion of ['ascending','descending'])for(const [study,sequenceOrder]of [['groups3','normal'],['groups4','reverse'],['thirds','directional'],['thirds','directionalReverse'],['scaleperm_312','normal']]){
  const h=harmony(),g=neckExerciseGroups([h],[16],{...base,traversal,motion,study,sequenceOrder})[0];let offset=0;
  for(let i=0;i<g.cellLengths.length;i++){
   const length=g.cellLengths[i],notes=g.notes.slice(offset,offset+length),cell=notes[0].neckCell;assert.ok(notes.every(n=>n.neckCell.id===cell.id));assert.ok(notes.every(n=>cell.notes.some(c=>c.midi===n.midi&&c.fret===n.fret&&c.string===n.string)));
   if(length===g.cellSizes[i]&&!g.cellOffsets[i]){const byMidi=new Map(cell.notes.map(n=>[n.midi,n])),candidates=cagedStudy({...g.board,notes:cell.notes},h,study,'seventh',g.sequenceDirections[i]>0?'ascending':'descending');assert.ok(candidates.some(c=>orderedScaleCell(c,sequenceOrder,i).notes.map(n=>n.midi).join(',')===notes.map(n=>n.midi).join(',')));}
   offset+=length;
  }
 }
});
test('core arpeggio cells, selected starting cells, and harmony changes keep real strings/pitches',()=>{
 for(let key=0;key<12;key++){
  const h=harmony(key),view={...base,study:'positional',arpeggioSource:'selectedChord'},regions=neckExerciseCells(h,view),first=regions.at(-1);const g=neckExerciseGroups([h],[4],{...view,traversalCell:first.degree})[0];assert.equal(g.notes[0]?.neckCell.id,first.degree);for(const n of g.notes){assert.ok(h.chordPcs.includes(n.pc));assert.equal(n.midi,TUNING[n.string]+n.fret);}
 }
 const harmonies=[0,1,2].map(i=>harmonyAt({...DEFAULTS,key:9,progression:true,template:'major251altered'},i));
 for(const traversal of ['horizontal','diagonal'])for(const study of ['groups4','arpseq_groups3','harmonized','enclosures4']){
  const groups=neckExerciseGroups(harmonies,[1.25,2.75,8],{...base,traversal,study,arpeggioSource:'selectedChord'});
  for(const g of groups)for(const n of g.notes){assert.ok([0,1].includes(n.string));assert.ok(n.fret>=5&&n.fret<=17);assert.equal(n.midi,TUNING[n.string]+n.fret);assert.ok(n.neckCell);}
 }
});
test('a pattern larger than its physical cell is unavailable, never extended outside it',()=>{
 const g=neckExerciseGroups([harmony()],[4],{...base,study:'groups7'})[0];assert.equal(g.notes.length,0);assert.ok(g.warning);
});
test('diagonal advance keeps its note-step phase across shapes, bar splits and a chosen starting cell',()=>{
 const h=harmony(),view={...base,traversal:'diagonal',traversalEnd:24},line=Array.from({length:128},(_,i)=>i).filter(n=>h.scalePcs.includes(n%12));
 for(const sequenceAdvance of [2,3])for(const selected of ['first',neckExerciseCells(h,view)[1].degree]){
  const recipe={...view,sequenceAdvance,traversalCell:selected},g=neckExerciseGroups([h],null,recipe)[0];let previous=null;
  g.sequenceAnchors.forEach((anchor,i)=>{if(previous!==null&&g.sequenceDirections[i]===g.sequenceDirections[i-1])assert.equal(Math.abs(line.indexOf(anchor)-line.indexOf(previous)),sequenceAdvance);previous=anchor;});
  assert.deepEqual(coords(neckExerciseGroups([h],[8],recipe)),coords(neckExerciseGroups([h,h,h],[1.25,2.75,4],recipe)));
  if(selected!=='first')assert.equal(g.notes[0].neckCell.id,selected);
 }
});
