import {test} from 'node:test';import assert from 'node:assert/strict';
import {REPERTOIRE_STUDIES,rehearsalSections,normalizeRepertoire} from '../src/practice/repertoire.js';import {normalizeCustomProgression,cloneTemplate} from '../src/practice/custom-progression.js';import {chordSheet} from '../src/practice/chord-sheet.js';import {harmonyAt,progressionBeatDurations,progressionOrder} from '../src/audio/music.js';import {readPresets} from '../src/practice/presets.js';
test('original forms retain full beat lengths, section boundaries and valid harmony in every key',()=>{
 for(const [index,study]of REPERTOIRE_STUDIES.entries()){
  const sections=rehearsalSections(study.progression,4);assert.deepEqual(sections.map(s=>[s.start,s.end]),({blues:[[0,16],[16,32],[32,48]],ab:[[0,32],[32,64]],minorjazz:[[0,8],[8,16],[16,32]],dorianform:[[0,16],[16,32],[32,48],[48,64]]})[study.id]);
  for(let key=0;key<12;key++){
   const settings={key,beats:4,progression:true,template:'custom',customProgression:study.progression};assert.equal(progressionBeatDurations(settings).reduce((a,b)=>a+b),({blues:48,ab:64,minorjazz:32,dorianform:64})[study.id]);
   for(const section of sections){const selected={...settings,loopEnabled:true,loopUnit:'beats',loopBeatStart:section.start,loopBeatEnd:section.end-1};assert.equal(progressionOrder(selected)[0],section.step);}
   for(let i=0;i<study.progression.steps.length;i++){const h=harmonyAt(settings,i);assert.equal(h.chordPcs[0],(key+study.progression.steps[i].root)%12);}
   assert.deepEqual(cloneTemplate(study.progression,'min7','dorian',settings).steps.map(s=>s.section),study.progression.steps.map(s=>s.section));
  }
 }
});
test('rehearsal sections follow beat and bar durations and preserve repeated names as separate passages',()=>{
 const p=normalizeCustomProgression({steps:[{root:0,chord:'maj7',beats:3},{root:2,chord:'min7',bars:2,section:'A'},{root:7,chord:'dom7',beats:1,section:'A'}]});assert.deepEqual(rehearsalSections(p,3).map(s=>[s.name,s.start,s.end]),[['Opening',0,3],['A',3,9],['A',9,10]]);
 const restored=readPresets(JSON.stringify({version:1,items:[{id:'x',name:'Sections',controls:{},customProgression:p}]}));assert.equal(restored[0].customProgression.steps[1].section,'A');
 const html=chordSheet(['Cmaj7','Dm7','G7'],[3,6,1],3,{marks:['','A','<Bridge>']});assert.match(html,/&lt;Bridge&gt;/);assert.equal((html.match(/data-grid-beat=/g)||[]).length,10);
});
test('chart transfer validates atomically and retains keys, metre, durations and marks',()=>{
 const item={id:'one',name:' My chart ',key:9,beats:4,progression:REPERTOIRE_STUDIES[0].progression};const result=normalizeRepertoire({version:1,items:[item]});assert.equal(result[0].name,'My chart');assert.equal(result[0].progression.steps[4].section,'B · Subdominant');
 assert.throws(()=>normalizeRepertoire({version:2,items:[item]}));assert.throws(()=>normalizeRepertoire({version:1,items:[item,{...item,key:99}]}));assert.throws(()=>normalizeRepertoire({version:1,items:[item,item]}));assert.throws(()=>normalizeRepertoire({version:1,items:[{...item,progression:{steps:[]}}]}));
});
