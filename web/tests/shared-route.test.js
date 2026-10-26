import {test} from 'node:test';import assert from 'node:assert/strict';import {DEFAULTS} from '../src/audio/engine.js';import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,TUNING} from '../src/guitar/fretboard.js';import {progressionPositionPath,FRET_REGIONS} from '../src/guitar/position-path.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';import {alignedProgressionGroups} from '../src/guitar/exercises.js';
test('supplied Guitar route determines adaptive and guide-tone exercise coordinates across keys and regions',()=>{
 for(let key=0;key<12;key++)for(const region of Object.values(FRET_REGIONS)){
 const h=[0,1,2].map(i=>harmonyAt({...DEFAULTS,key,progression:true,template:'major251essential'},i)),path=progressionPositionPath(h,region),anchor=fretboardFor(h[0],'C'),boards=path.map((p,i)=>fretboardFor(h[i],p.geometryShape));
 const groups=progressionExerciseGroups(h,[4,4,8],anchor,{study:'grip',positionPath:path});
 const guides=alignedProgressionGroups(anchor,h,'guidetones','seventh','ascending',boards);
 for(let i=0;i<groups.length;i++){assert.equal(groups[i].position,path[i]);assert.equal(groups[i].board.start,boards[i].start);assert.equal(groups[i].board.end,boards[i].end);for(const note of [...groups[i].notes,...guides[i].notes]){assert.equal(note.midi,TUNING[note.string]+note.fret);assert.ok(note.fret>=boards[i].start&&note.fret<=boards[i].end);assert.ok(h[i].chordPcs.includes(note.pc));}}
 }
});
