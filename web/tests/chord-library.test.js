import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHORDS,harmonyAt} from '../src/audio/music.js';
import {chordFamily,chordOptionGroups} from '../src/practice/chord-options.js';
import {compatibleScaleGroups} from '../src/practice/scale-explorer.js';
import {recommendedMode,romanForStep,normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {Engine} from '../src/audio/engine.js';
const added=['add9','add11','maj13','maj13sharp11','minAdd9','minAdd11','minSixNine','min7add11','minMaj11','minMaj13','dom11','dom7sharp11','dom13sharp11','dom7flat5','dom7sharp5','dom9sharp5','dom7b9sharp5','dom7sharp9flat5','dom7sharp9sharp5','thirteenSus','sevenSusB9','diminished'];
test('new chord formulas have compatible recommended scales, valid spellings and engine voices',()=>{
 for(const chord of added){
  assert.ok(compatibleScaleGroups(chord).flatMap(g=>g.choices).some(c=>c.id===recommendedMode(chord)),chord);
  for(const key of [0,6,9]){
   const h=harmonyAt({key,chord,mode:recommendedMode(chord)});
   assert.deepEqual(h.midi.map(n=>n-48-key),CHORDS[chord].intervals);
   assert.ok(h.chordPcs.every(pc=>h.scalePcs.includes(pc)),chord);
   assert.ok(h.tones.every(n=>typeof n==='string'&&/^[A-G][♯♭]*$/.test(n)),chord);
   assert.ok(h.intervals.every(Boolean),chord);
  }
  const settings={key:9,chord,mode:recommendedMode(chord),progression:false,countIn:false,click:0,harmony:1};
  const engine=new Engine(8000);engine.configure(settings);engine.reset();
  assert.ok(engine.chordMidi.every(Number.isFinite));assert.ok(engine.padVoicing.length>0);
  const chart=normalizeCustomProgression({steps:[{root:0,chord,mode:recommendedMode(chord),bars:1}]});assert.equal(chart.steps[0].chord,chord);
 }
 assert.equal(romanForStep({root:2,chord:'diminished'}),'ii°');
});
test('chord family groups include every chord once and distinguish altered tensions from a minor third',()=>{
 const ids=chordOptionGroups().flatMap(g=>g.ids);assert.deepEqual([...ids].sort(),Object.keys(CHORDS).sort());assert.equal(new Set(ids).size,ids.length);
 assert.equal(chordFamily('dom7alt'),'Dominant');assert.equal(chordFamily('dom7sharp9sharp5'),'Dominant');assert.equal(chordFamily('maj7sharp9sharp11'),'Major');assert.equal(chordFamily('minMaj13'),'Minor');assert.equal(chordFamily('diminished'),'Diminished & half-diminished');
});
