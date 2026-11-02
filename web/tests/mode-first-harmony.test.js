import {test} from 'node:test';import assert from 'node:assert/strict';
import {CHORDS,MODES} from '../src/audio/music.js';import {chordChoicesForMode,compatibleChordForMode,scaleChoicesForChord} from '../src/practice/scale-explorer.js';
test('mode-first suggestions are the reciprocal of every supported chord-first pairing',()=>{
 for(const mode of Object.keys(MODES)){
  const choices=chordChoicesForMode(mode),ids=choices.map(c=>c.id);assert.equal(new Set(ids).size,ids.length);
  for(const chord of Object.keys(CHORDS)){const forward=scaleChoicesForChord(chord).some(c=>c.id===mode&&c.compatible);assert.equal(ids.includes(chord),forward,`${mode} ${chord}`);}
  for(const choice of choices)if(choice.strict){const pcs=new Set(MODES[mode].intervals.map(n=>n%12));assert.ok(CHORDS[choice.id].intervals.every(n=>pcs.has(n%12)));}
 }
});
test('mode changes retain compatible qualities and choose a valid default for incompatible ones',()=>{
 assert.equal(compatibleChordForMode('dorian','min7'),'min7');assert.equal(compatibleChordForMode('dorian','dom7'),MODES.dorian.chord);
 const major=compatibleChordForMode('major','min7');assert.equal(major,MODES.major.chord);assert.ok(chordChoicesForMode('major').some(c=>c.id===major));
 assert.ok(chordChoicesForMode('lydian').some(c=>c.id==='maj13sharp11'));assert.ok(!chordChoicesForMode('major').some(c=>c.id==='maj13sharp11'));
 assert.ok(chordChoicesForMode('altered').some(c=>c.id==='dom7alt'));assert.ok(!chordChoicesForMode('altered').some(c=>c.id==='dom7'));
});
test('reduced collections explicitly distinguish omitted chord tones and invalid modes are rejected',()=>{
 const choice=chordChoicesForMode('major_pentatonic').find(c=>c.id==='maj7');assert.ok(choice);assert.equal(choice.strict,false);assert.match(choice.explanation,/omits/);
 assert.deepEqual(chordChoicesForMode('not-a-mode'),[]);assert.equal(compatibleChordForMode('not-a-mode','min7'),'');
});
