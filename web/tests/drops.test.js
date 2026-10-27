import {test} from 'node:test';import assert from 'node:assert/strict';
import {dropCandidates,dropRoute,dropStudy,dropMovements} from '../src/guitar/drop-study.js';
import {harmonyAt,CHORDS} from '../src/audio/music.js';import {TUNING} from '../src/guitar/fretboard.js';import {STRING_SETS} from '../src/guitar/voicings.js';import {FRET_REGIONS} from '../src/guitar/position-path.js';
const h=(key,chord)=>harmonyAt({key,mode:'major',chord});
test('drop workshop shapes preserve physical pitches, four voices and true octave-drop structure in all keys',()=>{
 for(let key=0;key<12;key++)for(const chord of Object.keys(CHORDS))for(const type of ['drop2','drop3'])for(const set of STRING_SETS[type]){
  for(const grip of dropCandidates(h(key,chord),type,set.id)){
   assert.equal(grip.notes.length,4);assert.equal(new Set(grip.notes.map(n=>n.pc)).size,4);assert.deepEqual(grip.notes.map(n=>n.string),set.strings);assert.ok(grip.end-grip.start<=4);assert.equal(grip.muted.length,2);
   for(const n of grip.notes){assert.equal(n.midi,TUNING[n.string]+n.fret);assert.ok(n.fret>=1&&n.fret<=17);assert.ok(h(key,chord).chordPcs.includes(n.pc));assert.equal(n.scaleIndex,h(key,chord).scalePcs.indexOf(n.pc));}
   // In either drop 2 or drop 3 the dropped voice is now lowest; raise it
   // back and require four distinct pitches within a single octave.
   const restored=grip.notes.map((n,i)=>n.midi+(i===0?12:0)).sort((a,b)=>a-b);assert.ok(restored[3]-restored[0]<12);
   const raisedIndex=restored.indexOf(grip.notes[0].midi+12);assert.equal(raisedIndex,type==='drop2'?2:1);
  }
 }
});
test('known Cmaj7 drop 2 shape and register selection expose multiple inversions without stretching',()=>{
 const candidates=dropCandidates(h(0,'maj7'),'drop2','4321');assert.ok(candidates.some(g=>g.notes.map(n=>n.fret).join(',')==='5,5,5,7'));
 assert.ok(new Set(candidates.map(g=>g.bassInterval)).size>=3);
 const low=dropRoute([h(0,'maj7')],'drop2','4321',FRET_REGIONS.low)[0],high=dropRoute([h(0,'maj7')],'drop2','4321',FRET_REGIONS.high)[0];assert.ok(high.start>low.start);
});
test('drop studies retain timeline gaps, exact arpeggios and actual four-voice movement',()=>{
 const harmonies=[h(2,'min7'),h(7,'dom7'),h(0,'maj7')],study=dropStudy(harmonies,[0,1,2],[4,4,8],4,{stringSet:'4321'});assert.equal(study.plan.duration,16);assert.equal(study.plan.events.length,12);assert.equal(dropMovements(study.groups).length,8);
 for(const g of study.groups){assert.deepEqual(g.notes,g.drop.notes);assert.equal(g.timing.at(-1).start,1.5);}
 for(const e of study.plan.events){const slot=study.plan.slots[e.slot];assert.ok(e.start+e.duration<=slot.start+slot.duration);}
 const gap=dropStudy([h(0,'maj7'),h(2,'minor'),h(7,'dom7')],[0,1,2],[1,4,4],4);assert.equal(gap.groups[0].notes.length,0);assert.equal(gap.groups[1].drop,null);assert.equal(gap.plan.harmonicDuration,9);assert.equal(gap.plan.duration,36);assert.equal(gap.groups.length,3);
});
