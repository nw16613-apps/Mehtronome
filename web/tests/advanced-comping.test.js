import {test} from 'node:test';import assert from 'node:assert/strict';
import {compingVocabulary,playableCompingGrip} from '../src/audio/comping-vocabulary.js';
import {harmonyAt,CHORDS} from '../src/audio/music.js';
import {referencePlan,referenceChart} from '../src/audio/reference-performances.js';
import {DEFAULTS} from '../src/audio/engine.js';
import {BACKING_STYLES,backingStyleInstruments} from '../src/practice/backing-styles.js';
import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
const pc=n=>(n%12+12)%12;
function settings(id,extra={}){return {...DEFAULTS,...BACKING_STYLES[id].settings,...backingStyleInstruments(id),automaticBacking:true,backingStyle:id,key:9,chord:'min7',mode:'dorian',progression:false,sequenceActivity:'supporting',...extra};}
test('advanced colours are harmonic, guide-anchored and physically playable in every key',()=>{
 for(let root=0;root<12;root++)for(const [chord,mode]of [['min7','dorian'],['maj7','lydian'],['dom7','mixolydian'],['halfDim','locrian']]){
  const h={...harmonyAt({...DEFAULTS,key:root,chord,mode,progression:false}),root,chord},ints=CHORDS[chord].intervals,guides=[pc(root+ints[1]),pc(root+ints.find(n=>n>=9&&n<=11))];
  for(const guitar of [false,true])for(const v of compingVocabulary(h,{guitar})){
   assert.ok(v.notes.length>=3&&v.notes.length<=4);assert.ok(v.notes.every(n=>n>=48&&n<=81&&(h.scalePcs.includes(pc(n))||h.chordPcs.includes(pc(n)))));
   assert.ok(v.notes.some(n=>guides.includes(pc(n))));
   if(ints.includes(4))assert.ok(!v.notes.some(n=>pc(n)===pc(root+5)));
   if(ints.includes(6))assert.ok(v.notes.some(n=>pc(n)===pc(root+6)));
   if(guitar)assert.ok(playableCompingGrip(v.notes));
   if(v.technique==='quartal')assert.ok(v.notes.some(n=>v.notes.includes(n+5)&&v.notes.includes(n+10)));
   if(v.technique==='pentatonic'){const[r,q]=v.source.split(':'),tones=(q==='major'?[0,2,4,7,9]:[0,3,5,7,10]).map(n=>pc(+r+n));assert.ok(v.notes.filter(n=>tones.includes(pc(n))).length>=3);}
   if(v.technique==='triadPair'){const triads=v.source.split('/').map(s=>{const[r,q]=s.split(':');return(q==='major'?[0,4,7]:[0,3,7]).map(n=>pc(+r+n));});assert.equal(new Set(triads.flat()).size,6);assert.ok(triads[v.side].every(n=>v.notes.some(m=>pc(m)===n)));}
  }
 }
});
test('all advanced families and both triads survive articulation and melody coordination',()=>{
 for(const id of ['traditionalJazz','fusionJazz','legatoFusion']){
  const a=referencePlan(settings(id)).score,b=referencePlan(settings(id)).score,rows=a.comping.flat();assert.deepEqual(rows,b.comping.flat());
  for(const technique of ['quartal','pentatonic','triadPair'])assert.ok(rows.some(e=>e.compingTechnique===technique),id+' '+technique);
  const pairs=rows.filter(e=>e.compingTechnique==='triadPair');assert.deepEqual([...new Set(pairs.map(e=>e.triadPairSide))].sort(),[0,1]);
  for(const e of pairs){const[root,quality]=e.harmonicSource.split('/')[e.triadPairSide].split(':'),triad=(quality==='major'?[0,4,7]:[0,3,7]).map(n=>pc(+root+n));assert.ok(triad.every(n=>e.notes.some(m=>pc(m)===n)),id+' pair intact');}
  assert.ok(new Set(rows.map(e=>e.notes.at(-1))).size>=4,id+' upper melody');
  if(id==='legatoFusion')assert.ok(rows.filter(e=>['quartal','pentatonic','triadPair'].includes(e.compingTechnique)).every(e=>playableCompingGrip(e.notes)));
 }
});
test('changing reference charts use the vocabulary while hard-rock riffs retain power harmony',()=>{
 for(const id of ['traditionalJazz','fusionJazz','legatoFusion','modernStraightJazz']){
  const c=referenceChart(id),s=settings(id,{key:c.key,beats:c.beats,progression:true,template:'custom',customProgression:normalizeCustomProgression(c.progression)});
  assert.ok(referencePlan(s).score.comping.flat().some(e=>['quartal','pentatonic','triadPair'].includes(e.compingTechnique)),id);
 }
 assert.ok(referencePlan(settings('hardRock')).score.comping.flat().every(e=>e.compingTechnique==='power'||e.answer));
});
