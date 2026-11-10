import {test} from 'node:test';import assert from 'node:assert/strict';
import {studyPathPlan,normalizeStudyPath,readStudyPath,studyPathId,studyPair,studyModeChoices,STUDY_FORMS,STUDY_TURNAROUNDS,STUDY_ROOT_ORDERS,STUDY_MATERIALS} from '../src/practice/study-path.js';
import {MODES,CHORDS,progressionBeatDurations} from '../src/audio/music.js';
const length=p=>progressionBeatDurations({key:p.chart.key,beats:p.chart.beats,template:'custom',progression:true,customProgression:p.chart.progression}).reduce((a,b)=>a+b,0);
test('single-quality studies support both harmony workflows across all roots and modes',()=>{
 for(const mode of Object.keys(MODES)){
  const pair=studyPair(mode,'min7','mode');assert.equal(pair.mode,mode);assert.ok(studyModeChoices(pair.chord).some(m=>m.id===mode));
  for(let root=0;root<12;root++){
   const p=studyPathPlan({tier:1,root,...pair,route:'manual',position:'IV'});
   assert.deepEqual(p.positions,['IV']);assert.equal(p.harmonies[0].chordPcs[0],root);assert.equal(p.harmonies[0].mode,mode);
  }
 }
 for(const chord of Object.keys(CHORDS)){
  const pair=studyPair('dorian',chord,'chord');assert.equal(pair.chord,chord);assert.ok(studyModeChoices(chord).some(m=>m.id===pair.mode));
 }
});
test('root orders close their real cycles; all-roots coverage visits twelve unique keys',()=>{
 const cycles={fourths:12,fifths:12,minorThird:4,majorThird:3,whole:6,chromatic:12,tritone:2,random:12};
 for(let root=0;root<12;root++)for(const order of Object.keys(STUDY_ROOT_ORDERS))for(const coverage of [false,true]){
  const p=studyPathPlan({tier:2,root,order,coverage}),hs=p.harmonies;
  assert.equal(hs.length,coverage?12:cycles[order]);assert.equal(new Set(hs.map(h=>h.chordPcs[0])).size,hs.length);assert.equal(hs[0].chordPcs[0],root);
  assert.ok(hs.every(h=>h.mode==='dorian'&&h.chordId==='min7'));
 }
});
test('all tiers support manual per-slot routes and repeated passes without adjacency restrictions',()=>{
 for(const tier of [1,2,3,4]){
  const manual=studyPathPlan({tier,route:'manual',passes:3,manualPositions:['I','V','II'],position:'IV'});
  assert.equal(manual.navigation,'all');assert.equal(manual.positions.length,manual.chart.progression.steps.length);assert.deepEqual(manual.positions.slice(0,3),['I','V','II']);
  assert.equal(manual.selection.passes,Math.min(3,manual.maxPasses));assert.ok(manual.chart.progression.steps.length<=128);
  const fixed=studyPathPlan({tier,route:'region',region:'high',passes:2});assert.equal(fixed.navigation,'path');assert.equal(fixed.positions,null);
 }
 assert.deepEqual(studyPathPlan({route:'manual',passes:3,manualPositions:['I','IV','V']}).positions,['I','IV','V']);
 assert.equal(normalizeStudyPath({route:'framework'}).route,'manual');
});
test('mixed harmony patterns belong to tier three; tier two always retains one quality and mode',()=>{
 for(const turnaround of ['major251altered','minor251','backdoor','tritone251','turnaround']){
  assert.ok(Object.hasOwn(STUDY_TURNAROUNDS,turnaround));
  const p=studyPathPlan({tier:3,turnaround,root:9,bars:1});
  assert.equal(p.singleQuality,false);assert.ok(new Set(p.harmonies.map(h=>h.chordId)).size>1);
  for(const h of p.harmonies)assert.ok(h.chordPcs.every(pc=>h.scalePcs.includes(pc)),h.name+h.suffix);
  const single=studyPathPlan({tier:2,variation:turnaround,order:'majorThird',mode:'lydian',chord:'maj7',editContext:'keys',harmonyEdits:{1:{mode:'altered',chord:'dom7alt'}}});
  assert.equal(single.singleQuality,true);assert.equal(single.harmonies.length,3);assert.ok(single.harmonies.every(h=>h.mode==='lydian'&&h.chordId==='maj7'));
  const migrated=readStudyPath(JSON.stringify({selection:{tier:2,variation:turnaround,route:'manual',root:9}}));
  assert.equal(migrated.selection.tier,3);assert.equal(migrated.selection.turnaround,turnaround);assert.equal(migrated.selection.route,'manual');
 }
 assert.equal(readStudyPath(JSON.stringify({selection:{tier:2,variation:'single'}})).selection.tier,2);
 assert.deepEqual(studyPathPlan({tier:3,root:9}).chords,['Bm7','E7','Amaj7']);
});
test('selected harmony edits affect one slot, preserve roots/durations and are scoped to their pattern',()=>{
 for(const tier of [3,4]){
  const s={tier,turnaround:'minor251'},before=studyPathPlan(s);
  const p=studyPathPlan({...s,editContext:before.editContext,harmonyEdits:{1:{mode:'lydian',chord:'maj7'}}});
  assert.equal(p.harmonies[1].mode,'lydian');assert.equal(p.harmonies[1].chordId,'maj7');
  assert.equal(p.harmonies[1].chordPcs[0],before.harmonies[1].chordPcs[0]);assert.equal(length(p),length(before));
  assert.deepEqual(p.chart.progression.steps.filter((_,i)=>i!==1),before.chart.progression.steps.filter((_,i)=>i!==1));
  assert.deepEqual(studyPathPlan({...s,editContext:'other',harmonyEdits:{1:{mode:'lydian',chord:'maj7'}}}).chart,before.chart);
 }
});
test('complete forms preserve durations, split bars, sections, credits and user-chart content',()=>{
 for(const source of STUDY_FORMS){
  const p=studyPathPlan({tier:4,form:source.id,root:source.key});
  assert.deepEqual(p.chart.progression.steps,source.progression.steps);assert.equal(p.chart.beats,source.beats);
  assert.equal(p.chart.progression.sourceNotes,source.progression.sourceNotes);assert.deepEqual(p.chart.progression.sources,source.progression.sources);
 }
 const rhythm=studyPathPlan({tier:4,form:'form:rhythm'});assert.equal(length(rhythm),128);
 const custom={id:'saved:x',name:'My waltz',key:2,beats:3,progression:{name:'My waltz',steps:[{root:0,chord:'min7',mode:'dorian',beats:3,section:'A'},{root:7,chord:'dom7',mode:'mixolydian',beats:2}]}};
 const p=studyPathPlan({tier:4,form:custom.id,root:5,passes:2},[custom]);assert.equal(length(p),10);assert.equal(p.chart.key,5);assert.equal(p.chart.beats,3);assert.equal(p.chart.progression.steps[2].section,'Pass 2 · A');assert.equal(custom.progression.steps.length,2);
});
test('long duration multipliers stay within supported chart slots and preserve total time',()=>{
 for(const turnaround of ['three','minor251','backdoor','turnaround']){
  const a=studyPathPlan({tier:3,turnaround,bars:1}),b=studyPathPlan({tier:3,turnaround,bars:8});assert.equal(length(b),length(a)*8);
 }
});
test('marks track actual loaded material and route; malformed storage migrates safely',()=>{
 const s={tier:1,root:9,route:'manual',position:'II',material:'positional'},id=studyPathId(s);
 assert.equal(id,studyPathId({...s,region:'high',order:'tritone',turnaround:'four'}));
 for(const change of [{root:0},{position:'III'},{material:'thirds'},{bars:4},{tier:2},{passes:2}])assert.notEqual(id,studyPathId({...s,...change}));
 assert.deepEqual(readStudyPath(JSON.stringify({selection:s,marked:[id,id,null,123]})).marked,[id]);
 for(const raw of ['bad','null','[]'])assert.equal(readStudyPath(raw).selection.material,'positionalscale');
 assert.equal(normalizeStudyPath({tier:90,root:60,material:'removed'}).tier,1);
 for(const [material]of STUDY_MATERIALS){const p=studyPathPlan({material});assert.equal(p.study,material==='voicings'?'positional':material);assert.equal(p.view,material==='voicings'?'guitar':'exercises');}
});

test('circle of fourths cycles Tier 2 roots and complete Tier 3 phrases through all twelve keys',()=>{
 const tonics=[0,5,10,3,8,1,6,11,4,9,2,7];
 assert.deepEqual(studyPathPlan({tier:2,root:0,order:'fourths'}).harmonies.map(h=>h.chordPcs[0]),tonics);
 for(let root=0;root<12;root++)for(const turnaround of Object.keys(STUDY_TURNAROUNDS)){
  const single=studyPathPlan({tier:3,root,turnaround,bars:8}),circle=studyPathPlan({tier:3,root,turnaround,bars:8,keyCycle:'fourths',route:'manual'});
  const n=single.baseCount;assert.equal(circle.baseCount,n*12);assert.equal(length(circle),length(single)*12);assert.equal(circle.positions.length,n*12);
  assert.ok(circle.baseCount<=128);
  for(let k=0;k<12;k++)for(let i=0;i<n;i++){
   const h=circle.harmonies[k*n+i],original=single.harmonies[i];
   assert.equal(h.chordPcs[0],(original.chordPcs[0]+5*k)%12);assert.equal(h.chordId,original.chordId);assert.equal(h.mode,original.mode);
  }
  assert.equal(circle.chart.progression.steps.filter(s=>s.section).length,12);
 }
 const base=studyPathPlan({tier:3,root:0}),circle=studyPathPlan({tier:3,root:0,keyCycle:'fourths'});
 assert.deepEqual(circle.chords.slice(0,9),['Dm7','G7','Cmaj7','Gm7','C7','Fmaj7','Cm7','F7','B♭maj7']);
 assert.notEqual(base.editContext,circle.editContext);assert.notEqual(base.id,circle.id);
 assert.equal(readStudyPath(JSON.stringify({selection:{tier:3,keyCycle:'fourths'}})).selection.keyCycle,'fourths');
});
