import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';

test('metronome meter measures the rendered dry click bus and mute reaches silence',()=>{
 const engine=new Engine(8000);engine.configure({countIn:false,click:1,harmony:0,drums:false,bass:false,comping:false,sequence:false});engine.reset();
 const click=new Float32Array(16000),left=new Float32Array(16000),right=new Float32Array(16000),rhythm=new Float32Array(16000);
 engine.render(click,undefined,left,right,undefined,rhythm);
 const peak=click.reduce((max,x)=>Math.max(max,Math.abs(x)),0);
 assert.ok(peak>.01);assert.ok(Math.abs(engine.meterPeaks[0]-peak)<1e-6);assert.equal(engine.meterPeaks[0],engine.meterPeaks[1]);
 assert.ok(Array.from(engine.meterPeaks.subarray(2)).every(value=>value===0));
 engine.configure({mutedChannels:'click'});engine.render(new Float32Array(16000));engine.meterPeaks.fill(0);engine.render(new Float32Array(8000));
 assert.ok(engine.meterPeaks[0]<1e-7);
});

test('reading and resetting channel peaks never changes rendered audio',()=>{
 const a=new Engine(8000),b=new Engine(8000);a.configure({countIn:false});b.configure({countIn:false});a.reset();b.reset();
 const expected=new Float32Array(24000),actual=new Float32Array(24000);a.render(expected);
 for(let offset=0;offset<actual.length;offset+=128){b.render(actual.subarray(offset,offset+128));assert.ok(Array.from(b.meterPeaks).every(Number.isFinite));b.meterPeaks.fill(0);}
 assert.deepEqual(actual,expected);
});
