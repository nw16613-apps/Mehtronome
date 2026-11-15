import test from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {arpeggioCollection} from '../src/guitar/arpeggio-collection.js';
import {fretboardFor} from '../src/guitar/fretboard.js';
import {fretboardCollection,arpeggioDiagramsMarkup} from '../src/guitar/fretboard-study.js';
import {fingeringCatalogue} from '../src/guitar/fingering-catalogue.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {neckExerciseCells,neckExerciseGroups} from '../src/practice/neck-exercises.js';
import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),base={study:'harmonized',material:'seventh',fingering:'three',linkedFingering:true,arpeggioPattern:'perm4_1357',arpeggioRoutine:'repeat',arpeggioRegister:'up',arpeggioSequence:'stepwise',arpeggioClose:false,motion:'ascending',rhythm:'sixteenths',traversal:'horizontal',traversalStrings:'3,4,5',traversalStart:2,traversalEnd:17,traversalShiftStrings:2,traversalTurn:'note',traversalPositionOrder:'follow'};
test('diagram source lists and generated complete arpeggios have the same roots and tone sets',()=>{
 for(const material of ['triad','seventh'])for(const arpeggioSource of ['selectedChord','diatonic','chordRoots']){
  const v={...base,material,arpeggioSource},members=arpeggioCollection(h,material,arpeggioSource),collection=fretboardCollection(h,v),board=fretboardFor(h,'E');
  assert.deepEqual(collection.arpeggios.map(a=>a.chordPcs),members.map(a=>a.chordPcs));
  const markup=arpeggioDiagramsMarkup(board,collection,true,['1','2','♭3','4','5','6','♭7']);for(const member of members)assert.ok(markup.includes(`data-arpeggio-root="${member.chordPcs[0]}"`));
  for(const pattern of [material==='triad'?'perm3_135':'perm4_1357','straight']){
   const cells=cagedStudy(board,h,'harmonized',material,'ascending',{...v,arpeggioPattern:pattern});assert.ok(cells.length);
   for(const cell of cells){assert.equal(cell.notes.length,material==='triad'?3:4);assert.ok(members.some(m=>cell.notes[0].pc===m.chordPcs[0]&&cell.notes.every(n=>m.chordPcs.includes(n.pc))));assert.ok(cell.notes.every(n=>board.notes.some(b=>b.string===n.string&&b.fret===n.fret)));}
  }
 }
 assert.deepEqual(arpeggioCollection(h,'seventh','chordRoots').map(a=>a.name+a.suffix),['Am7','Cmaj7','Em7','Gmaj7']);
});
test('dedicated arpeggio fingerings expose every source root and all inversions without changing geometry',()=>{
 for(const kind of ['oneTwo','twoOne'])for(const material of ['triad','seventh'])for(const arpeggioSource of ['selectedChord','diatonic','chordRoots']){
  const members=arpeggioCollection(h,material,arpeggioSource),catalogue=fingeringCatalogue(h,kind,0,'chord',4,{...base,material,arpeggioSource});
  assert.equal(catalogue.length,members.length*(material==='triad'?3:4));
  assert.deepEqual([...new Set(catalogue.map(e=>e.harmony.chordPcs[0]))],members.map(m=>m.chordPcs[0]));
  for(const entry of catalogue)for(const b of entry.choices){assert.ok(b.notes.every(n=>entry.harmony.chordPcs.includes(n.pc)));assert.deepEqual(Array.from({length:6},(_,s)=>b.notes.filter(n=>n.string===s).length),kind==='oneTwo'?[1,2,1,2,1,2]:[2,1,2,1,2,1]);}
  const v=normalizeExerciseOptions({...base,fingering:kind,material,arpeggioSource,inversion:catalogue.length-1});assert.equal(v.inversion,catalogue.length-1);
 }
});
test('across-neck arpeggio exercises retain complete motifs and exact displayed coordinates across bars',()=>{
 for(const fingering of ['caged','three'])for(const traversal of ['horizontal','diagonal'])for(const arpeggioSource of ['selectedChord','diatonic','chordRoots']){
  const v={...base,fingering,traversal,arpeggioSource,traversalStart:1,traversalEnd:24,traversalStrings:'2,3,4,5'},shapes=neckExerciseCells(h,v),allowed=new Map(shapes.flatMap(s=>(s.blocks||[s]).map(b=>[b.degree,new Set(b.board.notes.map(n=>`${n.string}:${n.fret}`))])));
  const whole=neckExerciseGroups([h],[16],v),split=neckExerciseGroups([h,h,h,h],[4,4,4,4],v);if(!whole[0].notes.length){assert.match(whole[0].warning,/complete|fits/);continue;}
  assert.deepEqual(split.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret])),whole.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret])));
  for(const g of split){assert.ok(g.cellSizes.every(n=>n===4));assert.ok(g.notes.every(n=>!n.boundaryRepeat&&!n.boundaryApproach&&allowed.get(n.neckCell.id)?.has(`${n.string}:${n.fret}`)));}
 }
});

test('selected chord uses the written triad or compatible seventh counterpart',()=>{
 const triad=arpeggioCollection(h,'triad','selectedChord')[0];assert.equal(triad.name+triad.suffix,'Am');assert.equal(triad.chordPcs.length,3);
 const plain=harmonyAt({key:9,mode:'dorian',chord:'minor'}),seventh=arpeggioCollection(plain,'seventh','selectedChord')[0];assert.equal(seventh.name+seventh.suffix,'Am7');assert.deepEqual(seventh.chordPcs,[9,0,4,7]);
});

test('all keys and diatonic modes generate only members of the displayed source',()=>{
 const qualities={major:'maj7',dorian:'min7',phrygian:'min7',lydian:'maj7',mixolydian:'dom7',minor:'min7',locrian:'halfDim'};
 for(let key=0;key<12;key++)for(const [mode,chord]of Object.entries(qualities))for(const material of ['triad','seventh'])for(const arpeggioSource of ['selectedChord','diatonic','chordRoots']){
  const harmony=harmonyAt({key,mode,chord}),v={...base,material,arpeggioSource,fingering:'caged',arpeggioPattern:material==='triad'?'perm3_135':'perm4_1357'},board=fretboardFor(harmony,'E'),members=fretboardCollection(harmony,v).arpeggios,cells=cagedStudy(board,harmony,'harmonized',material,'ascending',v);
  assert.ok(cells.length,`${key} ${mode} ${material} ${arpeggioSource}`);
  for(const c of cells)assert.ok(members.some(m=>c.notes[0].pc===m.chordPcs[0]&&c.notes.every(n=>m.chordPcs.includes(n.pc))));
 }
});
