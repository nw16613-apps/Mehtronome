import {test} from 'node:test';import assert from 'node:assert/strict';
import {validCompingDeparture} from '../src/audio/comping-embellishments.js';
import {compingVocabulary,playableCompingGrip} from '../src/audio/comping-vocabulary.js';
import {DEFAULTS} from '../src/audio/engine.js';import {harmonyAt} from '../src/audio/music.js';
import {referencePlan} from '../src/audio/reference-performances.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
const pc=n=>(n%12+12)%12;
const settings=(extra={})=>({...DEFAULTS,...BACKING_STYLES.traditionalJazz.settings,...backingStyleInstruments('traditionalJazz'),automaticBacking:true,backingStyle:'traditionalJazz',key:0,chord:'min7',mode:'dorian',sequenceActivity:'supporting',...extra});
test('upper structures retain a full named triad and harmonic anchor in all keys',()=>{
 for(let root=0;root<12;root++)for(const[chord,mode]of [['min7','dorian'],['dom7','mixolydian'],['maj7','lydian']]){
  const h={...harmonyAt({...settings(),progression:false,key:root,chord,mode}),root,chord};
  for(const guitar of [false,true]){
   const options=compingVocabulary(h,{guitar}).filter(v=>v.technique==='upperStructure');assert.ok(options.length);
   for(const v of options){const[r,q]=v.source.split(':'),triad=(q==='major'?[0,4,7]:[0,3,7]).map(n=>pc(+r+n));assert.ok(triad.every(n=>v.notes.some(m=>pc(m)===n)));if(guitar)assert.ok(playableCompingGrip(v.notes));}
  }
 }
});
test('secondary dominants and tritone substitutions resolve audibly into real ii–V–I destinations',()=>{
 const s=settings({progression:true,template:'major251essential'}),score=referencePlan(s).score,kinds=new Set();
 for(const[grid,events]of score.comping.entries())for(const e of events)if(e.harmonicTransition){
  kinds.add(e.harmonicTransition.kind);assert.ok(validCompingDeparture(score,e,grid));assert.ok(e.duration<=.5);
  const t=e.harmonicTransition,resolution=score.comping[t.resolveGrid].find(r=>r.harmonicResolution===t.id);assert.ok(resolution);
  if(t.kind==='secondaryDominant')assert.equal(t.sourceRoot,pc(t.targetRoot+7));
  if(t.kind==='tritoneSubstitution')assert.equal(t.sourceRoot,pc(t.targetRoot+1));
 }
 assert.ok(kinds.has('secondaryDominant'));assert.ok(kinds.has('tritoneSubstitution'));
});
test('vamps have resolved suspensions and approaches but no invented harmonic destinations',()=>{
 const score=referencePlan(settings({progression:false,key:9,chord:'min7',mode:'dorian'})).score,rows=score.comping.flat();
 assert.ok(rows.some(e=>e.compingTechnique==='upperStructure'));
 assert.ok(rows.some(e=>e.compingTechnique==='innerVoice'));
 assert.ok(rows.some(e=>e.compingTechnique==='suspension'));
 assert.ok(rows.some(e=>e.compingTechnique==='chromaticApproach'));
 for(const[grid,events]of score.comping.entries())for(const e of events){
  if(e.harmonicTransition){assert.ok(validCompingDeparture(score,e,grid));assert.ok(!['secondaryDominant','tritoneSubstitution'].includes(e.harmonicTransition.kind));}
  if(e.innerVoiceFrom){assert.equal(e.notes[0],e.innerVoiceFrom[0]);assert.equal(e.notes.at(-1),e.innerVoiceFrom.at(-1));assert.equal(e.notes.filter((n,i)=>n!==e.innerVoiceFrom[i]).length,1);}
 }
});
test('fixed written heads suppress chromatic substitutions and power styles keep their original identity',()=>{
 const score=referencePlan(settings({progression:true,template:'major251essential',standardMelody:'autumn-leaves'})).score;
 assert.ok(score.comping.flat().every(e=>!e.harmonicTransition||e.harmonicTransition.kind==='suspension'));
 const rock=referencePlan({...settings(),...BACKING_STYLES.hardRock.settings,...backingStyleInstruments('hardRock'),backingStyle:'hardRock',progression:false}).score;
 assert.ok(rock.comping.flat().every(e=>!e.harmonicTransition));
});
