import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,POSITIONS} from '../src/guitar/fretboard.js';import {progressionPositionPath,manualPositionPath,FRET_REGIONS} from '../src/guitar/position-path.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
test('manual choices edit only one actual chord position, retain other choices and survive a serialized round trip',()=>{
 for(let key=0;key<12;key++){
  const h=[0,1,2].map(i=>harmonyAt({key,progression:true,template:'major251essential'},i)),auto=progressionPositionPath(h),seed=manualPositionPath(h,auto),edited=manualPositionPath(h,auto,seed.value,{step:1,numeral:'V'});
  assert.equal(edited.path[1].numeral,'V');assert.deepEqual(edited.path[0],seed.path[0]);assert.deepEqual(edited.path[2],seed.path[2]);
  const second=manualPositionPath(h,auto,edited.value,{step:0,numeral:'II'});assert.equal(second.path[1].numeral,'V');assert.equal(second.path[0].numeral,'II');assert.deepEqual(manualPositionPath(h,progressionPositionPath(h,FRET_REGIONS.high),second.value).path,second.path);
  const groups=progressionExerciseGroups(h,[4,4,8],fretboardFor(h[0],'E'),{study:'harmonized',positionPath:second.path});for(let i=0;i<h.length;i++){assert.equal(groups[i].position.numeral,second.path[i].numeral);assert.deepEqual(groups[i].board.notes,fretboardFor(h[i],second.path[i].geometryShape).notes);}
  assert.ok(second.value.length<=120);
 }
});
test('unrelated harmonic context and malformed saved choices seed a fresh route without stale slot assignments',()=>{
 const h=[0,1,2].map(i=>harmonyAt({key:0,progression:true,template:'major251essential'},i)),auto=progressionPositionPath(h),saved=manualPositionPath(h,auto,'',{step:0,numeral:'V'});
 for(const raw of ['', 'bad', saved.value.slice(0,-1),saved.value+'9'])assert.deepEqual(manualPositionPath(h,auto,raw).path,auto);
 const other=h.toReversed(),otherAuto=progressionPositionPath(other);assert.deepEqual(manualPositionPath(other,otherAuto,saved.value).path,otherAuto);
 assert.deepEqual(manualPositionPath(h,auto,saved.value,{step:99,numeral:'I'}).path,saved.path);
});
