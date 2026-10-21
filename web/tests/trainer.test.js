import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';

function setup(settings={}) {
  const engine=new Engine(1200);
  engine.configure({bpm:120,beats:3,countIn:true,click:0,harmony:0,
    trainerEnabled:true,trainerBars:2,trainerIncrement:30,trainerTarget:180,...settings});
  engine.reset();
  return engine;
}

function barEvents(engine,length) {
  const events=[];
  engine.render(new Float32Array(length),event=>{
    if(event.beat===0)events.push({sample:engine.age,...event});
  });
  return events;
}

test('tempo training starts after complete musical bars and caps at the target on the sample clock',()=>{
  const engine=setup();
  const events=barEvents(engine,9600);
  assert.deepEqual(events.map(e=>[e.sample,e.counting,e.bar,e.bpm,e.trainerTargetReached]),[
    [0,true,1,120,false],
    [1800,false,1,120,false],
    [3600,false,2,120,false],
    [5400,false,3,150,false],
    [6840,false,4,150,false],
    [8280,false,5,180,true],
    [9480,false,6,180,true],
  ]);
  assert.equal(engine.settings.bpm,120,'training never overwrites the starting tempo');
  engine.reset();
  assert.equal(engine.currentBpm,120);
  assert.equal(barEvents(engine,1)[0].counting,true);
});

test('trainer target never slows the starting tempo and increments stop exactly at a non-multiple target',()=>{
  for(const target of [60,120]){
    const engine=setup({countIn:false,trainerBars:1,trainerTarget:target});
    const events=barEvents(engine,10000);
    assert.ok(events.every(e=>e.bpm===120&&e.trainerTargetReached));
  }
  const engine=setup({countIn:false,trainerBars:1,trainerIncrement:17,trainerTarget:150});
  const events=barEvents(engine,7000);
  assert.deepEqual(events.slice(0,3).map(e=>e.bpm),[120,137,150]);
  assert.ok(events.slice(2).every(e=>e.bpm===150&&e.trainerTargetReached));
});

test('live tempo and trainer edits preserve beat phase and restart after complete bars',()=>{
  const engine=setup({countIn:false,trainerBars:1});
  engine.render(new Float32Array(2000));
  assert.equal(engine.currentBpm,150);
  engine.configure({harmony:.5});
  assert.equal(engine.currentBpm,150,'unrelated settings do not reset trained tempo');
  const phase=engine.phase;
  engine.configure({bpm:100});
  assert.equal(engine.currentBpm,100);
  assert.equal(engine.phase,phase);
  const events=barEvents(engine,6000);
  assert.deepEqual(events.slice(0,2).map(e=>[e.bar,e.bpm]),[[3,100],[4,130]],'a partial bar is not counted as a completed training bar');
  engine.configure({trainerEnabled:false});
  assert.equal(engine.currentBpm,100);
  assert.ok(barEvents(engine,8000).every(e=>e.bpm===100&&!e.trainerTargetReached));
});

test('training clocks, sequence notes and rhythm envelopes remain synchronized across render blocks and gaps',()=>{
  const settings={bpm:137,beats:5,countIn:true,trainerBars:1,trainerIncrement:7,trainerTarget:166,
    progression:true,template:'major251',sequence:true,sequencePattern:'up',sequenceDensity:1,
    drums:true,bass:true,bassPattern:'roots',gapEnabled:true,gapPlayBars:1,gapMuteBars:1};
  const a=setup(settings),b=setup(settings);
  const expected=new Float32Array(30000),actual=new Float32Array(30000);
  const beatsA=[],beatsB=[],notesA=[],notesB=[],rhythmA=[],rhythmB=[];
  const record=(engine,events)=>event=>{
    const item={...event};
    if(event.type==='bass'&&event.beat===0&&event.sub===0){
      item.gate=engine.rhythm.bassVoices[(engine.rhythm.bassCursor-1)%engine.rhythm.bassVoices.length].gate;
      assert.equal(item.gate,Math.round(1.5*60/engine.currentBpm*engine.rate));
    }
    events.push(item);
  };
  a.render(expected,e=>beatsA.push({sample:a.age,...e}),null,null,e=>notesA.push(e),null,record(a,rhythmA));
  for(let i=0;i<actual.length;i+=128)b.render(actual.subarray(i,i+128),e=>beatsB.push({sample:b.age,...e}),null,null,e=>notesB.push(e),null,record(b,rhythmB));
  assert.deepEqual(actual,expected);assert.deepEqual(beatsB,beatsA);assert.deepEqual(notesB,notesA);assert.deepEqual(rhythmB,rhythmA);
  const starts=beatsA.filter(e=>!e.counting&&e.beat===0);
  assert.deepEqual(starts.slice(0,6).map(e=>e.bpm),[137,144,151,158,165,166]);
  assert.ok(starts.some(e=>e.gap&&e.bpm>137));
  for(const start of starts)assert.ok(notesA.some(n=>n.sample===start.sample),'the arpeggio remains on the accelerated barline');
});

test('pad and guitar previews never advance tempo training',()=>{
  for(const acoustic of [false,true]){
    const engine=setup({countIn:false,trainerBars:1});
    engine.audition(0,acoustic?[48,55,59,64]:null,acoustic);
    const events=[];
    engine.render(new Float32Array(12000),e=>events.push(e));
    assert.equal(engine.currentBpm,120);assert.deepEqual(events,[]);
  }
});
