import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retimeExercise} from '../src/practice/exercise-timing.js';
import {Engine} from '../src/audio/engine.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('tempo edits preserve fractional beats through count-in, loop rests and repeated changes',()=>{
 for(const countIn of [0,4])for(const phrase of [7,16])for(const cycle of [phrase,Math.ceil(phrase/4)*4])for(const beat of [.3,2.75,6.9,11.25,23.4]){
  let origin=5,tempo=120;const now=origin+beat*60/tempo;
  for(const next of [60,90,137,240,30]){
   const t=retimeExercise(now,origin,tempo,next,countIn,phrase,cycle);
   close((now-t.timelineStart)*next/60,beat);
   close(t.cycleStart,t.timelineStart+(countIn+Math.floor(Math.max(0,beat-countIn)/cycle)*cycle)*60/next);
   close(t.remainingBeats,Math.max(0,phrase-Math.max(0,beat-countIn)));
   origin=t.timelineStart;tempo=next;
  }
 }
 const pending=retimeExercise(4.9,5,120,60,4,16,16);assert.equal(pending.timelineStart,5);assert.equal(pending.cycleStart,9);
});
test('backing tempo edits preserve engine beat/phase and finish after the remaining musical duration',()=>{
 const e=new Engine(12000);e.configure({bpm:120,countIn:false,sessionSeconds:8,sessionFinishBar:false,harmony:0,click:0});e.reset();e.render(new Float32Array(15000));
 const beat=e.beat,phase=e.phase,frames=e.sessionFrames;
 e.updateExerciseTempo(60,13.5);assert.equal(e.currentBpm,60);assert.equal(e.beat,beat);assert.equal(e.phase,phase);assert.equal(e.sessionFrames,frames);assert.equal(e.running,true);
 close(e.settings.sessionSeconds,frames/e.rate+13.5);
 const messages=[];e.render(new Float32Array(13.5*e.rate+1),undefined,undefined,undefined,undefined,undefined,undefined,undefined,event=>messages.push(event));
 assert.equal(messages.filter(m=>m.type==='session-complete').length,1);assert.equal(e.running,false);
});
test('count-in and indefinite looping retain their original transport state when tempo changes',()=>{
 for(const countIn of [true,false]){
  const e=new Engine(12000);e.configure({bpm:120,countIn,sessionSeconds:0});e.reset();e.render(new Float32Array(1500));const state=[e.beat,e.phase,e.remainingCount,e.sessionFrames];
  e.updateExerciseTempo(90,16);assert.deepEqual([e.beat,e.phase,e.remainingCount,e.sessionFrames],state);assert.equal(e.settings.sessionSeconds,0);assert.equal(e.currentBpm,90);
 }
});
