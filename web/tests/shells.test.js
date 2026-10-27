import {test} from 'node:test';import assert from 'node:assert/strict';
import {shellCandidates,shellRoute,shellStudy,shellMovements} from '../src/guitar/shells.js';import {harmonyAt,CHORDS} from '../src/audio/music.js';import {TUNING} from '../src/guitar/fretboard.js';import {FRET_REGIONS} from '../src/guitar/position-path.js';import {progressionNotationSvg} from '../src/practice/progression-notation.js';
const h=(key,chord)=>harmonyAt({key,mode:'major',chord});
test('explicit shell templates preserve root/third/seventh or sixth on the two supported string sets in all keys',()=>{
 for(let key=0;key<12;key++)for(const chord of Object.keys(CHORDS))for(const strings of ['root6','root5']){
  const harmony=h(key,chord),shells=shellCandidates(harmony,strings),supported=harmony.intervals.some(i=>['3','♭3'].includes(i))&&harmony.intervals.some(i=>['7','♭7','♭♭7','6'].includes(i));assert.equal(shells.length>0,supported,`${key} ${chord} ${strings}`);
  for(const shell of shells){assert.deepEqual(shell.notes.map(n=>n.string),strings==='root6'?[0,2,3]:[1,2,3]);assert.equal(shell.notes[0].pc,key);assert.ok(shell.end-shell.start<=3);assert.equal(shell.muted.length,3);for(const note of shell.notes){assert.equal(note.midi,TUNING[note.string]+note.fret);assert.ok(note.fret>=1&&note.fret<=17);assert.ok(harmony.chordPcs.includes(note.pc));assert.equal(note.name,harmony.tones[harmony.chordPcs.indexOf(note.pc)]);}assert.deepEqual(shell.omitted,harmony.tones.filter((_,i)=>!shell.notes.some(n=>n.pc===harmony.chordPcs[i])));}
 }
});
test('the familiar C-major ii V I shells retain F F E and C B B voice paths',()=>{
 const harmonies=[0,1,2].map(i=>harmonyAt({key:0,progression:true,template:'major251essential'},i)),route=shellRoute(harmonies,'auto',FRET_REGIONS.low);
 assert.deepEqual(route.map(s=>s.notes.map(n=>[6-n.string,n.fret])),[[[5,5],[4,3],[3,5]],[[6,3],[4,3],[3,4]],[[5,3],[4,2],[3,4]]]);
 const groups=route.map((shell,i)=>({shell,chord:harmonies[i].name+harmonies[i].suffix})),moves=shellMovements(groups);assert.deepEqual(moves.map(e=>e.distance),[0,-1,-1,0]);
});
test('unsupported chords remain explicit gaps and do not shorten the progression',()=>{
 const harmonies=[h(0,'maj7'),h(2,'sus4'),h(7,'dom7')],study=shellStudy(harmonies,[0,1,2],[4,4,4],4);assert.equal(study.groups.length,3);assert.equal(study.groups[1].shell,null);assert.equal(study.groups[1].notes.length,0);assert.match(study.groups[1].warning,/No shell was substituted/);assert.equal(study.plan.duration,12);assert.equal(study.plan.slots.length,3);
});
test('authored shell phrases have true holds/rests and resolve approaches at the next chord on the same string',()=>{
 for(let key=0;key<12;key++)for(const strings of ['auto','root6','root5']){
  const harmonies=[0,1,2].map(i=>harmonyAt({key,progression:true,template:'major251essential'},i)),study=shellStudy(harmonies,[0,1,2],[4,4,8],4,{stringSet:strings,phrase:true,recipe:'approach'});
  assert.equal(study.plan.duration,16);for(const g of study.groups){assert.ok(g.notes.every(n=>[2,3].includes(n.string)));assert.ok(g.timing.some(e=>e.duration===1.5));assert.equal(g.timing.some(e=>e.start===1.5),false);}
  for(let slot=0;slot<2;slot++){const approach=study.groups[slot].notes.at(-1),target=study.groups[slot+1].notes[0];assert.equal(approach.string,target.string);assert.equal(Math.abs(approach.midi-target.midi),1);}
  assert.ok(harmonies[2].chordPcs.includes(study.groups[2].notes.at(-1).pc));
  for(const e of study.plan.events){const slot=study.plan.slots.find(s=>s.slot===e.slot&&e.start>=s.start&&e.start<s.start+s.duration);assert.ok(e.start+e.duration<=slot.start+slot.duration+1e-6);}
  const svg=progressionNotationSvg(study.plan,'Shell phrase');assert.match(svg,/notation-rest/);assert.match(svg,/note-accent/);assert.match(svg,/note-beam/);
 }
});
test('short slots and other metres explain phrase limits while complete arpeggios still work',()=>{
 const harmony=h(0,'maj7');for(const [beats,duration]of [[3,3],[4,2]]){const study=shellStudy([harmony],[0],[duration],beats,{phrase:true});assert.equal(study.plan.events.length,0);assert.match(study.groups[0].warning,/4\/4/);}
 assert.equal(shellStudy([harmony],[0],[1],4).groups[0].notes.length,0);assert.equal(shellStudy([harmony],[0],[3],3).groups[0].notes.length,3);
});
