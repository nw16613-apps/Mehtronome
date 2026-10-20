import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';
import {harmonyAt} from '../src/audio/music.js';
import {DRUM_GROOVES,BASS_PATTERNS} from '../src/audio/rhythm.js';
const noop=()=>{};
function setup(settings={}){
  const engine=new Engine(8000);
  engine.configure({countIn:false,click:0,harmony:0,bpm:120,drums:true,bass:true,...settings});engine.reset();return engine;
}
function render(engine,length){
  const click=new Float32Array(length),pad=new Float32Array(length),right=new Float32Array(length),dry=new Float32Array(length),events=[];
  engine.render(click,noop,pad,right,undefined,dry,event=>events.push(event));
  return {click,pad,right,dry,events};
}

test('drum grooves hit sample-clock beats and shuffled offbeats exactly',()=>{
  const straight=render(setup({bass:false}),16000);
  assert.deepEqual(straight.events.filter(e=>e.type==='kick').map(e=>e.sample),[0,8000]);
  assert.deepEqual(straight.events.filter(e=>e.type==='snare').map(e=>e.sample),[4000,12000]);
  assert.deepEqual(straight.events.filter(e=>e.type==='hat').map(e=>e.sample),[0,2000,4000,6000,8000,10000,12000,14000]);
  const shuffle=render(setup({bass:false,drumGroove:'shuffle'}),8000);
  assert.deepEqual(shuffle.events.filter(e=>e.type==='hat').map(e=>e.sample),[0,2667,4000,6667]);
  const swing=render(setup({bass:false,drumGroove:'swing'}),16000);
  assert.deepEqual(swing.events.filter(e=>e.type==='ride').map(e=>e.sample),[0,4000,6667,8000,12000,14667]);
  const half=render(setup({bass:false,drumGroove:'halftime'}),16000);
  assert.deepEqual(half.events.filter(e=>e.type==='snare').map(e=>e.sample),[8000]);
});

test('bass patterns follow actual chord tones and land on the root each bar in every meter',()=>{
  for(const bassPattern of Object.keys(BASS_PATTERNS))for(const beats of [3,4,5,6,7]){
    const engine=setup({drums:false,bassPattern,beats,progression:true,template:'major251'});
    const {events}=render(engine,beats*4000*4);
    assert.ok(events.length>=8);
    for(const event of events){
      const info=harmonyAt(engine.settings,event.step);
      assert.equal(event.type,'bass');
      assert.ok(info.chordPcs.includes(event.midi%12));
      assert.ok(event.midi>=36&&event.midi<=47);
      if(event.beat===0)assert.equal(event.midi%12,info.midi[0]%12);
    }
  }
  for(const drumGroove of Object.keys(DRUM_GROOVES))for(const beats of [3,5,7]){
    const result=render(setup({beats,drumGroove,bass:false}),beats*4000*2);
    assert.ok(result.events.some(e=>e.type==='kick'&&e.sample===beats*4000));
  }
});

test('count-in and chord previews never play drums or bass, and rhythm bypasses the pad bus',()=>{
  const engine=setup({countIn:true,sound:'atmosphere'});
  const result=render(engine,24000);
  assert.ok(result.dry.subarray(0,16000).every(x=>x===0));
  assert.equal(result.events[0].sample,16000);
  assert.ok(result.dry.subarray(16000).some(x=>Math.abs(x)>.01));
  assert.ok(result.pad.every(x=>x===0));assert.ok(result.right.every(x=>x===0));assert.ok(result.click.every(x=>x===0));
  engine.audition(1);const preview=render(engine,8000);
  assert.deepEqual(preview.events,[]);assert.ok(preview.dry.every(x=>x===0));
});

test('drum and bass switches and volumes are independent; enabling waits for the next grid',()=>{
  for(const settings of [{drums:false,bass:false},{drumsVolume:0,bassVolume:0},{drums:false,bassVolume:0},{bass:false,drumsVolume:0}]){
    assert.ok(render(setup(settings),8000).dry.every(x=>x===0));
  }
  for(const settings of [{drums:false},{bass:false}])assert.ok(render(setup(settings),8000).dry.some(x=>Math.abs(x)>.005));
  const engine=setup({drums:false,bass:false,bassPattern:'fifths'});render(engine,1500);
  engine.configure({drums:true,bass:true});const active=render(engine,3000);
  assert.equal(active.events[0].sample,2000);
  assert.equal(active.events.find(e=>e.type==='bass').sample,4000);
  engine.configure({drums:false,bass:false});render(engine,16000);
  assert.ok(render(engine,8000).dry.every(x=>Math.abs(x)<1e-8));
});

test('full backing is block-size independent, bounded, and fades to silence',()=>{
  const settings={sound:'atmosphere',chord:'maj9sharp11',mode:'lydian',click:1,harmony:1,drumsVolume:1,bassVolume:1,
    sequence:true,sequenceDensity:1,sequenceVolume:1,sequenceRate:4,bassPattern:'walk',bpm:137};
  const a=setup(settings),b=setup(settings);const full=render(a,48000);
  const actual=new Float32Array(48000),dry=new Float32Array(48000),pad=new Float32Array(48000),right=new Float32Array(48000);
  for(let offset=0;offset<actual.length;offset+=128){
    b.render(actual.subarray(offset,offset+128),noop,pad.subarray(offset,offset+128),right.subarray(offset,offset+128),undefined,dry.subarray(offset,offset+128));
  }
  assert.deepEqual(actual,full.click);assert.deepEqual(dry,full.dry);assert.deepEqual(pad,full.pad);assert.deepEqual(right,full.right);
  for(let i=0;i<actual.length;i++)assert.ok(Number.isFinite(actual[i]+dry[i]+pad[i])&&Math.abs(actual[i]+dry[i]+pad[i])<1);
  a.running=false;render(a,16000);assert.ok(render(a,8000).dry.every(x=>Math.abs(x)<1e-8));
});
