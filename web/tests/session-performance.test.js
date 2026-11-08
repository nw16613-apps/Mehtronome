import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Engine,DEFAULTS} from '../src/audio/engine.js';
import {referencePlan,referenceBasePlan,referenceChart,referencePlanKey,referenceEvents,sessionEventGain} from '../src/audio/reference-performances.js';
import {sessionCycle} from '../src/audio/session-performance.js';
import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {BACKING_STYLES,backingStyleInstruments,resolveDrumKit} from '../src/practice/backing-styles.js';
import {harmonyAt,progressionPositionAtBeat} from '../src/audio/music.js';
import {readSampleBank} from '../scripts/read-sample-bank.mjs';
const config=(id,extra={})=>{const beats=BACKING_STYLES[id].suggestedBeats||4;const s={...DEFAULTS,...BACKING_STYLES[id].settings,...backingStyleInstruments(id),backingStyle:id,automaticBacking:true,key:0,beats,progression:true,template:'custom',extensionMorph:false,countIn:false,bpm:160,drums:true,bass:true,comping:true,sequence:true,drumsVolume:1,bassVolume:1,compingVolume:1,sequenceVolume:1,click:0,harmony:0,backingHumanize:0,soundLibrary:'expanded',sequenceActivity:'supporting',customProgression:normalizeCustomProgression({name:'Connected changes',steps:[{root:2,chord:'min9',mode:'dorian',beats:beats*2},{root:7,chord:'dom13',mode:'mixolydian',beats},{root:0,chord:'maj9',mode:'major',beats,bass:7}]}),...extra};s.drumKit=resolveDrumKit(s);return s;};
const cycleRows=(plan,track,cycle)=>plan.score[track].flatMap((_,g)=>referenceEvents(plan,track,g+cycle*plan.score[track].length).map(e=>({g,...e})));

test('all styles have a bounded twelve-pass session arc with sparse prepared variants and shared dynamics',()=>{
 for(const id of Object.keys(BACKING_STYLES)){
  const plan=referencePlan(config(id)),score=plan.score,n=score.sequence.length;
  assert.deepEqual(score.sessionPerformance.roles,['opening','build','space-and-return']);
  assert.equal(score.sessionPerformance.cycleBeats,n/12);
  for(const cycle of [0,1,2,3])assert.equal(sessionCycle(score,cycle*n/12),cycle%3);
  const bytes=JSON.stringify(score.sessionPerformance.variants).length,baseBytes=JSON.stringify([score.bass,score.drums,score.comping,score.sequence]).length;
  assert.ok(bytes<baseBytes*2,id+' sparse storage, without three full tick grids');
  const bass=[0,1,2].map(c=>JSON.stringify(cycleRows(plan,'bass',c).map(e=>[e.g,e.midi,e.duration])));
  assert.ok(new Set(bass).size>=2,id+' played bass differs after opening cycle');
  for(const track of ['bass','drums','comping','sequence']){
   const contrast=2*n+Math.round(score.developmentBeats*12*2.5),ending=3*n-1;
   assert.ok(sessionEventGain(plan,track,contrast)<sessionEventGain(plan,track,ending),id+' shared breakdown and return');
   assert.equal(sessionEventGain(plan,track,0),1);
   assert.equal(referenceEvents(plan,track,n+7),referenceEvents(plan,track,n+7),'event lookup reuses prepared arrays');
  }
  assert.equal(sessionEventGain(plan,'drums',n+score.developmentBeats*12*1.9,'ride')<=1,true,'cymbals never boosted');
 }
});
test('connected bass, cadential approaches and pickups follow the real chart and retain slash/anticipated entries in every cycle',()=>{
 for(const id of Object.keys(BACKING_STYLES)){
  const s=config(id),plan=referencePlan(s),n=plan.score.sequence.length;
  for(const cycle of [0,1,2])for(const e of cycleRows(plan,'bass',cycle)){
   const h=harmonyAt(s,progressionPositionAtBeat(s,e.g/12).step);
   assert.ok(e.duration>0&&Number.isFinite(e.midi)&&e.midi>=28&&e.midi<=55);
   if(!e.approach&&!e.anticipation)assert.ok([...h.chordPcs,...h.scalePcs].includes(e.midi%12),id+' actual harmony');
   if(e.slashEntry)assert.equal(e.midi%12,7,id+' written bass retained');
  }
  const snapshot=JSON.stringify(plan.score);for(const cycle of [0,1,2])for(let g=0;g<n;g++)referenceEvents(plan,'bass',cycle*n+g);
  assert.equal(JSON.stringify(plan.score),snapshot,'playback selection never mutates the prepared score');
 }
 const jazz=referencePlan(config('traditionalJazz'));
 assert.ok(cycleRows(jazz,'bass',1).some(e=>e.sessionBassRole==='pickup'));
 assert.ok(cycleRows(jazz,'bass',1).some(e=>e.sessionBassRole==='approach'));
 const son=referencePlan(config('latin'));
 for(const cycle of [0,1,2])assert.deepEqual(cycleRows(son,'bass',cycle).filter(e=>e.anticipation).map(e=>[e.g,e.midi]),cycleRows(son,'bass',0).filter(e=>e.anticipation).map(e=>[e.g,e.midi]));
});
test('session fills preserve groove foundations, metre and gaps in the full melody',()=>{
 for(const id of ['latin','reggae','afroCuban68','slowSoul128','blues','hardRock']){
  const plan=referencePlan(config(id,{sequenceActivity:'featured'})),score=plan.score;
  for(const cycle of [0,1,2])for(const e of cycleRows(plan,'drums',cycle)){
   if(id==='reggae'&&e.name==='kick')assert.equal(e.at,2);
   if(id==='slowSoul128')assert.ok(Math.abs(e.at*3-Math.round(e.at*3))<1e-6);
   if(e.sessionFill)for(let g=Math.max(0,e.g-3);g<Math.min(score.sequence.length,e.g+4);g++)assert.equal(score.sequence[g].length,0,'new fill clears melodic attacks');
  }
  for(const cycle of [1,2])for(const name of id==='latin'?['clave']:id==='reggae'?['kick','rim']:id==='slowSoul128'?['hat']:['kick']){
   const foundation=c=>cycleRows(plan,'drums',c).filter(e=>e.name===name&&!e.sessionFill).map(e=>e.g);
   assert.deepEqual(foundation(cycle),foundation(0),id+' foundation '+name);
  }
 }
});
test('activity changes cannot resurrect filtered notes in later session cycles and cached sources stay immutable',()=>{
 const s=config('legatoFusion'),base=referenceBasePlan(s),snapshot=JSON.stringify(base.score);
 const a=referencePlan(s),b=referencePlan({...s,sequenceActivity:'featured'});
 for(const cycle of [0,1,2])assert.ok(cycleRows(a,'sequence',cycle).length<cycleRows(b,'sequence',cycle).length);
 assert.equal(JSON.stringify(base.score),snapshot);
 const raw=referenceChart('blues');assert.ok(raw.progression.steps.length);
});
test('later cycles follow a selected seven-beat loop rather than the unlooped chart',()=>{
 for(const id of ['traditionalJazz','latin','neoSoul','legatoFusion']){
  const s=config(id,{loopEnabled:true,loopUnit:'beats',loopBeatStart:1,loopBeatEnd:7}),plan=referencePlan(s);
  assert.equal(plan.score.chartBeats,7);
  for(const cycle of [0,1,2])for(const e of cycleRows(plan,'bass',cycle)){
   assert.equal(e.targetStep,progressionPositionAtBeat(s,e.g/12).step,id+' loop chord');
   if(e.approach||e.anticipation)continue;
   const h=harmonyAt(s,progressionPositionAtBeat(s,e.g/12).step);assert.ok([...h.chordPcs,...h.scalePcs].includes(e.midi%12));
  }
 }
});

const rate=8000,bank=await readSampleBank(rate);
function render(s,block=1024){
 const e=new Engine(rate);e.installDrumKit(bank);e.configure(s,{key:referencePlanKey(s),plan:referenceBasePlan(s)});e.reset();
 const beats=e.clockSettings.referencePlan.score.sessionPerformance.cycleBeats*3,n=Math.ceil(beats*60/s.bpm*rate)-1,out=new Float32Array(n),notes=[],events=[],cues=[];
 for(let i=0;i<n;i+=block){const size=Math.min(block,n-i);e.render(new Float32Array(size),b=>cues.push([b.arrangementCycle,b.sessionRole]),null,null,v=>notes.push(v),out.subarray(i,i+size),v=>events.push(v));}
 return {out,notes,events,cues};
}
test('all twenty bands render all twelve passes with bounded recorded audio and correct session cues',()=>{
 for(const id of Object.keys(BACKING_STYLES)){
  const r=render(config(id));assert.ok(r.out.some(n=>Math.abs(n)>.001));assert.ok(r.out.every(n=>Number.isFinite(n)&&Math.abs(n)<1),id+' all-cycle headroom');
  assert.deepEqual([...new Set(r.cues.map(c=>c[1]))],['opening','build','space-and-return']);assert.deepEqual([...new Set(r.cues.map(c=>c[0]))],[1,2,3]);
 }
});
test('later-cycle audio and events remain independent of callback block size',()=>{
 for(const id of ['legatoFusion','latin','slowSoul128']){const a=render(config(id),257),b=render(config(id),1024);assert.deepEqual(a.out,b.out,id);assert.deepEqual(a.notes,b.notes,id);assert.deepEqual(a.events,b.events,id);}
});
