import {test} from 'node:test';import assert from 'node:assert/strict';
import {studyPathPlan,normalizeStudyPath,readStudyPath,studyPathId,STUDY_ROOT_ORDERS,STUDY_MATERIALS} from '../src/practice/study-path.js';
import {harmonyAt} from '../src/audio/music.js';
function harmonies(plan){return plan.chart.progression.steps.map((_,i)=>harmonyAt({key:plan.chart.key,mode:'dorian',chord:'min7',template:'custom',progression:true,customProgression:plan.chart.progression},i));}
test('tier one and two preserve Dorian/minor-7 harmony across all starting roots and exact interval cycles',()=>{
 const cycles={fourths:12,fifths:12,minorThird:4,majorThird:3,whole:6,chromatic:12,tritone:2};
 for(let root=0;root<12;root++){
  const vamp=studyPathPlan({root,tier:1,position:'IV',material:'arpgroups4'});assert.equal(vamp.chart.progression.steps.length,1);assert.deepEqual(vamp.positions,['IV']);assert.equal(vamp.study,'arpgroups4');assert.equal(harmonies(vamp)[0].chordPcs[0],root);
  for(const order of Object.keys(STUDY_ROOT_ORDERS))for(const coverage of [false,true]){
   const p=studyPathPlan({tier:2,root,order,coverage}),hs=harmonies(p);assert.equal(hs.length,coverage?12:cycles[order]);assert.equal(new Set(hs.map(h=>h.chordPcs[0])).size,hs.length);assert.equal(hs[0].chordPcs[0],root);
   for(const h of hs){assert.equal(h.mode,'dorian');assert.equal(h.chordId,'min7');assert.ok(h.chordPcs.every(pc=>h.scalePcs.includes(pc)));}
  }
 }
});
test('framework and region approaches are distinct; turnarounds have a real tonal tonic and compatible modes',()=>{
 const fixed=studyPathPlan({tier:2,position:'V'}),regional=studyPathPlan({tier:2,route:'region',region:'high'});assert.equal(fixed.navigation,'all');assert.ok(fixed.positions.every(n=>n==='V'));assert.equal(regional.navigation,'path');assert.equal(regional.positions,null);
 for(let root=0;root<12;root++)for(const turnaround of ['two','three','four']){
  const p=studyPathPlan({tier:3,root,turnaround}),hs=harmonies(p);assert.equal(p.chart.key,(root+10)%12);assert.equal(p.navigation,'path');assert.equal(hs.find(h=>h.mode==='dorian').chordPcs[0],root);assert.equal(hs.length,{two:2,three:3,four:4}[turnaround]);
  for(const h of hs)assert.ok(h.chordPcs.every(pc=>h.scalePcs.includes(pc)));
  if(turnaround!=='two'){assert.equal(hs.at(-1).chordId,'maj7');assert.equal(hs.at(-1).chordPcs[0],p.chart.key);}
 }
 assert.deepEqual(studyPathPlan({tier:3,root:9}).chords,['Am7','D7','Gmaj7']);
});
test('study marks are scoped to the selected study, not hidden controls; storage handles malformed data',()=>{
 const s={tier:1,root:9,position:'II',material:'positional'};
 assert.equal(studyPathId(s),studyPathId({...s,region:'high',order:'tritone',turnaround:'four'}));
 for(const change of [{root:0},{position:'III'},{material:'thirds'},{bars:4},{tier:2}])assert.notEqual(studyPathId(s),studyPathId({...s,...change}));
 assert.equal(studyPathId({tier:2,route:'region',region:'high',position:'II'}),studyPathId({tier:2,route:'region',region:'high',position:'V'}));
 const id=studyPathId(s),data=readStudyPath(JSON.stringify({selection:s,marked:[id,id,null,123,'bad']}));assert.deepEqual(data.marked,[id]);assert.equal(data.selection.position,'II');
 for(const raw of ['bad','null','[]'])assert.equal(readStudyPath(raw).selection.material,'positionalscale');
 const bad=normalizeStudyPath({tier:90,root:60,position:'<script>',material:'removed',region:'missing',bars:-1});assert.equal(bad.tier,1);assert.equal(bad.root,9);assert.equal(bad.material,'positionalscale');
 for(const [material]of STUDY_MATERIALS)assert.equal(studyPathPlan({material}).study,material);
});
