import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ENCLOSURE_PATTERNS,enclosureNoteStarts} from '../src/guitar/enclosures.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';
import {DEFAULTS} from '../src/audio/engine.js';
import {harmonyAt} from '../src/audio/music.js';
import {fretboardFor,TUNING} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
import {singleChordExercisePlan} from '../src/practice/exercise-resolution.js';
import {STUDY_MATERIALS} from '../src/practice/study-path.js';

test('all bounded enclosure patterns resolve to selected core tones with playable chromatic notes in every key',()=>{
 for(let key=0;key<12;key++)for(const chord of ['min7','maj7','dom7','halfDim']){
  const harmony=harmonyAt({...DEFAULTS,key,chord,progression:false}),core=arpeggioHarmony(harmony),board=fretboardFor(harmony,'E');
  for(const [study,patterns]of Object.entries(ENCLOSURE_PATTERNS))for(const [enclosurePattern,offsets]of Object.entries(patterns))for(const motion of ['ascending','descending']){
   let count=0;
   for(let target=0;target<core.chordPcs.length;target++){
    const groups=cagedStudy(board,harmony,study,'seventh',motion,{enclosurePattern,enclosureTarget:String(target)});
    count+=groups.length;
    for(const group of groups){
     assert.equal(group.notes.length,Number(study.at(-1)));
     assert.equal(group.notes.at(-1).pc,core.chordPcs[target]);
     assert.deepEqual(group.notes.map(n=>n.midi-group.notes.at(-1).midi),offsets);
     assert.equal(group.targetIndex,group.notes.length-1);
     for(const n of group.notes){assert.equal(TUNING[n.string]+n.fret,n.midi);assert.ok(n.fret>=board.start&&n.fret<=board.end);}
    }
   }
   assert.ok(count>0,`${key} ${chord} ${study} ${enclosurePattern}`);
  }
 }
});
test('targets land on quarter-note beats in all subdivisions and never spill into the next chord',()=>{
 const harmonies=[0,1,2].map(step=>harmonyAt({...DEFAULTS,progression:true,template:'major251essential'},step)),board=fretboardFor(harmonies[0],'E');
 for(const study of Object.keys(ENCLOSURE_PATTERNS))for(const rhythm of ['eighths','triplets','sixteenths'])for(const durations of [[4,4,4],[2,3,1],[8,4,2]]){
  const groups=progressionExerciseGroups(harmonies,durations,board,{study,rhythm,enclosureTarget:'all',enclosurePattern:'upper'}),plan=progressionStudyPlan(groups,[0,1,2],durations.map(n=>n/4),4,study,rhythm);
  assert.ok(plan.events.length);
  for(const event of plan.events){
   const slot=plan.slots.find(s=>s.slot===event.slot&&event.start>=s.start&&event.start<s.start+s.duration);
   assert.ok(slot);assert.ok(event.start+event.duration<=slot.start+slot.duration+1e-8);
   if(event.target){assert.ok(Math.abs(event.start-Math.round(event.start))<1e-8);assert.ok(arpeggioHarmony(slot.harmony).chordPcs.includes(event.note.pc));}
  }
  for(const group of groups){assert.equal(group.notes.length%Number(study.at(-1)),0);assert.equal(group.targetIndices.length,group.cellLengths.length);}
 }
});
test('single chord notation allocates space for rests and the final target',()=>{
 const harmony=harmonyAt({...DEFAULTS,progression:false}),board=fretboardFor(harmony,'E');
 for(const study of Object.keys(ENCLOSURE_PATTERNS))for(const rhythm of ['eighths','triplets','sixteenths']){
  const cells=cagedStudy(board,harmony,study),{plan}=singleChordExercisePlan(cells,harmony,board,{numeral:'I'},study,rhythm,4);
  assert.equal(plan.events.length,cells.length*Number(study.at(-1)));
  assert.equal(plan.events.filter(e=>e.target).length,cells.length);
  assert.ok(plan.events.filter(e=>e.target).every(e=>Math.abs(e.start-Math.round(e.start))<1e-8));
  assert.ok(plan.events.at(-1).start<plan.duration);
 }
 assert.deepEqual(enclosureNoteStarts([4,4],2),[.5,1,1.5,2,2.5,3,3.5,4]);
});
test('Study exposes both lengths',()=>{for(const id of Object.keys(ENCLOSURE_PATTERNS))assert.ok(STUDY_MATERIALS.some(([value])=>value===id));});
test('extended backing chords target only structural tones; unavailable target leaves a rest',()=>{
 const harmony=harmonyAt({...DEFAULTS,key:9,chord:'min13',mode:'dorian',progression:false}),core=arpeggioHarmony(harmony),board=fretboardFor(harmony,'E');
 assert.ok(harmony.chordPcs.length>core.chordPcs.length);
 for(const study of Object.keys(ENCLOSURE_PATTERNS))assert.ok(cagedStudy(board,harmony,study).every(g=>core.chordPcs.includes(g.notes.at(-1).pc)));
 const triad=harmonyAt({...DEFAULTS,key:9,chord:'minor',mode:'dorian',progression:false});
 const groups=progressionExerciseGroups([triad],[4],fretboardFor(triad,'E'),{study:'enclosures5',enclosureTarget:'3'});
 assert.equal(groups[0].notes.length,0);assert.ok(groups[0].warning);
});
test('enclosure families exhaust the declared chromatic approach rules without duplicates',()=>{
 for(const [study,total,repeated]of [['enclosures4',16,4],['enclosures5',52,40]]){
  const patterns=Object.values(ENCLOSURE_PATTERNS[study]);assert.equal(patterns.length,total);assert.equal(new Set(patterns.map(p=>p.join(','))).size,total);
  assert.equal(patterns.filter(p=>new Set(p.slice(0,-1)).size<p.length-1).length,repeated);
  for(const p of patterns){const approaches=p.slice(0,-1);assert.equal(p.at(-1),0);assert.equal(Math.abs(p.at(-2)),1);assert.ok(approaches.some(n=>n<0)&&approaches.some(n=>n>0));assert.ok(approaches.every((n,i)=>[1,2,-1,-2].includes(n)&&(!i||n!==approaches[i-1])));}
 }
});
