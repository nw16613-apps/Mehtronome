import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {PREFERRED_SAMPLE_ZONES} from '../src/audio/preferred-zones.js';import {PREFERRED_SAMPLE_FILES} from '../src/audio/preferred-manifest.js';import {sampleNamesForSettings} from '../src/audio/sample-requirements.js';import {guitarToneProfile,needsGuitarCabinet} from '../src/audio/guitar-policy.js';
import {Engine,DEFAULTS} from '../src/audio/engine.js';import {readSampleBank} from '../scripts/read-sample-bank.mjs';import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
test('preferred banks have real pinned recordings, valid hashes and bounded active-family sizes',()=>{
 const p=JSON.parse(readFileSync(new URL('../src/audio/samples/preferred/sources.json',import.meta.url)));assert.equal(p.files.length,94);assert.deepEqual(Object.keys(PREFERRED_SAMPLE_ZONES),['electricGuitar','electricBass','upright']);
 for(const f of p.files){assert.equal(f.license,'CC0-1.0');assert.match(f.revision,/^[a-f0-9]{40}$/);assert.equal(createHash('sha256').update(readFileSync(PREFERRED_SAMPLE_FILES[f.id])).digest('hex'),f.sha256);assert.ok(f.seconds<=4);}
 const guitar=p.files.filter(f=>f.bank==='electricGuitar');assert.equal(guitar.length,60);assert.ok(guitar.reduce((n,f)=>n+f.bytes,0)<16*1024*1024);
 const s={soundLibrary:'expanded',bass:true,bassInstrument:'electric',bassVolume:.25};assert.equal(sampleNamesForSettings(s).length,12);assert.ok(sampleNamesForSettings(s).every(n=>n.startsWith('qYamahaBass')));assert.deepEqual(sampleNamesForSettings({...s,mutedChannels:'bass'}),[]);
});
test('35 percent chorus is confined to the three requested comping tones and no silent bank needs a cabinet',()=>{
 for(const tone of ['cleanGuitar','bluesGuitar','swelledGuitar']){assert.equal(guitarToneProfile(tone).chorus,.35);assert.equal(guitarToneProfile(tone,'sequence').chorus,0);}
 for(const tone of ['jazzGuitar','drivenGuitar','legatoGuitar'])assert.equal(guitarToneProfile(tone).chorus,0);
 const s={soundLibrary:'expanded',comping:true,compingTone:'cleanGuitar',compingVolume:.25};assert.ok(needsGuitarCabinet(s));assert.equal(needsGuitarCabinet({...s,mutedChannels:'comping'}),false);assert.equal(needsGuitarCabinet({...s,compingVolume:0}),false);
});
test('native guitar routing emits a single isolated stem without duplicating its raw dry mix or changing notes',async()=>{
 const rate=8000,kit=await readSampleBank(rate),base={...DEFAULTS,...BACKING_STYLES.popRock.settings,...backingStyleInstruments('popRock'),soundLibrary:'expanded',automaticBacking:true,progression:true,template:'single',key:9,mode:'dorian',chord:'min7',bpm:120,beats:4,countIn:false,click:0,harmony:0,drums:false,bass:false,sequence:false,comping:true,compingVolume:.25};
 const run=native=>{const e=new Engine(rate);e.installDrumKit(kit);e.configure({...base,nativeGuitarProcessing:native});e.reset();const frames=rate*4,stems={comping:new Float32Array(frames)},band=new Float32Array(frames),events=[];e.render(new Float32Array(frames),undefined,new Float32Array(frames),new Float32Array(frames),undefined,band,v=>events.push(v),null,undefined,stems);return {band,stem:stems.comping,events};};
 const dry=run(false),native=run(true);assert.deepEqual(native.events,dry.events);assert.deepEqual(native.stem,dry.stem);assert.ok(dry.band.some(x=>Math.abs(x)>.0001));assert.equal(Math.max(...native.band.map(Math.abs)),0);
});
