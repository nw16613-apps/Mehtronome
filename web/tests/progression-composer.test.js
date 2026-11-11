import {validCompingDeparture} from '../src/audio/comping-embellishments.js';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {Engine,DEFAULTS} from '../src/audio/engine.js';import {referencePlan,referenceBasePlan,referenceChart,referencePlanKey} from '../src/audio/reference-performances.js';
import {createReferencePreparation} from '../src/audio/reference-plan-preparation.js';import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {BACKING_STYLES,backingStyleInstruments,resolveDrumKit} from '../src/practice/backing-styles.js';import {COMPOSITION_STYLES} from '../src/audio/composition-vocabulary.js';
import {harmonyAt,progressionPositionAtBeat} from '../src/audio/music.js';import {readSampleBank} from '../scripts/read-sample-bank.mjs';
function settings(id,activity='featured',extra={}){const beats=BACKING_STYLES[id].suggestedBeats||4;const s={...DEFAULTS,...BACKING_STYLES[id].settings,...backingStyleInstruments(id),key:0,beats,backingStyle:id,progression:true,template:'custom',extensionMorph:false,loopEnabled:false,countIn:false,bpm:120,drums:true,bass:true,comping:true,sequence:true,drumsVolume:1,bassVolume:1,compingVolume:1,sequenceVolume:1,click:0,harmony:0,backingHumanize:0,soundLibrary:'expanded',sequenceActivity:activity,customProgression:normalizeCustomProgression({name:'Unfamiliar ii–V–I',arrangedPerformance:id,steps:[{root:2,chord:'min9',mode:'dorian',beats:beats*2},{root:7,chord:'dom13',mode:'mixolydian',beats},{root:0,chord:'maj9',mode:'major',beats}]}),...extra};s.drumKit=resolveDrumKit(s);return s;}
const pitchedSignature=(score,track,pass)=>{const n=score.developmentBeats*12;return JSON.stringify(score[track].slice(pass*n,(pass+1)*n).map(es=>es.map(e=>[e.midi,e.notes,e.duration])));};
test('all twenty styles develop pitched parts over four distinct passes, including newly composed middle choruses',()=>{
 assert.deepEqual(Object.keys(COMPOSITION_STYLES).sort(),Object.keys(BACKING_STYLES).sort());
 for(const id of Object.keys(BACKING_STYLES)){
  const s=settings(id),score=referencePlan(s).score;assert.equal(score.composition.method,'whole-progression-paths');assert.deepEqual(score.choruses.map(c=>c.role),['statement','development','contrast','return']);
  assert.equal(score.sequence.length,score.developmentBeats*4*12);assert.equal(score.developmentBeats%score.chartBeats,0);
  for(const track of ['sequence','bass','comping'])assert.ok(new Set([0,1,2,3].map(p=>pitchedSignature(score,track,p))).size>=3,id+' '+track+' meaningful variation');
  for(const pass of [1,2])assert.ok(score.sequence.slice(pass*score.developmentBeats*12,(pass+1)*score.developmentBeats*12).flat().some(e=>e.composed&&e.goalBeat!==undefined),id+' new phrase');
  for(const track of ['sequence','comping','bass'])for(let grid=0;grid<score[track].length;grid++)for(const e of score[track][grid]){
   assert.ok(e.duration>0&&e.velocity>0&&e.velocity<1,id+' duration/dynamics');const h=harmonyAt(s,progressionPositionAtBeat(s,grid/12).step),allowed=[...h.chordPcs,...h.scalePcs];
   if(track==='bass'&&(e.approach||e.anticipation))continue;
   if(track==='comping'&&e.harmonicTransition){assert.ok(validCompingDeparture(score,e,grid),id+' resolves temporary harmony');continue;}
   for(const midi of e.notes||[e.midi])assert.ok(Number.isFinite(midi)&&allowed.includes(midi%12),id+' '+track+' pitch '+midi+' at '+grid/12);
  }
 }
});
test('an upcoming destination changes an earlier new phrase while the opening harmony remains identical',()=>{
 const a=settings('legatoFusion'),b=structuredClone(a);b.customProgression.steps[2]={...b.customProgression.steps[2],root:9,chord:'min9',mode:'dorian'};
 const x=referencePlan(a).score,y=referencePlan(b).score,start=x.developmentBeats*12;
 assert.notDeepEqual(x.sequence.slice(start,start+8*12).flat().map(e=>e.midi),y.sequence.slice(start,start+8*12).flat().map(e=>e.midi));
 const composed=x.sequence.slice(start,start+8*12).flat();assert.ok(composed.some(e=>e.goalBeat>e.bar*x.beats+e.at));assert.ok(composed.every(e=>e.motifId&&e.composed));
});
test('the band follows the audible melody without mutating its composition or losing riff identities',()=>{
 const s=settings('traditionalJazz','supporting'),base=referenceBasePlan(s),snapshot=JSON.stringify(base.score),score=referencePlan(s).score;
 assert.ok(score.interaction.softenedComping>0);assert.ok(score.interaction.chordReplies>0);assert.equal(score.interaction.collisionsRemoved,0,'piano supports the lead without dropping its rhythm');assert.equal(JSON.stringify(base.score),snapshot);
 const sounding=grid=>score.sequence.some((events,at)=>at<=grid&&events.some(e=>at+e.duration*12>grid));
 for(let grid=0;grid<score.comping.length;grid++)for(const e of score.comping[grid])if(e.conversation==='reply')assert.equal(sounding(grid),false,'reply has a lead gap');
 const funk=referencePlan(settings('funk','supporting')).score;assert.equal(funk.interaction.collisionsRemoved,0,'ostinato accents retained');assert.ok(funk.interaction.bassKickMatches>0);
 for(let grid=0;grid<funk.drums.length;grid++)for(const e of funk.drums[grid])if(e.matchedBass)assert.ok(funk.bass[grid].some(b=>b.locksKick));
});
test('drum ornaments find spaces between melodic attacks while Latin, one-drop and 12/8 foundations survive all passes',()=>{
 for(const id of ['traditionalJazz','latin','reggae','slowSoul128','afroCuban68']){
  const score=referencePlan(settings(id,'supporting')).score,rate=12,beats=score.beats;
  for(let grid=0;grid<score.drums.length;grid++)for(const e of score.drums[grid])if(e.conversation==='fill-gap')for(let i=Math.max(0,grid-3);i<Math.min(score.sequence.length,grid+4);i++)assert.equal(score.sequence[i].length,0,'fill avoids lead attacks');
  for(let bar=0;bar<score.bars;bar++){
   const events=score.drums.slice(bar*beats*rate,(bar+1)*beats*rate).flat();
   if(id==='latin')assert.deepEqual(events.filter(e=>e.name==='clave').map(e=>e.at),bar%2?[0,1.5,3]:[1,2]);
   if(id==='reggae')assert.ok(events.filter(e=>e.name==='kick').every(e=>e.at===2));
   if(id==='slowSoul128'){assert.equal(events.filter(e=>e.name==='hat').length,12);assert.ok(events.every(e=>Math.abs(e.at*3-Math.round(e.at*3))<1e-6));}
  }
 }
});
test('anticipated roots, slash bass and selected loops follow the actual chart in newly composed passes',()=>{
 const s=settings('latin');s.customProgression.steps[2].bass=7;const score=referencePlan(s).score;
 for(const pass of [1,2,3]){const grid=Math.round((pass*score.developmentBeats+12-.5)*12),e=score.bass[grid].find(e=>e.anticipation);assert.ok(e);assert.equal(e.midi%12,7,'anticipated written G bass');}
 const slash=settings('popRock');slash.customProgression.steps[0].bass=5;const p=referencePlan(slash).score;for(const pass of [0,1,2,3])assert.equal(p.bass.slice(pass*p.developmentBeats*12,pass*p.developmentBeats*12+9).flat().find(e=>!e.anticipation).midi%12,5);
 const loop=settings('funk','supporting',{loopEnabled:true,loopUnit:'beats',loopBeatStart:2,loopBeatEnd:9}),l=referencePlan(loop).score;assert.equal(l.chartBeats,8);for(let g=0;g<l.sequence.length;g++)for(const e of l.sequence[g])assert.equal(e.targetStep,progressionPositionAtBeat(loop,g/12).step);
});
test('composition is prepared outside the worklet and fader/activity messages do not recompose or resend the score',()=>{
 const s=settings('legatoFusion');let calls=0;const prep=createReferencePreparation(value=>{calls++;return referenceBasePlan(value);}),first=prep.get(s);assert.equal(calls,1);
 const e=new Engine(8000);e.configure(s,first);assert.equal(e.cachedReferenceBasePlan,first.plan,'accept prepared object');
 const same={...s,bpm:170,bassVolume:.2,sequenceActivity:'supporting'},message=prep.message(same,first.key);assert.deepEqual(Object.keys(message),['key']);assert.equal(calls,1);e.configure(same,message);assert.equal(e.cachedReferenceBasePlan,first.plan);
 const changed=structuredClone(s);changed.customProgression.steps[0].chord='min11';const next=prep.message(changed,first.key);assert.equal(calls,2);assert.notEqual(next.key,first.key);e.configure(changed,next);assert.equal(e.cachedReferenceBasePlan,next.plan);assert.equal(next.key,referencePlanKey(e.settings));
});
const kit=await readSampleBank(8000);
function render(s,block=1024){const e=new Engine(8000),prepared={key:referencePlanKey(s),plan:referenceBasePlan(s)};e.installDrumKit(kit);e.configure(s,prepared);e.reset();const n=e.clockSettings.referencePlan.score.sequence.length/12*4000-1,out=new Float32Array(n),notes=[],beats=[];for(let at=0;at<n;at+=block){const end=Math.min(n,at+block);e.render(new Float32Array(end-at),b=>beats.push(b),null,null,n=>notes.push(n),out.subarray(at,end));}return {out,notes,beats};}
test('all twenty complete four-pass bands remain bounded with recorded sounds and expose the active pass',()=>{
 for(const id of Object.keys(BACKING_STYLES)){const r=render(settings(id,'supporting'));assert.ok(r.out.some(v=>Math.abs(v)>.001));assert.ok(r.out.every(v=>Number.isFinite(v)&&Math.abs(v)<1),id+' mix headroom');assert.deepEqual([...new Set(r.beats.map(b=>b.arrangementRole))],['statement','development','contrast','return']);}
});
test('the longer composed performance remains independent of audio block size',()=>{
 for(const id of ['legatoFusion','latin','slowSoul128']){const a=render(settings(id,'supporting'),257),b=render(settings(id,'supporting'),1024);assert.deepEqual(a.out,b.out,id);assert.deepEqual(a.notes,b.notes,id);assert.deepEqual(a.beats,b.beats,id);}
});
