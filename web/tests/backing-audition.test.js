import test from 'node:test';import assert from 'node:assert/strict';
import {Engine} from '../src/audio/engine.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
import {trialBass,trialComping,trialDrums,trialSequenceStep} from '../src/audio/audition-arrangements.js';
import {harmonyAt} from '../src/audio/music.js';
const config=(id,extra={})=>({...BACKING_STYLES[id].settings,...backingStyleInstruments(id),backingStyle:id,backingArrangement:'trial',backingVariation:1,beats:4,bpm:120,countIn:false,key:9,mode:'major',chord:'maj7',progression:true,template:'major251essential',click:0,harmony:0,drums:true,bass:true,comping:true,sequence:true,...extra});
const kit=Object.fromEntries(['kick','snare','hat','ride','rideBell','tomHigh','tomLow','electricBass40','electricBass52','electricGuitar63'].map(id=>[id,Float32Array.from({length:2000},(_,i)=>Math.sin(i*.17)*Math.exp(-i/700)*.2)]));
function render(id,block=257,extra={}){const e=new Engine(2000);e.installDrumKit(kit);e.configure(config(id,extra));e.reset();const audio=new Float32Array(64000),notes=[],events=[];for(let at=0;at<audio.length;at+=block)e.render(audio.subarray(at,Math.min(audio.length,at+block)),undefined,null,null,n=>notes.push(n),null,n=>events.push(n));return {e,audio,notes,events};}
test('both B arrangements have distinct coordinated full forms and A remains unchanged',()=>{
 for(const id of ['blues','legatoFusion']){const s=config(id),bars=id==='blues'?12:16,barGrid=4*s.sequenceRate,melodies=Array.from({length:bars},(_,b)=>Array.from({length:barGrid},(_,n)=>trialSequenceStep(s,b*barGrid+n,7)).filter(Boolean));assert.ok(melodies.some(ns=>!ns.length));assert.ok(new Set(melodies.map(ns=>ns.map(n=>[n.local,n.degree,n.duration].join(':')).join(','))).size>=7);assert.ok(new Set(Array.from({length:bars},(_,b)=>JSON.stringify(trialComping(s,b).cell))).size>=6);assert.ok(new Set(Array.from({length:bars},(_,b)=>JSON.stringify(trialBass(s,b)))).size>=4);assert.ok(trialDrums(s,bars-1).some(([,name])=>name==='tomLow'));
  for(const mode of ['supporting','countermelody','featured'])for(let grid=0;grid<bars*barGrid;grid++){const n=trialSequenceStep({...s,sequenceActivity:mode},grid,7);if(n)assert.ok(n.local>=0&&n.local<barGrid&&n.duration>0&&n.index>=0&&n.index<7);}
  const a={...s,backingArrangement:'current'};assert.equal(trialComping(a,0),null);assert.equal(trialBass(a,0),null);assert.equal(trialDrums(a,0),null);assert.equal(trialSequenceStep(a,0,7),null);
 }
 assert.equal(trialComping(config('funk'),0),null);
});
test('A/B changes wait for the next complete bar, survive intervening mixer updates and reset immediately',()=>{
 const e=new Engine(2000);e.configure(config('blues',{backingArrangement:'current'}));e.reset();e.render(new Float32Array(1200));const beat=e.beat,age=e.age,step=e.step;e.configure({backingArrangement:'trial'});assert.equal(e.clockSettings.backingArrangement,'current');assert.equal(e.beat,beat);assert.equal(e.age,age);assert.equal(e.step,step);e.configure({compingVolume:.18});assert.equal(e.clockSettings.backingArrangement,'current');e.render(new Float32Array(2799));assert.equal(e.clockSettings.backingArrangement,'current');const beats=[];e.render(new Float32Array(2),n=>beats.push(n));assert.equal(e.clockSettings.backingArrangement,'trial');assert.equal(beats.at(-1).beat,0);assert.equal(beats.at(-1).backingArrangement,'trial');assert.equal(e.settings.compingVolume,.18);
 e.configure({backingArrangement:'current'});assert.equal(e.clockSettings.backingArrangement,'trial');e.reset();assert.equal(e.clockSettings.backingArrangement,'current');
});
test('trial performances follow real chord changes and are identical across audio block sizes',()=>{
 for(const id of ['blues','legatoFusion']){const a=render(id),b=render(id,1024);assert.deepEqual(a.audio,b.audio);assert.deepEqual(a.notes,b.notes);assert.deepEqual(a.events,b.events);assert.ok(a.notes.length>35);assert.ok(a.events.some(n=>n.type==='bass'));assert.ok(a.events.some(n=>n.type==='comping'));assert.ok(a.events.some(n=>n.type==='ride'||n.type==='hat'));assert.ok(new Set(a.notes.map(n=>n.step)).size>1);
  for(const n of a.notes){const h=harmonyAt(a.e.settings,n.step);assert.ok([...h.scalePcs,...h.chordPcs].includes(n.midi%12),id+' melody');}
  for(const n of a.events.filter(n=>n.type==='comping')){const h=harmonyAt(a.e.settings,n.step);assert.ok(n.notes.every(m=>[...h.scalePcs,...h.chordPcs].includes(m%12)),id+' comping');assert.equal(n.variant,'trial');}
  assert.notDeepEqual(a.notes.map(n=>[n.grid,n.midi]),render(id,257,{backingArrangement:'current'}).notes.map(n=>[n.grid,n.midi]));
 }
});
test('both trial bands retain headroom and comparable loudness using the real instrument banks',async()=>{
 const {readSampleBank}=await import('../scripts/read-sample-bank.mjs'),bank=await readSampleBank(8000);
 for(const id of ['blues','legatoFusion']){
  const levels={};for(const choice of ['current','trial']){const e=new Engine(8000);e.installDrumKit(bank);e.configure(config(id,{backingArrangement:choice,progression:false,template:'single',chord:'dom9',mode:'mixolydian'}));e.reset();const frames=8000*24,click=new Float32Array(frames),left=new Float32Array(frames),right=new Float32Array(frames),band=new Float32Array(frames);e.render(click,undefined,left,right,undefined,band);let peak=0,energy=0;for(let i=0;i<frames;i++){const l=click[i]+left[i]+band[i],r=click[i]+right[i]+band[i];assert.ok(Number.isFinite(l)&&Number.isFinite(r));peak=Math.max(peak,Math.abs(l),Math.abs(r));energy+=(l*l+r*r)/2;}assert.ok(peak<.35,id+' '+choice+' peak '+peak);levels[choice]=Math.sqrt(energy/frames);}
  assert.ok(levels.trial/levels.current>.5&&levels.trial/levels.current<1.5,id+' comparable level '+JSON.stringify(levels));
 }
});
