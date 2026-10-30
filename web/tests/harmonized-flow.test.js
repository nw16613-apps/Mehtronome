import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const pathFor=(hs,shapes)=>hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,shapes[i%shapes.length])),geometryShape:shapes[i%shapes.length]}));
const pitches=groups=>groups.flatMap(g=>g.notes.map(n=>n.midi));
// Independent scale-step oracle. Construct every theoretical pitch before
// restricting complete stacks to the diagram; no production cell generator.
function cellsFor(h,board,size,direction){
 const line=Array.from({length:128},(_,i)=>i).filter(midi=>h.scalePcs.includes(midi%12));
 const available=new Set(board.notes.map(n=>n.midi));
 return line.filter(midi=>available.has(midi)).sort((a,b)=>(a-b)*direction)
  .map(anchor=>Array.from({length:size},(_,i)=>line[line.indexOf(anchor)+i*2*direction]))
  .filter(cell=>cell.every(midi=>available.has(midi)));
}
function walk(h,board,size,direction,length){
 let cells=cellsFor(h,board,size,direction),index=0,result=[];
 while(result.length<length){
  const cell=cells[index++];result.push(...cell);
  if(index===cells.length){
   const edge=direction>0?Math.max(...cell):Math.min(...cell);direction=-direction;
   cells=cellsFor(h,board,size,direction);index=cells.findIndex(c=>(c[0]-edge)*direction>0);if(index<0)index=0;
  }
 }
 return result.slice(0,length);
}
test('harmonized triads and sevenths flow across arbitrary bar splits in every mode, root and CAGED position',()=>{
 for(const [mode,definition]of Object.entries(MODES))for(let key=0;key<12;key++)for(const shape of ['C','A','G','E','D'])for(const direction of [1,-1])for(const [material,size]of [['triad',3],['seventh',4]]){
  const h=harmonyAt({key,mode,chord:definition.chord}),board=fretboardFor(h,shape);
  for(const [rhythm,division]of [['eighths',2],['triplets',3],['sixteenths',4]]){
   const durations=[1,2,1,3,1],hs=durations.map(()=>h),context=`${mode} ${key} ${shape} ${direction} ${material} ${rhythm}`;
   const gs=progressionExerciseGroups(hs,durations,board,{study:'harmonized',material,motion:direction>0?'ascending':'descending',rhythm,positionPath:pathFor(hs,[shape])});
   assert.deepEqual(gs.map(g=>g.notes.length),durations.map(d=>d*division),context);
   assert.deepEqual(pitches(gs),walk(h,board,size,direction,8*division),context);
   let phase=0;for(const g of gs)for(let i=0;i<g.cellLengths.length;i++){
    assert.equal(g.cellOffsets[i],phase,context);phase=(phase+g.cellLengths[i])%size;
   }
  }
 }
});
test('a mid-cell harmonic change keeps the seventh-chord ordinal and adapts the remaining tones',()=>{
 const hs=[9,11,2,4].map(key=>harmonyAt({key,mode:'dorian',chord:'min7'})),board=fretboardFor(hs[0],'C');
 for(const [motion,expected]of [
  ['ascending',[[47,50,54],[59,50,54],[59,62,53],[57,61,64]]],
  ['descending',[[74,71,67],[64,73,69],[67,64,72],[66,62,59]]],
 ]){
  const gs=progressionExerciseGroups(hs,[1,1,1,1],board,{study:'harmonized',material:'seventh',motion,rhythm:'triplets',positionPath:pathFor(hs,['C'])});
  assert.deepEqual(gs.map(g=>g.notes.map(n=>n.midi)),expected);
  assert.deepEqual(gs.map(g=>g.cellOffsets),[[0],[3,0],[2,0],[1]]);
  assert.deepEqual(gs.map(g=>g.cellLengths),[[3],[1,2],[2,1],[3]]);
 }
});
test('mixed scales and changed positions retain complete theoretical stacks and phase without empty bar tails',()=>{
 const cases=[['dorian','min13'],['mixolydian','dom13'],['major','maj9'],['harmonic_minor','minMaj7'],['minor_pentatonic','min7']];
 for(let key=0;key<12;key++)for(const direction of [1,-1])for(const [material,size]of [['triad',3],['seventh',4]]){
  const hs=cases.map(([mode,chord],i)=>harmonyAt({key:(key+i*3)%12,mode,chord})),shapes=['C','A','G','E','D'],path=pathFor(hs,shapes);
  const gs=progressionExerciseGroups(hs,[1,1,1,1,1],fretboardFor(hs[0],'C'),{study:'harmonized',material,motion:direction>0?'ascending':'descending',rhythm:'eighths',positionPath:path});
  let phase=0;
  for(const g of gs){
   assert.equal(g.notes.length,2);let at=0;
   for(let i=0;i<g.cellLengths.length;i++){
    const length=g.cellLengths[i],offset=g.cellOffsets[i],fragment=g.notes.slice(at,at+length);at+=length;
    assert.equal(offset,phase);phase=(phase+length)%size;
    const library=cellsFor(g.harmony,g.board,size,g.sequenceDirections[i]);
    assert.ok(library.some(cell=>cell[0]===g.sequenceAnchors[i]&&cell.slice(offset,offset+length).every((midi,j)=>midi===fragment[j].midi)));
    for(const note of fragment){assert.ok(g.harmony.scalePcs.includes(note.pc));assert.ok(g.board.notes.some(n=>n.string===note.string&&n.fret===note.fret&&n.midi===note.midi));}
   }
  }
 }
});
test('one-cell scope deliberately stays a complete cell followed by space',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h,h],board=fretboardFor(h,'C');
 for(const material of ['triad','seventh']){
  const gs=progressionExerciseGroups(hs,[4,4,4],board,{study:'harmonized',material,stage:'cell',positionPath:pathFor(hs,['C'])});
  assert.deepEqual(gs.map(g=>g.notes.length),hs.map(()=>material==='triad'?3:4));
  assert.ok(gs.every(g=>g.cellOffsets[0]===0));
 }
});
