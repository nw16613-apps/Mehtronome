import {test} from 'node:test';import assert from 'node:assert/strict';
import {normalizeFxSettings,fxDelaySeconds,FX_CHANNELS,FX_PRESET_CONTROLS,DELAY_DIVISIONS,fxImpulse} from '../src/audio/fx-buses.js';import {Engine} from '../src/audio/engine.js';import {exportPresets,importPresets} from '../src/practice/presets.js';
test('separate sends start dry, sanitize values and round trip in saved setups',()=>{
 const fx=normalizeFxSettings();for(const id of FX_CHANNELS)assert.deepEqual(fx.sends[id],{reverb:0,reverbB:0,delay:0});assert.equal(normalizeFxSettings({sends:{drums:{reverb:100,delay:0},bass:{delay:999}}}).sends.bass.delay,100);assert.equal(fxDelaySeconds(120,'eighth'),.25);assert.equal(fxDelaySeconds(120,'dotted'),.375);
 const p={id:'fx',name:'Drum room, guitar echoes',controls:Object.fromEntries(FX_PRESET_CONTROLS.map(id=>[id,id==='send-reverb-drums'?'30':id==='send-delay-comping'?'40':'0']))};assert.deepEqual(importPresets(exportPresets([p])).items[0].controls,p.controls);
});
test('FX stems are post-fader and post-mute, isolated from one another, and sum to existing dry rhythm output',()=>{
 for(const mute of ['', 'drums','bass','comping']){const e=new Engine(8000);e.configure({countIn:false,drums:true,bass:true,comping:true,sequence:true,mutedChannels:mute});e.reset();const n=24000,stems=Object.fromEntries(['drums','bass','comping','sequenceLeft','sequenceRight','harmonyLeft','harmonyRight'].map(id=>[id,new Float32Array(n)])),dry=new Float32Array(n);e.render(new Float32Array(n),undefined,new Float32Array(n),new Float32Array(n),undefined,dry,undefined,null,undefined,stems);for(let i=0;i<n;i++)assert.ok(Math.abs(dry[i]-stems.drums[i]-stems.bass[i]-stems.comping[i])<1e-7);if(mute)assert.ok(stems[mute].every(v=>v===0));}
});
test('harmony and comping vocabulary is prepared before rendering and reused across beats',()=>{
 const e=new Engine(8000);e.configure({progression:true,template:'major251',countIn:false});e.reset();const cache=e.cachedComping;assert.ok(cache.size>=3);e.render(new Float32Array(80000));assert.equal(e.cachedComping,cache);e.configure({drumsVolume:.4});assert.equal(e.cachedComping,cache);
});

test('both reverb types are independent, returns are fixed at unity, and old sends survive migration',()=>{
 const clean=normalizeFxSettings({reverbType:'room',reverbBType:'hall',reverbReturn:12,delayReturn:0,sends:{drums:{reverb:36},comping:{reverbB:58,delay:21}}});
 assert.equal(clean.reverbType,'room');assert.equal(clean.reverbBType,'hall');
 assert.deepEqual([clean.reverbReturn,clean.reverbBReturn,clean.delayReturn],[100,100,100]);
 assert.deepEqual(clean.sends.drums,{reverb:36,reverbB:0,delay:0});assert.deepEqual(clean.sends.comping,{reverb:0,reverbB:58,delay:21});
 assert.ok(!FX_PRESET_CONTROLS.some(id=>id.endsWith('-return')));assert.ok(FX_PRESET_CONTROLS.includes('send-reverbB-comping'));
});
test('delay lengths include dotted/triplet subdivisions and support a whole note at 30 BPM',()=>{
 assert.equal(Object.keys(DELAY_DIVISIONS).length,10);
 const beats={sixteenth:.25,dottedSixteenth:.375,eighthTriplet:1/3,eighth:.5,dotted:.75,quarterTriplet:2/3,quarter:1,dottedQuarter:1.5,half:2,whole:4};
 for(const [id,value]of Object.entries(beats))assert.equal(fxDelaySeconds(120,id),value*.5);
 assert.equal(fxDelaySeconds(30,'whole'),8);assert.equal(normalizeFxSettings({delayDivision:'bad'}).delayDivision,'eighth');
});
test('reverb choices have distinct deterministic decay lengths and stereo responses',()=>{
 const lengths=new Set();for(const type of ['room','chamber','plate','hall']){const impulse=fxImpulse(8000,type);lengths.add(impulse[0].length);assert.deepEqual(impulse,fxImpulse(8000,type));assert.notDeepEqual(impulse[0],impulse[1]);assert.ok(impulse.every(channel=>channel.every(Number.isFinite)));}assert.equal(lengths.size,4);
});

test('legacy room return is absent and old return sends cannot create an extra FX source',()=>{
 assert.equal(FX_CHANNELS.length,6);assert.ok(!FX_CHANNELS.includes('space'));
 const fx=normalizeFxSettings({sends:{space:{reverb:70},harmony:{reverbB:32}}});assert.equal(fx.sends.space,undefined);assert.equal(fx.sends.harmony.reverbB,32);
});
