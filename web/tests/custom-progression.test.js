import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCustomProgression,progressionText,recommendedMode,romanForStep} from '../src/practice/custom-progression.js';
import {harmonyAt,progressionDurations,progressionStep} from '../src/audio/music.js';
import {Engine} from '../src/audio/engine.js';

const custom=normalizeCustomProgression({name:'Changes',steps:[
  {root:0,chord:'min7',mode:'dorian',bars:1},
  {root:5,chord:'dom7',mode:'mixolydian',bars:2,bass:0},
  {root:3,chord:'maj7sharp11',mode:'lydian',bars:4},
]});
const settings={progression:true,template:'custom',customProgression:custom,key:9,mode:'dorian',chord:'min13'};

test('custom progressions normalize, label and recommend useful scale guides',()=>{
  assert.deepEqual(custom.roman,['i7','IV7','♭IIImaj7♯11']);
  assert.equal(romanForStep({root:7,chord:'dom7alt'}),'V7alt');
  assert.equal(recommendedMode('dom7alt'),'altered');
  assert.equal(recommendedMode('halfDim'),'locrian_natural2');
  assert.match(progressionText(custom,id=>id),/i7.*IV7.*♭IIImaj7♯11/);
  const bounded=normalizeCustomProgression({steps:Array.from({length:40},()=>({root:99,bars:3}))});
  assert.equal(bounded.steps.length,32);assert.equal(bounded.steps[0].root,11);assert.equal(bounded.steps[0].bars,1);
});

test('custom harmony transposes, follows durations and exposes slash bass',()=>{
  assert.deepEqual(progressionDurations(settings),[1,2,4]);
  assert.deepEqual(Array.from({length:8},(_,bar)=>progressionStep(settings,bar)),[0,1,1,2,2,2,2,0]);
  assert.equal(harmonyAt(settings,0).name,'A');
  assert.equal(harmonyAt(settings,0).suffix,'m7');
  assert.equal(harmonyAt(settings,1).name,'D');
  assert.equal(harmonyAt(settings,1).suffix,'7/A');
  assert.equal(harmonyAt(settings,1).bassMidi,45);
  assert.equal(harmonyAt({...settings,key:0},1).name,'F');
});

test('custom changes reach the audio engine and slash bass replaces the pad foundation',()=>{
  const engine=new Engine(8000);engine.configure({...settings,countIn:false,click:0,harmony:1,padDepth:'wide'});engine.reset();
  engine.setChord(1);
  assert.equal(engine.chordMidi[0]%12,2);
  assert.equal(engine.rhythmChordMidi[0],45);
  assert.ok(engine.padVoicing.some(entry=>entry.role==='foundation'&&entry.midi===45));
  const before=engine.chordSignature;
  const edited=normalizeCustomProgression({...custom,steps:custom.steps.map((item,index)=>index?item:{...item,chord:'min9'})});
  engine.configure({...settings,customProgression:edited});
  assert.notEqual(engine.chordSignature,before);
});

test('old added fourths repair stale letters without changing pitches or valid spellings',()=>{
 const progression=normalizeCustomProgression({steps:[0,5,10].map(root=>({root,letter:0,chord:'maj9sharp11',mode:'lydian',bars:1}))});
 assert.deepEqual(progression.steps.map(step=>step.letter),[0,3,6]);
 assert.deepEqual(progression.steps.map((_,index)=>harmonyAt({...settings,customProgression:progression},index).name),['A','D','G']);
 assert.deepEqual(normalizeCustomProgression(progression),progression);
 const valid=normalizeCustomProgression({steps:[{root:0,letter:0},{root:5,letter:3},{root:10,letter:6}]});
 assert.deepEqual(valid.steps.map(step=>step.letter),[0,3,6]);
});
