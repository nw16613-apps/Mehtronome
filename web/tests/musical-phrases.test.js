import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MUSICAL_STUDIES,musicalPhraseGroups} from '../src/practice/musical-phrases.js';
import {DEFAULTS} from '../src/audio/engine.js';
import {harmonyAt} from '../src/audio/music.js';
import {fretboardFor,TUNING} from '../src/guitar/fretboard.js';
import {progressionStudyPlan,planPosition} from '../src/practice/progression-timing.js';
import {withExerciseResolution} from '../src/practice/exercise-resolution.js';
import {progressionNotationSvg} from '../src/practice/progression-notation.js';

test('phrases use actual fretted notes and core-tone landings across keys, metres and altered changes',()=>{
 for(let key=0;key<12;key++)for(const beats of [1,2,3,4,5,7])for(const template of ['major251essential','major251altered'])for(const study of Object.keys(MUSICAL_STUDIES)){
  const s={...DEFAULTS,key,progression:true,template},hs=[0,1,2].map(i=>harmonyAt(s,i)),durations=[beats,beats,beats*2];
  const groups=musicalPhraseGroups(hs,durations,fretboardFor(hs[0],'E'),{study,beats});
  for(const g of groups){
   assert.ok(g.notes.length,g.chord);assert.equal(g.notes.length,g.timing.length);
   for(const n of g.notes){assert.equal(n.midi,TUNING[n.string]+n.fret);assert.ok(n.fret>0);assert.ok(g.board.notes.some(p=>p.string===n.string&&p.fret===n.fret));assert.ok(g.harmony.scalePcs.includes(n.pc)||g.harmony.chordPcs.includes(n.pc));}
   for(const i of g.targetIndices)assert.ok(g.harmony.chordPcs.includes(g.notes[i].pc));
   for(const [i,e]of g.timing.entries()){assert.ok(e.duration>0);assert.ok(e.start+e.duration<=durations[g.slot]+1e-8);if(i)assert.ok(e.start>=g.timing[i-1].start+g.timing[i-1].duration-1e-8);}
  }
 }
});

test('each subdivision has real rests, mixed durations, correct note indices and matching notation/playback',()=>{
 const s={...DEFAULTS,progression:true,template:'major251essential'},hs=[0,1,2].map(i=>harmonyAt(s,i));
 for(const rhythm of ['eighths','triplets','sixteenths'])for(const study of Object.keys(MUSICAL_STUDIES)){
  const groups=musicalPhraseGroups(hs,[4,4,8],fretboardFor(hs[0],'E'),{study,rhythm});
  const base=progressionStudyPlan(groups,[0,1,2],[1,1,2],4,study,rhythm),{plan}=withExerciseResolution(groups,base);
  assert.ok(base.events.reduce((s,e)=>s+e.duration,0)<base.duration*.8);
  assert.ok(new Set(base.events.map(e=>e.duration.toFixed(5))).size>1);
  for(const [i,e]of base.events.entries()){assert.equal(e.index,i);assert.equal(e.note,groups[e.slot].notes[i-groups[e.slot].globalStart]);assert.equal(planPosition(base,e.start+e.duration/2).event,e);}
  const gap=base.events.find((e,i)=>i&&e.start>base.events[i-1].start+base.events[i-1].duration+.01);
  assert.ok(gap);const before=base.events[base.events.indexOf(gap)-1];assert.equal(planPosition(base,(before.start+before.duration+gap.start)/2).event,undefined);
  const svg=progressionNotationSvg(plan,'Musical phrasing');assert.match(svg,/notation-rest/);assert.match(svg,/note-accent/);assert.match(svg,/target-note/);assert.equal(plan.resolution.start,16);
 }
});

test('chord-change targets land on thirds/sevenths and questions have quieter, different answers',()=>{
 const s={...DEFAULTS,progression:true,template:'major251essential'},hs=[0,1,2].map(i=>harmonyAt(s,i)),anchor=fretboardFor(hs[0],'E');
 const targets=musicalPhraseGroups(hs,[4,4,8],anchor,{study:'changetargets'});
 for(const g of targets){assert.equal(g.timing[0].start,0);assert.match(g.harmony.intervals[g.harmony.chordPcs.indexOf(g.notes[0].pc)],/[37]$/);}
 const question=musicalPhraseGroups([hs[0]],[16],anchor,{study:'questionanswer'})[0];
 const q=question.timing.filter(e=>e.start<4),a=question.timing.filter(e=>e.start>=4&&e.start<8);
 assert.ok(a[0].velocity<q[0].velocity);assert.notDeepEqual(q.map(e=>e.start),a.map(e=>e.start-4));
 const down=musicalPhraseGroups([hs[0]],[16],anchor,{study:'questionanswer',motion:'descending'})[0];assert.notDeepEqual(question.notes.map(n=>n.midi),down.notes.map(n=>n.midi));
});
