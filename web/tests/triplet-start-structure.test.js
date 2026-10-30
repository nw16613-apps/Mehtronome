import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const shapes=['C','A','G','E','D'],phrases=['balanced','balanced2','balanced3','balancedcycle','turnaround'];
const run=(hs,ss,ds,phrase,startTone,motion='ascending')=>progressionExerciseGroups(hs,ds,fretboardFor(hs[0],ss[0]),{study:'positional',rhythm:'triplets',phrase,startTone,motion,positionPath:hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i%ss.length])),geometryShape:ss[i%ss.length]}))});
const role=(h,n)=>h.intervals[h.chordPcs.indexOf(n.pc)].match(/\d+/)[0];
test('reported fifth start keeps exactly two six-note ascents followed by two six-note descents',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),[g]=run([h],['C'],[8],'turnaround','5:0');assert.deepEqual(g.notes.map(n=>n.midi),[52,55,57,60,64,67,55,57,60,64,67,69,72,69,67,64,60,57,64,60,57,55,52,48]);assert.equal(g.phrasePhase,0);assert.deepEqual(g.cellLengths,[12,12]);
 const [balanced]=run([h],['C'],[4],'balanced','5:0');assert.deepEqual(balanced.notes.map(n=>n.midi),[52,55,57,60,64,67,69,67,64,60,57,55]);
 const [unavailable]=run([h],['C'],[4],'balanced','1:0'),[base]=run([h],['C'],[4],'balanced','default');assert.match(unavailable.warning,/cannot start this complete phrase/);assert.deepEqual(unavailable.notes,base.notes);
});
test('cycling degree entries shift whole bars and retain complete balanced phrases',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),[base]=run([h],['C'],[16],'balancedcycle','default'),[fifth]=run([h],['C'],[16],'balancedcycle','5:0');assert.equal(fifth.phrasePhase,12);assert.deepEqual(fifth.notes,[...base.notes.slice(12),...base.notes.slice(0,12)]);
});
test('all scale families, positions, directions and degrees retain their triplet run structure',()=>{
 for(const [mode,def]of Object.entries(MODES))for(const key of [0,9])for(const shape of shapes)for(const motion of ['ascending','descending'])for(const phrase of phrases)for(const degree of ['1','3','5','7']){
  const h=harmonyAt({key,mode,chord:def.chord}),[g]=run([h],[shape],[48],phrase,degree+':0',motion),leg=phrase==='turnaround'?6:Math.max(1,Math.min(7,g.positionalSpan.length)-1);
  if(!g.warning)assert.equal(role(h,g.notes[0]),degree);
  for(let offset=0;offset+leg<=g.notes.length;offset+=leg){const down=(motion==='descending')!==(phrase==='turnaround'?Math.floor(offset/(g.phraseCycleLength/2))%2===1:Math.floor(offset/leg)%2===1);for(let i=offset+1;i<offset+leg;i++)assert.ok(down?g.notes[i].midi<=g.notes[i-1].midi:g.notes[i].midi>=g.notes[i-1].midi,`${mode} ${key} ${shape} ${motion} ${phrase} ${degree}`);}
  for(const n of g.notes)assert.ok(g.board.notes.some(p=>p.midi===n.midi&&p.string===n.string&&p.fret===n.fret));
  if(phrase==='turnaround')assert.deepEqual([...new Set(g.notes.slice(0,g.phraseCycleLength).map(n=>n.midi))].sort((a,b)=>a-b),g.positionalSpan.map(n=>n.midi));
 }
});
test('mixed harmony and CAGED changes preserve the subdivision phase within intact incoming phrases',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:2,mode:'mixolydian',chord:'dom13'}),harmonyAt({key:7,mode:'lydian',chord:'maj9sharp11'}),harmonyAt({key:0,mode:'minor_pentatonic',chord:'min7'})],ss=['C','A','E','D'],ds=[1,3,2,6];
 for(const phrase of phrases)for(const motion of ['ascending','descending'])for(const degree of ['1','3','5','7']){const gs=run(hs,ss,ds,phrase,degree+':0',motion);let cursor=0;for(const g of gs){const [whole]=run([g.harmony],[g.position.geometryShape],[48],phrase,degree+':0',motion),cycle=whole.notes.slice(0,whole.phraseCycleLength);assert.deepEqual(g.notes,Array.from({length:g.notes.length},(_,i)=>cycle[(cursor+i)%cycle.length]));cursor+=g.notes.length;}}
});
