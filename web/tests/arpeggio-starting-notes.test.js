import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
import {normalizeExerciseOptions} from '../src/practice/exercise-options.js';
const shapes=['C','A','G','E','D'];
const run=(hs,ss,ds,startTone='default',motion='ascending',rhythm='eighths',stage='full')=>progressionExerciseGroups(hs,ds,fretboardFor(hs[0],ss[0]),{study:'positional',rhythm,stage,motion,startTone,positionPath:hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i%ss.length])),geometryShape:ss[i%ss.length]}))});
const choices=(g,motion)=>{const ordered=motion==='descending'?g.positionalSpan.toReversed():g.positionalSpan,counts={};return ordered.map(note=>{const degree=g.harmony.intervals[g.harmony.chordPcs.indexOf(note.pc)].match(/\d+/)[0],index=counts[degree]||0;counts[degree]=index+1;return `${degree}:${index}`;});};
test('reported Position II rotates to the fifth E without changing its two-bar cycle',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),gs=run([h,h,h,h],['C'],[4,4,4,4],'5:0');
 assert.deepEqual(gs[0].notes.map(n=>n.midi),[52,55,57,60,64,67,69,72]);assert.deepEqual(gs[1].notes.map(n=>n.midi),[69,67,64,60,57,55,52,48]);assert.deepEqual(gs[2].notes,gs[0].notes);
 const plan=progressionStudyPlan(gs,[0,1,2,3],[1,1,1,1],4,'positional','eighths');assert.equal(plan.duration,16);assert.equal(plan.events.length,32);for(let i=0;i<32;i++)assert.equal(plan.events[i].start,i/2);
});
test('every chord-degree occurrence rotates the same sequence in all modes, roots, shapes and directions',()=>{
 for(const [mode,def]of Object.entries(MODES))for(let key=0;key<12;key++)for(const shape of shapes)for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode,chord:def.chord}),[base]=run([h],[shape],[8],'default',motion),span=base.positionalSpan.map(n=>n.midi),ordered=motion==='descending'?span.toReversed():span,expected=[...ordered,...ordered.slice(1,-1).toReversed()];
  for(const [start,choice]of choices(base,motion).entries()){const [g]=run([h],[shape],[8],choice,motion);assert.deepEqual(g.positionalSpan,base.positionalSpan);assert.equal(g.phraseCycleLength,base.phraseCycleLength);assert.equal(g.notes[0].midi,ordered[start]);assert.deepEqual(g.notes.map(n=>n.midi),Array.from({length:16},(_,i)=>expected[(start+i)%expected.length]));}
 }
});
test('mixed progression follows chord degree while preserving the original spans and elapsed phrase phase',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:2,mode:'mixolydian',chord:'dom13'}),harmonyAt({key:7,mode:'lydian',chord:'maj9sharp11'}),harmonyAt({key:0,mode:'minor_pentatonic',chord:'min7'})],durations=[1,3,2,6];
 for(const motion of ['ascending','descending'])for(const start of ['1:0','3:0','5:0','7:1']){
  const base=run(hs,['D','A','E','C'],durations,'default',motion),gs=run(hs,['D','A','E','C'],durations,start,motion);let cursor=0;
  for(const [i,g]of gs.entries()){assert.deepEqual(g.positionalSpan,base[i].positionalSpan);const labels=choices(g,motion),sameDegree=labels.map((label,index)=>({label,index})).filter(x=>x.label.split(':')[0]===start.split(':')[0]),index=labels.includes(start)?labels.indexOf(start):sameDegree.at(-1)?.index||0,span=g.positionalSpan.map(n=>n.midi),ordered=motion==='descending'?span.toReversed():span,cycle=[...ordered,...ordered.slice(1,-1).toReversed()];assert.deepEqual(g.notes.map(n=>n.midi),Array.from({length:durations[i]*2},(_,n)=>cycle[(cursor+index+n)%cycle.length]));cursor+=g.notes.length;}
 }
 const minor=harmonyAt({key:9,mode:'dorian',chord:'min7'}),major=harmonyAt({key:9,mode:'major',chord:'maj7'}),gs=run([minor,major],['C'],[8,8],'3:0');assert.equal(gs[0].notes[0].pc,0);assert.equal(gs[1].notes[0].pc,1);
});
test('one-run stops at the next endpoint; missing occurrences and absent degrees disclose fallback',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),[g]=run([h],['C'],[8],'7:0','ascending','eighths','cell');assert.deepEqual(g.notes.map(n=>n.midi),[55,57,60,64,67,69,72]);
 const [short]=run([h],['C'],[4],'7:8');assert.match(short.warning,/nearest available octave/);assert.equal(short.notes[0].pc,7);
 const sus=harmonyAt({key:9,mode:'mixolydian',chord:'sus4'}),[missing]=run([sus],['C'],[4],'3:0');assert.match(missing.warning,/absent/);assert.equal(missing.phraseStartIndex,0);
});
test('other rhythms ignore starting-degree choices and legacy options retain shape-default behavior',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'});for(const rhythm of ['triplets','sixteenths'])assert.deepEqual(run([h,h],['C','A'],[4,4],'3:0','ascending',rhythm).map(g=>g.notes),run([h,h],['C','A'],[4,4],'default','ascending',rhythm).map(g=>g.notes));
 for(const [value,expected]of [[undefined,'default'],['3:0','3:0'],['5:1','5:1'],['9:0','default'],['bad','default']])assert.equal(normalizeExerciseOptions({startTone:value}).startTone,expected);
});
