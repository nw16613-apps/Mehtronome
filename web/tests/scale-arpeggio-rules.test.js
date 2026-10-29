import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,CHORDS,harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {positionalArpeggio} from '../src/practice/learning.js';
import {recommendedMode} from '../src/practice/custom-progression.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const patterns={thirds:[0,2],fourths:[0,3],sixths:[0,5],groups3:[0,1,2],groups4:[0,1,2,3],digital1324:[0,2,1,3],cells:[0,1,2,4]};
const sizes={triad:3,seventh:4,extensions:5};
const midiCells=cells=>cells.map(c=>c.notes.map(n=>n.midi));
// Independent reference: construct the theoretical scale through MIDI octaves,
// then retain only cells whose exact pitches are present on this diagram.
function scaleCells(board,h,offsets,direction){
 const line=Array.from({length:128},(_,midi)=>midi).filter(midi=>h.scalePcs.includes(midi%12)),available=new Set(board.notes.map(n=>n.midi));
 return line.filter(midi=>available.has(midi)).sort((a,b)=>(a-b)*direction).map(anchor=>offsets.map(offset=>line[line.indexOf(anchor)+direction*offset])).filter(cell=>cell.every(midi=>available.has(midi)));
}
test('scale sequences include every complete cell across all scale families and CAGED shapes',()=>{
 for(const mode of Object.keys(MODES))for(const key of Array.from({length:12},(_,i)=>i))for(const shape of ['C','A','G','E','D'])for(const direction of [1,-1]){
  const h=harmonyAt({key,mode,chord:MODES[mode].chord}),board=fretboardFor(h,shape),motion=direction>0?'ascending':'descending';
  for(const [study,offsets]of Object.entries(patterns))assert.deepEqual(midiCells(cagedStudy(board,h,study,'seventh',motion)),scaleCells(board,h,offsets,direction),`${mode} ${key} ${shape} ${motion} ${study}`);
 }
});
test('harmonized and alternating stacks cover every complete register without inventing scale notes',()=>{
 for(const mode of Object.keys(MODES))for(const shape of ['C','A','G','E','D'])for(const [material,size]of Object.entries(sizes))for(const direction of [1,-1]){
  const h=harmonyAt({key:9,mode,chord:MODES[mode].chord}),board=fretboardFor(h,shape),motion=direction>0?'ascending':'descending',expected=scaleCells(board,h,Array.from({length:size},(_,i)=>2*i),direction);
  assert.deepEqual(midiCells(cagedStudy(board,h,'harmonized',material,motion)),expected,`${mode} ${shape} ${material} ${motion}`);
  assert.deepEqual(midiCells(cagedStudy(board,h,'alternating',material,motion)),expected.map((cell,i)=>i%2?[...cell].reverse():cell));
 }
});
test('an interior missing pitch omits only affected cells rather than ending the traversal',()=>{
 const h=harmonyAt({key:0,mode:'major',chord:'maj7'}),board={start:0,end:24,notes:[60,62,64,65,67,71,72,74,76,77,79,81,83,84].map(midi=>({midi,pc:midi%12,name:'',string:0,fret:midi-40}))};
 assert.deepEqual(midiCells(cagedStudy(board,h,'groups3')),[[60,62,64],[62,64,65],[64,65,67],[71,72,74],[72,74,76],[74,76,77],[76,77,79],[77,79,81],[79,81,83],[81,83,84]]);
});
test('selected-chord inversions traverse every complete register before reversing',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'C');
 const expected=[[48,52,55,57],[52,55,57,60],[55,57,60,64],[57,60,64,67],[60,64,67,69],[64,67,69,72]];
 assert.deepEqual(midiCells(cagedStudy(board,h,'inversions','seventh','ascending')),expected);
 assert.deepEqual(midiCells(cagedStudy(board,h,'inversions','seventh','descending')),expected.toReversed().map(c=>c.toReversed()));
 const positionPath=[{...cagedPositionFor(board),geometryShape:'C'}],g=progressionExerciseGroups([h],[16],board,{study:'inversions',positionPath})[0];
 assert.deepEqual(g.notes.slice(20,28).map(n=>n.midi),[64,67,69,72,69,67,64,60]);
});
test('bar splits do not change scale/arpeggio patterns or alternating phase',()=>{
 const h=harmonyAt({key:0,mode:'harmonic_minor',chord:'minMaj7'}),board=fretboardFor(h,'G');
 for(const study of [...Object.keys(patterns),'harmonized','alternating','chordtones','chordtonesalternating','inversions','positional'])for(const motion of ['ascending','descending']){
  const run=durations=>progressionExerciseGroups(durations.map(()=>h),durations,board,{study,motion,rhythm:'sixteenths',positionPath:durations.map(()=>({...cagedPositionFor(board),geometryShape:'G'}))});
  const length={thirds:2,fourths:2,sixths:2,groups3:3,groups4:4,digital1324:4,cells:4}[study]||4;
  const beat=study==='positional'?4:length;
  assert.deepEqual(run([beat,beat,beat]).flatMap(g=>g.notes.map(n=>n.midi)),run([beat*3]).flatMap(g=>g.notes.map(n=>n.midi)),`${study} ${motion}`);
 }
});

test('core-chord-tone stacks use exact scale steps and alternate only the played contour',()=>{
 for(const mode of Object.keys(MODES))for(const shape of ['C','A','G','E','D'])for(const [material,size]of Object.entries(sizes))for(const direction of [1,-1]){
  const h=harmonyAt({key:6,mode,chord:MODES[mode].chord}),board=fretboardFor(h,shape),motion=direction>0?'ascending':'descending';
  let expected=scaleCells(board,h,Array.from({length:size},(_,i)=>i*2),1).filter(cell=>h.chordPcs.slice(0,4).includes(cell[0]%12));
  if(direction<0)expected=expected.toReversed().map(cell=>cell.toReversed());
  assert.deepEqual(midiCells(cagedStudy(board,h,'chordtones',material,motion)),expected,`${mode} ${shape} ${material} ${motion}`);
  assert.deepEqual(midiCells(cagedStudy(board,h,'chordtonesalternating',material,motion)),expected.map((cell,i)=>i%2?cell.toReversed():cell));
 }
});
test('inversions cover every fitting anchor for every chord type, including suspended and extended chords',()=>{
 for(const chord of Object.keys(CHORDS))for(const shape of ['C','A','G','E','D'])for(const [material,size]of Object.entries(sizes))for(const direction of [1,-1]){
  const h=harmonyAt({key:6,mode:recommendedMode(chord),chord}),board=fretboardFor(h,shape),motion=direction>0?'ascending':'descending',pcs=h.chordPcs.slice(0,size),available=new Set(board.notes.map(n=>n.midi));
  const expected=[...available].filter(midi=>pcs.includes(midi%12)).sort((a,b)=>(a-b)*direction).map(anchor=>{
   const first=pcs.indexOf(anchor%12),notes=[anchor];
   for(let i=1;i<pcs.length;i++){const pc=pcs[(first+direction*i+pcs.length*10)%pcs.length],last=notes.at(-1),delta=((direction*(pc-last%12))%12+12)%12||12;notes.push(last+direction*delta);}
   return notes;
  }).filter(cell=>cell.every(midi=>available.has(midi)));
  assert.deepEqual(midiCells(cagedStudy(board,h,'inversions',material,motion)),expected,`${chord} ${shape} ${material} ${motion}`);
 }
});

test('positional pitch libraries include each written chord pitch once with chord-tone spelling',()=>{
 for(const chord of Object.keys(CHORDS))for(const shape of ['C','A','G','E','D'])for(const direction of [1,-1]){
  const h=harmonyAt({key:0,mode:recommendedMode(chord),chord}),board=fretboardFor(h,shape),notes=positionalArpeggio(board,h,direction>0?'ascending':'descending').flatMap(c=>c.notes);
  const expected=[...new Set(board.notes.filter(n=>h.chordPcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>(a-b)*direction);
  assert.deepEqual(notes.map(n=>n.midi),expected);
  for(const note of notes){const index=h.chordPcs.indexOf(note.pc);assert.equal(note.name,h.tones[index]);assert.equal(note.chromaticDegree,h.intervals[index]);}
 }
});
