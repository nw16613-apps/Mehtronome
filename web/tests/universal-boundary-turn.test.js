import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor} from '../src/guitar/fretboard.js';import {hasRouteTurnOptions,traversalControls} from '../src/guitar/neck-traversal.js';import {neckExerciseGroups} from '../src/practice/neck-exercises.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {progressionStudyPlan} from '../src/practice/progression-timing.js';import {perStringExerciseGroups} from '../src/practice/per-string-exercises.js';
import {cagedStudy} from '../src/guitar/exercises.js';
const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),base={material:'seventh',traversalStrings:'0,1,2',traversalStart:5,traversalEnd:17,rhythm:'sixteenths',motion:'ascending',traversalTurn:'note'};
const stamp=gs=>gs.flatMap(g=>g.notes.map(n=>[n.midi,n.string,n.fret,!!n.boundaryRepeat]));
test('boundary choice is independent of material, family, order, position traversal and alternation',()=>{
 for(const traversal of ['position','horizontal','diagonal'])for(const traversalPositionOrder of ['follow','alternate'])for(const study of ['groups4','harmonized','enclosures4','positionalscale','positional','triadpairs'])for(const sequenceOrder of ['normal','reverse','alternate','directional']){
  const view={...base,traversal,traversalPositionOrder,study,sequenceOrder};assert.ok(hasRouteTurnOptions(view));assert.match(traversalControls(view),/id="exercise-neck-turn"/);assert.doesNotMatch(traversalControls(view,'guitar'),/id="guitar-neck-turn"/);
 }
});
test('all written cell orders keep complete motifs and repeat the outgoing note at a route turn',()=>{
 for(const traversal of ['horizontal','diagonal'])for(const motion of ['ascending','descending'])for(const study of ['groups3','groups4','digital1324','arpseq_groups3','harmonized','enclosures4','doubleapproach','chromaticneighbors','pentatonic'])for(const sequenceOrder of ['normal','reverse','alternate','directional']){
  const view={...base,traversal,motion,study,sequenceOrder,pattern:'groups3',arpeggioSource:'selectedChord',arpeggioPattern:'perm4_1357',enclosureTarget:'all',enclosurePattern:'upper'},groups=neckExerciseGroups([h],[128],view),split=neckExerciseGroups([h,h,h],[5.25,10.75,112],view);if(!['enclosures4','doubleapproach','chromaticneighbors'].includes(study))assert.deepEqual(stamp(groups),stamp(split),`${study} ${sequenceOrder} phase`);
  const g=groups[0];assert.ok(g.notes.length,study);g.notes.forEach((n,i)=>{if(n.boundaryRepeat){assert.ok(i>0);assert.deepEqual([n.midi,n.string,n.fret],[g.notes[i-1].midi,g.notes[i-1].string,g.notes[i-1].fret]);}});
  assert.ok(g.sequenceDirections.some((d,i,a)=>i&&d!==a[i-1]),`${study} ${sequenceOrder} must turn`);
  let offset=0;g.cellLengths.forEach((length,i)=>{if(i&&g.sequenceDirections[i]!==g.sequenceDirections[i-1])assert.equal(g.notes[offset].midi,g.notes[offset-1].midi,`${study} ${sequenceOrder} repeat at turn`);offset+=length;});
  const plan=progressionStudyPlan(groups,[0],[32],4,study,'sixteenths');assert.ok(plan.events.length);assert.equal(g.cellLengths.reduce((a,b)=>a+b,0),g.notes.length);
 }
});
test('triad-pair return contours respect repeating or sharing their endpoint',()=>{
 const board=fretboardFor(h,'E');for(const motion of ['up-down','down-up']){
  const run=traversalTurn=>progressionExerciseGroups([h],[32],board,{...base,study:'triadpairs',motion,traversalTurn})[0];
  const repeated=run('note'),shared=run('position');assert.equal(repeated.notes[23].midi,repeated.notes[24].midi);assert.notEqual(shared.notes[23].midi,shared.notes[24].midi);
  const staticRepeat=cagedStudy(board,h,'triadpairs','triad',motion,{traversalTurn:'note'}).flatMap(g=>g.notes),staticShared=cagedStudy(board,h,'triadpairs','triad',motion,{traversalTurn:'position'}).flatMap(g=>g.notes);assert.equal(staticRepeat[23].midi,staticRepeat[24].midi);assert.notEqual(staticShared[23].midi,staticShared[24].midi);assert.equal(staticRepeat.length,staticShared.length+1);
 }
});
test('selected CAGED scale and arpeggio traversals repeat both endpoints at every subdivision',()=>{
 const board=fretboardFor(h,'E');for(const study of ['positionalscale','positional'])for(const rhythm of ['eighths','triplets','sixteenths'])for(const motion of ['ascending','descending']){
  const v={...base,study,rhythm,motion},g=progressionExerciseGroups([h],[32],board,v)[0],ns=g.notes.map(n=>n.midi),duplicates=ns.filter((n,i)=>i&&n===ns[i-1]);assert.ok(duplicates.includes(Math.min(...ns)),`${study} bottom`);assert.ok(duplicates.includes(Math.max(...ns)),`${study} top`);
 }
});
test('every selected fingering repeats the turning endpoint without changing its string or fret',()=>{
 for(const fingering of ['three','oneTwo','twoOne','drop2','drop3','spread'])for(const motion of ['ascending','descending']){
  const v={...base,study:'positional',fingering,inversion:0,fingeringFret:5,material:fingering==='spread'?'triad':'seventh',exactFingering:true,motion},groups=perStringExerciseGroups([h],[32],[{}],v),ns=groups[0].notes;assert.ok(ns.length,fingering);assert.ok(ns.some((n,i)=>i&&n.midi===ns[i-1].midi&&n.string===ns[i-1].string&&n.fret===ns[i-1].fret),fingering);
  assert.deepEqual(stamp(groups),stamp(perStringExerciseGroups([h,h],[5,27],[{},{}],v)));
 }
});
