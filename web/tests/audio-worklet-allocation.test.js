import {test} from 'node:test';import assert from 'node:assert/strict';
globalThis.sampleRate=48000;globalThis.currentFrame=0;globalThis.AudioWorkletProcessor=class{constructor(){this.port={postMessage(){}};}};let Processor;
globalThis.registerProcessor=(name,constructor)=>{Processor=constructor;};await import('../src/audio/worklet.js');
const outputs=()=>[2,2,2,1].map(count=>Array.from({length:count},()=>new Float32Array(128)));
test('steady-state audio callback does not allocate subarray views',()=>{
 const processor=new Processor();processor.active=true;processor.startFrame=null;let views=0;
 const channels=outputs();for(const bus of channels)for(const channel of bus){const subarray=channel.subarray.bind(channel);channel.subarray=(...args)=>{views++;return subarray(...args);};}
 processor.engine={running:true,level:1,meterPeaks:new Float32Array(12),render(click,onBeat,left,right,onSequence,rhythm,onRhythm,gate){click.fill(.1);left.fill(.2);right.fill(.3);rhythm.fill(.4);gate.fill(1);}};
 for(let i=0;i<100;i++)processor.process([],channels);assert.equal(views,0);assert.ok(channels[0][1].every(n=>Math.abs(n-.1)<1e-6));assert.ok(channels[2][1].every(n=>Math.abs(n-.4)<1e-6));
});
test('partial first quantum retains its silent prefix and the same start offset on every output',()=>{
 const processor=new Processor();processor.active=true;processor.startFrame=5;const channels=outputs();processor.engine={running:true,level:1,render(click,onBeat,left,right,onSequence,rhythm,onRhythm,gate){for(const data of [click,left,right,rhythm,gate]){assert.equal(data.length,123);data.fill(.5);}}};
 processor.process([],channels);for(const bus of channels)for(const channel of bus){assert.ok(channel.slice(0,5).every(n=>n===0));assert.ok(channel.slice(5).every(n=>n===.5));}
 assert.equal(processor.startFrame,null);
});
