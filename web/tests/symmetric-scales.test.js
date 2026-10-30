import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,CHORDS,harmonyAt,modeNotes} from '../src/audio/music.js';
import {compatibleScaleGroups} from '../src/practice/scale-explorer.js';
import {fretboardFor,fullFretboardFor,cagedPositionFor,parentMajorFor} from '../src/guitar/fretboard.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {theoryOptions} from '../src/guitar/superimposition.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {Engine} from '../src/audio/engine.js';
const diminished=['diminished_half_whole','diminished_whole_half'];
const harmonic=Object.keys(MODES).filter(id=>MODES[id].family==='Harmonic major');
test('diminished scales alternate their step sizes and spell all eight pitches correctly',()=>{
 assert.deepEqual(modeNotes(0,diminished[0]),['C','D♭','E♭','E','F♯','G','A','B♭']);
 assert.deepEqual(modeNotes(0,diminished[1]),['C','D','E♭','F','G♭','A♭','B♭♭','B']);
 for(const [index,id] of diminished.entries())for(let key=0;key<12;key++){
  const h=harmonyAt({key,mode:id,chord:MODES[id].chord});assert.equal(h.scalePcs.length,8);
  assert.deepEqual(MODES[id].intervals.map((n,i,ns)=>((ns[(i+1)%8]??0)-n+12)%12),index?[2,1,2,1,2,1,2,1]:[1,2,1,2,1,2,1,2]);
  assert.ok(h.chordPcs.every(pc=>h.scalePcs.includes(pc)));assert.equal(parentMajorFor(h),null);
  for(const shape of ['C','A','G','E','D']){const b=fretboardFor(h,shape);assert.ok(b.notes.every(n=>Number.isFinite(n.midi)&&n.fret>=1));assert.equal(new Set(b.notes.filter(n=>n.scale).map(n=>n.pc)).size,8);}
 }
 assert.equal(harmonic.length,7);
 for(const id of harmonic)for(let key=0;key<12;key++){
  const h=harmonyAt({key,mode:id,chord:MODES[id].chord});assert.ok(h.chordPcs.every(pc=>h.scalePcs.includes(pc)),id);assert.equal(parentMajorFor(h).family,'Harmonic major');
 }
});
test('new dominant and diminished chord choices have strict matches in the new families',()=>{
 const choices=id=>compatibleScaleGroups(id).flatMap(g=>g.choices.map(c=>c.id));
 assert.ok(choices('dom7sharp9').includes(diminished[0]));assert.ok(choices('dom7b9sharp11').includes(diminished[0]));assert.ok(choices('dom13b9').includes(diminished[0])&&choices('dom13b9').includes('mixolydian_b2'));assert.ok(choices('dimMaj7').includes(diminished[1]));
 for(const chord of ['dom7sharp9','dom13b9','dom7b9sharp11','dimMaj7'])assert.ok(CHORDS[chord]);
});
test('eight-note patterns retain the eighth degree and use eight steps per octave',()=>{
 const h=harmonyAt({key:0,mode:diminished[0],chord:'dom7b9'});
 const board={start:1,end:24,notes:Array.from({length:25},(_,i)=>60+i).filter(midi=>h.scalePcs.includes(midi%12)).map(midi=>({midi,pc:midi%12,name:h.scaleNames[h.scalePcs.indexOf(midi%12)],fret:midi-40,string:0}))};
 const groups=cagedStudy(board,h,'groups4','seventh','ascending');
 assert.deepEqual(groups[0].notes.map(n=>n.midi),[60,61,63,64]);assert.deepEqual(groups[7].notes.map(n=>n.midi),[70,72,73,75]);
 const upper=cagedStudy(board,h,'upperstructure','seventh','ascending');assert.deepEqual(upper[0].notes.map(n=>n.midi),[60,63,66,69]); // Retired 3-to-9 study migrates to harmonized scale.
 const stacks=cagedStudy(board,h,'harmonized','seventh','ascending');assert.deepEqual(stacks[0].notes.map(n=>n.midi),[60,63,66,69]);assert.ok(stacks.some(c=>c.sequenceAnchor===70));
});
test('mixed seven/eight-note progressions support intact patterns, turns, voicings and sources',()=>{
 const hs=[harmonyAt({key:2,mode:'dorian',chord:'min7'}),harmonyAt({key:7,mode:diminished[0],chord:'dom13b9'}),harmonyAt({key:0,mode:'harmonic_major',chord:'maj9'}),harmonyAt({key:1,mode:diminished[1],chord:'dim7'})];
 const path=hs.map((h,i)=>{const shape=['C','A','G','D'][i];return {...cagedPositionFor(fretboardFor(h,shape)),geometryShape:shape};});
 for(const h of hs){const opts=theoryOptions(h);assert.ok(opts.pentatonics.every(p=>p.pcs.every(pc=>h.scalePcs.includes(pc))));const engine=new Engine(8000);engine.configure({key:h.midi[0]%12,chord:h.chordId,mode:h.mode,countIn:false});engine.reset();assert.ok(engine.padVoicing.length);}
 for(const study of ['harmonized','alternating','chordtones','chordtonesalternating','groups3','groups4','thirds','fourths','sixths','digital1324','cells','upperstructure','enclosures','approach','approacheverytone','inversions','pentatonic','triadpairs','positional'])for(const motion of ['ascending','descending']){
  const gs=progressionExerciseGroups(hs,[8,8,8,8],fretboardFor(hs[0],'C'),{study,motion,positionPath:path});
  for(const g of gs){assert.ok(g.notes.length||g.warning,study);assert.ok(g.notes.every(n=>Number.isFinite(n.midi)&&n.name),study);if(!['enclosures','approach','approacheverytone'].includes(study))assert.ok(g.notes.every(n=>g.harmony.scalePcs.includes(n.pc)),study);}
 }
});
