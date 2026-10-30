import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt,progressionDefinition} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
const shapes=['C','A','G','E','D'];
const lineFor=(board,h)=>[...new Set(board.notes.filter(n=>h.scalePcs.includes(n.pc)).map(n=>n.midi))].sort((a,b)=>a-b);
const paths=(hs,ss)=>hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i%ss.length])),geometryShape:ss[i%ss.length]}));
function expectedForm(line,down){
 const ordered=down?line.toReversed():line;
 const pad=run=>Array.from({length:12},(_,i)=>run[Math.max(0,i-(12-run.length))]);
 return [...pad(ordered.slice(0,12)),...pad(ordered.slice(Math.max(0,ordered.length-13),-1))];
}
const cycle=(g,motion)=>{const line=lineFor(g.board,g.harmony),down=motion==='descending';return [...expectedForm(line,down),...expectedForm(line,!down)];};
test('all modes, twelve roots and five CAGED positions use complete overlapping runs with no internal reversal',()=>{
 for(const [mode,def]of Object.entries(MODES))for(let key=0;key<12;key++)for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode,chord:def.chord}),hs=[h,h,h,h],gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(h,shape),{study:'positionalscale',rhythm:'triplets',motion,positionPath:paths(hs,[shape])});
  const available=lineFor(gs[0].board,h);assert.ok(available.length<=24);
  assert.deepEqual(gs.flatMap(g=>g.notes.map(n=>n.midi)),cycle(gs[0],motion),`${mode} ${key} ${shape} ${motion}`);
  assert.deepEqual(gs.map(g=>g.phrasePhase),[0,12,24,36]);
  for(let bar=0;bar<4;bar++){
   const g=gs[bar],down=(motion==='descending')!==(bar>=2);assert.equal(g.notes.length,12);assert.equal(g.phraseHalfLength,24);assert.equal(g.phraseCycleLength,48);
   for(let i=1;i<12;i++){const delta=g.notes[i].midi-g.notes[i-1].midi;assert.ok(down?delta<=0:delta>=0);if(available.length>=13)assert.notEqual(delta,0);}
   for(const n of g.notes){assert.equal(n.name,h.scaleNames[h.scalePcs.indexOf(n.pc)]);assert.ok(g.board.notes.some(p=>p.string===n.string&&p.fret===n.fret&&p.midi===n.midi));}
  }
  assert.deepEqual([...new Set(gs.flatMap(g=>g.notes.map(n=>n.midi)))].sort((a,b)=>a-b),available);
  assert.equal(gs[1].notes.at(-1).midi,motion==='ascending'?available.at(-2):available[1]);assert.equal(gs[2].notes[0].midi,motion==='ascending'?available.at(-1):available[0]);assert.equal(gs[3].notes.at(-1).midi,motion==='ascending'?available[1]:available.at(-2));
 }
});
test('reported A Dorian Position I begins bar two on E and reserves the top C for the descending form',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h,h,h],gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(h,'D'),{study:'positionalscale',rhythm:'triplets',motion:'ascending',positionPath:paths(hs,['D'])});
 assert.deepEqual(gs[0].notes.map(n=>n.midi),[45,47,48,50,52,54,55,57,59,60,62,64]);
 assert.deepEqual(gs[1].notes.map(n=>n.midi),[52,54,55,57,59,60,62,64,66,67,69,71]);
 assert.deepEqual([gs[1].notes[0].name,gs[1].notes[0].string,gs[1].notes[0].fret],['E',1,7]);
 assert.deepEqual(gs[2].notes.map(n=>n.midi),[72,71,69,67,66,64,62,60,59,57,55,54]);assert.deepEqual(gs[3].notes.map(n=>n.midi),[66,64,62,60,59,57,55,54,52,50,48,47]);
 const plan=progressionStudyPlan(gs,[0,1,2,3],[1,1,1,1],4,'positionalscale','triplets');assert.equal(plan.events.length,48);assert.equal(plan.events[12].start,4);assert.equal(plan.events[24].start,8);
 for(let i=0;i<48;i++)assert.ok(Math.abs(plan.events[i].start-i/3)<1e-10);
});
test('I-II-III-IV assigned positions retain phase and start bar three at the top of III',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h,h,h];
 for(const motion of ['ascending','descending']){
  const gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(h,'D'),{study:'positionalscale',rhythm:'triplets',motion,positionPath:paths(hs,['D','C','A','G'])});
  assert.deepEqual(gs.map(g=>g.position.numeral),['I','II','III','IV']);
  gs.forEach((g,i)=>assert.deepEqual(g.notes.map(n=>n.midi),cycle(g,motion).slice(i*12,i*12+12)));
  const incoming=lineFor(gs[2].board,h);assert.equal(gs[2].notes[0].midi,motion==='ascending'?incoming.at(-1):incoming[0]);
 }
});
test('mixed chord qualities, scale cardinalities and positions keep run phase at mid-bar changes',()=>{
 const cases=[['dorian','min13'],['mixolydian','dom13'],['major','maj9'],['minor_pentatonic','min7'],['whole_tone','dom9sharp5'],['harmonic_major','maj7']],durations=[5,1,2,1,3,4];
 for(let key=0;key<12;key++)for(const motion of ['ascending','descending']){
  const hs=cases.map(([mode,chord],i)=>harmonyAt({key:(key+i*3)%12,mode,chord})),gs=progressionExerciseGroups(hs,durations,fretboardFor(hs[0],'C'),{study:'positionalscale',rhythm:'triplets',motion,positionPath:paths(hs,shapes)});let cursor=0;
  for(const g of gs){const expected=cycle(g,motion);assert.equal(g.phrasePhase,cursor%48);assert.deepEqual(g.notes.map(n=>n.midi),Array.from({length:durations[g.slot]*3},(_,i)=>expected[(cursor+i)%48]));cursor+=g.notes.length;}
 }
});
test('splitting a repeated scale into slots does not restart a run',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),run=durations=>progressionExerciseGroups(durations.map(()=>h),durations,fretboardFor(h,'C'),{study:'positionalscale',rhythm:'triplets',positionPath:paths(durations.map(()=>h),['C'])}).flatMap(g=>g.notes.map(n=>n.midi));assert.deepEqual(run([1,2,4,1,3,5]),run([16]));
});
test('one-run scope retains the existing unpadded scale traversal',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),hs=[h,h],gs=progressionExerciseGroups(hs,[16,16],fretboardFor(h,'C'),{study:'positionalscale',rhythm:'triplets',stage:'cell',positionPath:paths(hs,['C'])}),line=lineFor(gs[0].board,h);assert.deepEqual(gs[0].notes.map(n=>n.midi),line);assert.deepEqual(gs[1].notes.map(n=>n.midi),line.toReversed().slice(1));
});
test('jazz, altered, modal and fourths charts retain the same run placement',()=>{
 for(const template of ['major251essential','major251altered','modal_dorian','fourths1'])for(let key=0;key<12;key++)for(const motion of ['ascending','descending']){
  const setup={key,mode:'dorian',chord:'min7',progression:true,template,beats:4},hs=progressionDefinition(setup).roman.map((_,i)=>harmonyAt(setup,i)),durations=hs.map((_,i)=>i%2?2:4),gs=progressionExerciseGroups(hs,durations,fretboardFor(hs[0],'C'),{study:'positionalscale',rhythm:'triplets',motion,positionPath:paths(hs,shapes)});let cursor=0;
  for(const g of gs){const expected=cycle(g,motion);assert.deepEqual(g.notes.map(n=>n.midi),Array.from({length:durations[g.slot]*3},(_,i)=>expected[(cursor+i)%48]));cursor+=g.notes.length;}
 }
});
