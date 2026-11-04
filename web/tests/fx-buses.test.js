import {test} from 'node:test';import assert from 'node:assert/strict';
import {normalizeFxSettings,fxDelaySeconds,FX_CHANNELS,FX_PRESET_CONTROLS} from '../src/audio/fx-buses.js';import {Engine} from '../src/audio/engine.js';import {exportPresets,importPresets} from '../src/practice/presets.js';
test('separate sends start dry, sanitize values and round trip in saved setups',()=>{
 const fx=normalizeFxSettings();for(const id of FX_CHANNELS)assert.deepEqual(fx.sends[id],{reverb:0,delay:0});assert.equal(normalizeFxSettings({sends:{drums:{reverb:100,delay:0},bass:{delay:999}}}).sends.bass.delay,100);assert.equal(fxDelaySeconds(120,'eighth'),.25);assert.equal(fxDelaySeconds(120,'dotted'),.375);
 const p={id:'fx',name:'Drum room, guitar echoes',controls:Object.fromEntries(FX_PRESET_CONTROLS.map(id=>[id,id==='send-reverb-drums'?'30':id==='send-delay-comping'?'40':'0']))};assert.deepEqual(importPresets(exportPresets([p])).items[0].controls,p.controls);
});
test('FX stems are post-fader and post-mute, isolated from one another, and sum to existing dry rhythm output',()=>{
 for(const mute of ['', 'drums','bass','comping']){const e=new Engine(8000);e.configure({countIn:false,drums:true,bass:true,comping:true,sequence:true,mutedChannels:mute});e.reset();const n=24000,stems=Object.fromEntries(['drums','bass','comping','sequenceLeft','sequenceRight','harmonyLeft','harmonyRight'].map(id=>[id,new Float32Array(n)])),dry=new Float32Array(n);e.render(new Float32Array(n),undefined,new Float32Array(n),new Float32Array(n),undefined,dry,undefined,null,undefined,stems);for(let i=0;i<n;i++)assert.ok(Math.abs(dry[i]-stems.drums[i]-stems.bass[i]-stems.comping[i])<1e-7);if(mute)assert.ok(stems[mute].every(v=>v===0));}
});
test('harmony and comping vocabulary is prepared before rendering and reused across beats',()=>{
 const e=new Engine(8000);e.configure({progression:true,template:'major251',countIn:false});e.reset();const cache=e.cachedComping;assert.ok(cache.size>=3);e.render(new Float32Array(80000));assert.equal(e.cachedComping,cache);e.configure({drumsVolume:.4});assert.equal(e.cachedComping,cache);
});
