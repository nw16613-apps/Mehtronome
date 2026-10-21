import {test} from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';
import {guitarVoicings,voiceLeadingFor,voiceLeadingDistance} from '../src/guitar/voicings.js';

const cmaj7=()=>harmonyAt({key:0,mode:'major',chord:'maj7'});
const notes=(pitches,strings=pitches.map((_,index)=>index))=>({notes:pitches.map((midi,index)=>({string:strings[index],midi,pc:midi%12}))});

test('unfiltered drop voicings keep all inversions and their original default octaves',()=>{
  const defaults=guitarVoicings(cmaj7(),'drop2','4321');
  const explicit=guitarVoicings(cmaj7(),'drop2','4321',{fretRange:null,topPc:null});
  assert.deepEqual(defaults.voicings.map(board=>board.inversion),[0,1,2,3]);
  assert.deepEqual(defaults.voicings.map(board=>board.notes.map(note=>note.fret)),[
    [10,12,12,12],[2,4,1,3],[5,5,5,7],[9,9,8,8],
  ]);
  assert.deepEqual(explicit,defaults);
});

test('a position filter searches other octaves and reports real note bounds separately from its grid',()=>{
  const range={start:19,end:24};
  const result=guitarVoicings(cmaj7(),'drop2','4321',{fretRange:range});
  const root=result.voicings.find(board=>board.inversion===0);
  assert.deepEqual(root.notes.map(note=>note.fret),[22,24,24,24]);
  assert.equal(root.minFret,22);
  assert.equal(root.maxFret,24);
  assert.equal(root.end,26); // The diagram keeps five columns; these are not sounding frets.
  assert.equal(root.contained,true);
  assert.equal(root.shiftFrets,0);
  for(const board of result.voicings){
    assert.equal(board.minFret,Math.min(...board.notes.map(note=>note.fret)));
    assert.equal(board.maxFret,Math.max(...board.notes.map(note=>note.fret)));
    assert.ok(board.minFret>=range.start-2&&board.maxFret<=range.end+2);
  }
});

test('adjacent voicings disclose their shift, and an impossible position has no silent fallback',()=>{
  const nearby=guitarVoicings(cmaj7(),'drop2','4321',{fretRange:{start:3,end:7}});
  const contained=nearby.voicings.find(board=>board.inversion===2);
  const shifted=nearby.voicings.find(board=>board.inversion===1);
  assert.equal(contained.contained,true);
  assert.equal(contained.regionDistance,0);
  assert.equal(shifted.contained,false);
  assert.equal(shifted.shiftFrets,2);
  assert.equal(shifted.regionDistance,2);
  assert.equal(nearby.voicings.some(board=>board.inversion===0),false);
  const impossible=guitarVoicings(cmaj7(),'drop2','4321',{fretRange:{start:1,end:1}});
  assert.deepEqual(impossible.voicings,[]);
  assert.match(impossible.reason,/No voicing matches/);
});

test('the top-note filter checks the actual highest voice and keeps physical shape IDs stable',()=>{
  const original=guitarVoicings(cmaj7(),'drop2','4321').voicings[0];
  const filtered=guitarVoicings(cmaj7(),'drop2','4321',{topPc:4});
  assert.equal(filtered.voicings.length,1);
  assert.equal(filtered.voicings[0].id,original.id);
  assert.equal(filtered.voicings[0].topName,'E');
  assert.equal(filtered.voicings[0].topInterval,'3');
  assert.equal(Math.max(...filtered.voicings[0].notes.map(note=>note.midi))%12,4);
  const impossible=guitarVoicings(cmaj7(),'drop2','4321',{topPc:1});
  assert.deepEqual(impossible.voicings,[]);
  assert.match(impossible.reason,/No voicing matches/);
});

test('invalid filters produce an explanatory empty result',()=>{
  for(const fretRange of [{start:0,end:5},{start:8,end:4},{start:20,end:25},{start:NaN,end:5}]){
    const result=guitarVoicings(cmaj7(),'drop2','4321',{fretRange});
    assert.deepEqual(result.voicings,[]);
    assert.match(result.reason,/fret range/);
  }
  for(const topPc of [-1,12,2.5]){
    const result=guitarVoicings(cmaj7(),'drop2','4321',{topPc});
    assert.deepEqual(result.voicings,[]);
    assert.match(result.reason,/top note/);
  }
});

test('voice leading identifies held notes and semitone movement without mutating either chord',()=>{
  const previous=notes([53,57,60,64],[1,2,3,4]);
  const next=notes([53,57,59,64],[1,2,3,4]);
  const snapshot=structuredClone([previous,next]);
  const result=voiceLeadingFor(previous,next);
  assert.equal(result.distance,1);
  assert.equal(voiceLeadingDistance(previous,next),1);
  assert.equal(result.stringChanges,0);
  assert.deepEqual(new Set(result.commonPcs),new Set([5,9,4]));
  assert.equal(result.notes.filter(movement=>movement.common).length,3);
  assert.deepEqual(result.notes.find(movement=>movement.string===3),{
    string:3,from:60,to:59,delta:-1,common:false,fromString:3,stringChanged:false,
  });
  assert.deepEqual([previous,next],snapshot);
});

test('voice leading distinguishes common pitch classes from held notes and penalizes string changes',()=>{
  const previous=notes([60],[2]);
  const octave=voiceLeadingFor(previous,notes([72],[2]));
  assert.deepEqual(octave.commonPcs,[0]);
  assert.equal(octave.notes[0].common,false);
  assert.equal(octave.distance,12);
  const changedString=voiceLeadingFor(previous,notes([60],[3]));
  assert.equal(changedString.distance,3);
  assert.equal(changedString.stringChanges,1);
  assert.equal(changedString.notes[0].fromString,2);
  assert.equal(changedString.notes[0].string,3);
  assert.equal(changedString.notes[0].stringChanged,true);
  assert.equal(changedString.notes[0].common,false);
});

test('voice leading handles chords with different voice counts and a missing previous chord',()=>{
  const previous=notes([48,55,59],[0,2,3]);
  const next=notes([48,55,59,64],[0,2,3,4]);
  const added=voiceLeadingFor(previous,next);
  const removed=voiceLeadingFor(next,previous);
  assert.equal(added.distance,12);
  assert.equal(removed.distance,12);
  assert.equal(added.notes.find(movement=>movement.string===4).from,null);
  assert.equal(removed.notes.find(movement=>movement.string===4).to,null);
  assert.deepEqual(voiceLeadingFor(null,next),{distance:0,commonPcs:[],stringChanges:0,notes:[]});
});

test('a previous voicing selects its nearby octave and identifies the smallest-motion recommendation',()=>{
  const previous=guitarVoicings(cmaj7(),'drop2','4321',{fretRange:{start:19,end:24}}).voicings[0];
  const result=guitarVoicings(cmaj7(),'drop2','4321',{previous});
  const sameInversion=result.voicings.find(board=>board.inversion===previous.inversion);
  assert.equal(sameInversion.id,previous.id);
  assert.equal(sameInversion.voiceLeading.distance,0);
  assert.equal(result.recommendedId,previous.id);
  assert.deepEqual(result.voicings.map(board=>board.inversion),[0,1,2,3]);
});
