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
  const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:0,mode,chord:MODES[mode].chord})],gs=progressionExerciseGroups(hs,[duration,4],fretboardFor(hs[0],from),{study:'positionalscale',motion,rhythm:'sixteenths',positionPath:path(hs,[from,to])});let last=null,direction=motion==='ascending'?1:-1,pendingBoundary=false,pendingTurn=false;
  for(const g of gs){
   const pitches=available(g.board,g.harmony);if(g.slot>0&&pendingTurn)direction=-direction;
   for(const [index,n]of g.notes.entries()){
    let ahead=last===null?pitches:g.slot>0&&index===0&&pendingBoundary?[direction>0?pitches.at(-1):pitches[0]]:g.slot>0&&index===0&&(last===pitches[0]||last===pitches.at(-1))?[last]:pitches.filter(m=>(m-last)*direction>0);
    if(!ahead.length){direction=-direction;ahead=pitches.filter(m=>(m-last)*direction>0);}
    const expected=direction>0?Math.min(...ahead):Math.max(...ahead);assert.equal(n.midi,expected);assert.equal(n.name,g.harmony.scaleNames[g.harmony.scalePcs.indexOf(n.pc)]);last=n.midi;
   }
   const lastIndex=pitches.indexOf(last),nextIndex=lastIndex+direction;
   pendingBoundary=nextIndex===0||nextIndex===pitches.length-1;pendingTurn=nextIndex<0||nextIndex>=pitches.length;
  }
 }
});
test('one run per chord stops at the boundary and resumes the opposite form on the next repeated chord',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h],gs=progressionExerciseGroups(hs,[16,16],fretboardFor(h,'C'),{study:'positionalscale',stage:'cell',rhythm:'sixteenths',positionPath:path(hs,['C'])}),pitches=available(gs[0].board,h);
 assert.deepEqual(gs[0].notes.map(n=>n.midi),pitches);assert.deepEqual(gs[1].notes.map(n=>n.midi),pitches.toReversed().slice(1));
 const plan=progressionStudyPlan(gs,[0,1],[4,4],4,'positionalscale','sixteenths'),svg=progressionNotationSvg(plan,'Positional scale');assert.ok(svg.includes('Position II · D shape'));assert.ok(svg.includes('notation-rest'));
});

test('reported Am7 to Cm7 change rearticulates low-string C8 before ascending',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:0,mode:'dorian',chord:'min7'})],gs=progressionExerciseGroups(hs,[8,8],fretboardFor(hs[0],'C'),{study:'positionalscale',rhythm:'sixteenths',positionPath:path(hs,['C','D'])});
 assert.equal(gs[0].notes.at(-1).midi,48);assert.deepEqual(gs[1].notes.slice(0,4).map(n=>[n.name,n.midi]),[['C',48],['D',50],['E♭',51],['F',53]]);assert.deepEqual([gs[1].notes[0].string,gs[1].notes[0].fret],[0,8]);
 const plan=progressionStudyPlan(gs,[0,1],[2,2],4,'positionalscale','sixteenths');assert.equal(plan.events.find(e=>e.start===8).note.midi,48);
});
test('shared lower and upper endpoints are rearticulated across every scale family, key and changed shape',()=>{
 let checks=0;
 for(const [mode,definition]of Object.entries(MODES))for(let key=0;key<12;key++)for(const from of shapes)for(const to of shapes)if(from!==to)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode,chord:definition.chord}),before=available(fretboardFor(h,from),h),after=available(fretboardFor(h,to),h),ordered=motion==='ascending'?before:before.toReversed();
  for(const boundary of [after[0],after.at(-1)]){
   const index=ordered.indexOf(boundary);if(index<0)continue;
   const gs=progressionExerciseGroups([h,h],[(index+1)/4,1],fretboardFor(h,from),{study:'positionalscale',motion,rhythm:'sixteenths',positionPath:path([h,h],[from,to])});
   assert.equal(gs[0].notes.at(-1).midi,boundary);assert.equal(gs[1].notes[0].midi,boundary);assert.equal(gs[1].notes[1].midi,boundary===after[0]?after[1]:after.at(-2));
   assert.ok(gs[1].notes.every(n=>after.includes(n.midi)));checks++;
  }
 }
 assert.ok(checks>1000);
});

test('the complete parallel-minor chart retains its lower turns at all four harmonic entries',()=>{
 const hs=[0,1,2,3].map(i=>harmonyAt({key:9,mode:'dorian',chord:'min7',progression:true,template:'parallel2'},i)),gs=progressionExerciseGroups(hs,[8,8,8,8],fretboardFor(hs[0],'C'),{study:'positionalscale',rhythm:'sixteenths',positionPath:path(hs,['C','D','E','A'])});
 assert.deepEqual(gs.map(g=>g.notes[0].midi),[47,48,48,47]);
 for(const g of gs){const line=available(g.board,g.harmony),cycle=[...line,...line.slice(1,-1).toReversed()];assert.equal(cycle.length,32);assert.deepEqual(g.notes.map(n=>n.midi),cycle);}
 assert.deepEqual(gs[2].notes.slice(0,4).map(n=>[n.name,n.midi]),[['C',48],['D♭',49],['E♭',51],['F',53]]);
 assert.deepEqual(gs[3].notes.slice(0,4).map(n=>[n.name,n.midi]),[['B',47],['C♯',49],['D♯',51],['E',52]]);
});

test('pending upper and lower turns enter the corresponding new endpoint in every mode and key',()=>{
 for(const [mode,definition]of Object.entries(MODES))for(let key=0;key<12;key++)for(const from of shapes)for(const to of shapes)if(from!==to)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode,chord:definition.chord}),before=available(fretboardFor(h,from),h),after=available(fretboardFor(h,to),h),duration=(before.length-1)/4;
  const gs=progressionExerciseGroups([h,h],[duration,1],fretboardFor(h,from),{study:'positionalscale',motion,rhythm:'sixteenths',positionPath:path([h,h],[from,to])});
  assert.equal(gs[1].notes[0].midi,motion==='ascending'?after.at(-1):after[0]);assert.equal(gs[1].notes[1].midi,motion==='ascending'?after.at(-2):after[1]);
 }
});
