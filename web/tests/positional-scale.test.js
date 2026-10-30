import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {cagedStudy} from '../src/guitar/exercises.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
import {progressionNotationSvg} from '../src/practice/progression-notation.js';
const shapes=['C','A','G','E','D'];
const available=(board,h)=>[...new Set(board.notes.filter(n=>h.scalePcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b);
const path=(hs,ss)=>hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i%ss.length])),geometryShape:ss[i%ss.length]}));
test('plain scale includes every actual scale pitch, with correct spelling, in every mode, key and CAGED shape',()=>{
 for(const [mode,def] of Object.entries(MODES))for(let key=0;key<12;key++)for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode,chord:def.chord}),board=fretboardFor(h,shape),notes=cagedStudy(board,h,'positionalscale','seventh',motion).flatMap(g=>g.notes),expected=available(board,h);
  assert.deepEqual(notes.map(n=>n.midi),motion==='ascending'?expected:expected.toReversed());
  for(const n of notes){assert.equal(n.name,h.scaleNames[h.scalePcs.indexOf(n.pc)]);assert.ok(board.notes.some(p=>p.string===n.string&&p.fret===n.fret&&p.midi===n.midi));}
 }
});
test('continuous scale traverses the whole range without duplicate endpoints at all subdivisions',()=>{
 for(const shape of shapes)for(const motion of ['ascending','descending'])for(const [rhythm,division]of [['eighths',2],['triplets',3],['sixteenths',4]]){
  const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=Array(4).fill(h),gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(h,shape),{study:'positionalscale',motion,rhythm,positionPath:path(hs,[shape])});
  const line=available(gs[0].board,h),ordered=motion==='ascending'?line:line.toReversed(),cycle=[...ordered,...ordered.slice(1,-1).toReversed()];
  assert.deepEqual(gs.flatMap(g=>g.notes.map(n=>n.midi)),Array.from({length:16*division},(_,i)=>cycle[i%cycle.length]));
  assert.ok(gs.every(g=>g.notes.length===4*division));assert.equal(progressionStudyPlan(gs,[0,1,2,3],[1,1,1,1],4,'positionalscale',rhythm).duration,16);
 }
});
test('chord, scale and position changes continue to the nearest pitch ahead and turn only at the range boundary',()=>{
 for(const mode of Object.keys(MODES))for(const from of shapes)for(const to of shapes)for(const motion of ['ascending','descending'])for(const duration of [1,2,4]){
  const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:0,mode,chord:MODES[mode].chord})],gs=progressionExerciseGroups(hs,[duration,4],fretboardFor(hs[0],from),{study:'positionalscale',motion,rhythm:'sixteenths',positionPath:path(hs,[from,to])});let last=null,direction=motion==='ascending'?1:-1;
  for(const g of gs){const pitches=available(g.board,g.harmony);for(const n of g.notes){let ahead=last===null?pitches:pitches.filter(m=>(m-last)*direction>0);if(!ahead.length){direction=-direction;ahead=pitches.filter(m=>(m-last)*direction>0);}const expected=direction>0?Math.min(...ahead):Math.max(...ahead);assert.equal(n.midi,expected);assert.equal(n.name,g.harmony.scaleNames[g.harmony.scalePcs.indexOf(n.pc)]);last=n.midi;}}
 }
});
test('one run per chord stops at the boundary and resumes the opposite form on the next repeated chord',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h],gs=progressionExerciseGroups(hs,[16,16],fretboardFor(h,'C'),{study:'positionalscale',stage:'cell',rhythm:'sixteenths',positionPath:path(hs,['C'])}),pitches=available(gs[0].board,h);
 assert.deepEqual(gs[0].notes.map(n=>n.midi),pitches);assert.deepEqual(gs[1].notes.map(n=>n.midi),pitches.toReversed().slice(1));
 const plan=progressionStudyPlan(gs,[0,1],[4,4],4,'positionalscale','sixteenths'),svg=progressionNotationSvg(plan,'Positional scale');assert.ok(svg.includes('Position II · D shape'));assert.ok(svg.includes('notation-rest'));
});
