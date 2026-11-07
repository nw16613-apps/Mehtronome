import {test} from 'node:test';import assert from 'node:assert/strict';
import {referenceChart,referencePlan,referenceScore,referenceStatus,REFERENCE_PERFORMANCES,referenceGrid} from '../src/audio/reference-performances.js';
import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {Engine} from '../src/audio/engine.js';import {harmonyAt,progressionPositionAtBeat,MODES,CHORDS} from '../src/audio/music.js';
import {BACKING_STYLES,backingStyleInstruments,resolveDrumKit} from '../src/practice/backing-styles.js';import {readSampleBank} from '../scripts/read-sample-bank.mjs';
const ids=Object.keys(BACKING_STYLES),bank=await readSampleBank(8000);
function config(id,extra={}){const chart=referenceChart(id),s={...BACKING_STYLES[id].settings,...backingStyleInstruments(id),...chart,backingStyle:id,customProgression:normalizeCustomProgression(chart.progression),template:'custom',progression:true,bpm:120,countIn:false,extensionMorph:false,loopEnabled:false,drums:true,bass:true,comping:true,sequence:true,click:0,harmony:0,backingHumanize:0,soundLibrary:'expanded',...extra};s.drumKit=resolveDrumKit(s);return s;}
function unfamiliar(id,extra={}){const s=config(id);s.key=0;s.customProgression=normalizeCustomProgression({name:'Unfamiliar changes',arrangedPerformance:id,steps:[{root:0,chord:'min9',mode:'dorian',beats:2},{root:1,chord:'dom9sharp11',mode:'lydian_dominant',beats:2},{root:6,chord:'maj9sharp11',mode:'lydian',beats:4},{root:11,chord:'halfDim',mode:'locrian',beats:2},{root:4,chord:'dom7b9',mode:'phrygian_dominant',beats:2},{root:9,chord:'minMaj9',mode:'melodic_minor',beats:4}]});return {...s,...extra};}
function render(settings,beats,block=1024){const engine=new Engine(8000);engine.installDrumKit(bank);engine.configure(settings);engine.reset();const size=Math.floor(beats*4000)-1,out=new Float32Array(size),notes=[],events=[];for(let at=0;at<size;at+=block){const end=Math.min(size,at+block);engine.render(new Float32Array(end-at),undefined,null,null,e=>notes.push(e),out.subarray(at,end),e=>events.push(e));}return {engine,out,notes,events};}
test('all twenty styles have a full reference in their native metre with valid written material',()=>{
 assert.deepEqual(Object.keys(REFERENCE_PERFORMANCES).sort(),ids.sort());
 for(const id of ids){const def=REFERENCE_PERFORMANCES[id],s=config(id),score=referenceScore(id),beats=def.beats||4;assert.equal(referenceStatus(s).active,true,id);assert.equal(s.customProgression.referencePerformance,id);assert.equal(def.harmony.reduce((n,h)=>n+h[3],0),def.bars*beats,id);def.harmony.forEach(([pc,chord,mode],i)=>{assert.ok(CHORDS[chord]&&MODES[mode]);assert.equal(harmonyAt(s,i).chordPcs[0],pc);});
  for(const track of ['bass','comping','sequence','drums']){assert.ok(score[track].flat().length>10,id+track);for(const event of score[track].flat()){assert.ok(event.at>=0&&event.at<beats,id+track);assert.ok(event.velocity>0&&event.velocity<1,id+track);if(track!=='drums'){assert.ok(event.duration>0);for(const pitch of event.notes||[event.midi])assert.ok(Number.isFinite(pitch)&&pitch>=28&&pitch<=90,id+track);}}}
  const lead=score.sequence.flat();assert.ok(new Set(lead.map(n=>n.midi)).size>=6,id+' melodic pitches');assert.ok(new Set(lead.map(n=>n.duration)).size>=2,id+' articulation');
 }
});
test('native reference clock plays every written attack across all complete forms without clipping',()=>{
 for(const id of ids){const def=REFERENCE_PERFORMANCES[id],s=config(id,{drumsVolume:1,bassVolume:1,compingVolume:1,sequenceVolume:1}),score=referenceScore(id),r=render(s,def.bars*(def.beats||4));
  assert.deepEqual(r.notes.map(n=>n.midi),score.sequence.flat().map(n=>n.midi),id+' melody clock');
  assert.deepEqual(r.events.filter(n=>n.type==='bass').map(n=>n.midi),score.bass.flat().map(n=>n.midi),id+' bass clock');
  assert.deepEqual(r.events.filter(n=>n.type==='comping').map(n=>n.notes),score.comping.flat().map(n=>n.notes),id+' comping clock');
  assert.equal(r.events.filter(n=>!['bass','comping'].includes(n.type)).length,score.drums.flat().length,id+' drum clock');
  assert.ok(r.out.every(n=>Number.isFinite(n)&&Math.abs(n)<1),id+' headroom');
 }
});
test('son clave, one-drop and compound subdivisions retain their native identities',()=>{
 const son=referenceScore('latin');for(let bar=0;bar<16;bar++){const clave=son.drums.slice(bar*48,(bar+1)*48).flat().filter(n=>n.name==='clave').map(n=>n.at);assert.deepEqual(clave,bar%2?[0,1.5,3]:[1,2]);}
 const reggae=referenceScore('reggae');assert.ok(reggae.drums.flat().filter(n=>n.name==='kick').every(n=>n.at===2));
 const soul=referenceScore('slowSoul128');for(let b=0;b<16;b++)assert.equal(soul.drums.slice(b*48,(b+1)*48).flat().filter(n=>n.name==='hat').length,12);
 const plan=referencePlan(config('slowSoul128'));assert.equal(referenceGrid(plan,'bass',0,1/3,config('slowSoul128')),4);assert.equal(referenceGrid(plan,'comping',0,2/3,config('slowSoul128')),8);
 assert.equal(config('jazzWaltz').beats,3);assert.equal(config('afroCuban68').beats,3);
});
test('long-form arrangements adapt all styles to unfamiliar split-bar changes and retain harmonically valid voicings',()=>{
 for(const id of ids){const s=unfamiliar(id),plan=referencePlan(s);assert.ok(plan?.score.adapted,id);assert.equal(plan.transpose,0);assert.equal(s.customProgression.arrangedPerformance,id);
  const score=plan.score;assert.ok(score.bars>=16,id+' full phrase window');
  for(const track of ['sequence','comping'])for(let grid=0;grid<score[track].length;grid++)for(const event of score[track][grid]){
   const step=progressionPositionAtBeat(s,grid/12).step,h=harmonyAt(s,step),allowed=[...h.scalePcs,...h.chordPcs];
   for(const midi of event.notes||[event.midi])assert.ok(allowed.includes(midi%12),id+' '+track+' targets '+step+' at '+grid/12+' pitch '+midi);
   assert.equal(event.targetStep,step);assert.ok(event.duration>0);
  }
  const changed=structuredClone(s);changed.customProgression.steps[0].chord='maj9';changed.customProgression.steps[0].mode='major';const other=referencePlan(changed);assert.notDeepEqual(other.score[id==='hardRock'?'sequence':'comping'],score[id==='hardRock'?'sequence':'comping'],id+' responds to quality edit');
 }
});
test('adaptation preserves multi-bar source contour, connects voices, supports loops and slash bass, and caches on mixer edits',()=>{
 for(const id of ['blues','legatoFusion','funk','slowSoul128','jazzWaltz']){
  const s=unfamiliar(id),a=render(s,s.beats*4,257),b=render(s,s.beats*4,1024);assert.deepEqual(a.out,b.out,id);assert.deepEqual(a.notes,b.notes,id);assert.ok(a.notes.length>5);assert.ok(a.events.some(n=>n.type==='comping'));
  const plan=a.engine.clockSettings.referencePlan;a.engine.configure({bassVolume:.2});assert.equal(a.engine.clockSettings.referencePlan,plan,id+' cached plan');
  const looped={...s,loopEnabled:true,loopUnit:'beats',loopBeatStart:2,loopBeatEnd:9},l=referencePlan(looped);assert.equal(l.score.chartBeats,8);for(let grid=0;grid<l.score.comping.length;grid++)for(const event of l.score.comping[grid])assert.equal(event.targetStep,progressionPositionAtBeat(looped,grid/12).step);
 }
 const slash=unfamiliar('popRock');slash.customProgression.steps[0].bass=7;const score=referencePlan(slash).score;assert.equal(score.bass[0][0].midi%12,7);
 const bad=unfamiliar('funk',{beats:3});assert.equal(referencePlan(bad),null);const unsupported=unfamiliar('funk');unsupported.customProgression.steps=Array.from({length:128},()=>({...unsupported.customProgression.steps[0],beats:8}));assert.equal(referencePlan(unsupported),null);
});
