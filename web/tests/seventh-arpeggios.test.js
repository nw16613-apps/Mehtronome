import {test} from 'node:test';import assert from 'node:assert/strict';
import {CHORDS,harmonyAt} from '../src/audio/music.js';
import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {positionalArpeggio} from '../src/practice/learning.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {recommendedMode} from '../src/practice/custom-progression.js';
const shapes=['C','A','G','E','D'],stamp=groups=>groups.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret,n.name]));
test('arpeggio chord material excludes compound extensions but preserves suspended, altered, sixth and diminished qualities',()=>{
 const library=JSON.stringify(CHORDS);
 for(const [chord,definition]of Object.entries(CHORDS))for(let key=0;key<12;key++){
  const h=harmonyAt({key,mode:recommendedMode(chord),chord}),before=JSON.stringify(h),core=arpeggioHarmony(h),indices=definition.intervals.map((n,i)=>n<12?i:-1).filter(i=>i>=0),pcs=[...new Set(indices.map(i=>h.chordPcs[i]))];
  assert.deepEqual(core.chordPcs,pcs);assert.ok(pcs.length<=4);assert.deepEqual(core.tones,pcs.map(pc=>h.tones[h.chordPcs.indexOf(pc)]));assert.deepEqual(core.scalePcs,h.scalePcs);assert.equal(JSON.stringify(h),before);
  for(const shape of shapes){const b=fretboardFor(h,shape),notes=positionalArpeggio(b,h).flatMap(g=>g.notes),expected=[...new Set(b.notes.filter(n=>pcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b);assert.deepEqual(notes.map(n=>n.midi),expected);for(const material of ['triad','seventh','extensions'])for(const g of cagedStudy(b,h,'inversions',material))assert.ok(g.notes.length<=4&&g.notes.every(n=>pcs.includes(n.pc)));}
 }
 assert.equal(JSON.stringify(CHORDS),library);
});
test('extended and corresponding core chords produce identical positional and arpeggio sequences in the same scale/shape',()=>{
 const pairs=[['min13','min7'],['dom13','dom7'],['maj13sharp11','maj7'],['dom7alt','dom7flat5'],['minMaj13','minMaj7'],['halfDim13','halfDim'],['augMaj9','augMaj7'],['thirteenSus','sevenSus'],['sixNine','six'],['add9','major']];
 for(const [extended,base]of pairs)for(const key of [0,6,9])for(const shape of shapes)for(const motion of ['ascending','descending']){
  const mode=recommendedMode(extended),h=harmonyAt({key,mode,chord:extended}),core=harmonyAt({key,mode,chord:base}),board=fretboardFor(h,shape),coreBoard=fretboardFor(core,shape);
  assert.deepEqual(stamp(positionalArpeggio(board,h,motion)),stamp(positionalArpeggio(coreBoard,core,motion)),extended);
  for(const study of ['harmonized','alternating','chordtones','chordtonesalternating','inversions','approach','approacheverytone'])assert.deepEqual(stamp(cagedStudy(board,h,study,'extensions',motion)),stamp(cagedStudy(coreBoard,core,study,'seventh',motion)),extended+' '+study);
  for(const rhythm of ['eighths','triplets','sixteenths']){
   const run=(chord,anchor)=>progressionExerciseGroups([chord,chord],[4,4],anchor,{study:'positional',rhythm,motion,positionPath:Array(2).fill({...cagedPositionFor(anchor),geometryShape:shape})});assert.deepEqual(stamp(run(h,board)),stamp(run(core,coreBoard)),extended+' '+rhythm);
  }
 }
});
