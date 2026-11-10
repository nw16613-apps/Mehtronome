import {test} from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {Engine} from '../src/audio/engine.js';import {BACKING_STYLES} from '../src/practice/backing-styles.js';import {readSampleBank} from '../scripts/read-sample-bank.mjs';
const rate=8000,kit=await readSampleBank(rate);
function play(style,seconds=8,settings={}){const engine=new Engine(rate);engine.installDrumKit(kit);engine.configure({...BACKING_STYLES[style].settings,backingStyle:null,accompanimentStyle:null,sequenceStyle:null,drums:true,bass:false,comping:false,countIn:false,bpm:120,click:0,harmony:0,backingHumanize:0,...settings});engine.reset();const events=[],audio=new Float32Array(rate*seconds);engine.render(new Float32Array(audio.length),undefined,null,null,undefined,audio,e=>events.push(e));assert.ok(audio.every(x=>Number.isFinite(x)&&Math.abs(x)<1));return events;}
test('archival DRS recordings are verified while the fusion profile uses the replacement Sonor bank',()=>{
 const metadata=JSON.parse(readFileSync(new URL('../src/audio/samples/live/sources.json',import.meta.url)));assert.equal(metadata.license,'CC-BY-4.0');assert.equal(metadata.files.length,32);for(const f of metadata.files){const b=readFileSync(new URL('../src/audio/samples/live/'+f.id+'.wav',import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256);}
 for(const style of ['popRock','blues','motown','funk']){const events=play(style);assert.ok(events.length>20);assert.ok(events.filter(e=>e.type==='kick'||e.type==='snare').every(e=>e.sampleId.startsWith('live')));assert.ok(events.some(e=>e.type==='snare'&&e.sampleId==='liveSnare2'));}
 assert.ok(play('fusionJazz').filter(e=>e.type==='kick'||e.type==='snare').every(e=>e.sampleId.startsWith('sonor')));
 for(const style of ['traditionalJazz','bossa','latin','ballad','neoSoul'])assert.ok(!play(style,2).some(e=>e.sampleId.startsWith('live')));
});
test('new grooves state genre-specific pulse, backbeat and orchestration instead of sharing the funk beat',()=>{
 const rock=play('popRock',2,{backingVariation:0});assert.deepEqual(rock.filter(e=>e.type==='kick').map(e=>e.sample),[0,8000]);assert.deepEqual(rock.filter(e=>e.type==='snare').map(e=>e.sample),[4000,12000]);
 const blues=play('blues',2,{backingVariation:0});assert.deepEqual(blues.filter(e=>e.type==='kick').map(e=>e.sample),[0,4000,8000,12000]);assert.deepEqual(blues.filter(e=>e.type==='ride').map(e=>e.sample),[0,2667,4000,6667,8000,10667,12000,14667]);assert.ok(!blues.some(e=>['hat','hatOpen'].includes(e.type)));
 const soul=play('motown',2,{backingVariation:0});assert.equal(soul.filter(e=>e.type==='tambourine').length,8);assert.equal(soul.filter(e=>e.type==='hatOpen').length,0);assert.deepEqual(soul.filter(e=>e.type==='kick').map(e=>e.sample),[0,4000,8000,12000]);
 const fusion=play('fusionJazz');assert.ok(fusion.some(e=>e.type==='hat'));assert.ok(fusion.some(e=>e.type==='hatOpen'));assert.ok(!fusion.some(e=>e.type==='ride'||e.type==='rideBell'));assert.equal(BACKING_STYLES.funk.settings.drumGroove,'fusion');assert.equal(BACKING_STYLES.fusionJazz.settings.drumGroove,'fusionRide');
});

test('live kit retains acoustic body and cymbal decay without the former hybrid gating',()=>{
 const metadata=JSON.parse(readFileSync(new URL('../src/audio/samples/live/sources.json',import.meta.url)));
 assert.match(metadata.processing,/Original tuning and natural decay retained/);
 const get=id=>metadata.files.find(f=>f.id===id);assert.ok(get('liveSnare1').duration>=.3);assert.ok(get('liveRide1').duration>=2);assert.ok(get('liveKick1').duration<=.25);assert.ok(get('liveKick1').duration>=.18);
 const snare=kit.liveSnare1;assert.ok(snare.subarray(800,3200).some(value=>Math.abs(value)>.001));
});
