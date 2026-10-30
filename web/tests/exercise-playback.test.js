import {test} from 'node:test';import assert from 'node:assert/strict';
import {ExerciseBufferCache,ExerciseAudioQueue,exerciseNoteDuration} from '../src/audio/exercise-playback.js';
const fakeContext=()=>({sampleRate:48000,currentTime:0,createBuffer(channels,length,rate){return {length,rate,copyToChannel(samples){this.samples=samples;}};}});
test('sample cache renders once per distinct pitch/duration/context and respects its byte bound',()=>{
 let calls=0;const cache=new ExerciseBufferCache({limitBytes:48000,render:(rate,midi,seconds)=>{calls++;return new Float32Array(Math.round(rate*seconds));}}),ctx=fakeContext();
 const first=cache.get(ctx,60,.1);for(let i=0;i<100;i++)assert.equal(cache.get(ctx,60,.1),first);assert.equal(calls,1);
 cache.get(ctx,62,.1);cache.get(ctx,64,.1);assert.equal(calls,3);cache.get(ctx,60,.1);assert.equal(calls,4);cache.get(fakeContext(),60,.1);assert.equal(calls,5);
});
test('preparation deduplicates a whole repeated exercise, yields, and can be cancelled',async()=>{
 let calls=0,pauses=0,cancel=false;const cache=new ExerciseBufferCache({render:(rate,midi,seconds)=>{calls++;return new Float32Array(16);},pause:async()=>{pauses++;}}),ctx=fakeContext(),requests=Array.from({length:256},(_,i)=>({midi:48+i%17,duration:.16}));
 const buffers=await cache.prepare(ctx,requests);assert.equal(calls,17);assert.equal(buffers.size,17);assert.equal(pauses,4);await cache.prepare(ctx,requests);assert.equal(calls,17);
 const cancelled=new ExerciseBufferCache({pause:async()=>{cancel=true;},render:()=>new Float32Array(16)});assert.equal(await cancelled.prepare(ctx,requests,()=>cancel),null);
});
test('audio queue schedules only the lookahead window, preserves loop timing and cancels queued notes',()=>{
 const ctx=fakeContext(),scheduled=[],events=Array.from({length:256},(_,i)=>({at:.12+i*.0625,length:.0625,id:i}));let interval=null,cleared=false;
 const queue=new ExerciseAudioQueue(ctx,event=>scheduled.push(event),{startInterval:callback=>{interval=callback;return 1;},stopInterval:()=>{cleared=true;}});
 queue.enqueue(events);assert.ok(scheduled.length<=16);assert.equal(scheduled[0].at,.12);
 for(let i=1;i<=300;i++){ctx.currentTime=i*.05;interval();}
 queue.enqueue(events.map(e=>({...e,at:e.at+16})));for(let i=301;i<=640;i++){ctx.currentTime=i*.05;interval();}
 assert.equal(scheduled.length,512);assert.equal(new Set(scheduled.map(e=>e.at)).size,512);assert.ok(scheduled.every((event,i)=>i===0||event.at>scheduled[i-1].at));
 queue.enqueue([{at:100,length:1}]);queue.stop();ctx.currentTime=100;queue.pump();assert.equal(scheduled.length,512);assert.ok(cleared);
});
test('a delayed queue drops fully expired events instead of playing a burst of missed notes',()=>{
 const ctx=fakeContext(),scheduled=[];const queue=new ExerciseAudioQueue(ctx,event=>scheduled.push(event),{horizon:.1,startInterval:()=>1,stopInterval:()=>{}});queue.enqueue([{at:1,length:.1},{at:2,length:.5},{at:3,length:.5}]);ctx.currentTime=2.2;queue.pump();assert.deepEqual(scheduled.map(e=>e.at),[2]);queue.stop();
 assert.equal(exerciseNoteDuration(.125),.12);assert.equal(exerciseNoteDuration(30),12);
});
