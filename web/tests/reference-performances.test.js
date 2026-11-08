import {test} from 'node:test';import assert from 'node:assert/strict';
import {referenceChart,referencePlan,referenceScore,referenceStatus,REFERENCE_PERFORMANCES} from '../src/audio/reference-performances.js';
import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {Engine} from '../src/audio/engine.js';
import {harmonyAt,MODES,CHORDS} from '../src/audio/music.js';
import {BACKING_STYLES,backingStyleInstruments,resolveDrumKit} from '../src/practice/backing-styles.js';
import {readSampleBank} from '../scripts/read-sample-bank.mjs';
function config(id,extra={}){const chart=referenceChart(id),s={...BACKING_STYLES[id].settings,...backingStyleInstruments(id),backingStyle:id,...chart,customProgression:normalizeCustomProgression(chart.progression),template:'custom',progression:true,bpm:120,countIn:false,loopEnabled:false,extensionMorph:false,drums:true,bass:true,comping:true,sequence:true,click:0,harmony:0,backingHumanize:0,soundLibrary:'expanded',sequenceActivity:'featured',...extra};s.drumKit=resolveDrumKit(s);return s;}
test('both complete scores survive normalization, use valid harmony, and have independent developed parts',()=>{
 for(const [id,def]of Object.entries(REFERENCE_PERFORMANCES).filter(([id])=>['blues','legatoFusion'].includes(id))){
  const s=config(id),plan=referencePlan(s);assert.equal(plan.score.bars,def.bars);assert.equal(plan.transpose,0);assert.equal(s.customProgression.referencePerformance,id);
  assert.equal(s.customProgression.steps.reduce((n,v)=>n+v.beats,0),def.bars*4);
  def.harmony.forEach(([pc,chord,mode],i)=>{assert.ok(MODES[mode]);assert.ok(CHORDS[chord]);assert.equal(harmonyAt(s,i).chordPcs[0],pc);});
  for(const track of ['sequence','bass','comping','drums']){const slots=plan.score[track],rate=track==='sequence'?def.rate:4;assert.equal(slots.length,def.bars*4*rate);const signatures=new Set();for(let b=0;b<def.bars;b++)signatures.add(JSON.stringify(slots.slice(b*4*rate,(b+1)*4*rate).map(events=>events.map(({bar,...rest})=>rest))));assert.ok(signatures.size>=8,id+' '+track+' development');for(const event of slots.flat()){assert.ok(event.at>=0&&event.at<4);assert.ok(event.velocity>0&&event.velocity<1);if(track!=='drums')assert.ok(event.duration>0);}}
 }
 assert.equal(harmonyAt(config('blues'),5).name,'B');
 const score=referenceScore('legatoFusion');assert.ok(score.sequence.flat().some(n=>n.at+n.duration>4));assert.ok(score.comping.flat().some(n=>n.at+n.duration>4));
});
test('written pitch playback is restricted to its chart, with transposition and tempo supported',()=>{
 const s=config('blues');assert.equal(referencePlan({...s,key:7,bpm:85}).transpose,2);
 for(const change of [{backingStyle:'funk'},{beats:3},{loopEnabled:true},{extensionMorph:true},{progression:false},{template:'single'}])assert.equal(referencePlan({...s,...change}),null);
 for(const field of ['root','chord','mode','beats','bass']){const edited=structuredClone(s);edited.customProgression.steps[0][field]=({root:6,chord:'maj7',mode:'major',beats:2,bass:1})[field];assert.equal(referenceStatus(edited).active,false,field);}
 const renamed=structuredClone(s);renamed.customProgression.name='Renamed';renamed.customProgression.steps[0].section='My section';assert.equal(referenceStatus(renamed).active,true);
 assert.equal(referencePlan({...s,customProgression:{...s.customProgression,referencePerformance:'unknown'}}),null);
});
const bank=await readSampleBank(8000);
function render(id,bars,block=1024,extra={}){const s=config(id,extra),engine=new Engine(8000);engine.installDrumKit(bank);engine.configure(s);engine.reset();const n=bars*16000-1,out=new Float32Array(n),notes=[],events=[];for(let i=0;i<n;i+=block){const size=Math.min(block,n-i);engine.render(new Float32Array(size),undefined,null,null,e=>notes.push(e),out.subarray(i,i+size),e=>events.push(e));}return {engine,out,notes,events};}
test('the engine plays every exact written note and voicing across the whole form, including approaches and ties',()=>{
 for(const [id,def]of Object.entries(REFERENCE_PERFORMANCES).filter(([id])=>['blues','legatoFusion'].includes(id))){
  const result=render(id,def.bars),score=referenceScore(id);
  assert.deepEqual(result.notes.map(e=>[e.midi,e.durationBeats]),score.sequence.flat().map(e=>[e.midi,e.duration]));
  assert.deepEqual(result.events.filter(e=>e.type==='bass').map(e=>[e.midi,e.durationBeats]),score.bass.flat().map(e=>[e.midi,e.duration]));
  assert.deepEqual(result.events.filter(e=>e.type==='comping').map(e=>[e.notes,e.duration]),score.comping.flat().map(e=>[e.notes,e.duration]));
  assert.ok(result.out.some(n=>Math.abs(n)>.001));assert.ok(result.out.every(n=>Number.isFinite(n)&&Math.abs(n)<1));
  const pitched=result.events.filter(e=>e.type==='comping'||e.type==='bass');assert.ok(pitched.every(e=>e.reference===id));assert.equal(result.notes[0].sample,id==='blues'?2667:2000);
 }
});
test('reference playback is block-independent, transposes exact parts, and respects inaudible tracks',()=>{
 for(const id of ['blues','legatoFusion']){
  const a=render(id,4,257),b=render(id,4,1024);assert.deepEqual(a.out,b.out);assert.deepEqual(a.notes,b.notes);assert.deepEqual(a.events,b.events);
  const shifted=render(id,4,1024,{key:REFERENCE_PERFORMANCES[id].key+2});assert.deepEqual(shifted.notes.map(n=>n.midi),a.notes.map(n=>n.midi+2));
  const silent=render(id,1,1024,{mutedChannels:'drums,bass,comping,sequence'});assert.equal(silent.notes.length,0);assert.equal(silent.events.length,0);
 }
});
