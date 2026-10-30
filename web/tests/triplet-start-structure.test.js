import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt} from '../src/audio/music.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
const shapes=['C','A','G','E','D'],phrases=['balanced','balanced2','balanced3','balancedcycle','turnaround'];
const run=(hs,ss,ds,phrase,startTone,motion='ascending')=>progressionExerciseGroups(hs,ds,fretboardFor(hs[0],ss[0]),{study:'positional',rhythm:'triplets',phrase,startTone,motion,positionPath:hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,ss[i%ss.length])),geometryShape:ss[i%ss.length]}))});
test('full-position triplets retain their original two-up/two-down run formula regardless of saved start',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),expected=[48,52,55,57,60,64,55,57,60,64,67,69,72,69,67,64,60,57,67,64,60,57,55,52];
 for(const start of ['default','1:0','3:0','5:0','7:0'])assert.deepEqual(run([h],['C'],[8],'turnaround',start)[0].notes.map(n=>n.midi),expected);
});
test('every triplet phrase ignores starting-degree values across all modes, roots, positions and directions',()=>{
 for(const [mode,def]of Object.entries(MODES))for(const key of [0,9])for(const shape of shapes)for(const motion of ['ascending','descending'])for(const phrase of phrases){
  const h=harmonyAt({key,mode,chord:def.chord}),base=run([h],[shape],[16],phrase,'default',motion);for(const degree of ['1','3','5','7'])assert.deepEqual(run([h],[shape],[16],phrase,degree+':0',motion),base);
 }
});
test('mixed harmony and CAGED changes preserve triplet formulas and phase independently of saved degree',()=>{
 const hs=[harmonyAt({key:9,mode:'dorian',chord:'min7'}),harmonyAt({key:2,mode:'mixolydian',chord:'dom13'}),harmonyAt({key:7,mode:'lydian',chord:'maj9sharp11'}),harmonyAt({key:0,mode:'minor_pentatonic',chord:'min7'})],ss=['C','A','E','D'],ds=[1,3,2,6];
 for(const phrase of phrases)for(const motion of ['ascending','descending']){const base=run(hs,ss,ds,phrase,'default',motion);for(const degree of ['1','3','5','7'])assert.deepEqual(run(hs,ss,ds,phrase,degree+':0',motion),base);}
});
