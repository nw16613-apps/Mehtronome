import test from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {TUNING} from '../src/guitar/fretboard.js';
import {SPREAD_STRING_SETS,spreadTriadCatalogue} from '../src/guitar/spread-triads.js';
import {exerciseFingeringCatalogue,perStringExerciseChoice} from '../src/practice/per-string-exercises.js';
import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';
test('all 20 string combinations have three genuine open-triad inversions in every key',()=>{
 assert.equal(SPREAD_STRING_SETS.length,20);assert.equal(new Set(SPREAD_STRING_SETS.map(s=>s.join())).size,20);
 for(const chord of ['maj7','min7','dim7','augmented','halfDim'])for(let key=0;key<12;key++){
  const h=harmonyAt({key,mode:'lydian',chord});
  for(let set=0;set<20;set++){
   const catalogue=spreadTriadCatalogue(h,set);assert.equal(catalogue.length,3);
   catalogue.forEach((entry,inversion)=>{
    assert.ok(entry.choices.length,`${key} ${chord} ${set} ${inversion}`);
    for(const b of entry.choices){
     assert.deepEqual(b.notes.map(n=>n.string),SPREAD_STRING_SETS[set]);
     assert.deepEqual(b.notes.map(n=>n.pc),[0,2,1].map(i=>h.chordPcs[(inversion+i)%3]));
     assert.ok(b.notes[2].midi-b.notes[0].midi>12);
     assert.equal(b.muted.length,3);
     assert.equal(b.start,Math.min(...b.notes.map(n=>n.fret)));assert.equal(b.end,Math.max(...b.notes.map(n=>n.fret)));
     for(const n of b.notes){assert.ok(n.fret>=1&&n.fret<=(entry.extended?36:24));assert.equal(n.midi,TUNING[n.string]+n.fret);}
    }
   });
  }
 }
});
test('practice keeps the spread inversion, string set and register while removing backing extensions',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min13'}),o={study:'positional',material:'triad',fingering:'spread',fingeringStringSet:19,inversion:2,fingeringFret:12};
 const entries=exerciseFingeringCatalogue(h,o),choice=perStringExerciseChoice(h,o);
 assert.equal(entries.length,3);assert.equal(choice.index,2);assert.match(choice.label,/Spread triad.*Second inversion/);
 assert.deepEqual(choice.board.notes.map(n=>n.string),[3,4,5]);assert.equal(choice.board.notes[0].pc,h.chordPcs[2]);
});

test('normalization preserves all twenty spread string sets and triad material',()=>{const o={study:'positional',fingering:'spread',fingeringStringSet:19,material:'seventh',exactFingering:true};normalizeExerciseOptions(o);assert.equal(o.fingering,'spread');assert.equal(o.fingeringStringSet,19);assert.equal(o.material,'triad');assert.equal(o.exactFingering,false);});
