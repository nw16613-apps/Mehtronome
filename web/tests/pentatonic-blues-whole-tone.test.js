import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt,modeNotes} from '../src/audio/music.js';
import {compatibleScaleGroups} from '../src/practice/scale-explorer.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {theoryOptions} from '../src/guitar/superimposition.js';
import {harmonizedSevenths} from '../src/practice/harmonized-sevenths.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {Engine} from '../src/audio/engine.js';
const scales=['whole_tone','augmented_scale','major_pentatonic','minor_pentatonic','major_blues','minor_blues'];
test('whole tone, augmented, pentatonic and blues spellings and strict chord guides',()=>{
 assert.deepEqual(modeNotes(0,'whole_tone'),['C','D','E','F♯','G♯','B♭']);
 assert.deepEqual(modeNotes(0,'augmented_scale'),['C','E♭','E','G','A♭','B']);
 assert.deepEqual(modeNotes(0,'major_pentatonic'),['C','D','E','G','A']);
 assert.deepEqual(modeNotes(0,'minor_pentatonic'),['C','E♭','F','G','B♭']);
 assert.deepEqual(modeNotes(0,'major_blues'),['C','D','E♭','E','G','A']);
 assert.deepEqual(modeNotes(0,'minor_blues'),['C','E♭','F','G♭','G','B♭']);
 const guides=chord=>compatibleScaleGroups(chord).flatMap(g=>g.choices.map(c=>c.id));
 for(const chord of ['dom7sharp5','dom9sharp5','dom7flat5'])assert.ok(guides(chord).includes('whole_tone'));
 assert.ok(!guides('dom7').includes('whole_tone'));assert.ok(!guides('dom7').includes('minor_blues'));assert.ok(guides('min7').includes('minor_blues'));assert.ok(guides('sixNine').includes('major_blues'));assert.ok(guides('augMaj7').includes('augmented_scale'));
});
test('all six new guides support every tonic, complete note collections and finite backing voices',()=>{
 for(const mode of scales)for(let key=0;key<12;key++){
  const h=harmonyAt({key,mode,chord:MODES[mode].chord});assert.ok(h.chordPcs.every(pc=>h.scalePcs.includes(pc)));
  const boards=['C','A','G','E','D'].map(shape=>fretboardFor(h,shape));
  for(const b of boards){assert.equal(new Set(b.notes.map(n=>n.pc)).size,h.scalePcs.length);assert.ok(b.notes.every(n=>n.fret>=1&&n.name));if(h.scalePcs.length===5){assert.equal(b.notes.length,12);for(let string=0;string<6;string++)assert.equal(b.notes.filter(n=>n.string===string).length,2);}}
  if(h.scalePcs.length===5)assert.equal(new Set(boards.map(b=>b.notes.map(n=>`${n.string}:${n.fret}`).join(','))).size,5);
  const sources=theoryOptions(h);assert.ok(sources.pentatonics.length);for(const option of [...sources.pentatonics,...sources.triadPairs])assert.ok(option.pcs.every(pc=>h.scalePcs.includes(pc)));
  if(h.scalePcs.length===5)assert.equal(sources.triadPairs.length,0);
  const reference=harmonizedSevenths(h);assert.equal(reference.length,h.scalePcs.length);assert.ok(reference.every(c=>c.pcs.length===3));
  if(['whole_tone','augmented_scale'].includes(mode))assert.ok(reference.every(c=>c.quality==='Augmented triad'));
  const e=new Engine(1200);e.configure({key,mode,chord:h.chordId,countIn:false});e.reset();const audio=new Float32Array(512);e.render(audio);assert.ok(audio.every(Number.isFinite));
 }
});
test('five and six notes wrap at the correct octave and repeated stacks are never named seventh chords',()=>{
 for(const [mode,expected] of [['whole_tone',[70,72,74,76]],['augmented_scale',[71,72,75,76]],['major_pentatonic',[69,72,74,76]],['minor_pentatonic',[70,72,75,77]]]){
  const h=harmonyAt({key:0,mode,chord:MODES[mode].chord});const board={start:1,end:24,notes:Array.from({length:25},(_,i)=>60+i).filter(midi=>h.scalePcs.includes(midi%12)).map(midi=>({midi,pc:midi%12,name:h.scaleNames[h.scalePcs.indexOf(midi%12)],fret:midi-40,string:0}))};
  const groups=cagedStudy(board,h,'groups4','seventh','ascending');assert.deepEqual(groups[h.scalePcs.length-1].notes.map(n=>n.midi),expected);
  if(h.scalePcs.length===6){const stacks=cagedStudy(board,h,'harmonized','seventh','ascending');assert.equal(stacks[0].notes.at(-1).midi-stacks[0].notes[0].midi,12);assert.match(stacks[0].chord,/stack/);}
 }
});
test('mixed five/six/seven/eight-note charts retain complete cells and progression order',()=>{
 const hs=[...scales,'dorian','diminished_half_whole'].map((mode,i)=>harmonyAt({key:(i*2)%12,mode,chord:MODES[mode].chord}));
 const positionPath=hs.map((h,i)=>{const shape=['C','A','G','E','D'][i%5];return {...cagedPositionFor(fretboardFor(h,shape)),geometryShape:shape};});
 for(const study of ['harmonized','alternating','chordtones','chordtonesalternating','groups3','groups4','thirds','fourths','sixths','cells','upperstructure','enclosures','approach','inversions','pentatonic','positional'])for(const motion of ['ascending','descending']){
  const gs=progressionExerciseGroups(hs,hs.map(()=>8),fretboardFor(hs[0],'C'),{study,motion,positionPath});assert.equal(gs.length,hs.length);
  for(const g of gs)assert.ok(g.notes.length&&g.notes.every(n=>Number.isFinite(n.midi)&&n.name),`${study} ${motion} ${g.slot}`);
 }
});
