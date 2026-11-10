import {test} from 'node:test';import assert from 'node:assert/strict';
import {studyPathPlan,normalizeStudyPath,readStudyPath,STUDY_PATH_KEY} from '../src/practice/study-path.js';
import {randomizeStudy,normalizeStudyRandomizer} from '../src/practice/study-randomizer.js';
import {generatorModes} from '../src/practice/progression-generator.js';
import {Engine,DEFAULTS} from '../src/audio/engine.js';
const random=(value,seed=1729)=>{const s=normalizeStudyPath(value),p=studyPathPlan(s);return studyPathPlan(randomizeStudy(s,p,seed));};
test('random keys and changing-key decks preserve the selected quality/mode, route, passes and exact slot count',()=>{
 for(const tier of [1,2]){
  const p=random({tier,root:9,mode:'lydian',chord:'maj7',route:'manual',manualPositions:['V','II','IV'],passes:2,bars:1,randomizer:{roots:[0,2,7],count:8}});
  assert.equal(p.chart.key===9,false);assert.equal(p.baseCount,tier===1?1:8);assert.equal(p.chords.length,p.baseCount*2);assert.ok(p.harmonies.every(h=>h.chordId==='maj7'&&h.mode==='lydian'));assert.ok(p.harmonies.every(h=>[0,2,7].includes(h.chordPcs[0])));assert.deepEqual(p.positions.slice(0,3),['V','II','IV'].slice(0,p.positions.length));
  if(tier===2)assert.equal(new Set(p.harmonies.slice(0,3).map(h=>h.chordPcs[0])).size,3);
 }
 assert.deepEqual(random({tier:2},9),random({tier:2},9));assert.notDeepEqual(random({tier:2},9).chords,random({tier:2},456).chords);
});
test('independent chords obey quality and compatible-mode pools without changing the manual transition route',()=>{
 const p=random({tier:3,route:'manual',manualPositions:['I','V'],randomizer:{roots:[0],qualities:['min7','dom7'],modes:['dorian','mixolydian'],count:16}});
 for(let i=0;i<p.harmonies.length;i++){const h=p.harmonies[i];assert.equal(h.chordPcs[0],0);assert.ok(['min7','dom7'].includes(h.chordId));assert.ok(generatorModes(h.chordId).some(m=>m.id===h.mode));if(i)assert.notEqual(h.chordId,p.harmonies[i-1].chordId);assert.equal(p.positions[i],['I','V','I'][i%3]);}
 assert.throws(()=>random({tier:3,randomizer:{qualities:['maj7'],modes:['locrian']}}),/compatible/);
 assert.throws(()=>random({tier:1,randomizer:{roots:[]}}),/eligible/);
});
test('related changes reuse the Harmony generator vocabulary and retain valid chord-scale pairs',()=>{
 for(const tonality of ['major','minor'])for(const complexity of ['diatonic','borrowed','secondary','substitutions']){
  const p=random({tier:3,randomizer:{approach:'related',roots:[2,7],count:8,tonality,complexity}});assert.equal(p.baseCount,8);assert.ok([2,7].includes(p.chart.key));assert.ok(new Set(p.harmonies.map(h=>h.chordId)).size>1);for(const h of p.harmonies)assert.ok(generatorModes(h.chordId).some(m=>m.id===h.mode));
 }
});
test('Tier 4 changes only key and preserves complete forms, written melodies and route lengths across passes',()=>{
 for(const form of ['standard:autumn-leaves','reference:traditionalJazz','modal:soWhat']){
  const before=studyPathPlan({tier:4,form,passes:2,root:9,route:'manual',manualPositions:['II','V']}),p=randomizeStudy(before.selection,before,99),after=studyPathPlan(p);
  assert.notEqual(after.chart.key,before.chart.key);assert.deepEqual(after.chart.progression.steps,before.chart.progression.steps);assert.equal(after.chart.progression.standardMelody,before.chart.progression.standardMelody);assert.equal(after.baseCount,before.baseCount);assert.equal(after.positions.length,before.positions.length);
 }
});
test('generated preview survives storage and ordinary root/mode/duration edits; tier changes clear unrelated generated charts',()=>{
 const p=random({tier:2,bars:1,region:'high',randomizer:{count:4,auto:true,every:3}}),stored=readStudyPath(JSON.stringify({selection:p.selection}));assert.deepEqual(studyPathPlan(stored.selection).chart,p.chart);assert.equal(stored.selection.randomizer.every,3);
 const edited=studyPathPlan({...stored.selection,mode:'mixolydian',chord:'dom7',bars:4});assert.ok(edited.harmonies.every(h=>h.chordId==='dom7'));assert.ok(edited.chart.progression.steps.every(s=>(s.beats??s.bars*4)===16));assert.equal(edited.selection.region,'high');assert.equal(normalizeStudyPath({...p.selection,tier:1}).randomChart,null);
 assert.equal(normalizeStudyRandomizer({every:999,count:999}).every,16);
});
test('automatic study boundaries stop before the next old-chart beat, independent of block size and count-in',()=>{
 for(const countIn of [false,true])for(const block of [127,1024]){
  const e=new Engine(8000);e.configure({...DEFAULTS,countIn,bpm:120,beats:4,studyRepeatBeats:8,click:0,harmony:0});e.reset();const beats=[],events=[];for(let i=0;i<56000;i+=block)e.render(new Float32Array(Math.min(block,56000-i)),b=>beats.push(b),null,null,undefined,null,undefined,null,event=>events.push(event));
  assert.equal(events.filter(e=>e.type==='study-repeat').length,1);assert.deepEqual(beats.filter(b=>!b.counting).map(b=>b.musicalBeat),[0,1,2,3,4,5,6,7]);assert.equal(e.running,false);
 }
});
