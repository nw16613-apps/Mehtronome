import {test} from 'node:test';import assert from 'node:assert/strict';
import {drumStrokeGain} from '../src/audio/drum-performance.js';
import {Rhythm} from '../src/audio/rhythm.js';import {readSampleBank} from '../scripts/read-sample-bank.mjs';
import {BACKING_STYLES,backingStyleInstruments,resolveDrumKit} from '../src/practice/backing-styles.js';
import {Engine,DEFAULTS} from '../src/audio/engine.js';
const rate=8000,kit=await readSampleBank(rate);
test('stronger strokes select harder recordings while ghosts, cymbals and Latin foundations keep their touch',()=>{
 for(const id of Object.keys(BACKING_STYLES)){
  for(const piece of ['kick','snare','tomHigh','tomLow'])assert.ok(drumStrokeGain(id,piece,.45)>.45,id+' '+piece);
  for(const [piece,gain]of [['snare',.12],['kick',.19],['hat',.24],['ride',.31],['rideBell',.25],['crash',.25],['clave',.3],['congaOpen',.3]])assert.equal(drumStrokeGain(id,piece,gain),gain);
 }
 const r=new Rhythm(rate,kit);r.expandedSounds=true;const events=[];
 r.hitDrum('snare',.45,0,0,1,0,e=>events.push(e),'tama',0,'funk');
 r.hitDrum('kick',.6,0,0,0,0,e=>events.push(e),'tama',0,'funk');
 assert.match(events[0].sampleId,/tamaSnareAccent/);assert.match(events[1].sampleId,/tamaKickAccent/);
 assert.ok(drumStrokeGain('hardRock','snare',.5)>drumStrokeGain('ballad','snare',.5));
});
test('real recorded hits gain body and attack energy without moving any onset',()=>{
 for(const id of ['popRock','blues','funk','fusionJazz','legatoFusion']){
  const settings={...BACKING_STYLES[id].settings,...backingStyleInstruments(id),backingStyle:id,soundLibrary:'expanded'},profile=resolveDrumKit(settings);
  const render=style=>{const r=new Rhythm(rate,kit);r.expandedSounds=true;const events=[],out=new Float32Array(rate);for(let n=0;n<out.length;n++){if(n===0)r.hitDrum('kick',.56,n,0,0,0,e=>events.push(e),profile,0,style);if(n===4000)r.hitDrum('snare',.49,n,0,1,0,e=>events.push(e),profile,0,style);r.render(true,false);out[n]=r.drums;}return {events,energy:out.reduce((s,n)=>s+n*n,0)};};
  const before=render(null),after=render(id);assert.ok(after.energy>before.energy*1.3,id);assert.deepEqual(after.events.map(e=>e.sample),before.events.map(e=>e.sample));
 }
});
test('all twenty automatic ensembles retain headroom with firmer drum strokes',()=>{
 for(const [id,style]of Object.entries(BACKING_STYLES)){
  const settings={...DEFAULTS,...style.settings,...backingStyleInstruments(id),automaticBacking:true,backingStyle:id,soundLibrary:'expanded',beats:style.suggestedBeats||4,key:9,mode:'dorian',chord:'min9',template:'single',progression:true,bpm:120,countIn:false,click:0,harmony:0,drums:true,bass:true,comping:true,sequence:true,sequenceActivity:'supporting'};
  settings.drumKit=resolveDrumKit(settings);const e=new Engine(rate);e.installDrumKit(kit);e.configure(settings);e.reset();let peak=0;const out=new Float32Array(rate*4);e.render(out);for(const x of out){assert.ok(Number.isFinite(x));peak=Math.max(peak,Math.abs(x));}assert.ok(peak<.98,id+' peak '+peak);
 }
});
