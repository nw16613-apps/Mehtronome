import {test} from 'node:test';import assert from 'node:assert/strict';import {DEFAULTS} from '../src/audio/engine.js';import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,TUNING} from '../src/guitar/fretboard.js';import {chordToneQuestion,RECALL_TONES} from '../src/practice/fret-recall.js';
test('recall targets use chord intervals and all available octave locations across keys and regions',()=>{
 for(let key=0;key<12;key++)for(const [chord,mode]of [['min7','dorian'],['maj7','major'],['dom7alt','altered'],['halfDim','locrian_natural2'],['dim7','ultralocrian']])for(const shape of ['C','A','G','E','D']){
 const h=harmonyAt({...DEFAULTS,key,chord,mode}),board=fretboardFor(h,shape);
 for(const kind of Object.keys(RECALL_TONES)){const q=chordToneQuestion(h,board,kind);if(q.unavailable){assert.ok(!h.intervals.some(i=>RECALL_TONES[kind].includes(i))||!board.notes.some(n=>n.pc===h.chordPcs[h.intervals.findIndex(i=>RECALL_TONES[kind].includes(i))]));continue;}assert.ok(RECALL_TONES[kind].includes(q.interval));assert.equal(q.pc,h.chordPcs[h.intervals.indexOf(q.interval)]);assert.equal(q.name,h.tones[h.intervals.indexOf(q.interval)]);assert.deepEqual(q.answers,board.notes.filter(n=>n.pc===q.pc));for(const n of q.answers)assert.equal(n.midi,TUNING[n.string]+n.fret);}
 }
});
test('suspended chords do not acquire an invented third, and absent positions are explicit',()=>{
 const h=harmonyAt({...DEFAULTS,chord:'sus4',mode:'major'}),board=fretboardFor(h,'E');assert.match(chordToneQuestion(h,board,'third').unavailable,/has no third/);assert.match(chordToneQuestion(h,{notes:[]},'root').unavailable,/unavailable/);
 const diminished=harmonyAt({...DEFAULTS,chord:'dim7',mode:'ultralocrian'});const q=chordToneQuestion(diminished,fretboardFor(diminished,'E'),'seventh');assert.equal(q.interval,'♭♭7');
});
