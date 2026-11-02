import {test} from 'node:test';import assert from 'node:assert/strict';
import {PROGRESSIONS,harmonyAt,progressionBeatDurations} from '../src/audio/music.js';
import {cloneTemplate,normalizeCustomProgression} from '../src/practice/custom-progression.js';
const formulas={major1625:[0,9,2,7],minor1625:[0,8,2,7],backdoor:[5,10,0],tritone251:[2,1,0],major1564:[0,7,9,5],major6415:[9,5,0,7],minor1637:[0,8,3,10],andalusian:[0,10,8,7]};
test('added templates transpose correctly, spell their roots and retain all four bars in editable copies',()=>{
 for(const [id,roots]of Object.entries(formulas)){
  const template=PROGRESSIONS[id],original=JSON.stringify(template);assert.deepEqual(template.steps.map(s=>s.root),roots);
  for(const key of [0,2,9]){
   const settings={key,progression:true,template:id,mode:'major',chord:'maj7',beats:4};
   const copy=normalizeCustomProgression(cloneTemplate(template,'maj7','major',settings));assert.equal(copy.steps.length,roots.length);assert.equal(copy.steps.reduce((n,s)=>n+s.bars,0),4);assert.equal(progressionBeatDurations(settings).reduce((a,b)=>a+b,0),16);
   roots.forEach((offset,i)=>{const h=harmonyAt(settings,i);assert.equal(h.chordPcs[0],(key+offset)%12);assert.ok(h.chordPcs.every(pc=>h.scalePcs.includes(pc)));assert.ok(h.tones.every(n=>/^[A-G][♯♭]*$/.test(n)));});
  }
  assert.equal(JSON.stringify(template),original);
 }
 assert.equal(harmonyAt({key:0,progression:true,template:'tritone251'},1).name,'D♭');
});
