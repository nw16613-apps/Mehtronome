import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHORDS,MODES} from '../src/audio/music.js';
import {scaleChoicesForChord} from '../src/practice/scale-explorer.js';

test('strict chord-first choices contain every explicitly written chord tone',()=>{
  for(const chordId of Object.keys(CHORDS))for(const choice of scaleChoicesForChord(chordId).filter(choice=>choice.strict)){
    const scale=new Set(MODES[choice.id].intervals.map(interval=>interval%12));
    assert.ok(CHORDS[chordId].intervals.every(interval=>scale.has(interval%12)),`${choice.name} must contain every tone of ${chordId}`);
  }
});

test('altered requires an altered chord in the guide menu',()=>{
  const plain=scaleChoicesForChord('dom7'),altered=plain.find(choice=>choice.id==='altered');
  assert.ok(altered);assert.equal(altered.strict,false);assert.equal(altered.targetChord,'dom7alt');assert.equal(altered.compatible,false);
  assert.match(altered.explanation,/omits the natural 5/i);
  assert.equal(scaleChoicesForChord('dom7alt').find(choice=>choice.id==='altered').strict,true);
  assert.equal(scaleChoicesForChord('maj7').some(choice=>choice.id==='altered'&&!choice.strict),false);
});

import {compatibleScaleGroups,compatibleModeForChord} from '../src/practice/scale-explorer.js';
import {recommendedMode} from '../src/practice/custom-progression.js';
test('selected-chord menus include all compatible matches once, grouped by their parent scale',()=>{
 for(const chord of Object.keys(CHORDS)){
  const groups=compatibleScaleGroups(chord),choices=groups.flatMap(g=>g.choices);
  assert.ok(choices.length,chord);
  assert.deepEqual(choices.map(c=>c.id).sort(),scaleChoicesForChord(chord).filter(c=>c.compatible).map(c=>c.id).sort());
  for(const group of groups)assert.ok(group.choices.every(c=>c.family===group.family));
  const selected=compatibleModeForChord(chord,'phrygian_dominant',recommendedMode(chord));
  assert.ok(choices.some(c=>c.id===selected));
 }
 const minor=compatibleScaleGroups('min7').flatMap(g=>g.choices.map(c=>c.id));
 assert.ok(minor.includes('dorian')&&minor.includes('phrygian')&&minor.includes('minor'));
 assert.ok(!minor.includes('phrygian_dominant'));
 assert.equal(compatibleModeForChord('min7','phrygian','dorian'),'phrygian');
 assert.equal(compatibleModeForChord('dom7','dorian','mixolydian'),'mixolydian');
 assert.ok(!compatibleScaleGroups('dom7').flatMap(g=>g.choices).some(c=>c.id==='altered'));
 assert.ok(compatibleScaleGroups('dom7alt').flatMap(g=>g.choices).some(c=>c.id==='altered'));
 assert.ok(!compatibleScaleGroups('min13').flatMap(g=>g.choices).some(c=>c.id==='minor'));
});


test('reduced guides can omit chord tones without admitting conflicting full scales',()=>{
 const guides=chord=>compatibleScaleGroups(chord).flatMap(g=>g.choices.map(c=>c.id));
 for(const chord of ['dom7','dom9','dom13','maj7','maj13','sixNine']){
  assert.ok(guides(chord).includes('major_pentatonic'),chord);
  assert.ok(guides(chord).includes('major_blues'),chord);
 }
 for(const chord of ['min7','min9','min13']){
  assert.ok(guides(chord).includes('minor_pentatonic'),chord);
  assert.ok(guides(chord).includes('minor_blues'),chord);
  assert.ok(!guides(chord).includes('major_pentatonic'),chord);
  assert.ok(!guides(chord).includes('phrygian_dominant'),chord);
 }
 assert.ok(!guides('dom7sharp5').includes('major_pentatonic'));
 assert.ok(!guides('dom7').includes('whole_tone'));
 assert.ok(guides('dom9sharp5').includes('whole_tone'));
 assert.ok(!guides('dom13').includes('minor_blues'));
 assert.ok(!guides('maj7').includes('mixolydian'));
 assert.ok(!guides('dom7').includes('major'));
 assert.ok(!guides('dom13b9').includes('major_pentatonic'));
 assert.equal(compatibleModeForChord('dom13','major_blues','mixolydian'),'major_blues');
});

test('every reduced exception has a supporting full scale for chord and underlying pentatonic',()=>{
 for(const chord of Object.keys(CHORDS))for(const choice of scaleChoicesForChord(chord).filter(c=>c.compatible&&!c.strict)){
  const mode=MODES[choice.id];assert.ok(['Pentatonic scales','Blues scales'].includes(mode.family));
  const blue=choice.id==='major_blues'?3:choice.id==='minor_blues'?6:null;
  const required=[...CHORDS[chord].intervals.map(n=>n%12),...mode.intervals.filter(n=>n!==blue)];
  assert.ok(Object.values(MODES).some(parent=>parent.intervals.length===7&&required.every(n=>parent.intervals.includes(n))),`${chord} ${choice.id}`);
 }
});
