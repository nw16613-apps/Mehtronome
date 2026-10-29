import {test} from 'node:test';import assert from 'node:assert/strict';import {DEFAULTS} from '../src/audio/engine.js';import {musicalContext,spellingHelp} from '../src/practice/context.js';
test('tonic stays distinct from current ii chord and next dominant in every key',()=>{for(let key=0;key<12;key++){const c=musicalContext({...DEFAULTS,key,progression:true,template:'major251essential'},0);assert.equal(c.current.chordPcs[0],(key+2)%12);assert.equal(c.next.chordPcs[0],(key+7)%12);assert.equal(c.current.chordId,'min7');assert.ok(c.scale.includes('Dorian'));}});
test('four ii V I levels retain their actual harmonic choices',()=>{for(const [template,dominant,tonic]of [['major251essential','dom7','maj7'],['major251extended','dom13','maj9'],['major251altered','dom7alt','maj9'],['major251','dom7alt','maj9sharp11']]){const s={...DEFAULTS,progression:true,template};assert.equal(musicalContext(s,1).current.chordId,dominant);assert.equal(musicalContext(s,2).current.chordId,tonic);assert.match(spellingHelp(musicalContext(s,1).current),/contextual/);}});

test('compatibility checks compare real pitches and preserve intentional outside guides',async()=>{
 const {scaleCompatibility}=await import('../src/practice/context.js'),{harmonyAt,CHORDS}=await import('../src/audio/music.js'),{recommendedMode}=await import('../src/practice/custom-progression.js');
 for(let key=0;key<12;key++)for(const chord of Object.keys(CHORDS))assert.equal(scaleCompatibility(harmonyAt({key,chord,mode:recommendedMode(chord)})),'');
 assert.match(scaleCompatibility(harmonyAt({key:0,chord:'maj7',mode:'dorian'})),/omits E \(3\), B \(7\)/);
 for(const template of ['diatonic','modal_dorian','major251essential'])for(let i=0;i<4;i++)assert.equal(scaleCompatibility(harmonyAt({key:9,mode:'major',progression:true,template},i)),'');
});

test('melodic colours are accepted across keys without a repair warning',async()=>{
 const {scaleCompatibility}=await import('../src/practice/context.js'),{harmonyAt}=await import('../src/audio/music.js');
 for(let key=0;key<12;key++)for(const [chord,mode] of [['dom13','major_pentatonic'],['dom13','major_blues'],['min13','minor_blues'],['dom9sharp5','whole_tone'],['dom7alt','altered']]){
  assert.equal(scaleCompatibility(harmonyAt({key,chord,mode})), '',`${key} ${chord} ${mode}`);
 }
});
