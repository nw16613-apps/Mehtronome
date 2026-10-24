import {test} from 'node:test';
import assert from 'node:assert/strict';
import {barAlignedDuration} from '../src/practice/exercise-timing.js';

test('backed exercise loops restart only on complete bar boundaries',()=>{
  assert.equal(barAlignedDuration(9*.0625,.25,4),1);
  assert.equal(barAlignedDuration(16*.0625,.25,4),1);
  assert.equal(barAlignedDuration(17*.0625,.25,4),2);
  assert.equal(barAlignedDuration(12*(1/6),.5,4),2);
});
