import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,Engine} from '../src/audio/engine.js';
import {harmonyAt,progressionOrder,progressionPlaybackBeatDurations,progressionStepAtBeat} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan,planPosition} from '../src/practice/progression-timing.js';
import {progressionNotationSvg} from '../src/practice/progression-notation.js';
import {withExerciseResolution,resolutionBackingSettings,singleChordExercisePlan} from '../src/practice/exercise-resolution.js';
import {exerciseNoteDuration} from '../src/audio/exercise-playback.js';
function setup(settings,study='positionalscale',rhythm='triplets',shape='C'){
 const order=progressionOrder(settings),hs=order.map(i=>harmonyAt(settings,i)),durations=progressionPlaybackBeatDurations(settings),path=hs.map(h=>({...cagedPositionFor(fretboardFor(h,shape)),geometryShape:shape}));
 const groups=progressionExerciseGroups(hs,order.map(i=>durations[i]),fretboardFor(hs[0],shape),{study,rhythm,positionPath:path});
 return {groups,plan:progressionStudyPlan(groups,order,durations.map(d=>d/settings.beats),settings.beats,study,rhythm)};
}
test('ending adds exactly one full bar, chooses the nearest core chord pitch in the final position, and leaves the exercise prefix untouched',()=>{
 for(const template of ['single','major251essential','minor251','turnaround','diatonic'])for(const key of [0,6,9])for(const shape of ['C','A','G','E','D'])for(const study of ['positional','positionalscale','groups3','harmonized'])for(const rhythm of ['eighths','sixteenths','triplets']){
  const s={...DEFAULTS,key,mode:'dorian',chord:'min7',progression:true,template},base=setup(s,study,rhythm,shape),before=JSON.stringify(base),out=withExerciseResolution(base.groups,base.plan),e=out.plan.events.at(-1),slot=base.plan.slots.at(-1),last=base.plan.events.at(-1),core=arpeggioHarmony(slot.harmony);
  assert.equal(JSON.stringify(base),before);assert.deepEqual(out.plan.events.slice(0,-1),base.plan.events);assert.deepEqual(out.groups.slice(0,-1),base.groups);
  assert.equal(out.plan.duration,base.plan.duration+4);assert.equal(e.start,base.plan.duration);assert.equal(e.duration,4);assert.ok(core.chordPcs.includes(e.note.pc));
  assert.equal(Math.abs(e.note.midi-last.note.midi),Math.min(...slot.board.notes.filter(n=>core.chordPcs.includes(n.pc)).map(n=>Math.abs(n.midi-last.note.midi))));
  assert.ok(slot.board.notes.some(n=>n.midi===e.note.midi&&n.string===e.note.string&&n.fret===e.note.fret));
  assert.equal(planPosition(out.plan,e.start+3.9).event,e);assert.deepEqual(withExerciseResolution(out.groups,out.plan),out);
 }
});
test('resolution sustains over the last backing chord, including wrapped loops and repeated short-meter plans, without editing settings',()=>{
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

test('the audio engine keeps the last harmony through every beat of the ending and loops only afterwards',()=>{
 const s={...DEFAULTS,key:9,mode:'dorian',chord:'min7',progression:true,template:'major251essential',bpm:240,countIn:false};
 const base=setup(s),{plan}=withExerciseResolution(base.groups,base.plan),config=resolutionBackingSettings(s,plan),engine=new Engine(8000);
 engine.configure(config);engine.reset();const beatSteps=[];
 engine.render(new Float32Array(8000*6),event=>{if(!event.counting&&event.step!==undefined)beatSteps.push(event.step);});
 const final=plan.slots.length-1;
 assert.deepEqual(beatSteps.slice(plan.resolution.start,plan.duration),Array(plan.beats).fill(final));
 assert.equal(beatSteps[plan.duration],0);
});
