import test from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {TUNING} from '../src/guitar/fretboard.js';
import {SPREAD_STRING_SETS,spreadTriadCatalogue,playableSpreadStringSets} from '../src/guitar/spread-triads.js';
import {exerciseFingeringCatalogue,perStringExerciseChoice} from '../src/practice/per-string-exercises.js';
import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';
test('only practical open-triad shapes are offered across keys and qualities',()=>{
 assert.equal(SPREAD_STRING_SETS.length,20);assert.equal(new Set(SPREAD_STRING_SETS.map(s=>s.join())).size,20);
 for(const chord of ['maj7','min7','dim7','augmented','halfDim'])for(let key=0;key<12;key++){
  const h=harmonyAt({key,mode:'lydian',chord});
  for(let set=0;set<20;set++){
   const catalogue=spreadTriadCatalogue(h,set);assert.equal(catalogue.length,3);
   catalogue.forEach((entry,inversion)=>{

    for(const b of entry.choices){
     assert.deepEqual(b.notes.map(n=>n.string),SPREAD_STRING_SETS[set]);
     assert.deepEqual(b.notes.map(n=>n.pc),[0,2,1].map(i=>h.chordPcs[(inversion+i)%3]));
     assert.ok(b.notes[2].midi-b.notes[0].midi>12);assert.ok(b.end-b.start<=4);
     assert.equal(b.muted.length,3);
     assert.equal(b.start,Math.min(...b.notes.map(n=>n.fret)));assert.equal(b.end,Math.max(...b.notes.map(n=>n.fret)));
     for(const n of b.notes){assert.ok(n.fret>=1&&n.fret<=24);assert.equal(n.midi,TUNING[n.string]+n.fret);}
    }
   });
  }
 }
});
test('practice keeps the spread inversion, string set and register while removing backing extensions',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min13'}),o={study:'positional',material:'triad',fingering:'spread',fingeringStringSet:4,inversion:2,fingeringFret:12};
 const entries=exerciseFingeringCatalogue(h,o),choice=perStringExerciseChoice(h,o);
 assert.equal(entries.length,3);assert.equal(choice.index,2);assert.match(choice.label,/Spread triad.*Second inversion/);
 assert.deepEqual(choice.board.notes.map(n=>n.string),SPREAD_STRING_SETS[4]);assert.equal(choice.board.notes[0].pc,h.chordPcs[2]);
});

test('normalization preserves all twenty spread string sets and triad material',()=>{const o={study:'positional',fingering:'spread',fingeringStringSet:19,material:'seventh',exactFingering:true};normalizeExerciseOptions(o);assert.equal(o.fingering,'spread');assert.equal(o.fingeringStringSet,19);assert.equal(o.material,'triad');assert.equal(o.exactFingering,false);});

test('menus exclude impossible sets and mode source builds all seven tertian triads',()=>{
 const h=harmonyAt({key:0,mode:'major',chord:'maj7'}),sets=playableSpreadStringSets(h,'mode');
 assert.ok(sets.length>0&&sets.length<20);
 for(let i=0;i<20;i++)assert.equal(sets.some(s=>s.index===i),spreadTriadCatalogue(h,i,'mode').some(e=>e.choices.length));
 const entries=spreadTriadCatalogue(h,sets[0].index,'mode');assert.equal(entries.length,21);
 for(let degree=0;degree<7;degree++)for(let inversion=0;inversion<3;inversion++){
  const e=entries[degree*3+inversion];assert.equal(e.inversion,inversion);assert.equal(e.harmony.modeDegree,degree);
  assert.deepEqual(e.harmony.chordPcs,[0,2,4].map(i=>h.scalePcs[(degree+i)%7]));assert.match(e.label,/Degree/);
 }
 assert.deepEqual(entries.filter((_,i)=>i%3===0).map(e=>e.harmony.suffix),['','m','m','','','m','dim']);
});
test('mode-degree identity survives exercise transfer and normalization',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min13'}),set=playableSpreadStringSets(h,'mode')[0].index,entries=spreadTriadCatalogue(h,set,'mode'),index=entries.findIndex((e,i)=>i>8&&e.choices.length),o=normalizeExerciseOptions({study:'positional',material:'triad',fingering:'spread',spreadSource:'mode',fingeringStringSet:set,inversion:index,fingeringFret:5});
 assert.equal(o.inversion,index);const choice=perStringExerciseChoice(h,o);assert.deepEqual(choice.board.notes,entries[index].choices.reduce((a,b)=>Math.abs(b.firstFret-5)<Math.abs(a.firstFret-5)?b:a).notes);
});
