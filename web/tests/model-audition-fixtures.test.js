import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditionFixture} from '../scripts/export-model-audition.mjs';
test('AI audition inputs preserve actual study tempo, chord extensions and separate a four-bar primer from the continuation',()=>{
 for(const [id,bpm]of [['blues',112],['legatoFusion',104]]){
  const f=auditionFixture(id,'test-checkout');assert.equal(f.bpm,bpm);assert.equal(f.totalBeats,64);assert.equal(f.primerBeats,16);assert.equal(f.generated,false);
  assert.equal(f.chords[0].beat,0);assert.equal(f.chords.reduce((sum,e)=>sum+e.duration,0),64);
  assert.ok(f.chords.some(h=>h.symbol.includes('9')&&h.chordPcs.length>=5),'full chord quality retained');
  assert.ok(!Object.values(f.programs).slice(1).includes(f.programs.controls),'control instrument is separate');
  for(const track of Object.values(f.tracks))assert.ok(track.length&&track.every(e=>e.origin==='current-arranger'&&e.beat>=0&&e.beat+e.duration<=64+1e-8));
 }
});
test('Blues primer follows the actual swung onset clock, and model input export is deterministic',()=>{
 const a=auditionFixture('blues','test-checkout'),b=auditionFixture('blues','test-checkout');assert.deepEqual(a,b);
 assert.ok(a.tracks.sequence.some(e=>Math.abs(e.beat%1-2/3)<1e-8));assert.throws(()=>auditionFixture('unknown'));
});
