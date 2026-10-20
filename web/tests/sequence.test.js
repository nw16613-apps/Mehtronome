import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';
import {harmonyAt} from '../src/audio/music.js';

function setup(settings={}){
  const engine=new Engine(8000);
  engine.configure({countIn:false,click:0,harmony:0,sequence:true,sequenceDensity:1,sequenceVolume:1,sequencePattern:'up',bpm:120,...settings});
  engine.reset();return engine;
}

test('sequence subdivisions and swing use exact sample-clock boundaries',()=>{
  for(const [rate,swing,expected] of [
    [2,0,[0,2000,4000,6000]],
    [2,.5,[0,2500,4000,6500]],
    [4,.5,[0,1250,2000,3250]],
    [3,.5,[0,1334,2667,4000]],
  ]){
    const engine=setup({sequenceRate:rate,sequenceSwing:swing});const notes=[];
    engine.render(new Float32Array(8000),()=>{},null,null,note=>notes.push(note));
    assert.deepEqual(notes.slice(0,4).map(n=>n.sample),expected);
  }
});

test('all sequence patterns follow the current chord, respect count-in and are silent during chord previews',()=>{
  for(const pattern of ['pulse','up','down','updown','sparse']){
    const engine=setup({countIn:true,progression:true,template:'major251',sequencePattern:pattern});
    const notes=[];const output=new Float32Array(8000*12);
    engine.render(output,()=>{},null,null,note=>notes.push(note));
    assert.ok(output.subarray(0,16000).every(x=>x===0));
    assert.ok(notes.length>4);
    assert.equal(notes[0].sample,16000);
    for(const note of notes)assert.ok(harmonyAt(engine.settings,note.step).midi.includes(note.midi-12));
    assert.ok(notes.some(n=>n.step===1));
    engine.audition(1);const previews=[];
    engine.render(new Float32Array(8000),()=>{},null,null,note=>previews.push(note));
    assert.equal(previews.length,0);
  }
});

test('sequence audio has its own volume, density and enable switch',()=>{
  for(const settings of [{sequence:false},{sequenceVolume:0},{sequenceDensity:0}]){
    const engine=setup(settings);const output=new Float32Array(8000);
    engine.render(output);assert.ok(output.every(x=>x===0));
  }
  const engine=setup();const output=new Float32Array(8000);
  engine.render(output);assert.ok(output.some(x=>Math.abs(x)>.01));
  engine.configure({sequence:false});engine.render(new Float32Array(16000));
  engine.render(output);assert.ok(output.every(x=>Math.abs(x)<1e-8));
});

test('evolving stereo pad and sequence are block-size independent, bounded and fade fully on stop',()=>{
  const settings={sound:'bloom',harmony:1,chord:'maj9sharp11',mode:'lydian',sequencePattern:'updown',sequenceRate:3,bpm:137};
  const a=setup(settings),b=setup(settings);
  const left=new Float32Array(40000),right=new Float32Array(40000);
  const actual=new Float32Array(40000),actualRight=new Float32Array(40000);
  a.render(new Float32Array(40000),()=>{},left,right);
  for(let offset=0;offset<actual.length;offset+=128)b.render(new Float32Array(Math.min(128,actual.length-offset)),()=>{},actual.subarray(offset,offset+128),actualRight.subarray(offset,offset+128));
  assert.deepEqual(actual,left);assert.deepEqual(actualRight,right);
  assert.notDeepEqual(left,right);
  for(const samples of [left,right])assert.ok(samples.every(x=>Number.isFinite(x)&&Math.abs(x)<1));
  a.running=false;a.render(new Float32Array(16000));
  a.render(new Float32Array(40000),()=>{},left,right);
  assert.ok(left.every(x=>Math.abs(x)<1e-8));assert.ok(right.every(x=>Math.abs(x)<1e-8));
});

test('enabling a sequence mid-beat waits for the next subdivision',()=>{
  const engine=setup({sequence:false});const notes=[];
  engine.render(new Float32Array(1500));
  engine.configure({sequence:true});
  engine.render(new Float32Array(3000),()=>{},null,null,note=>notes.push(note));
  assert.deepEqual(notes.map(n=>n.sample),[2000,4000]);
});
