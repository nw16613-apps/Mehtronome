import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BACKING_CHANNELS,backingMutesForPreset} from '../src/practice/mixer.js';
test('legacy off channels become muted, while enabled channels retain explicit mute state',()=>{
 for(const id of BACKING_CHANNELS){
  assert.equal(backingMutesForPreset({})['mute-'+id],true);
  assert.equal(backingMutesForPreset({[id]:false,['mute-'+id]:false})['mute-'+id],true);
  assert.equal(backingMutesForPreset({[id]:true})['mute-'+id],false);
  for(const muted of [true,false])assert.equal(backingMutesForPreset({[id]:true,['mute-'+id]:muted})['mute-'+id],muted);
 }
});

import {Engine} from '../src/audio/engine.js';
test('a muted bass leaves the pad foundation intact, and mute changes reweight without restarting its chord',()=>{
 const setup=bass=>{const e=new Engine(8000);e.configure({key:9,chord:'min7',mode:'dorian',sound:'horizon',padDepth:'epic',extensionMorph:false,bass,countIn:false});e.reset();return e;};
 const off=setup(false),on=setup(true);off.applyPadDepthState(off.depthMotionState);
 const low=e=>e.voices.filter(v=>v.role==='foundation').reduce((sum,v)=>sum+v.targetLevel,0);
 assert.ok(low(on)<low(off));
 on.chordAge=123;on.configure({mutedChannels:'bass'});assert.ok(Math.abs(low(on)-low(off))<1e-10);assert.equal(on.chordAge,123);
 on.configure({mutedChannels:''});assert.ok(low(on)<low(off));assert.equal(on.chordAge,123);
});
