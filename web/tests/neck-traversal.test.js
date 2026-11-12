import {test} from 'node:test';import assert from 'node:assert/strict';
import {DEFAULTS} from '../src/audio/engine.js';import {harmonyAt} from '../src/audio/music.js';import {TUNING} from '../src/guitar/fretboard.js';
import {normalizeTraversal,neckRouteBoard,routeCellNotes,STRING_SETS} from '../src/guitar/neck-traversal.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {withExerciseResolution,singleChordExercisePlan} from '../src/practice/exercise-resolution.js';import {exerciseFavouriteKey} from '../src/practice/exercise-favourites.js';
const harmony=(key=9)=>harmonyAt({...DEFAULTS,key,progression:false},0);
function generate(h,config,study='groups4',durations=[2048],extra={}){const board=neckRouteBoard(h,config);return progressionExerciseGroups(durations.map(()=>h),durations,board,{study,rhythm:'sixteenths',once:durations.length===1,boardFor:()=>board,positionPath:durations.map(()=>({neck:true})),...extra});}
test('route normalization bounds frets, rejects unknown string sets, and never defaults open',()=>{assert.equal(STRING_SETS.length,21);const v=normalizeTraversal({traversal:'diagonal',traversalStart:-3,traversalEnd:99,traversalStrings:'99'});assert.equal(v.traversalStrings,'0,1,2,3,4,5');assert.equal(v.traversalStart,1);assert.equal(v.traversalEnd,24);});
test('every adjacent string set supports physically accurate complete-cell traversal in all keys',()=>{
 for(let key=0;key<12;key++)for(const strings of STRING_SETS)for(const traversal of ['horizontal','diagonal']){
  if(traversal==='diagonal'&&strings.length===1)continue;
  const config={traversal,traversalStrings:strings.join(','),traversalStart:5,traversalEnd:17};
  const group=generate(harmony(key),config)[0];assert.ok(group.notes.length>0&&group.notes.length<1000);assert.ok(group.cellLengths.every(n=>n===4));
  assert.ok(group.sequenceDirections.includes(1)&&group.sequenceDirections.includes(-1));
  for(const n of group.notes){assert.ok(strings.includes(n.string));assert.equal(n.midi,TUNING[n.string]+n.fret);assert.ok(n.fret>=5&&n.fret<=17);}
 }
});
test('changing bar partition retains exact physical route and cell phase',()=>{
 const h=harmony(),config={traversal:'diagonal',traversalStrings:'0,1,2,3,4,5'};
 for(const study of ['groups3','groups4','thirds','harmonized']){
  const one=generate(h,config,study,[4],{once:false}),split=generate(h,config,study,[1.25,2.75],{once:false});
  const coords=groups=>groups.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret]));assert.deepEqual(coords(split),coords(one),study);
 }
});
test('route internal orders survive both travel directions and resolution stays on selected strings',()=>{
 const h=harmony(),config={traversal:'horizontal',traversalStrings:'0,1',traversalStart:5,traversalEnd:17};
 for(const motion of ['ascending','descending'])for(const sequenceOrder of ['normal','reverse','directional','directionalReverse']){
  const groups=generate(h,config,'thirds',[2048],{motion,sequenceOrder}),g=groups[0];
  for(let i=0;i<g.notes.length;i+=2){const ascending=g.notes[i+1].midi>g.notes[i].midi,travel=g.sequenceDirections[i/2];assert.equal(ascending,sequenceOrder==='normal'||sequenceOrder==='directional'&&travel===1||sequenceOrder==='directionalReverse'&&travel===-1);}
  const single=singleChordExercisePlan(groups,h,g.board,g.position,'thirds','sixteenths',4),resolved=withExerciseResolution(single.groups,single.plan);const n=resolved.groups.at(-1).notes[0];assert.ok([0,1].includes(n.string));assert.ok(n.fret>=5&&n.fret<=17);
 }
});
test('route recipes create distinct favourites; position bookmarks retain existing identity',()=>{
 const base={study:'groups4',material:'scale',motion:'ascending'},horizontal={...base,traversal:'horizontal',traversalStrings:'0,1'};
 assert.notEqual(exerciseFavouriteKey(base),exerciseFavouriteKey(horizontal));assert.notEqual(exerciseFavouriteKey(horizontal),exerciseFavouriteKey({...horizontal,traversalStrings:'1,2'}));assert.equal(exerciseFavouriteKey(base),exerciseFavouriteKey({...base,traversal:'position'}));
});
test('new chords adapt route notes and chromatic targets without escaping selected strings',()=>{
 const settings={...DEFAULTS,key:9,progression:true,template:'major251altered'},harmonies=[0,1,2].map(i=>harmonyAt(settings,i)),config={traversal:'diagonal',traversalStrings:'1,2,3,4',traversalStart:3,traversalEnd:20},anchor=neckRouteBoard(harmonies[0],config);
 for(const study of ['groups4','arpseq_groups4','harmonized','enclosures4','chromaticneighbors','pentatonic']){
  const groups=progressionExerciseGroups(harmonies,[5,3,8],anchor,{study,rhythm:'sixteenths',enclosureTarget:'all',enclosurePattern:'upper',boardFor:h=>neckRouteBoard(h,config),positionPath:harmonies.map(()=>({neck:true}))});
  for(const g of groups){assert.ok(g.notes.length,study);for(const n of g.notes){assert.ok([1,2,3,4].includes(n.string));assert.ok(n.fret>=3&&n.fret<=20);assert.equal(n.midi,TUNING[n.string]+n.fret);}for(const index of g.targetIndices)assert.ok(g.harmony.chordPcs.includes(g.notes[index].pc));}
 }
});
test('continuous route arpeggios use only core triad or seventh pitches, and retain backing harmony',async()=>{
 const {neckExerciseGroups}=await import('../src/practice/neck-exercises.js'),h=harmony();
 for(const material of ['triad','seventh'])for(const traversal of ['horizontal','diagonal']){
  const g=neckExerciseGroups([h],null,{study:'positional',material,traversal,traversalStrings:'0,1,2',rhythm:'sixteenths'})[0];
  assert.ok(g.notes.length>5&&g.notes.length<300);assert.equal(g.harmony,h);assert.ok(g.notes.every(n=>h.chordPcs.slice(0,material==='triad'?3:4).includes(n.pc)));
 }
});
