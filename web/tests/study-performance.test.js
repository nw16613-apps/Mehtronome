import {test} from 'node:test';import assert from 'node:assert/strict';
import {DEFAULTS} from '../src/audio/engine.js';import {referencePlan,referenceBasePlan,referenceChart,referenceScore} from '../src/audio/reference-performances.js';import {normalizeCustomProgression} from '../src/practice/custom-progression.js';import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';import {buildStudyPerformance,articulateStudyPerformance} from '../src/audio/study-performance.js';import {CompingInstrument} from '../src/audio/comping.js';import {readSampleBank} from '../scripts/read-sample-bank.mjs';
const settings=(id,extra={})=>{const c=referenceChart(id);return {...DEFAULTS,...BACKING_STYLES[id].settings,...backingStyleInstruments(id),automaticBacking:true,backingStyle:id,key:c.key,beats:c.beats,progression:true,template:'custom',customProgression:normalizeCustomProgression(c.progression),sequenceActivity:'featured',...extra};};
test('both studies have recurring motifs, multiple rhythms, distinct comping passes and room between phrases',()=>{
 for(const id of ['blues','legatoFusion']){const source=JSON.stringify(referenceScore(id)),score=referencePlan(settings(id)).score;assert.equal(score.performanceStudy.style,id);assert.equal(JSON.stringify(referenceScore(id)),source);
  const bars=Array.from({length:8},(_,b)=>score.sequence.slice(b*48,(b+1)*48).flat().map(e=>[e.at,e.duration]));assert.ok(new Set(bars.map(JSON.stringify)).size>=6,id+' rhythmic development');assert.equal(new Set(score.sequence.flat().map(e=>e.motifId)).size,1,'related motif family');assert.ok(score.sequence.flat().some(e=>e.phraseGesture==='call')&&score.sequence.flat().some(e=>e.phraseGesture==='answer'));
  const signatures=[0,1,2,3].map(pass=>JSON.stringify(score.comping.slice(pass*score.developmentBeats*12,(pass+1)*score.developmentBeats*12).flat().map(e=>[e.bar%Math.ceil(score.developmentBeats/4),e.at,e.duration,e.notes])));assert.ok(new Set(signatures).size>=3,id+' comping development');
  const rate=12,occupied=new Uint8Array(score.sequence.length);for(let g=0;g<score.sequence.length;g++)for(const e of score.sequence[g])for(let n=g;n<Math.min(occupied.length,g+e.duration*rate);n++)occupied[n]=1;assert.ok(occupied.filter(n=>!n).length>occupied.length*.15,id+' real breathing space');
 }
});
test('blues uses dyads and small upper replies with real damped/ringing articulation; fusion uses open swells and connected melody',()=>{
 const blues=referencePlan(settings('blues')).score;assert.ok(blues.comping.flat().every(e=>e.notes.length>=2&&e.notes.length<=3));assert.deepEqual(new Set(blues.comping.flat().map(e=>e.articulation)),new Set(['damped','ringing']));
 const fusion=referencePlan(settings('legatoFusion')).score;assert.ok(fusion.comping.flat().every(e=>e.articulation==='swell'));assert.ok(fusion.comping.flat().some(e=>e.duration>4));assert.ok(fusion.comping.flat().filter(e=>e.notes.at(-1)-e.notes[0]>=12).length>fusion.comping.flat().length*.4);assert.ok(fusion.sequence.flat().some(e=>e.articulation==='connected'));
 for(const id of ['blues','legatoFusion']){const a=referencePlan(settings(id,{sequenceActivity:'supporting'})).score,b=referencePlan(settings(id,{sequenceActivity:'featured'})).score;assert.ok(a.sequence.flat().length<b.sequence.flat().length);assert.ok(a.interaction.chordReplies>0,id+' replies in actual melodic gaps');}
});
test('unknown styles are a no-op, and the two approved studies retain their original performance version',()=>{
 const score={...referenceBasePlan(settings('funk')).score,id:'unknown'},snapshot=JSON.stringify(score);const fail=()=>{throw new Error('unexpected planning');};buildStudyPerformance(score,[],fail,fail);articulateStudyPerformance(score,[],fail);assert.equal(JSON.stringify(score),snapshot);
 for(const id of ['blues','legatoFusion'])assert.equal(referenceBasePlan(settings(id)).score.performanceStudy.version,1);
});
const rate=16000,kit=await readSampleBank(rate);
test('written damping and swells change the actual recorded guitar envelope',()=>{
 const tail=expression=>{const p=new CompingInstrument(rate);p.installKit(kit);p.soundLibrary='expanded';p.strike([60,64],.4,.5,120,0,0,undefined,'comping','bluesGuitar',0,null,expression);let energy=0;for(let n=0;n<rate;n++){const x=p.render();if(n>rate*.4)energy+=x*x;}return energy;};assert.ok(tail('ringing')>tail('damped')*4);
 const p=new CompingInstrument(rate);p.installKit(kit);p.soundLibrary='expanded';p.strike([55,62,66],4,.4,120,0,0,undefined,'comping','swelledGuitar',0,null,'swell');assert.ok(p.voices.filter(v=>v.active).every(v=>v.shape.attackFrames>=rate*.065));
});
