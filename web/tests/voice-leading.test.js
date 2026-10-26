import {test} from 'node:test';import assert from 'node:assert/strict';
import {voiceLeadingTargets} from '../src/practice/voice-leading.js';
import {DEFAULTS} from '../src/audio/engine.js';import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,TUNING} from '../src/guitar/fretboard.js';import {alignedProgressionGroups} from '../src/guitar/exercises.js';
test('targets describe actual written pitches, chord intervals and physical coordinates across keys and regions',()=>{
 for(let key=0;key<12;key++)for(const shape of ['C','A','G','E','D'])for(const study of ['guidetones','connections']){
 const harmonies=[0,1,2].map(i=>harmonyAt({...DEFAULTS,key,progression:true,template:'major251essential'},i)),board=fretboardFor(harmonies[0],shape);let offset=0;
 const groups=alignedProgressionGroups(board,harmonies,study,'seventh','ascending').map((g,i)=>{const result={...g,harmony:harmonies[i],globalStart:offset};offset+=g.notes.length;return result;});
 const notes=groups.flatMap(g=>g.notes),edges=voiceLeadingTargets(groups);assert.equal(edges.length,2);
 for(const edge of edges){assert.equal(notes[edge.targetIndex],edge.target);assert.equal(notes[edge.sourceIndex],edge.source);assert.equal(edge.distance,edge.target.midi-edge.source.midi);assert.equal(TUNING[edge.target.string]+edge.target.fret,edge.target.midi);assert.ok(harmonies[edge.slot].chordPcs.includes(edge.target.pc));assert.equal(edge.targetInterval,harmonies[edge.slot].intervals[harmonies[edge.slot].chordPcs.indexOf(edge.target.pc)]);}
 }
});
test('common tones and semitone resolutions are distinct from octave shifts and silent slots',()=>{
 const note=(midi)=>({midi,pc:midi%12,name:'F',string:0,fret:midi-40}),group=(midi)=>({chord:'test',notes:[note(midi)]});
 const edges=voiceLeadingTargets([group(65),group(65),group(64),group(76)]);assert.equal(edges[0].movement,'Hold · common tone');assert.equal(edges[1].movement,'Down a semitone');assert.match(edges[2].movement,/Up an octave · same pitch class/);
 assert.deepEqual(voiceLeadingTargets([group(65),{notes:[]},group(64)]),[]);
});
