import {test} from 'node:test';import assert from 'node:assert/strict';
import {PREFERRED_SAMPLE_ZONES} from '../src/audio/preferred-zones.js';
import {sampleNamesForSettings} from '../src/audio/sample-requirements.js';
import {SampledBass} from '../src/audio/bass.js';import {VSCO_UPRIGHT_GAIN} from '../src/audio/mix-balance.js';
import {readSampleBank} from '../scripts/read-sample-bank.mjs';
import {Engine,DEFAULTS} from '../src/audio/engine.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
const rate=8000,kit=await readSampleBank(rate);
test('upright loading selects only the chosen VSCO bank with two takes, velocity layers and corrected pitches',()=>{
 const zones=PREFERRED_SAMPLE_ZONES.upright;assert.equal(zones.length,40);assert.ok(zones.every(z=>z.id.startsWith('qVscoBass')));assert.equal(new Set(zones.map(z=>z.nominalMidi)).size,14);assert.ok(zones.some(z=>Math.abs(z.rootMidi-z.nominalMidi)>.1));
 const s={soundLibrary:'expanded',bass:true,bassInstrument:'upright',bassVolume:.25};assert.deepEqual(sampleNamesForSettings(s),zones.map(z=>z.id));assert.deepEqual(sampleNamesForSettings({...s,mutedChannels:'bass'}),[]);
 const bass=new SampledBass(rate,kit);const a=bass.noteOn(36,.4,.4,'walk','upright','expanded'),first=a.sourceId,b=bass.noteOn(36,.4,.4,'walk','upright','expanded');assert.notEqual(first,b.sourceId);assert.match(first,/v1/);assert.match(bass.noteOn(36,.4,.7,'walk','upright','expanded').sourceId,/v3/);
 assert.equal(bass.noteOn(36,.4,.6,'walk','upright','expanded').gain,.6*VSCO_UPRIGHT_GAIN);
});
test('every upright style uses VSCO in normal automatic playback with finite audio',()=>{
 for(const [id,style]of Object.entries(BACKING_STYLES)){
  if(style.settings.bassInstrument!=='upright')continue;
  const settings={...DEFAULTS,...style.settings,...backingStyleInstruments(id),automaticBacking:true,backingStyle:id,soundLibrary:'expanded',progression:false,key:0,mode:'dorian',chord:'min7',beats:style.suggestedBeats||4,bpm:120,countIn:false,click:0,harmony:0,drums:false,comping:false,sequence:false,bass:true};
  const engine=new Engine(rate);engine.installDrumKit(kit);engine.configure(settings);engine.reset();const audio=new Float32Array(rate*4),events=[];engine.render(new Float32Array(audio.length),undefined,null,null,undefined,audio,e=>events.push(e));assert.ok(events.some(e=>e.type==='bass'),id);assert.ok(engine.rhythm.bassInstrument.voices.filter(v=>v.sourceId).every(v=>v.sourceId.startsWith('qVscoBass')),id);assert.ok(audio.some(x=>Math.abs(x)>.001));assert.ok(audio.every(x=>Number.isFinite(x)&&Math.abs(x)<1));
 }
});
