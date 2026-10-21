import {test} from 'node:test';
import assert from 'node:assert/strict';
import {roomImpulse} from '../src/audio/ambience.js';
const energy=values=>values.reduce((sum,value)=>sum+value*value,0)/values.length;

test('room has a clean pre-delay, decorrelated stereo and a damped tail without a cut-off click',()=>{
  for(const rate of [8000,44100,48000,96000]){
    const [left,right]=roomImpulse(rate);
    assert.equal(left.length,right.length);
    assert.ok(left.subarray(0,Math.floor(rate*.024)).every(value=>value===0));
    assert.ok(left.every(value=>Number.isFinite(value)&&Math.abs(value)<.5));
    assert.ok(right.every(value=>Number.isFinite(value)&&Math.abs(value)<.5));
    assert.ok(energy(left.subarray(rate*.05,rate*.3))>energy(left.subarray(rate*2,rate*2.5))*100);
    assert.equal(Math.abs(left.at(-1)),0);assert.equal(Math.abs(right.at(-1)),0);
    const mono=left.map((value,index)=>(value+right[index])/2);
    assert.ok(energy(mono)>energy(left)*.25,'mono room keeps useful energy');
    assert.notDeepEqual(left,right);
  }
  assert.deepEqual(roomImpulse(8000),roomImpulse(8000));
});
