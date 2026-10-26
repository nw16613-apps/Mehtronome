import {test} from 'node:test';import assert from 'node:assert/strict';
import {TRANSFORMATIONS,transformationPair} from '../src/guitar/transformations.js';import {TUNING} from '../src/guitar/fretboard.js';
const names=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
test('explicit transformation templates transpose with exactly one semitone change and two fixed voices',()=>{
 for(let pc=0;pc<12;pc++)for(const family of ['sixth','fifth'])for(const lesson of TRANSFORMATIONS)for(const centre of [1,7,16]){
 const pair=transformationPair(pc,names[pc],family,lesson.id,centre);assert.equal(pair.changed.length,1);assert.equal(pair.changed[0].delta,-1);assert.equal(pair.unchanged.length,2);
 for(const voice of [pair.before,pair.after]){assert.equal(voice.notes.length,3);assert.equal(voice.notes[0].pc,pc);assert.equal(voice.muted.length,3);assert.equal(new Set(voice.notes.map(n=>n.pc)).size,3);assert.ok(Math.max(...voice.notes.map(n=>n.fret))-Math.min(...voice.notes.map(n=>n.fret))<=3);for(const n of voice.notes){assert.equal(n.midi,TUNING[n.string]+n.fret);assert.equal(n.pc,n.midi%12);assert.ok(n.fret>=0&&n.fret<=20);assert.ok(n.fret>=pair.start&&n.fret<=pair.end);assert.equal(n.finger,undefined);}}
 }
});
test('C shell examples distinguish formula, voiced order and omitted fifth',()=>{
 const pair=transformationPair(0,'C','sixth','maj7-dom7',8);assert.deepEqual(pair.before.frets,[8,'×',9,9,'×','×']);assert.deepEqual(pair.after.frets,[8,'×',8,9,'×','×']);assert.deepEqual(pair.before.notes.map(n=>n.name),['C','B','E']);assert.equal(pair.before.formula,'1 · 3 · 5 · 7');assert.match(pair.before.omitted,/G \(5th\)/);assert.equal(pair.changed[0].before.name,'B');assert.equal(pair.changed[0].after.name,'B♭');
 const minor=transformationPair(0,'C','fifth','min7-min6',3);assert.deepEqual(minor.before.frets,['×',3,1,3,'×','×']);assert.deepEqual(minor.after.frets,['×',3,1,2,'×','×']);assert.deepEqual(minor.after.notes.map(n=>n.name),['C','E♭','A']);
});
test('functional spelling retains thirds and sevenths on their correct letters',()=>{const pair=transformationPair(1,'C♯','fifth','maj7-dom7',4);assert.deepEqual(pair.before.notes.map(n=>n.name),['C♯','E♯','B♯']);assert.deepEqual(pair.after.notes.map(n=>n.name),['C♯','E♯','B']);const triad=transformationPair(10,'B♭','sixth','major-minor',6);assert.deepEqual(triad.after.notes.map(n=>n.name),['B♭','D♭','F']);assert.match(triad.after.omitted,/None/);});
