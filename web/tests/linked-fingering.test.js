import test from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {linkExerciseFingering} from '../src/practice/linked-fingering.js';
import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';
import {perStringExerciseChoice,perStringExerciseGroups} from '../src/practice/per-string-exercises.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {perStringCatalogue} from '../src/guitar/per-string.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),key=n=>n.string+':'+n.fret;
test('shared fingering retains a compatible pattern and copies its physical selection',()=>{
 const v={fingering:'caged',study:'groups3',material:'seventh'};linkExerciseFingering(v,{kind:'three',inversion:2,fret:8},h);normalizeExerciseOptions(v);assert.equal(v.study,'groups3');assert.equal(v.fingering,'three');
 linkExerciseFingering(v,{kind:'oneTwo',inversion:1,fret:8},h);normalizeExerciseOptions(v);assert.equal(v.study,'arpseq_groups3');assert.equal(v.fingering,'oneTwo');assert.equal(v.inversion,1);assert.equal(v.arpeggioSource,'selectedChord');
 linkExerciseFingering(v,{kind:'drop3',inversion:2,fret:12,stringSet:1,spreadSource:'mode'},h);normalizeExerciseOptions(v);assert.equal(v.study,'positional');assert.equal(v.fingering,'drop3');assert.equal(v.fingeringStringSet,1);assert.equal(v.spreadSource,'mode');
});
test('changing material retains the 3NPS fingering and traverses only its chord-tone subset',()=>{
 const o=normalizeExerciseOptions({linkedFingering:true,fingering:'three',study:'positional',material:'triad',inversion:2,fingeringFret:8,motion:'ascending'}),b=perStringExerciseChoice(h,o).board,g=perStringExerciseGroups([h],[8],[{}],o)[0];
 assert.equal(o.fingering,'three');const allowed=new Set(b.notes.map(key));assert.ok(g.notes.length);assert.ok(g.notes.every(n=>h.chordPcs.slice(0,3).includes(n.pc)&&allowed.has(key(n))));assert.deepEqual(g.board.notes,b.notes);
});
test('sequence generation uses the selected 3NPS strings/frets and retains cell phase across chord slots',()=>{
 const board=perStringCatalogue(h,'three')[2].choices[0],o={study:'groups3',material:'seventh',motion:'ascending',rhythm:'sixteenths',boardFor:()=>board};
 const whole=progressionExerciseGroups([h],[8],board,o),split=progressionExerciseGroups([h,h],[4,4],board,o),allowed=new Set(board.notes.map(key));
 assert.ok(whole[0].notes.length);assert.ok(split.flatMap(g=>g.notes).every(n=>allowed.has(key(n))));assert.deepEqual(split.flatMap(g=>g.notes.map(key)),whole.flatMap(g=>g.notes.map(key)));assert.deepEqual(whole[0].board.notes,board.notes);
});
test('chord-note sequence generation retains the exact alternating-string arpeggio pattern',()=>{
 const o={linkedFingering:true,fingering:'twoOne',study:'arpseq_groups3',material:'seventh',motion:'ascending',rhythm:'sixteenths',inversion:1,fingeringFret:8},choice=perStringExerciseChoice(h,o),allowed=new Set(choice.board.notes.map(key));
 const groups=progressionExerciseGroups([h],[8],choice.board,{...o,boardFor:()=>choice.board});assert.ok(groups[0].notes.length);assert.ok(groups[0].notes.every(n=>allowed.has(key(n))));
});

test('exercise-side arpeggio selection cannot retain a scale-only material label',()=>{const v={linkedFingering:true,fingering:'oneTwo',study:'positionalscale',material:'seventh'};linkExerciseFingering(v,{kind:'oneTwo',inversion:0,fret:5},h);assert.equal(v.study,'positional');assert.equal(v.fingering,'oneTwo');assert.equal(v.arpeggioSource,'selectedChord');});
