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

test('altered is contextual for plain dominant seven and strict for altered dominant',()=>{
  const plain=scaleChoicesForChord('dom7'),altered=plain.find(choice=>choice.id==='altered');
  assert.ok(altered);assert.equal(altered.strict,false);assert.equal(altered.targetChord,'dom7alt');
  assert.match(altered.explanation,/omits the natural 5/i);
  assert.equal(scaleChoicesForChord('dom7alt').find(choice=>choice.id==='altered').strict,true);
  assert.equal(scaleChoicesForChord('maj7').some(choice=>choice.id==='altered'&&!choice.strict),false);
});

import {compatibleScaleGroups,compatibleModeForChord} from '../src/practice/scale-explorer.js';
import {recommendedMode} from '../src/practice/custom-progression.js';
test('selected-chord menus include all strict matches once, grouped by their parent scale',()=>{
 for(const chord of Object.keys(CHORDS)){
  const groups=compatibleScaleGroups(chord),choices=groups.flatMap(g=>g.choices);
  assert.ok(choices.length,chord);
  assert.deepEqual(choices.map(c=>c.id).sort(),scaleChoicesForChord(chord).filter(c=>c.strict).map(c=>c.id).sort());
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
