import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHORDS,harmonyAt} from '../src/audio/music.js';
import {TUNING} from '../src/guitar/fretboard.js';
import {guitarVoicings,voicingSvg} from '../src/guitar/voicings.js';

test('every chord in every key has fretted four-note grips with correct notes and genuine drop ordering',()=>{
  for(const chord of Object.keys(CHORDS))for(let key=0;key<12;key++)for(const type of ['drop2','drop3']){
    const harmony=harmonyAt({key,mode:'major',chord});
    const result=guitarVoicings(harmony,type);
    assert.ok(result.voicings.length>0,`${chord} ${key} ${type}`);
    assert.ok(result.voicings.length<=4);
    for(const board of result.voicings){
      assert.equal(board.notes.length,4);
      assert.equal(new Set(board.notes.map(n=>n.string)).size,4);
      assert.ok(Math.max(...board.notes.map(n=>n.fret))-Math.min(...board.notes.map(n=>n.fret))<=4);
      for(const note of board.notes){
        assert.ok(note.fret>=1&&note.fret<=17);
        assert.equal(note.midi,TUNING[note.string]+note.fret);
        assert.ok(harmony.chordPcs.includes(note.pc));
        assert.equal(note.name,harmony.tones[harmony.chordPcs.indexOf(note.pc)]);
      }
      assert.deepEqual(new Set(board.notes.map(n=>n.pc)),new Set(result.indices.map(i=>harmony.chordPcs[i])));
      if(!result.fifths){
        // Raising the bass must reconstruct a closed chord and identify exactly
        // the second- or third-highest voice, rather than an arbitrary spread.
        const raised=board.notes[0].midi+12;
        const close=[raised,...board.notes.slice(1).map(n=>n.midi)].sort((a,b)=>a-b);
        assert.ok(close[3]-close[0]<=12);
        assert.equal(close[type==='drop2'?2:1],raised);
      }
    }
  }
});

test('Cmaj7 includes familiar drop-2 and drop-3 root-bass guitar grips',()=>{
  const harmony=harmonyAt({key:0,mode:'major',chord:'maj7'});
  const drop2=guitarVoicings(harmony,'drop2').voicings;
  const drop3=guitarVoicings(harmony,'drop3').voicings;
  assert.ok(drop2.some(v=>v.notes.map(n=>n.midi).join(',')==='48,55,59,64'));
  assert.ok(drop3.some(v=>v.notes.map(n=>n.midi).join(',')==='48,59,64,67'));
  assert.equal(new Set(drop2.map(v=>v.bassInterval)).size,4);
  assert.equal(new Set(drop3.map(v=>v.bassInterval)).size,4);
});

test('extended reductions disclose omissions and preserve altered fifths; triads and fifths identify doubling',()=>{
  for(const [chord,expected,omitted] of [
    ['maj9',['1','3','7','9'],['G']],
    ['halfDim11',['1','♭3','♭5','♭7'],['F']],
    ['augMaj9',['1','3','♯5','7'],['D']],
    ['dom7alt',['1','3','♭5','♭7'],['D♭','D♯']],
  ]){
    const harmony=harmonyAt({key:0,mode:'major',chord});
    const result=guitarVoicings(harmony);
    assert.deepEqual(result.indices.map(i=>harmony.intervals[i]),expected);
    assert.deepEqual(result.omitted,omitted);
  }
  assert.equal(guitarVoicings(harmonyAt({key:0,mode:'major',chord:'major'})).doubled,true);
  assert.equal(guitarVoicings(harmonyAt({key:0,mode:'major',chord:'fifth'})).fifths,true);
});

test('grip diagrams show four sounding notes, two muted strings and chord-relative interval labels',()=>{
  const harmony=harmonyAt({key:0,mode:'major',chord:'min7'});
  const board=guitarVoicings(harmony,'drop3').voicings[0];
  const svg=voicingSvg(board,harmony.intervals,true,'Cm7 drop 3');
  assert.equal((svg.match(/class="fret-note /g)||[]).length,4);
  assert.equal((svg.match(/class="muted-string"/g)||[]).length,2);
  assert.ok(svg.includes('>♭3</text>'));
  assert.ok(svg.includes('>♭7</text>'));
  assert.ok(svg.includes('Mute string'));
});
