import test from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {fingeringCatalogue,playableFingeringStringSets} from '../src/guitar/fingering-catalogue.js';
import {exerciseFingeringCatalogue,perStringExerciseChoice} from '../src/practice/per-string-exercises.js';
import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';
import {exerciseFavouriteKey} from '../src/practice/exercise-favourites.js';
for(const kind of ['oneTwo','twoOne','drop2','drop3'])test(`${kind}: every mode degree has correct four-tone harmony and only practical fingerings`,()=>{
 for(const mode of ['major','dorian','melodic_minor','harmonic_minor'])for(let key=0;key<12;key++){
  const h=harmonyAt({key,mode,chord:'maj7'}),sets=kind.startsWith('drop')?playableFingeringStringSets(h,kind,'mode'):[{index:0}];
  assert.ok(sets.length);
  const seen=new Set();
  for(const {index:set} of sets){const catalogue=fingeringCatalogue(h,kind,set,'mode');assert.equal(catalogue.length,28);
   for(const [index,e] of catalogue.entries()){
    assert.equal(e.degree,index);assert.deepEqual(e.harmony.chordPcs,[0,2,4,6].map(i=>h.scalePcs[(Math.floor(index/4)+i)%7]));
    for(const b of e.choices){seen.add(e.harmony.modeDegree);assert.ok(b.end<=24&&b.start>0);
     assert.equal(b.notes[0].pc,e.harmony.chordPcs[index%4]);
     assert.ok(b.notes.every(n=>e.harmony.chordPcs.includes(n.pc)));
     if(kind.startsWith('drop')){assert.equal(b.notes.length,4);assert.ok(b.end-b.start<=4);}
     else for(let string=0;string<6;string++){const ns=b.notes.filter(n=>n.string===string);assert.equal(ns.length,(string%2===0)===(kind==='twoOne')?2:1);assert.ok(Math.max(...ns.map(n=>n.fret))-Math.min(...ns.map(n=>n.fret))<=4);}
    }
   }
  }
  assert.equal(seen.size,7,`${mode} ${key}: every degree has a playable option`);
 }
});
test('all-source practice keeps the selected mode degree and favourites distinguish sources',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min13'});
 for(const kind of ['oneTwo','twoOne','drop2','drop3']){
  const set=playableFingeringStringSets(h,kind,'mode')[0]?.index||0,entries=fingeringCatalogue(h,kind,set,'mode'),inversion=entries.findIndex((e,i)=>i>23&&e.choices.length),o=normalizeExerciseOptions({study:'positional',material:'seventh',fingering:kind,spreadSource:'mode',inversion,fingeringStringSet:set,fingeringFret:5});
  assert.equal(o.inversion,inversion);assert.equal(exerciseFingeringCatalogue(h,o).length,28);assert.equal(perStringExerciseChoice(h,o).index,inversion);
  assert.notEqual(exerciseFavouriteKey(o),exerciseFavouriteKey({...o,spreadSource:'chord'}));
 }
});

test('scale fingerings ignore the chord-source choice when identifying favourites',()=>{const o={study:'positionalscale',material:'triad',fingering:'three',spreadSource:'chord'};assert.equal(exerciseFavouriteKey(o),exerciseFavouriteKey({...o,spreadSource:'mode'}));});
