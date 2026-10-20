import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';
import {MODES,PROGRESSIONS,progressionOrder,progressionDurations,progressionStep,harmonyAt,characteristicNotes} from '../src/audio/music.js';
import {fretboardFor,diagramSvg} from '../src/guitar/fretboard.js';
import {PRESET_KEY,readPresets,writePresets} from '../src/practice/presets.js';
function setup(settings={}) {
  const engine=new Engine(8000);engine.configure({countIn:false,bpm:120,drums:true,bass:true,sequence:true,sequencePattern:'pulse',sequenceDensity:1,...settings});engine.reset();return engine;
}
function render(engine,length) {
  const click=new Float32Array(length),left=new Float32Array(length),right=new Float32Array(length),rhythm=new Float32Array(length),gate=new Float32Array(length),beats=[];
  engine.render(click,e=>beats.push(e),left,right,undefined,rhythm,undefined,gate);
  return {click,left,right,rhythm,gate,beats};
}

test('selected chord loops preserve durations, support wraparound and every template',()=>{
  for(const template of Object.keys(PROGRESSIONS)){
    const durations=progressionDurations({template}),count=durations.length;
    for(const [loopStart,loopEnd] of [[1,count-1],[count-1,0],[1,1]]){
      const settings={template,loopEnabled:true,loopStart,loopEnd};
      const order=progressionOrder(settings);
      assert.equal(order[0],loopStart);assert.equal(order.at(-1),loopEnd);
      const expected=order.flatMap(i=>Array(durations[i]).fill(i));
      for(let bar=0;bar<expected.length*3;bar++)assert.equal(progressionStep(settings,bar),expected[bar%expected.length]);
    }
  }
  const engine=setup({progression:true,template:'major251',loopEnabled:true,loopStart:1,loopEnd:2,countIn:true});
  const {beats}=render(engine,16000*7);
  assert.deepEqual(beats.filter(e=>!e.counting&&e.beat===0).map(e=>e.step),[1,2,2,1,2,2]);
});

test('gap training silences the chosen buses, including the reverb control, with exact bar cycles',()=>{
  for(const gapTarget of ['all','click','backing']){
    const active=setup({gapEnabled:true,gapPlayBars:1,gapMuteBars:1,gapTarget,sound:'atmosphere'});
    const reference=setup({sound:'atmosphere'});
    const a=render(active,48000),b=render(reference,48000);
    assert.deepEqual(a.beats.filter(e=>e.beat===0).map(e=>e.gap),[false,true,false]);
    const from=16040,to=32000; // five-millisecond anti-click ramp, then exact zeros
    if(gapTarget!=='backing')assert.ok(a.click.subarray(from,to).every(x=>x===0));
    else assert.deepEqual(a.click,b.click);
    if(gapTarget!=='click'){
      for(const bus of ['left','right','rhythm','gate'])assert.ok(a[bus].subarray(from,to).every(x=>x===0),bus);
    } else {
      for(const bus of ['left','right','rhythm','gate'])assert.deepEqual(a[bus],b[bus],bus);
    }
    // Silent bars never pause the sequencer, chord or oscillator state.
    for(const bus of ['click','left','right','rhythm'])assert.deepEqual(a[bus].subarray(32040),b[bus].subarray(32040),bus);
  }
});

test('gaps exclude count-in and auditions and follow the selected loop without stopping harmonic time',()=>{
  const engine=setup({countIn:true,progression:true,template:'major251',loopEnabled:true,loopStart:1,loopEnd:2,gapEnabled:true,gapPlayBars:1,gapMuteBars:2});
  const a=render(engine,80000);
  assert.ok(a.click.subarray(0,16000).some(x=>x!==0));
  assert.ok(a.beats.filter(e=>e.counting).every(e=>!e.gap));
  assert.deepEqual(a.beats.filter(e=>!e.counting&&e.beat===0).map(e=>[e.step,e.gap]),[[1,false],[2,true],[2,true],[1,false]]);
  engine.audition(0);const preview=render(engine,24000);
  assert.ok(preview.gate.every(x=>x===1));assert.ok(preview.left.some(x=>Math.abs(x)>.01));
  assert.ok(preview.click.every(x=>x===0));assert.ok(preview.rhythm.every(x=>x===0));
});

test('gapped loop output is block independent at odd meters and changing tempo',()=>{
  const settings={gapEnabled:true,gapPlayBars:1,gapMuteBars:1,progression:true,template:'parallel2',loopEnabled:true,loopStart:3,loopEnd:1,bpm:137,beats:3};
  const whole=setup(settings),blocks=setup(settings);
  for(const length of [40001,28000]){
    const a=render(whole,length),b=Object.fromEntries(['click','left','right','rhythm','gate'].map(key=>[key,new Float32Array(length)]));
    const beats=[];
    for(let offset=0;offset<length;offset+=127){
      const part=render(blocks,Math.min(127,length-offset));
      for(const key of Object.keys(b))b[key].set(part[key],offset);
      beats.push(...part.beats);
    }
    for(const key of Object.keys(b))assert.deepEqual(a[key],b[key]);assert.deepEqual(a.beats,beats);
    whole.configure({bpm:91});blocks.configure({bpm:91});
  }
});

test('modal colour notes cover all families and transpose correctly while preserving note roles',()=>{
  for(const [mode,definition] of Object.entries(MODES))for(let key=0;key<12;key++){
    const info=harmonyAt({mode,key,chord:definition.chord});
    const colours=characteristicNotes(info);assert.ok(colours.length>0);
    for(const colour of colours){
      const i=definition.degrees.indexOf(colour.degree);
      assert.ok(i>=0,`${mode}: ${colour.degree}`);assert.equal(colour.pc,(key+definition.intervals[i])%12);assert.equal(colour.name,info.scaleNames[i]);
    }
    const board=fretboardFor(info,'E');
    for(const note of board.notes)assert.equal(note.characteristic,colours.some(c=>c.pc===note.pc));
    const svg=diagramSvg(board,false,definition.degrees,'Mode',true);
    assert.ok(svg.includes('characteristic-ring'));assert.ok(svg.includes('characteristic mode note'));
    assert.ok(!diagramSvg(board,false,definition.degrees,'Mode',false).includes('characteristic-ring'));
  }
  assert.deepEqual(characteristicNotes(harmonyAt({mode:'dorian',key:0})).map(n=>[n.name,n.degree]),[['A','6']]);
  assert.deepEqual(characteristicNotes(harmonyAt({mode:'lydian',key:0})).map(n=>[n.name,n.degree]),[['F♯','♯4']]);
  for(const step of [0,1,2])assert.ok(characteristicNotes(harmonyAt({progression:true,template:'major251',key:0},step)).length>0);
});

test('saved presets round trip through storage and reject unsupported data safely',()=>{
  let raw;const storage={setItem:(key,value)=>{assert.equal(key,PRESET_KEY);raw=value;}};
  const items=[{id:'one',name:'D Dorian',progression:true,controls:{key:'2',quality:'dorian','gap-enabled':true,'loop-start':'1','fret-labels':'degrees'}}];
  writePresets(storage,items);assert.deepEqual(readPresets(raw),items);
  assert.deepEqual(readPresets(null),[]);assert.throws(()=>readPresets('{'));
  assert.throws(()=>readPresets('{"version":2,"items":[]}'));
  assert.throws(()=>writePresets({setItem:()=>{throw new Error('Full');}},items),/Full/);
  assert.throws(()=>writePresets(storage,Array(51).fill(items[0])),/50 presets/);
  const dirty=readPresets(JSON.stringify({version:1,items:[null,{...items[0],controls:{...items[0].controls,unknown:'ignore',click:{invalid:true}}}]}));
  assert.deepEqual(dirty,items);
});
