import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS} from '../src/audio/engine.js';
import {harmonyAt} from '../src/audio/music.js';
import {fretboardFor,TUNING} from '../src/guitar/fretboard.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {SCALE_SEQUENCES} from '../src/guitar/scale-sequences.js';
import {arpeggioPatternGroups} from '../src/guitar/arpeggio-patterns.js';
import {ARPEGGIO_ROOT_SEQUENCES} from '../src/guitar/arpeggio-sequences.js';
import {ENCLOSURE_PATTERNS} from '../src/guitar/enclosures.js';
import {theoryOptions} from '../src/guitar/superimposition.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
import {neckExerciseGroups} from '../src/practice/neck-exercises.js';
const harmony=(key=9,mode='dorian')=>harmonyAt({...DEFAULTS,key,mode,chord:mode==='dorian'?'min7':'maj7',progression:false},0);
const neck={traversal:'horizontal',traversalStrings:'0,1',traversalStart:5,traversalEnd:17,rhythm:'sixteenths',motion:'ascending'};
const pitches=gs=>gs.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret]));
function physical(groups){for(const g of groups){assert.ok(g.notes.length||g.warning,'unavailable recipes must explain why');assert.equal(g.cellLengths.reduce((a,b)=>a+b,0),g.notes.length);for(const n of g.notes){assert.equal(n.midi,TUNING[n.string]+n.fret);assert.equal(n.pc,n.midi%12);assert.ok(n.fret>=g.board.start&&n.fret<=g.board.end);if(n.neckCell)assert.ok(n.neckCell.notes.some(c=>c.midi===n.midi&&c.string===n.string&&c.fret===n.fret));}}}
test('catalogue audit: every scale and arpeggio-tone sequence retains phase, pitches and timing across bars',()=>{
 for(const key of [0,9])for(const traversal of ['horizontal','diagonal'])for(const material of ['scale','triad','seventh'])for(const study of Object.keys(SCALE_SEQUENCES)){
  const h=harmony(key),v={...neck,traversal,study:material==='scale'?study:'arpseq_'+study,material:material==='scale'?'seventh':material,arpeggioSource:'selectedChord'};
  const whole=neckExerciseGroups([h],[8],v),split=neckExerciseGroups([h,h],[4,4],v);physical(split);assert.deepEqual(pitches(split),pitches(whole),`${material} ${study} ${traversal}`);
  const plan=progressionStudyPlan(split,[0,1],[1,1],4,v.study,v.rhythm);assert.equal(plan.events.length,split.flatMap(g=>g.notes).length);if(whole[0].notes.length)assert.equal(plan.events.length,32,`${material} ${study} should flow across the bar`);
 }
});
test('catalogue audit: every whole-arpeggio note order and enclosure uses the declared tones',()=>{
 for(const shape of ['C','A','G','E','D'])for(const motion of ['ascending','descending']){
  const h=harmony(),board=fretboardFor(h,shape);
  for(const material of ['triad','seventh'])for(const family of ['pairs','permutations','repeatTone','returnStart'])for(const [pattern]of arpeggioPatternGroups(material,family).flatMap(g=>g.items)){
   const cells=cagedStudy(board,h,'harmonized',material,motion,{arpeggioPattern:pattern,arpeggioClose:false});assert.ok(cells.length,`${shape} ${pattern}`);
   for(const cell of cells){const root=h.scaleNames.indexOf(cell.rootName);assert.equal(cell.notes.length,cell.patternOrder.length);cell.notes.forEach((n,i)=>{assert.equal(n.pc,h.scalePcs[(root+[1,3,5,7].indexOf(cell.patternOrder[i])*2)%7],pattern);assert.equal(n.midi,TUNING[n.string]+n.fret);});}
  }
  for(const [study,patterns]of Object.entries(ENCLOSURE_PATTERNS))for(const [pattern,offsets]of Object.entries(patterns)){
   const cells=cagedStudy(board,h,study,'seventh',motion,{enclosurePattern:pattern,enclosureTarget:'all'});assert.ok(cells.length);
   for(const cell of cells){assert.deepEqual(cell.notes.map(n=>n.midi-cell.notes.at(-1).midi),offsets);assert.ok(h.chordPcs.includes(cell.notes.at(-1).pc));}
  }
 }
});
test('triad-pair contours match their names, and three-note cells cross bars without missing notes',()=>{
 const h=harmony(),board=fretboardFor(h,'E'),source=theoryOptions(h).triadPairs[0];
 for(const motion of ['ascending','descending','up-down','down-up']){
  const cells=cagedStudy(board,h,'triadpairs','triad',motion,{source:source.id});assert.ok(cells.length);const first=motion==='ascending'||motion==='up-down'?1:-1;
  for(const [i,c]of cells.entries()){const direction=i>=8?-first:first;assert.equal(Math.sign(c.notes[1].midi-c.notes[0].midi),direction);assert.equal(Math.sign(c.notes[2].midi-c.notes[1].midi),direction);}
  const opts={study:'triadpairs',material:'triad',source:source.id,motion,rhythm:'sixteenths'},single=progressionExerciseGroups([h],[16],board,opts),split=progressionExerciseGroups([h,h,h,h],[4,4,4,4],board,opts);
  assert.deepEqual(pitches(split),pitches(single));assert.deepEqual(split.map(g=>g.notes.length),[16,16,16,16]);physical(split);
 }
});
test('unavailable whole-arpeggio root motifs stay explicit rather than losing individual tones',()=>{
 const h=harmony(),v={...neck,traversalStrings:'4,5',study:'harmonized',material:'triad',arpeggioSource:'diatonic',arpeggioPattern:'perm3_135',arpeggioClose:false,arpeggioSequence:'groups3'};
 const gs=neckExerciseGroups([h,h],[4,4],v);assert.ok(gs.every(g=>!g.notes.length&&g.warning));
 const pairs=neckExerciseGroups([h],[4],{...v,arpeggioSequence:'seconds'});physical(pairs);assert.equal(pairs[0].notes.length,16);assert.ok(pairs[0].cellSizes.every(n=>n===6));
});
test('every arpeggio-root sequence contains the whole declared arpeggios in the declared root order',()=>{
 for(const material of ['triad','seventh'])for(const mode of ['dorian','lydian'])for(const motion of ['ascending','descending']){
  const h=harmony(9,mode),board=fretboardFor(h,'E'),line=Array.from({length:128},(_,m)=>m).filter(m=>h.scalePcs.includes(m%12));
  for(const [sequence,definition]of Object.entries(ARPEGGIO_ROOT_SEQUENCES)){
   const cells=cagedStudy(board,h,'harmonized',material,motion,{arpeggioPattern:material==='triad'?'perm3_135':'perm4_1357',arpeggioClose:false,arpeggioSequence:sequence,arpeggioSource:'diatonic'});
   for(const cell of cells){if(!cell.rootParts)continue;assert.equal(cell.rootParts.length,definition.pedal?2:definition.offsets.length);assert.deepEqual(cell.notes,cell.rootParts.flatMap(p=>p.notes));if(!definition.pedal)assert.deepEqual(cell.rootSequence.map(root=>line.indexOf(root)-line.indexOf(cell.rootSequence[0])),definition.offsets.map(n=>n-definition.offsets[0]),sequence);for(const part of cell.rootParts){assert.equal(part.notes.length,material==='triad'?3:4);assert.ok(part.notes.every(n=>n.midi===TUNING[n.string]+n.fret));}}
  }
 }
});
