import {test} from 'node:test';import assert from 'node:assert/strict';
import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {DEFAULTS,Engine} from '../src/audio/engine.js';
import {progressionTimeline,progressionOrder,progressionPositionAtBeat,progressionStepAtBeat,progressionPlaybackBeatDurations,harmonyAt} from '../src/audio/music.js';
import {alignedProgressionGroups} from '../src/guitar/exercises.js';import {fretboardFor} from '../src/guitar/fretboard.js';import {progressionStudyPlan,planPosition} from '../src/practice/progression-timing.js';
import {exportPresets,importPresets} from '../src/practice/presets.js';
const setup={...DEFAULTS,progression:true,template:'major251essential',loopEnabled:true,loopUnit:'beats',loopBeatStart:2,loopBeatEnd:4};
test('inclusive beat loops clip chord edges, repeat exact chart beats and normalize reversed or invalid bounds',()=>{
 assert.deepEqual(progressionTimeline(setup),[{step:0,start:2,duration:2},{step:1,start:4,duration:1}]);assert.deepEqual(progressionPlaybackBeatDurations(setup),[2,1,0]);assert.deepEqual(Array.from({length:9},(_,i)=>progressionPositionAtBeat(setup,i).chartBeat),[2,3,4,2,3,4,2,3,4]);
 assert.deepEqual(progressionTimeline({...setup,loopBeatStart:4,loopBeatEnd:2}),progressionTimeline(setup));assert.equal(progressionTimeline({...setup,loopBeatStart:5,loopBeatEnd:5})[0].duration,1);
 assert.equal(progressionTimeline({...setup,loopBeatStart:-10,loopBeatEnd:999}).reduce((a,b)=>a+b.duration,0),16);
 const legacy={...setup,loopUnit:undefined,loopStart:2,loopEnd:0};assert.deepEqual(progressionOrder(legacy),[2,0]);assert.deepEqual(progressionPlaybackBeatDurations(legacy),[4,0,8]);
});
test('real engine uses exact beat ranges after count-in in built-in and custom progressions',()=>{
 for(const beats of [3,4,5])for(const custom of [false,true]){
 const s={...setup,bpm:240,beats,countIn:true,...(custom?{template:'custom',customProgression:normalizeCustomProgression({steps:[{root:2,chord:'min7',mode:'dorian',beats:2},{root:7,chord:'dom7',mode:'mixolydian',beats:2},{root:0,chord:'maj7',mode:'major',beats:4}],roman:['ii','V','I']})}:{})};
 const engine=new Engine(8000);engine.configure(s);engine.reset();const events=[];engine.render(new Float32Array(8000*4),e=>events.push(e));assert.equal(events.filter(e=>e.counting).length,beats);events.filter(e=>!e.counting&&typeof e.beat==='number').forEach((e,i)=>assert.equal(e.step,progressionStepAtBeat(s,i)));
 if(!custom&&beats===4)assert.deepEqual(events.filter(e=>!e.counting&&typeof e.beat==='number').slice(0,6).map(e=>e.step),[0,0,1,0,0,1]);
 }
});
test('timed exercises share clipped durations with backing; presets retain beat loop options and legacy fields',()=>{
 const order=progressionOrder(setup),harmonies=order.map(i=>harmonyAt(setup,i)),groups=alignedProgressionGroups(fretboardFor(harmonies[0],'E'),harmonies,'guidetones','seventh','ascending');
 const plan=progressionStudyPlan(groups,order,progressionPlaybackBeatDurations(setup).map(d=>d/4),4,'guidetones');assert.equal(plan.harmonicDuration,3);for(let i=0;i<plan.duration;i++)assert.equal(planPosition(plan,i).slot.step,progressionStepAtBeat(setup,i));assert.deepEqual(plan.events.slice(0,2).map(e=>e.duration),[2,1]);
 const p={id:'beats',name:'Beat loop',progression:true,controls:{'loop-enabled':true,'loop-unit':'beats','loop-beat-start':'3','loop-beat-end':'5','loop-start':'0','loop-end':'1'}};assert.deepEqual(importPresets(exportPresets([p])).items[0].controls,p.controls);
});
