import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMasterOutput,masterVolumePercent,OUTPUT_BOOST_DB,OUTPUT_HEADROOM_GAIN,OUTPUT_LIMITER} from '../src/audio/master-output.js';
test('master volume sanitizes stored values and keeps deliberate silence',()=>{
 for(const value of [null,undefined,'',NaN,'bad'])assert.equal(masterVolumePercent(value),100);
 assert.equal(masterVolumePercent('0'),0);assert.equal(masterVolumePercent(-10),0);assert.equal(masterVolumePercent(120),100);assert.equal(masterVolumePercent('38'),38);
});
test('every source shares one boosted, limited output and the user volume stays after protection',()=>{
 const connections=[],ramps=[],context={currentTime:12,destination:{name:'speakers'},createGain(){return {gain:{value:0,setTargetAtTime(...args){ramps.push(args);}},connect(target){connections.push([this,target]);return target;}};},createDynamicsCompressor(){return {...Object.fromEntries(Object.keys(OUTPUT_LIMITER).map(key=>[key,{value:0}])),connect(target){connections.push([this,target]);return target;}};}};
 const stage=createMasterOutput(context,40);assert.equal(stage.input.gain.value,10**(OUTPUT_BOOST_DB/20));assert.equal(stage.volume.gain.value,.4*OUTPUT_HEADROOM_GAIN);
 for(const [key,value]of Object.entries(OUTPUT_LIMITER))assert.equal(stage.limiter[key].value,value);
 assert.deepEqual(connections,[[stage.input,stage.limiter],[stage.limiter,stage.volume],[stage.volume,context.destination]]);
 stage.setVolume(0);assert.deepEqual(ramps,[[0,12,.02]]);assert.equal(stage.input.gain.value,10**(OUTPUT_BOOST_DB/20));
});
