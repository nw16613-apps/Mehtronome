import {test} from 'node:test';import assert from 'node:assert/strict';
import {DEFAULTS} from '../src/audio/engine.js';import {harmonyAt} from '../src/audio/music.js';import {fretboardFor} from '../src/guitar/fretboard.js';import {cagedStudy} from '../src/guitar/exercises.js';import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const patterns=['perm3_513','perm3_135','perm4_1357','cell3_1353','cell4_13573','wideSkips','inversionCycle','connected','approachEach'];
test('new cell families turn at the nearest root/target without replaying the boundary or jumping across the position',()=>{
 for(const key of [0,9])for(const shape of ['E','C','A'])for(const motion of ['ascending','descending'])for(const arpeggioRegister of ['up','down','alternating'])for(const pattern of patterns){
  const h=harmonyAt({...DEFAULTS,key,chord:'min7',mode:'dorian',progression:false}),board=fretboardFor(h,shape),position={geometryShape:shape},material=/3_/.test(pattern)?'triad':'seventh',options={study:'harmonized',material,motion,rhythm:'sixteenths',arpeggioPattern:pattern,arpeggioRegister};
  const groups=progressionExerciseGroups(Array(16).fill(h),Array(16).fill(4),board,{...options,positionPath:Array(16).fill(position)}),trace=[];
  for(const g of groups)for(let i=0;i<g.sequenceAnchors.length;i++)if(!g.cellOffsets[i])trace.push({anchor:g.sequenceCursors[i],direction:g.sequenceDirections[i]});
  for(let i=1;i<trace.length;i++)if(trace[i].direction!==trace[i-1].direction){
   const {anchor,direction}=trace[i-1],next=trace[i],cells=cagedStudy(board,h,options.study,material,next.direction>0?'ascending':'descending',{...options}),roots=[...new Set(cells.map(c=>c.sequenceCursor??c.sequenceAnchor))],forward=roots.filter(a=>(a-anchor)*next.direction>0).sort((a,b)=>(a-b)*next.direction);
   if(forward.length)assert.equal(next.anchor,forward[0],`${key} ${shape} ${pattern} ${motion} ${arpeggioRegister}`);
   if(roots.length>1)assert.notEqual(next.anchor,anchor,'boundary root must not repeat');
  }
  for(const g of groups)for(const n of g.notes)assert.ok(n.fret>=board.start&&n.fret<=board.end);
 }
});
test('four- and five-note enclosures skip the completed boundary target on each turn',()=>{
 for(const study of ['enclosures4','enclosures5'])for(const motion of ['ascending','descending']){
  const h=harmonyAt({...DEFAULTS,key:9,chord:'min7',mode:'dorian',progression:false}),board=fretboardFor(h,'E'),position={geometryShape:'E'},gs=progressionExerciseGroups(Array(12).fill(h),Array(12).fill(4),board,{study,motion,rhythm:'sixteenths',positionPath:Array(12).fill(position)}),trace=gs.flatMap(g=>g.sequenceAnchors.map((anchor,i)=>({anchor,direction:g.sequenceDirections[i]})));
  for(let i=1;i<trace.length;i++)if(trace[i].direction!==trace[i-1].direction)assert.ok((trace[i].anchor-trace[i-1].anchor)*trace[i].direction>0);
 }
});
