import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Engine} from '../src/audio/engine.js';
import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {Rhythm} from '../src/audio/rhythm.js';
import {BACKING_STYLES} from '../src/practice/backing-styles.js';
import {backingSubdivision} from '../src/audio/groove-time.js';
import {readSampleBank} from '../scripts/read-sample-bank.mjs';
const rate=8000,kit=await readSampleBank(rate);
const create=(extra={})=>{const e=new Engine(rate);e.installDrumKit(kit);e.configure({...BACKING_STYLES.traditionalJazz.settings,drums:true,bass:true,comping:true,countIn:false,bpm:120,click:0,harmony:0,...extra});e.reset();return e;};
function render(e,frames,block=frames){const audio=new Float32Array(frames),events=[];for(let offset=0;offset<frames;offset+=block){const count=Math.min(block,frames-offset);e.render(new Float32Array(count),undefined,null,null,undefined,audio.subarray(offset,offset+count),event=>events.push(event));}return {audio,events};}
test('new acoustic recordings are licensed, hash-verified, distinct and velocity-sensitive',()=>{
 const metadata=JSON.parse(readFileSync(new URL('../src/audio/samples/jazz/sources.json',import.meta.url)));assert.equal(metadata.license,'CC0-1.0');assert.equal(metadata.files.length,38);
 for(const file of metadata.files){const bytes=readFileSync(new URL('../src/audio/samples/jazz/'+file.id+'.wav',import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);assert.ok(kit[file.id].some(x=>Math.abs(x)>.1));}
 const r=new Rhythm(rate,kit),events=[];for(const gain of [.1,.25,.65,.25])r.hitDrum('snare',gain,0,0,0,0,e=>events.push(e),'jazz');assert.ok(events[0].sampleId.startsWith('jazzSnareGhost'));assert.ok(events[1].sampleId.startsWith('jazzSnareSoft'));assert.ok(/^jazzSnare\d/.test(events[2].sampleId));assert.notEqual(events[1].sampleId,events[3].sampleId);
});
test('human touch varies hands without shifting click, bass roots or accumulating drift',()=>{
 const natural=render(create(),rate*32),exact=render(create({backingHumanize:0}),rate*32);
 const hands=natural.events.filter(e=>e.delayFrames>0);assert.ok(hands.length>50);assert.ok(hands.every(e=>e.sample-e.gridSample===e.delayFrames&&e.delayFrames<rate*.02));
 const kicks=natural.events.filter(e=>e.type==='kick'&&e.beat===0&&e.sub===0);assert.equal(kicks.length,16);assert.ok(kicks.every((e,i)=>e.sample===i*rate*2));
 assert.deepEqual(natural.events.filter(e=>e.type==='bass').map(e=>e.sample),exact.events.filter(e=>e.type==='bass').map(e=>e.sample));assert.ok(natural.events.some(e=>e.type==='comping'&&e.delayFrames>0));
 const a=new Engine(rate),b=new Engine(rate);a.configure({countIn:false,drums:true,backingHumanize:1});b.configure({countIn:false,drums:true,backingHumanize:0});a.reset();b.reset();const clicksA=[],clicksB=[];a.render(new Float32Array(rate*6),e=>clicksA.push(e));b.render(new Float32Array(rate*6),e=>clicksB.push(e));assert.deepEqual(clicksA,clicksB);
});
test('natural backing remains block-independent and bounded through odd meters and fast swing',()=>{
 for(const [style,beats,bpm]of [['traditionalJazz',5,237],['neoSoul',4,137],['bossa',3,113]]){
  const settings={...BACKING_STYLES[style].settings,beats,bpm};const whole=render(create(settings),rate*12),blocks=render(create(settings),rate*12,127);assert.deepEqual(blocks,whole);assert.ok(whole.audio.every(v=>Number.isFinite(v)&&Math.abs(v)<1));
 }
 assert.equal(backingSubdivision(.62,'swing',120),1);assert.equal(backingSubdivision(.62,'swing',240),2);assert.equal(backingSubdivision(.62,'shuffle',240),1);
});
test('phrases change beyond four bars and fills respond to marked sections',()=>{
 const e=create({...BACKING_STYLES.popRock.settings,comping:false,bass:false,progression:true,template:'custom',customProgression:normalizeCustomProgression({name:'Sections',steps:[{root:0,chord:'min7',mode:'dorian',beats:12,section:'A'},{root:5,chord:'dom7',mode:'mixolydian',beats:12,section:'B'}]})});
 const {events}=render(e,rate*24);assert.ok(events.some(e=>e.type.startsWith('tom')&&e.gridSample>=rate*5&&e.gridSample<rate*6));
 const jazz=render(create({comping:false,bass:false}),rate*32).events;assert.ok(jazz.some(e=>e.type==='flatRide'));const signatures=[0,4,8,12].map(bar=>JSON.stringify(jazz.filter(e=>e.gridSample>=bar*rate*2&&e.gridSample<(bar+1)*rate*2).map(e=>[e.type,e.gridSample%(rate*2),e.gain])));assert.equal(new Set(signatures).size,4);
});
