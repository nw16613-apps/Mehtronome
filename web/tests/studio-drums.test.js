import {test} from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {Engine} from '../src/audio/engine.js';import {BACKING_STYLES} from '../src/practice/backing-styles.js';import {readSampleBank} from '../scripts/read-sample-bank.mjs';
const rate=8000,kit=await readSampleBank(rate);
function play(style,seconds=8,settings={}){const engine=new Engine(rate);engine.installDrumKit(kit);engine.configure({...BACKING_STYLES[style].settings,drums:true,bass:false,comping:false,countIn:false,bpm:120,click:0,harmony:0,backingHumanize:0,...settings});engine.reset();const events=[],audio=new Float32Array(rate*seconds);engine.render(new Float32Array(audio.length),undefined,null,null,undefined,audio,e=>events.push(e));assert.ok(audio.every(x=>Number.isFinite(x)&&Math.abs(x)<1));return events;}
test('replacement recordings are verified and used exclusively by the requested four styles',()=>{
 const metadata=JSON.parse(readFileSync(new URL('../src/audio/samples/studio/sources.json',import.meta.url)));assert.equal(metadata.license,'CC0-1.0');assert.equal(metadata.files.length,32);for(const f of metadata.files){const b=readFileSync(new URL('../src/audio/samples/studio/'+f.id+'.wav',import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256);}
 for(const style of ['popRock','blues','fusionJazz','motown']){const events=play(style);assert.ok(events.length>20);assert.ok(events.filter(e=>e.type==='kick'||e.type==='snare').every(e=>e.sampleId.startsWith('studio')));assert.ok(events.some(e=>e.type==='snare'&&e.sampleId==='studioSnare2'));}
 for(const style of ['traditionalJazz','bossa','latin','ballad','neoSoul','funk'])assert.ok(!play(style,2).some(e=>e.sampleId.startsWith('studio')));
});
test('new grooves state genre-specific pulse, backbeat and orchestration instead of sharing the funk beat',()=>{
 const rock=play('popRock',2,{backingVariation:0});assert.deepEqual(rock.filter(e=>e.type==='kick').map(e=>e.sample),[0,8000]);assert.deepEqual(rock.filter(e=>e.type==='snare').map(e=>e.sample),[4000,12000]);
 const blues=play('blues',2,{backingVariation:0});assert.deepEqual(blues.filter(e=>e.type==='kick').map(e=>e.sample),[0,4000,8000,12000]);assert.deepEqual(blues.filter(e=>e.type==='hat').map(e=>e.sample),[0,2667,4000,6667,8000,10667,12000,14667]);
 const soul=play('motown',2,{backingVariation:0});assert.equal(soul.filter(e=>e.type==='tambourine').length,8);assert.equal(soul.filter(e=>e.type==='hatOpen').length,0);assert.deepEqual(soul.filter(e=>e.type==='kick').map(e=>e.sample),[0,4000,8000,12000]);
 const fusion=play('fusionJazz');assert.ok(fusion.some(e=>e.type==='ride'));assert.ok(fusion.some(e=>e.type==='rideBell'));assert.ok(!fusion.some(e=>e.type==='hat'));assert.equal(BACKING_STYLES.funk.settings.drumGroove,'fusion');assert.equal(BACKING_STYLES.fusionJazz.settings.drumGroove,'fusionRide');
});
