import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt,progressionDefinition} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
const shapes=['C','A','G','E','D'];
const lineFor=(board,h)=>[...new Set(board.notes.filter(n=>h.scalePcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b);
const paths=(hs,ss)=>hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i%ss.length])),geometryShape:ss[i%ss.length]}));
const ordinal17=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,15,14,13,12,13,14,15];
// Independent reference: enumerate one stepwise excursion and return, using
// each possible turning depth, then choose the nearest link to the entry.
function form(line,down,target=null){
 const ordered=down?line.toReversed():line,edge=ordered.length-1,remaining=24-ordered.length,arcs=[];
 for(let distance=1;distance<=edge;distance++){
  const path=[];for(let i=1;i<=distance;i++)path.push(ordered[edge-i]);
  for(let i=distance-1;path.length<remaining&&i>=1;i--)path.push(ordered[edge-i]);
  if(path.length===remaining&&distance<remaining)arcs.push(path);
 }
 arcs.sort((a,b)=>Math.abs(a.at(-1)-(target??ordered.at(-1)))-Math.abs(b.at(-1)-(target??ordered.at(-1))));
 return [...ordered,...arcs[0]];
}
function expectedChart(groups,durations,motion){
 let cursor=0;const rows=groups.map((g,i)=>{const start=cursor;cursor+=durations[i]*3;return {start,end:cursor,line:lineFor(g.board,g.harmony)};});
 return groups.map((g,slot)=>Array.from({length:durations[slot]*3},(_,i)=>{
  const attack=rows[slot].start+i,section=Math.floor(attack/24),down=(motion==='descending')!==(section%2===1),nextStart=(section+1)*24;
  const incoming=rows.find(row=>nextStart>=row.start&&nextStart<row.end),target=incoming?(down?incoming.line[0]:incoming.line.at(-1)):null;
  return form(rows[slot].line,down,target)[attack%24];
 }));
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
  for(const start of [0,24]){const tail=actual.slice(start+line.length-1,start+24).map(n=>n.midi),directions=tail.slice(1).map((m,i)=>Math.sign(m-tail[i])),runs=directions.filter((d,i)=>!i||d!==directions[i-1]);assert.deepEqual(runs,start===0?(down?[1,-1]:[-1,1]):(down?[-1,1]:[1,-1]));}
  for(const g of gs)for(const n of g.notes){assert.equal(n.name,h.scaleNames[h.scalePcs.indexOf(n.pc)]);assert.ok(g.board.notes.some(p=>p.string===n.string&&p.fret===n.fret&&p.midi===n.midi));}
 }
});
test('the reported two-position Am7 chart starts its descending form at bar three and fills every triplet',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h,h,h];
 for(const motion of ['ascending','descending']){
  const gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(h,'C'),{study:'positionalscale',rhythm:'triplets',motion,positionPath:paths(hs,['C','C','A','A'])});
  assert.deepEqual(gs.map(g=>g.notes.map(n=>n.midi)),expectedChart(gs,[4,4,4,4],motion));
  if(motion==='ascending'){const line=lineFor(gs[0].board,h);assert.deepEqual(gs.slice(0,2).flatMap(g=>g.notes.map(n=>n.midi)),ordinal17.map(i=>line[i]));}
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
   assert.equal(g.phrasePhase,cursor%48);assert.equal(g.notes.length,durations[g.slot]*3);
   assert.deepEqual(g.notes.map(n=>n.midi),expectedChart(gs,durations,motion)[g.slot]);
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
  let cursor=0;const expected=expectedChart(gs,durations,motion);for(const g of gs){assert.equal(g.phrasePhase,cursor%48);assert.deepEqual(g.notes.map(n=>n.midi),expected[g.slot]);cursor+=g.notes.length;}
 }
});


test('the reported upper C turnaround makes one wide arc and connects to the incoming descending D',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h,h,h];
 const gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(h,'D'),{study:'positionalscale',rhythm:'triplets',motion:'ascending',positionPath:paths(hs,['D','D','C','C'])});
 assert.deepEqual(gs[1].notes.slice(4).map(n=>n.name),['C','B','A','G','F♯','G','A','B']);
 assert.deepEqual(gs[2].notes.slice(0,3).map(n=>n.name),['D','C','B']);
});


test('the single return arc chooses the nearest available link to the actual incoming position',()=>{
 let improved=0;
 for(const from of shapes)for(const to of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h];
  const gs=progressionExerciseGroups(hs,[8,8],fretboardFor(h,from),{study:'positionalscale',rhythm:'triplets',motion,positionPath:paths(hs,[from,to])});
  const line=lineFor(gs[0].board,h),target=gs[1].notes[0].midi,canonical=form(line,motion==='descending').at(-1);
  const before=Math.abs(canonical-target),after=Math.abs(gs[0].notes.at(-1).midi-target);
  assert.ok(after<=before);if(after<before)improved++;
 }
 assert.ok(improved>0);
});

test('I to II to III to IV enters the top of III on bar three without carrying the ascending offset',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h,h,h];
 const gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(h,'D'),{study:'positionalscale',rhythm:'triplets',motion:'ascending',positionPath:paths(hs,['D','C','A','G'])});
 assert.deepEqual(gs.map(g=>g.position.numeral),['I','II','III','IV']);assert.deepEqual(gs.map(g=>g.phrasePhase),[0,12,24,36]);
 const incoming=lineFor(gs[2].board,h).toReversed();assert.deepEqual(gs[2].notes.slice(0,3).map(n=>n.midi),incoming.slice(0,3));assert.equal(gs[2].notes[0].midi,78);
 const plan=progressionStudyPlan(gs,[0,1,2,3],[1,1,1,1],4,'positionalscale','triplets');assert.equal(plan.events[24].start,8);assert.equal(plan.events[24].note.midi,78);
});
