import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine,gapAt} from '../src/audio/engine.js';
import {tapBpm,subdivisionAt,beatStrength,progressiveGap} from '../src/practice/pulse.js';

function setup(settings={}){
  const engine=new Engine(1200);
  engine.configure({bpm:120,beats:4,countIn:false,harmony:0,...settings});engine.reset();return engine;
}
function render(engine,samples){
  const beats=[],pulse=[],audio=new Float32Array(samples);
  engine.render(audio,event=>beats.push({sample:engine.age,...event}),null,null,undefined,null,undefined,null,event=>pulse.push({sample:engine.age,...event}));
  return {beats,pulse,audio};
}
test('tap tempo tolerates an outlier and never invents a tempo from one tap',()=>{
  assert.equal(tapBpm([0]),null);assert.equal(tapBpm([0,500,1000,1700,2200]),120);
  assert.equal(tapBpm([0,2000,4000]),30);assert.equal(tapBpm([0,250,500]),240);
});
test('swing moves only the eighth offbeat; triplets remain even',()=>{
  assert.equal(subdivisionAt(.6,2,1),0);assert.equal(subdivisionAt(2/3,2,1),1);
  assert.equal(subdivisionAt(.5,2,0),1);assert.equal(subdivisionAt(.34,3,1),1);
  const engine=setup({subdivision:2,clickSwing:1});render(engine,361);
  assert.equal(engine.lastSubdivision,0);render(engine,40);assert.equal(engine.lastSubdivision,1);
  assert.equal(engine.clickAge,1);
});
test('silent beats also mute subdivisions, while count-in keeps audible beats',()=>{
  const engine=setup({beatAccents:'0000',subdivision:4});
  assert.ok(render(engine,2500).audio.every(sample=>sample===0));
  assert.equal(beatStrength(engine.settings,0,true),2);
  assert.equal(beatStrength(engine.settings,1,true),1);
});
test('click timbres produce distinct finite audio',()=>{
  const sounds=['beep','wood','rim','soft'].map(clickSound=>render(setup({clickSound}),200).audio);
  sounds.forEach(audio=>assert.ok(audio.every(Number.isFinite)&&audio.some(sample=>Math.abs(sample)>.001)));
  for(let i=1;i<sounds.length;i++)assert.notDeepEqual(sounds[0],sounds[i]);
});
test('3 against 2 shares exact alignment with main beats and follows tempo',()=>{
  const result=render(setup({polyBeats:3,polyBase:2}),2401);
  assert.deepEqual(result.pulse.filter(event=>event.type==='polyrhythm').map(event=>event.sample),[0,400,800,1200,1600,2000,2400]);
  assert.deepEqual(result.beats.map(event=>event.sample),[0,600,1200,1800,2400]);
});
test('timer excludes count-in and can finish the current bar',()=>{
  const exact=setup({sessionSeconds:1.1,sessionFinishBar:false,countIn:true});
  const finished=render(exact,5000).pulse.find(event=>event.type==='session-complete');
  assert.equal(finished.sample,2400+1320);assert.equal(exact.running,false);
  const bar=setup({sessionSeconds:1.1,sessionFinishBar:true});
  const result=render(bar,5000);
  assert.equal(result.pulse.find(event=>event.type==='session-complete').sample,2400);
  assert.deepEqual(result.beats.map(event=>event.sample),[0,600,1200,1800]);
});
test('timed bar completion remains aligned when the tempo trainer accelerates',()=>{
  const engine=setup({bpm:120,trainerEnabled:true,trainerBars:1,trainerIncrement:30,trainerTarget:150,sessionSeconds:2.5});
  const result=render(engine,6000);
  assert.equal(result.pulse.find(event=>event.type==='session-complete').sample,4320);
  engine.reset();assert.equal(engine.sessionFrames,0);assert.equal(engine.sessionFinished,false);
});
test('progressive silence grows after complete cycles and caps at its maximum',()=>{
  const settings={gapEnabled:true,gapPlayBars:2,gapMuteBars:1,gapProgressive:true,gapMaxBars:3};
  assert.deepEqual(Array.from({length:17},(_,bar)=>gapAt(settings,bar)),[false,false,true,false,false,true,true,false,false,true,true,true,false,false,true,true,true]);
  assert.equal(progressiveGap(settings,1000000).silent,3);
  assert.equal(gapAt({...settings,gapEnabled:false},2),false);
});

test('enabling swing subdivisions or a polyrhythm mid-beat waits for the next grid onset',()=>{
  const engine=setup({clickSwing:1});render(engine,361);
  engine.configure({subdivision:2,polyBeats:3,polyBase:2});
  const events=render(engine,39).pulse.filter(event=>event.type==='polyrhythm');
  assert.deepEqual(events,[]);
  const next=render(engine,1).pulse.find(event=>event.type==='polyrhythm');
  assert.equal(next.sample,400);assert.equal(engine.clickAge,1);
});
test('new pulse modes remain sample-identical across callback sizes',()=>{
  const settings={subdivision:2,clickSwing:1,polyBeats:5,polyBase:4,clickSound:'wood',beatAccents:'2011',gapEnabled:true,gapProgressive:true,gapPlayBars:1,gapMuteBars:1,gapMaxBars:3,trainerEnabled:true,trainerBars:1,trainerIncrement:7,trainerTarget:151,sessionSeconds:9};
  const whole=render(setup(settings),15000),engine=setup(settings),actual=new Float32Array(15000),events=[];
  for(let start=0;start<actual.length;start+=127){const result=render(engine,Math.min(127,actual.length-start));actual.set(result.audio,start);events.push(...result.pulse);}
  assert.deepEqual(actual,whole.audio);assert.deepEqual(events,whole.pulse);
});
