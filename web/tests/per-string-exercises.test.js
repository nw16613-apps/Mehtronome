import test from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {perStringExerciseChoice,perStringExerciseGroups} from '../src/practice/per-string-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';import {withExerciseResolution} from '../src/practice/exercise-resolution.js';
const options={fingering:'oneTwo',inversion:1,fingeringFret:5,motion:'ascending',rhythm:'sixteenths',study:'positional'};
const h=harmonyAt({key:9,mode:'lydian',chord:'maj7'}),position={numeral:'I',shape:'E'};
test('traversal retains the exact transferred shape, inversion and register in either direction and pattern',()=>{
 for(const fingering of ['oneTwo','twoOne'])for(let inversion=0;inversion<4;inversion++)for(const motion of ['ascending','descending']){
  const o={...options,fingering,inversion,motion},choice=perStringExerciseChoice(h,o),g=perStringExerciseGroups([h],null,[position],o)[0],base=motion==='ascending'?choice.board.notes:[...choice.board.notes].reverse();
  assert.deepEqual(g.notes.slice(0,9),base);assert.equal(g.notes.length,16);assert.equal(g.notes[0].pc,motion==='ascending'?h.chordPcs[inversion]:base[0].pc);for(let i=1;i<g.notes.length;i++)assert.notEqual(g.notes[i].midi,g.notes[i-1].midi);assert.notEqual(g.notes.at(-1).midi,g.notes[0].midi);
 }
});
test('grouped studies keep their exact per-string notes and group ordering',()=>{
 for(const study of ['arpgroups3','arpgroups4']){const o={...options,study},g=perStringExerciseGroups([h],null,[position],o)[0],size=study==='arpgroups3'?3:4;assert.deepEqual(g.notes.slice(0,size),g.board.notes.slice(0,size));assert.deepEqual(g.notes.slice(size,size*2),g.board.notes.slice(1,size+1));assert.ok(g.notes.every(n=>g.board.notes.some(b=>b.string===n.string&&b.fret===n.fret)));}
});
test('chord durations, repeated-slot continuity, changed qualities and resolution use the selected per-string boards',()=>{
 const other=harmonyAt({key:0,mode:'dorian',chord:'min7'}),hs=[h,h,other],durations=[1,1,2],groups=perStringExerciseGroups(hs,durations,[position,position,position],options);
 assert.deepEqual(groups.map(g=>g.notes.length),[4,4,8]);assert.match(groups[0].warning,/full shape/);assert.deepEqual(groups[1].notes,groups[0].board.notes.slice(4,8));assert.equal(groups[2].notes[0].pc,other.chordPcs[1]);
 const plan=progressionStudyPlan(groups,[0,1,2],[.25,.25,.5],4,'positional','sixteenths');assert.equal(plan.events.length,16);const result=withExerciseResolution(groups,plan);assert.equal(result.groups.at(-1).board,groups[0].board);assert.ok(groups[0].board.notes.some(n=>n.string===result.plan.events.at(-1).note.string&&n.fret===result.plan.events.at(-1).note.fret));
 const fallback=perStringExerciseChoice(harmonyAt({key:9,mode:'major',chord:'major'}),{...options,inversion:6});assert.equal(fallback.index,0);assert.match(fallback.warning,/root position/);
 const changing=perStringExerciseGroups([h,harmonyAt({key:0,mode:'major',chord:'major'})],[4,4],[position,position],{...options,inversion:3}),ending=withExerciseResolution(changing,progressionStudyPlan(changing,[0,1],[1,1],4,'positional','sixteenths'));assert.match(changing[1].fingeringLabel,/Root position/);assert.match(ending.groups.at(-1).fingeringLabel,/Third inversion/);
});

test('chord suggestions use fretted octave equivalents instead of open strings',()=>{
 const chord=harmonyAt({key:9,mode:'dorian',chord:'min7'}),choice=perStringExerciseChoice(chord,{...options,fingering:'oneTwo',inversion:3,fingeringFret:3});
 assert.equal(choice.board.firstFret,15);assert.ok(choice.board.notes.every(n=>n.fret>0));
});

test('drop practice preserves every inversion and string set, and unsupported chords rest',()=>{
 for(const fingering of ['drop2','drop3'])for(let fingeringStringSet=0;fingeringStringSet<(fingering==='drop2'?3:2);fingeringStringSet++)for(let inversion=0;inversion<4;inversion++){
  const o={...options,fingering,fingeringStringSet,inversion},choice=perStringExerciseChoice(h,o),g=perStringExerciseGroups([h],null,[position],o)[0];
  assert.equal(choice.board.notes.length,4);assert.deepEqual(g.notes.slice(0,4),choice.board.notes);assert.equal(g.notes[0].pc,h.chordPcs[inversion]);assert.equal(choice.board.muted.length,2);
 }
 const triad=harmonyAt({key:9,mode:'major',chord:'major'}),g=perStringExerciseGroups([triad],[4],[position],{...options,fingering:'drop2'})[0];assert.deepEqual(g.notes,[]);assert.match(g.warning,/rest for this chord/);
});
test('three-note-per-string practice transfers the continuous scale and starting degree',()=>{
 for(let inversion=0;inversion<7;inversion++){const o={...options,fingering:'three',inversion,study:'positionalscale'},g=perStringExerciseGroups([h],null,[position],o)[0];assert.equal(g.board.notes.length,18);assert.deepEqual(g.notes.slice(0,18),g.board.notes);assert.equal(g.notes[0].pc,h.scalePcs[inversion]);}
});
