import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,CHORDS,harmonyAt} from '../src/audio/music.js';
import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {recommendedMode} from '../src/practice/custom-progression.js';
const studies=['groups3','groups4','arpgroups3','arpgroups4'],shapes=['C','A','G','E','D'];
const sizeOf=s=>s.endsWith('3')?3:4,pcsFor=(h,s)=>s.startsWith('arp')?arpeggioHarmony(h).chordPcs:h.scalePcs;
const make=(hs,ss,ds,study,rhythm='eighths',motion='ascending')=>progressionExerciseGroups(hs,ds,fretboardFor(hs[0],ss[0]),{study,rhythm,motion,positionPath:hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i%ss.length])),geometryShape:ss[i%ss.length]}))});
function library(h,board,study,direction){
 const line=Array.from({length:128},(_,m)=>m).filter(m=>pcsFor(h,study).includes(m%12)),allowed=new Set(board.notes.map(n=>n.midi)),size=sizeOf(study);
 return line.filter(m=>allowed.has(m)).sort((a,b)=>(a-b)*direction).map(m=>Array.from({length:size},(_,i)=>line[line.indexOf(m)+i*direction])).filter(cell=>cell.every(m=>allowed.has(m)));
}
function walk(h,board,study,direction,count){
 let cells=library(h,board,study,direction),index=0,notes=[];if(!cells.length)return [];
 while(notes.length<count){const cell=cells[index++];notes.push(...cell);if(index===cells.length){const edge=direction>0?Math.max(...cell):Math.min(...cell);direction=-direction;cells=library(h,board,study,direction);index=cells.findIndex(c=>(c[0]-edge)*direction>0);if(index<0)index=0;}}
 return notes.slice(0,count);
}
test('groups follow exact overlapping scale or selected-chord steps in every mode, root and CAGED shape',()=>{
 for(const [mode,def]of Object.entries(MODES))for(let key=0;key<12;key++)for(const shape of shapes)for(const direction of [1,-1])for(const study of studies){
  const h=harmonyAt({key,mode,chord:def.chord}),board=fretboardFor(h,shape),motion=direction>0?'ascending':'descending';assert.deepEqual(cagedStudy(board,h,study,'seventh',motion).map(c=>c.notes.map(n=>n.midi)),library(h,board,study,direction));
  for(const [rhythm,division]of [['eighths',2],['triplets',3],['sixteenths',4]]){const ds=[1,2,1,3,1],gs=make(ds.map(()=>h),[shape],ds,study,rhythm,motion);assert.deepEqual(gs.flatMap(g=>g.notes.map(n=>n.midi)),walk(h,board,study,direction,8*division));assert.deepEqual(gs.map(g=>g.notes.length),ds.map(d=>d*division));let ordinal=0;for(const g of gs)for(let i=0;i<g.cellLengths.length;i++){assert.equal(g.cellOffsets[i],ordinal);ordinal=(ordinal+g.cellLengths[i])%sizeOf(study);}}
 }
});
test('reported groups of three carry their unfinished notes across the bar instead of inserting rests',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});const scalar=make([h,h],['C'],[4,4],'groups3'),arps=make([h,h],['C'],[4,4],'arpgroups3');
 assert.deepEqual(scalar[0].notes.map(n=>n.midi),[47,48,50,48,50,52,50,52]);assert.equal(scalar[1].notes[0].midi,54);assert.deepEqual(arps[0].notes.map(n=>n.midi),[48,52,55,52,55,57,55,57]);assert.equal(arps[1].notes[0].midi,60);assert.equal(arps[1].cellOffsets[0],2);
});
test('arpeggio groups exclude extensions and preserve all written chord qualities, including triads',()=>{
 for(const chord of Object.keys(CHORDS))for(const shape of shapes)for(const study of ['arpgroups3','arpgroups4']){const h=harmonyAt({key:9,mode:recommendedMode(chord),chord}),core=arpeggioHarmony(h),board=fretboardFor(h,shape),cells=cagedStudy(board,h,study);for(const cell of cells)for(const n of cell.notes){assert.ok(core.chordPcs.includes(n.pc));assert.equal(n.name,core.tones[core.chordPcs.indexOf(n.pc)]);}}
 const h7=harmonyAt({key:9,mode:'dorian',chord:'min7'}),h13=harmonyAt({key:9,mode:'dorian',chord:'min13'});for(const study of ['arpgroups3','arpgroups4'])assert.deepEqual(cagedStudy(fretboardFor(h7,'C'),h7,study).map(c=>c.pcs),cagedStudy(fretboardFor(h13,'C'),h13,study).map(c=>c.pcs));
});
test('mixed progressions and changing positions retain group ordinal and valid incoming material',()=>{
 const cases=[['dorian','min13'],['mixolydian','dom13'],['major','maj9'],['harmonic_minor','minMaj7'],['minor_pentatonic','min7']],ds=[1,1,1,1,4];
 for(let key=0;key<12;key++)for(const direction of [1,-1])for(const study of studies)for(const [rhythm,division]of [['eighths',2],['triplets',3],['sixteenths',4]]){
  const hs=cases.map(([mode,chord],i)=>harmonyAt({key:(key+i*3)%12,mode,chord})),gs=make(hs,shapes,ds,study,rhythm,direction>0?'ascending':'descending');let ordinal=0;
  for(const g of gs){assert.equal(g.notes.length,ds[g.slot]*division);let offset=0;for(let i=0;i<g.cellLengths.length;i++){const count=g.cellLengths[i],cell=library(g.harmony,g.board,study,g.sequenceDirections[i]).find(c=>c[0]===g.sequenceAnchors[i]);assert.ok(cell);assert.equal(g.cellOffsets[i],ordinal);assert.deepEqual(g.notes.slice(offset,offset+count).map(n=>n.midi),cell.slice(ordinal,ordinal+count));offset+=count;ordinal=(ordinal+count)%sizeOf(study);}}
 }
});
test('splitting a chart cannot restart or alter any scale/arpeggio group sequence',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});for(const study of studies)for(const rhythm of ['eighths','triplets','sixteenths'])for(const motion of ['ascending','descending']){const notes=ds=>make(ds.map(()=>h),['C'],ds,study,rhythm,motion).flatMap(g=>g.notes.map(n=>n.midi));assert.deepEqual(notes([1,2,1,3,1]),notes([8]));}
});
