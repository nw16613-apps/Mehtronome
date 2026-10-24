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
