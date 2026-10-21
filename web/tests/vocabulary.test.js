import test from 'node:test';
import assert from 'node:assert/strict';
import { harmonyAt, MODES } from '../src/audio/music.js';
import { TUNING } from '../src/guitar/fretboard.js';
import { voiceLeadingFor } from '../src/guitar/voicings.js';
import { VOCABULARY_APPROACHES, VOCABULARY_STRING_SETS, vocabularyVoicings } from '../src/guitar/vocabulary.js';

const approaches=Object.keys(VOCABULARY_APPROACHES);
const pcs=board=>board.notes.map(note=>note.pc);
const relative=(pc,root)=>(pc-root+12)%12;

function assertPlayable(board,harmony) {
  const allowed=new Set([...harmony.chordPcs,...harmony.scalePcs]);
  assert.ok(board.notes.length===3||board.notes.length===4);
  assert.equal(new Set(board.notes.map(note=>note.string)).size,board.notes.length);
  assert.equal(new Set(pcs(board)).size,board.notes.length);
  assert.ok(board.maxFret-board.minFret<=4);
  assert.ok(board.end-board.start>=4);
  assert.ok(board.start>=1&&board.end<=24);
  assert.equal(board.rootPc,harmony.midi[0]%12);
  assert.equal(board.intervals.length,board.notes.length);
  for (const [index,note] of board.notes.entries()) {
    assert.ok(note.fret>=1&&note.fret<=24);
    assert.equal(note.midi,TUNING[note.string]+note.fret);
    assert.equal(note.pc,note.midi%12);
    assert.ok(allowed.has(note.pc));
    assert.ok(note.name);
    assert.ok(board.intervals[note.scaleIndex]);
    if (index) {
      assert.ok(note.string>board.notes[index-1].string);
      assert.ok(note.midi>board.notes[index-1].midi);
    }
  }
}

test('all modes and keys have bounded, playable vocabulary with correct chord guide tones',()=>{
  for (const mode of Object.keys(MODES)) for (let key=0;key<12;key++) {
    const harmony=harmonyAt({key,mode});
    for (const approach of approaches) {
      const result=vocabularyVoicings(harmony,{approach});
      assert.ok(result.voicings.length>0,`${key} ${mode} ${approach}: ${result.reason}`);
      assert.ok(result.voicings.length<=8);
      assert.equal(new Set(result.voicings.map(board=>board.id)).size,result.voicings.length);
      for (const board of result.voicings) {
        assertPlayable(board,harmony);
        const degrees=pcs(board).map(pc=>relative(pc,key));
        if (approach==='shell') {
          assert.ok(degrees.includes(0));
          assert.ok(board.intervals.includes(harmony.intervals[1]));
          const seventh=harmony.intervals.find(degree=>['♭♭7','♭7','7'].includes(degree));
          assert.ok(board.intervals.includes(seventh));
        }
        if (approach==='rootless') {
          assert.ok(!degrees.includes(0));
          assert.ok(board.intervals.includes(harmony.intervals[1]));
          const seventh=harmony.intervals.find(degree=>['♭♭7','♭7','7'].includes(degree));
          assert.ok(board.intervals.includes(seventh));
        }
        if (approach==='quartal') {
          assert.ok(board.notes.every(note=>harmony.scalePcs.includes(note.pc)));
          for (let i=1;i<board.notes.length;i++) assert.ok([5,6].includes(board.notes[i].midi-board.notes[i-1].midi));
          assert.match(board.relation,/not a complete chord/i);
        }
      }
    }
  }
});

test('rootless vocabulary retains altered fifths and the diminished seventh spelling',()=>{
  for (const [mode,chord,third,fifth,seventh] of [
    ['locrian','halfDim',3,6,10],
    ['lydian_augmented','augMaj7',4,8,11],
    ['ultralocrian','dim7',3,6,9],
    ['altered','dom7alt',4,6,10],
  ]) {
    const harmony=harmonyAt({key:0,mode,chord});
    const {voicings}=vocabularyVoicings(harmony,{approach:'rootless'});
    assert.ok(voicings.length);
    for (const board of voicings) {
      for (const pc of [third,fifth,seventh]) assert.ok(pcs(board).includes(pc));
      assert.ok(!pcs(board).includes(0));
      if (chord==='dim7') assert.ok(board.intervals.includes('♭♭7'));
    }
  }
  const diminishedShells=vocabularyVoicings(harmonyAt({key:0,mode:'locrian'}),{approach:'shell'});
  assert.ok(diminishedShells.recipes.some(recipe=>recipe.name==='Shell + ♭5'));
  assert.ok(!diminishedShells.recipes.some(recipe=>recipe.name==='Shell + ♯11'));
});

test('rootless shapes explain absent guide tones and sixth shells preserve their actual quality',()=>{
  for (const chord of ['major','minor','sus4','sevenSus','min6','fifth']) {
    const result=vocabularyVoicings(harmonyAt({key:0,mode:'major',chord}),{approach:'rootless'});
    assert.deepEqual(result.voicings,[]);
    assert.match(result.reason,/third and seventh/);
  }
  const sixth=vocabularyVoicings(harmonyAt({key:0,mode:'melodic_minor',chord:'min6'}),{approach:'shell'});
  assert.ok(sixth.voicings.length);
  for (const board of sixth.voicings) {
    assert.ok(board.intervals.includes('6'));
    assert.ok(board.intervals.includes('♭3'));
    assert.ok(!board.intervals.includes('♭7'));
  }
});

test('triad recipes are genuine triads and disclose their upper structure and optional guide tone',()=>{
  const definitions={major:[0,4,7],minor:[0,3,7],diminished:[0,3,6],augmented:[0,4,8]};
  for (const mode of ['dorian','lydian','altered','harmonic_minor']) {
    const harmony=harmonyAt({key:9,mode});
    const result=vocabularyVoicings(harmony,{approach:'triad'});
    for (const board of result.voicings) {
      const triad=board.triad;
      assert.deepEqual(triad.pcs.map(pc=>relative(pc,triad.rootPc)),definitions[triad.quality]);
      assert.ok(triad.pcs.every(pc=>pcs(board).includes(pc)));
      assert.ok(board.relation);
      assert.match(board.name,new RegExp(triad.quality));
      if (board.notes.length===4) {
        assert.ok(pcs(board).includes(board.recipe.extraPc));
        const index=harmony.chordPcs.indexOf(board.recipe.extraPc);
        assert.ok(['3','♭3','7','♭7','♭♭7'].includes(harmony.intervals[index]));
      }
    }
    assert.ok(result.recipes.some(recipe=>recipe.extraPc!==undefined));
  }
});

test('top-note filtering uses the highest sounding pitch and string sets are exact',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian'});
  for (const approach of approaches) {
    const baseline=vocabularyVoicings(harmony,{approach});
    const topPc=baseline.voicings[0].notes.at(-1).pc;
    const filtered=vocabularyVoicings(harmony,{approach,topPc});
    assert.ok(filtered.voicings.length);
    assert.ok(filtered.voicings.every(board=>board.notes.at(-1).pc===topPc));
  }
  for (const stringSet of ['4321','321','642']) {
    const result=vocabularyVoicings(harmony,{approach:'triad',stringSet});
    assert.ok(result.voicings.length,stringSet);
    for (const board of result.voicings) assert.equal(board.strings.join(''),stringSet);
  }
  const exact=vocabularyVoicings(harmony,{approach:'shell',strings:[5,2,4]});
  assert.ok(exact.voicings.length);
  for (const board of exact.voicings) assert.deepEqual(board.notes.map(note=>note.string),[2,4,5]);
  assert.ok(VOCABULARY_STRING_SETS.every(set=>set.id==='all'||set.strings.length===set.id.length));
});

test('position links favor contained shapes and label only small adjacent shifts',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian'});
  for (const approach of approaches) {
    const result=vocabularyVoicings(harmony,{approach,fretRange:{start:5,end:9}});
    assert.ok(result.voicings.length);
    assert.equal(result.voicings[0].contained,true);
    for (const board of result.voicings) {
      assert.ok(board.minFret>=3&&board.maxFret<=11);
      assert.ok(board.shiftFrets<=2);
      assert.equal(board.contained,board.minFret>=5&&board.maxFret<=9);
      assert.equal(board.inRange,board.contained);
    }
  }
  const narrow=vocabularyVoicings(harmony,{approach:'shell',fretRange:{start:7,end:7}});
  assert.ok(narrow.voicings.some(board=>board.shiftFrets>0));
});

test('vamps use the current chord root rather than the unchanged modal tonic',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian',progression:true,template:'modal_dorian'},1);
  assert.equal(harmony.scalePcs[0],9);
  assert.equal(harmony.midi[0]%12,2);
  for (const approach of ['shell','rootless']) {
    const result=vocabularyVoicings(harmony,{approach,fretRange:{start:5,end:9}});
    assert.ok(result.voicings.length);
    for (const board of result.voicings) {
      assert.equal(board.rootPc,2);
      assert.equal(pcs(board).includes(2),approach==='shell');
      assert.ok(pcs(board).includes(6)); // D7's F♯ third, not A minor's C.
      assert.ok(pcs(board).includes(0)); // D7's C seventh.
    }
  }
});

test('previous voicing uses shared physical movement metrics and keeps the best connection first',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian'});
  const before=vocabularyVoicings(harmony,{approach:'shell'}).voicings[3];
  const result=vocabularyVoicings(harmony,{approach:'shell',previous:before});
  assert.equal(result.voicings[0].id,before.id);
  assert.equal(result.voicings[0].voiceLeading.distance,0);
  assert.equal(result.recommendedId,before.id);
  for (let i=0;i<result.voicings.length;i++) {
    const board=result.voicings[i];
    assert.deepEqual(board.voiceLeading,voiceLeadingFor(before,board));
    if (i) assert.ok(board.voiceLeading.distance>=result.voicings[i-1].voiceLeading.distance);
  }
});

test('labels distinguish added mode colour from omitted chord tones without mutating harmony',()=>{
  const harmony=harmonyAt({key:0,mode:'lydian',chord:'maj7'});
  const snapshot=structuredClone(harmony);
  const result=vocabularyVoicings(harmony,{approach:'shell'});
  const sharp11=result.voicings.find(board=>pcs(board).includes(6));
  assert.ok(sharp11);
  assert.ok(sharp11.added.includes('F♯'));
  assert.ok(sharp11.addedIntervals.includes('♯11'));
  assert.ok(sharp11.omitted.includes('G'));
  assert.ok(sharp11.omittedIntervals.includes('5'));
  assert.deepEqual(harmony,snapshot);
  assert.deepEqual(result,vocabularyVoicings(harmony,{approach:'shell'}));
});

test('invalid and impossible filters return an explanation, with an enforced result bound',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian'});
  for (const options of [{approach:'unknown'},{topPc:12},{topPc:NaN},{fretRange:{start:0,end:5}},
    {fretRange:{start:10,end:5}},{fretRange:{start:5,end:25}},{stringSet:'111'},{strings:[1,1,2]}]) {
    const result=vocabularyVoicings(harmony,options);
    assert.deepEqual(result.voicings,[]);
    assert.ok(result.reason);
  }
  const absent=vocabularyVoicings(harmony,{approach:'shell',topPc:1});
  assert.deepEqual(absent.voicings,[]);
  assert.ok(absent.reason);
  assert.equal(vocabularyVoicings(harmony,{limit:1}).voicings.length,1);
  assert.equal(vocabularyVoicings(harmony,{limit:100}).voicings.length,8);
  assert.ok(vocabularyVoicings(null).reason);
});
