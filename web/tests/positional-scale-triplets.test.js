import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt,progressionDefinition} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
const shapes=['C','A','G','E','D'];
const lineFor=(board,h)=>[...new Set(board.notes.filter(n=>h.scalePcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b);
const paths=(hs,ss)=>hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i%ss.length])),geometryShape:ss[i%ss.length]}));
const ordinal17=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,15,14,15,16,15,14,15];
// Independent reference: play the complete sweep, then repeat a fixed
// neighbour figure below its destination. Start the opposite form on the edge.
function form(line,down){
 const ordered=down?line.toReversed():line,edge=ordered.length-1,result=[...ordered];
 for(let i=0;result.length<24;i++)result.push(ordered[edge-[1,2,1,0][i%4]]);
 if(result.at(-1)===ordered.at(-1))result[result.length-1]=ordered[edge-2];
 return result;
}
test('all modes, twelve roots and five CAGED positions retain every pitch in fixed two-bar triplet forms',()=>{
 for(const [mode,def]of Object.entries(MODES))for(let key=0;key<12;key++)for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode,chord:def.chord}),hs=[h,h,h,h],positionPath=paths(hs,[shape]);
  const gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(h,shape),{study:'positionalscale',rhythm:'triplets',motion,positionPath});
  const line=lineFor(gs[0].board,h),down=motion==='descending',expected=[...form(line,down),...form(line,!down)],actual=gs.flatMap(g=>g.notes);
  assert.ok(line.length<=24&&line.length>=3);assert.deepEqual(actual.map(n=>n.midi),expected,`${mode} ${key} ${shape} ${motion}`);
  assert.deepEqual(gs.map(g=>g.phrasePhase),[0,12,24,36]);assert.ok(gs.every(g=>g.notes.length===12&&g.phraseHalfLength===24&&g.phraseCycleLength===48));
  assert.deepEqual(expected.slice(0,line.length),down?line.toReversed():line);assert.deepEqual(expected.slice(24,24+line.length),down?line:line.toReversed());
  for(let i=1;i<actual.length;i++)assert.notEqual(actual[i].midi,actual[i-1].midi);
  for(const g of gs)for(const n of g.notes){assert.equal(n.name,h.scaleNames[h.scalePcs.indexOf(n.pc)]);assert.ok(g.board.notes.some(p=>p.string===n.string&&p.fret===n.fret&&p.midi===n.midi));}
 }
});
test('the reported two-position Am7 chart starts its descending form at bar three and fills every triplet',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h,h,h];
 for(const motion of ['ascending','descending']){
  const gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(h,'C'),{study:'positionalscale',rhythm:'triplets',motion,positionPath:paths(hs,['C','C','A','A'])});
  for(let half=0;half<2;half++){
   const line=lineFor(gs[half*2].board,h),down=(motion==='descending')!==(half===1),ordered=down?line.toReversed():line;
   assert.equal(line.length,17);assert.deepEqual(gs.slice(half*2,half*2+2).flatMap(g=>g.notes.map(n=>n.midi)),ordinal17.map(i=>ordered[i]));
  }
  const plan=progressionStudyPlan(gs,[0,1,2,3],[1,1,1,1],4,'positionalscale','triplets');
  assert.equal(plan.events.length,48);assert.equal(plan.duration,16);assert.equal(plan.events[24].start,8);assert.equal(plan.events[24].note.midi,motion==='ascending'?lineFor(gs[2].board,h).at(-1):lineFor(gs[2].board,h)[0]);
  for(let i=0;i<48;i++){assert.ok(Math.abs(plan.events[i].start-i/3)<1e-10);assert.ok(Math.abs(plan.events[i].duration-1/3)<1e-10);}
 }
});
test('mid-sweep and turnaround changes retain phrase phase through mixed scale cardinalities and shapes',()=>{
 const cases=[['dorian','min13'],['mixolydian','dom13'],['major','maj9'],['minor_pentatonic','min7'],['whole_tone','dom9sharp5'],['harmonic_major','maj7']];
 const durations=[5,1,2,1,3,4];
 for(let key=0;key<12;key++)for(const motion of ['ascending','descending']){
  const hs=cases.map(([mode,chord],i)=>harmonyAt({key:(key+i*3)%12,mode,chord})),gs=progressionExerciseGroups(hs,durations,fretboardFor(hs[0],'C'),{study:'positionalscale',rhythm:'triplets',motion,positionPath:paths(hs,shapes)});
  let cursor=0;
  for(const g of gs){
   const line=lineFor(g.board,g.harmony),down=motion==='descending',cycle=[...form(line,down),...form(line,!down)];
   assert.equal(g.phrasePhase,cursor%48);assert.equal(g.notes.length,durations[g.slot]*3);
   assert.deepEqual(g.notes.map(n=>n.midi),g.notes.map((_,i)=>cycle[(cursor+i)%48]));
   assert.ok(g.notes.every(n=>g.harmony.scalePcs.includes(n.pc)));cursor+=g.notes.length;
  }
 }
});
test('splitting a repeated scale into bars never restarts the triplet phrase',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});
 const run=durations=>progressionExerciseGroups(durations.map(()=>h),durations,fretboardFor(h,'C'),{study:'positionalscale',rhythm:'triplets',positionPath:paths(durations.map(()=>h),['C'])}).flatMap(g=>g.notes.map(n=>n.midi));
 assert.deepEqual(run([1,2,4,1,3,5]),run([16]));
});


test('one-run triplets keep the existing full sweep without padded turnarounds',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h];
 const gs=progressionExerciseGroups(hs,[16,16],fretboardFor(h,'C'),{study:'positionalscale',rhythm:'triplets',stage:'cell',positionPath:paths(hs,['C'])});
 const line=lineFor(gs[0].board,h);assert.deepEqual(gs[0].notes.map(n=>n.midi),line);assert.deepEqual(gs[1].notes.map(n=>n.midi),line.toReversed().slice(1));assert.equal(gs[0].phraseStyle,undefined);
});


test('jazz, altered, modal and fourths progressions keep triplet phase through their actual scale guides',()=>{
 for(const template of ['major251essential','major251altered','modal_dorian','fourths1'])for(let key=0;key<12;key++)for(const motion of ['ascending','descending']){
  const setup={key,mode:'dorian',chord:'min7',progression:true,template,beats:4};
  const hs=progressionDefinition(setup).roman.map((_,i)=>harmonyAt(setup,i)),durations=hs.map((_,i)=>i%2?2:4);
  const gs=progressionExerciseGroups(hs,durations,fretboardFor(hs[0],'C'),{study:'positionalscale',rhythm:'triplets',motion,positionPath:paths(hs,shapes)});
  let cursor=0;for(const g of gs){const line=lineFor(g.board,g.harmony),down=motion==='descending',cycle=[...form(line,down),...form(line,!down)];assert.equal(g.phrasePhase,cursor%48);assert.deepEqual(g.notes.map(n=>n.midi),Array.from({length:durations[g.slot]*3},(_,i)=>cycle[(cursor+i)%48]));cursor+=g.notes.length;}
 }
});
