import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCustomProgression} from '../src/practice/custom-progression.js';
import {DEFAULTS,Engine} from '../src/audio/engine.js';
import {harmonyAt,progressionOrder,progressionPlaybackBeatDurations,progressionStepAtBeat} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan,planPosition} from '../src/practice/progression-timing.js';
import {progressionNotationSvg} from '../src/practice/progression-notation.js';
import {withExerciseResolution,resolutionBackingSettings,singleChordExercisePlan,exerciseEndingDirection} from '../src/practice/exercise-resolution.js';
import {exerciseNoteDuration} from '../src/audio/exercise-playback.js';
function setup(settings,study='positionalscale',rhythm='triplets',shape='C'){
 const order=progressionOrder(settings),hs=order.map(i=>harmonyAt(settings,i)),durations=progressionPlaybackBeatDurations(settings),path=hs.map(h=>({...cagedPositionFor(fretboardFor(h,shape)),geometryShape:shape}));
 const groups=progressionExerciseGroups(hs,order.map(i=>durations[i]),fretboardFor(hs[0],shape),{study,rhythm,positionPath:path});
 return {groups,plan:progressionStudyPlan(groups,order,durations.map(d=>d/settings.beats),settings.beats,study,rhythm)};
}
test('ending adds exactly one full bar, chooses the nearest different core chord pitch in the final direction within the position, and leaves the exercise prefix untouched',()=>{
 for(const template of ['single','major251essential','minor251','turnaround','diatonic'])for(const key of [0,6,9])for(const shape of ['C','A','G','E','D'])for(const study of ['positional','positionalscale','groups3','harmonized'])for(const rhythm of ['eighths','sixteenths','triplets']){
  const s={...DEFAULTS,key,mode:'dorian',chord:'min7',progression:true,template},base=setup(s,study,rhythm,shape),before=JSON.stringify(base),out=withExerciseResolution(base.groups,base.plan),e=out.plan.events.at(-1),slot=base.plan.slots.at(-1),last=base.plan.events.at(-1),core=arpeggioHarmony(base.plan.slots[0].harmony),ending=out.plan.slots.at(-1);
  assert.equal(JSON.stringify(base),before);assert.deepEqual(out.plan.events.slice(0,-1),base.plan.events);assert.deepEqual(out.groups.slice(0,-1),base.groups);
  assert.equal(out.plan.duration,base.plan.duration+4);assert.equal(e.start,base.plan.duration);assert.equal(e.duration,4);assert.ok(core.chordPcs.includes(e.note.pc));assert.notEqual(e.note.midi,last.note.midi);
  const candidates=ending.board.notes.filter(n=>core.chordPcs.includes(n.pc)&&n.midi!==last.note.midi),direction=exerciseEndingDirection(base.groups,base.plan),forward=candidates.filter(n=>(n.midi-last.note.midi)*direction>0);
  assert.equal(Math.abs(e.note.midi-last.note.midi),Math.min(...(forward.length?forward:candidates).map(n=>Math.abs(n.midi-last.note.midi))));if(forward.length)assert.equal(Math.sign(e.note.midi-last.note.midi),direction);
  assert.equal(ending.step,base.plan.slots[0].step);assert.equal(ending.harmony,base.plan.slots[0].harmony);
  assert.ok(ending.board.notes.some(n=>n.midi===e.note.midi&&n.string===e.note.string&&n.fret===e.note.fret));
  assert.equal(planPosition(out.plan,e.start+3.9).event,e);assert.deepEqual(withExerciseResolution(out.groups,out.plan),out);
 }
});
test('resolution returns to the opening backing chord, including wrapped loops and repeated short-meter plans, without editing settings',()=>{
 for(const beats of [3,4,5,7])for(const loopEnabled of [false,true]){
  const s={...DEFAULTS,key:9,mode:'dorian',chord:'min7',progression:true,template:'major251essential',beats,loopEnabled,loopStart:2,loopEnd:1},before=JSON.stringify(s),base=setup(s),out=withExerciseResolution(base.groups,base.plan),config=resolutionBackingSettings(s,out.plan);
  for(const slot of out.plan.slots){const actual=harmonyAt(config,progressionStepAtBeat(config,slot.start+.1));assert.deepEqual(actual.chordPcs,slot.harmony.chordPcs);assert.deepEqual(actual.scalePcs,slot.harmony.scalePcs);}
  assert.equal(JSON.stringify(s),before);assert.equal(out.plan.events.at(-1).duration,beats);assert.equal(harmonyAt(config,progressionStepAtBeat(config,out.plan.duration)).chordId,out.plan.slots[0].harmony.chordId);
 }
});
test('4/4 resolution is one whole note with no stems, beams or triplet numeral; other meters use tied true durations',()=>{
 for(const beats of [3,4,5,7]){
  const s={...DEFAULTS,key:9,progression:true,template:'single',mode:'dorian',chord:'min7',beats},base=setup(s),{plan}=withExerciseResolution(base.groups,base.plan),svg=progressionNotationSvg(plan,'Ending');
  const end=plan.events.at(-1),segments=[...svg.matchAll(new RegExp('class="exercise-note resolution-note[^>]+data-note-index="'+end.index+'"[^>]*data-duration-beats="([^"]+)"','g'))];
  assert.equal(segments.reduce((sum,m)=>sum+Number(m[1]),0),beats);if(beats===4)assert.equal(segments.length,1);
  assert.ok(svg.includes('Resolution'));assert.ok(svg.includes('note-hole'));assert.equal(exerciseNoteDuration(beats*2,true),beats*2);
 }
});
test('held-chord study also receives the ending and empty studies do not invent a resolution',()=>{
 const h=harmonyAt({...DEFAULTS,key:9,mode:'dorian',chord:'min7'}),b=fretboardFor(h,'C'),single=singleChordExercisePlan([{notes:b.notes.slice(0,7)}],h,b,cagedPositionFor(b),'positionalscale','eighths',4);
 assert.equal(withExerciseResolution(single.groups,single.plan).plan.duration,8);
 const empty={events:[],slots:[],duration:0};assert.equal(withExerciseResolution([],empty).plan,empty);
});

test('the audio engine plays the opening harmony through every beat of the ending and loops only afterwards',()=>{
 const s={...DEFAULTS,key:9,mode:'dorian',chord:'min7',progression:true,template:'major251essential',bpm:240,countIn:false};
 const base=setup(s),{plan}=withExerciseResolution(base.groups,base.plan),config=resolutionBackingSettings(s,plan),engine=new Engine(8000);
 engine.configure(config);engine.reset();const beatSteps=[];
 engine.render(new Float32Array(8000*6),event=>{if(!event.counting&&event.step!==undefined)beatSteps.push(event.step);});
 const final=plan.slots.length-1;assert.deepEqual(harmonyAt(config,final).chordPcs,plan.slots[0].harmony.chordPcs);
 assert.deepEqual(beatSteps.slice(plan.resolution.start,plan.duration),Array(plan.beats).fill(final));
 assert.equal(beatSteps[plan.duration],0);
});


test('a descending Am7 arpeggio ending on low-E fret 15 continues down to E rather than rising to A',()=>{
 const s={...DEFAULTS,key:9,mode:'dorian',chord:'min7',progression:true,template:'single'},base=setup(s,'positional','triplets','G');
 const last=base.plan.slots.at(-1).board.notes.find(n=>n.midi===55&&n.fret===15);assert.ok(last);
 base.plan.events.at(-1).note=last;
 const ending=withExerciseResolution(base.groups,base.plan).plan.events.at(-1);
 assert.equal(ending.note.midi,52);assert.equal(ending.note.fret,12);assert.equal(ending.duration,4);
});
test('a board containing only the previous pitch does not add a repeated-note ending on another string',()=>{
 const s={...DEFAULTS,key:9,mode:'dorian',chord:'min7',progression:true,template:'single'},base=setup(s,'positional','triplets','G'),last=base.plan.events.at(-1).note;
 base.plan.slots.at(-1).board={...base.plan.slots.at(-1).board,notes:[last,{...last,string:last.string+1}]};
 const out=withExerciseResolution(base.groups,base.plan);assert.equal(out.plan,base.plan);assert.equal(out.groups,base.groups);
});

test('the ending returns Am13 after D13, with a different core pitch and without changing the written progression',()=>{
 const s={...DEFAULTS,key:9,chord:'min13',mode:'dorian',progression:true,template:'custom',customProgression:normalizeCustomProgression({name:'A to D',steps:[{root:0,chord:'min13',mode:'dorian',bars:2,bass:7},{root:5,chord:'dom13',mode:'mixolydian',bars:2,bass:null}]})},before=JSON.stringify(s),base=setup(s,'positional','triplets','D'),{groups,plan}=withExerciseResolution(base.groups,base.plan),ending=plan.slots.at(-1),note=plan.events.at(-1).note,config=resolutionBackingSettings(s,plan);
 assert.equal(ending.harmony.chordId,'min13');assert.equal(ending.harmony.name,'A');assert.equal(ending.chord,plan.slots[0].chord);assert.equal(groups.at(-1).harmony,ending.harmony);
 assert.ok([9,0,4,7].includes(note.pc));assert.notEqual(note.midi,base.plan.events.at(-1).note.midi);
 const actual=harmonyAt(config,progressionStepAtBeat(config,ending.start));assert.equal(actual.chordId,'min13');assert.equal(actual.bassMidi,plan.slots[0].harmony.bassMidi);assert.equal(JSON.stringify(s),before);
 const svg=progressionNotationSvg(plan,'Return',{chordDiagrams:true});assert.equal(svg.split(`data-chord="${plan.slots[0].chord}"`).length-1,2);
});
test('repeated opening harmony retains the last assigned CAGED board instead of jumping back to the first position',()=>{
 const h=harmonyAt({...DEFAULTS,key:9,mode:'dorian',chord:'min7'}),first=fretboardFor(h,'D'),last=fretboardFor(h,'G');
 const groups=[first,last].map((board,slot)=>({slot,chord:'Am7',harmony:h,board,position:cagedPositionFor(board),notes:board.notes.filter(n=>n.chord).slice(0,8),globalStart:slot*8}));
 const plan=progressionStudyPlan(groups,[0,1],[1,1],4,'positional','eighths'),out=withExerciseResolution(groups,plan);
 assert.equal(out.plan.slots.at(-1).board,last);assert.equal(out.plan.slots.at(-1).position,groups[1].position);assert.equal(out.plan.slots.at(-1).step,0);
});

test('the reported downward Am7 ending resolves to E on the A string at fret 7; upward endings also continue their direction',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});
 for(const [shape,lastMidi,direction]of [['C',55,-1],['D',48,1]]){
  const board=fretboardFor(h,shape),last=board.notes.find(n=>n.midi===lastMidi),group={slot:0,harmony:h,board,position:cagedPositionFor(board),chord:'Am7',notes:[last],endingDirection:direction,annotation:'6 cell segments'};
  const plan=progressionStudyPlan([group],[0],[1],4,'harmonized','sixteenths'),ending=withExerciseResolution([group],plan).plan.events.at(-1);
  assert.equal(ending.note.midi,52);assert.equal(ending.note.string,1);assert.equal(ending.note.fret,7);assert.equal(ending.note.name,'E');assert.equal(Math.sign(ending.note.midi-lastMidi),direction);
 }
});
test('a fixed-order cell follows traversal direction rather than its misleading final local interval',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'C'),notes=[60,55].map(midi=>board.notes.find(n=>n.midi===midi)),group={slot:0,harmony:h,board,position:cagedPositionFor(board),chord:'Am7',notes,endingDirection:1,annotation:''};
 const plan=progressionStudyPlan([group],[0],[1],4,'harmonized','eighths');assert.ok(notes[1].midi<notes[0].midi);assert.ok(withExerciseResolution([group],plan).plan.events.at(-1).note.midi>notes.at(-1).midi);
});
test('continuous traversals resolve in the next leg at a turning endpoint, in either starting direction',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),board=fretboardFor(h,'C'),position={...cagedPositionFor(board),geometryShape:'C'};
 for(const motion of ['ascending','descending']){
  const groups=progressionExerciseGroups([h],[4.5],board,{study:'positional',rhythm:'eighths',motion,positionPath:[position]}),plan=progressionStudyPlan(groups,[0],[1.25],4,'positional','eighths'),last=plan.events.at(-1).note;
  assert.equal(groups[0].notes.length,9);assert.equal(groups[0].endingDirection,motion==='ascending'?-1:1);assert.equal(Math.sign(withExerciseResolution(groups,plan).plan.events.at(-1).note.midi-last.midi),groups[0].endingDirection);
 }
});
