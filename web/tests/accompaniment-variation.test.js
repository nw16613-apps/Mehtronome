import {test} from 'node:test';import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';import {BACKING_STYLES} from '../src/practice/backing-styles.js';
import {accompanimentPhrase} from '../src/audio/accompaniment.js';
function play(style,bars=32,extra={}){const rate=4000,e=new Engine(rate);e.configure({...BACKING_STYLES[style].settings,bpm:120,beats:4,key:9,chord:'min7',mode:'dorian',comping:true,drums:false,bass:false,sequence:false,click:0,harmony:0,countIn:false,compingMovementAmount:0,backingHumanize:0,backingVariation:1,...extra});e.reset();const events=[];e.render(new Float32Array(bars*8000),undefined,null,null,undefined,new Float32Array(bars*8000),n=>events.push(n));return events;}
const pairSignature=(events,pair)=>JSON.stringify(events.filter(n=>Math.floor(n.gridSample/16000)===pair).map(n=>[n.gridSample%16000,n.role,n.notes]));
test('every style has five genuinely different musical parts even with timing, velocity and voicing variation disabled',()=>{
 for(const style of Object.keys(BACKING_STYLES)){
  const events=play(style);assert.deepEqual(new Set(events.map(n=>n.variant)),new Set(['base','develop','space','answer','turn']),style);
  const signatures=Array.from({length:8},(_,pair)=>pairSignature(events,pair));assert.ok(new Set(signatures).size>=4,style+' changes notes or musical rhythm');
  const base=events.filter(n=>n.gridSample<16000),space=events.filter(n=>n.gridSample>=32000&&n.gridSample<48000);assert.ok(space.length<base.length,style+' leaves more room in the thinner part');
  assert.ok(events.every(n=>n.notes.every(midi=>[9,11,0,2,4,6,7].includes(midi%12))),style);
 }
});
test('part variation can be disabled and playback restarts reproduce the same written phrase form',()=>{
 for(const style of ['popRock','traditionalJazz','funk','latin','neoSoul']){
  const stable=play(style,8,{backingVariation:0});assert.ok(stable.every(n=>n.variant==='base'));assert.equal(pairSignature(stable,0),pairSignature(stable,2),style);
  assert.deepEqual(play(style,8),play(style,8),style);
 }
});
test('Latin and bossa keep their two-bar side and anchor notes through every variation and turnaround',()=>{
 for(const style of ['latin','bossa'])for(let bar=0;bar<32;bar++)for(const turnaround of [false,true]){
  const phrase=accompanimentPhrase(style,bar,true,turnaround),root=style==='latin'?'rootOctave':'thumbRoot',fifth=style==='latin'?'fifthOctave':'thumbFifth';
  assert.ok(phrase.cell.some(n=>n[0]===0&&n[1]===root),style+' '+bar);assert.ok(phrase.cell.some(n=>n[0]===8&&n[1]===fifth),style+' '+bar);
 }
});
test('chart-ending cues select an answering turnaround while keeping harmony and musical phase',()=>{
 const events=play('funk',4,{progression:true,template:'major251essential'}),last=events.filter(n=>Math.floor(n.gridSample/8000)===3);
 assert.ok(last.length);assert.ok(last.every(n=>n.variant==='turn'));assert.ok(last.every(n=>n.step===2));
});
