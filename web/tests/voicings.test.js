import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHORDS,harmonyAt} from '../src/audio/music.js';
import {TUNING} from '../src/guitar/fretboard.js';
import {DROP_TYPES,STRING_SETS,guitarVoicings,voicingSvg} from '../src/guitar/voicings.js';

test('every string set and key shows all distinct inversions with genuine drop ordering',()=>{
  for(const chord of Object.keys(CHORDS))for(let key=0;key<12;key++)for(const type of Object.keys(DROP_TYPES))for(const set of STRING_SETS[type]){
    const harmony=harmonyAt({key,mode:'major',chord});
    const result=guitarVoicings(harmony,type,set.id);
    const count=new Set(result.indices.map(i=>harmony.chordPcs[i])).size;
    assert.equal(result.voicings.length,count,`${chord} ${key} ${type} ${set.id}`);
    assert.deepEqual(result.voicings.map(v=>v.inversion),Array.from({length:count},(_,i)=>i));
    assert.equal(result.voicings[0].notes[0].pc,key);
    for(const board of result.voicings){
      assert.equal(board.notes.length,4);
      assert.equal(new Set(board.notes.map(n=>n.string)).size,4);
      assert.equal(board.strings.join(''),set.id);
      assert.equal(board.wide,Math.max(...board.notes.map(n=>n.fret))-Math.min(...board.notes.map(n=>n.fret))>4);
      for(const note of board.notes){
        assert.ok(note.fret>=1&&note.fret<=24);
        assert.equal(note.midi,TUNING[note.string]+note.fret);
        assert.ok(harmony.chordPcs.includes(note.pc));
        assert.equal(note.name,harmony.tones[harmony.chordPcs.indexOf(note.pc)]);
      }
      assert.deepEqual(new Set(board.notes.map(n=>n.pc)),new Set(result.indices.map(i=>harmony.chordPcs[i])));
      if(!result.fifths){
        // Raising the bass must reconstruct a closed chord and identify exactly
        // the second- or third-highest voice, rather than an arbitrary spread.
        const count=DROP_TYPES[type].voices.length;
        const raised=board.notes.slice(0,count).map(n=>n.midi+12);
        const close=[...raised,...board.notes.slice(count).map(n=>n.midi)].sort((a,b)=>a-b);
        assert.ok(close[3]-close[0]<=12);
        assert.deepEqual(new Set(raised),new Set(DROP_TYPES[type].voices.map(v=>close[4-v])));
      }
    }
  }
});

test('Cmaj7 includes familiar drop-2 and drop-3 root-bass guitar grips',()=>{
  const harmony=harmonyAt({key:0,mode:'major',chord:'maj7'});
  const drop2=guitarVoicings(harmony,'drop2','5432').voicings;
  const drop3=guitarVoicings(harmony,'drop3','5321').voicings;
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
    ['dom7alt',['1','3','♭5','♭7'],['D♭','D♯','A♭']],
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
  const board=guitarVoicings(harmony,'drop3','5321').voicings[0];
  const svg=voicingSvg(board,harmony.intervals,true,'Cm7 drop 3');
  assert.equal((svg.match(/class="fret-note /g)||[]).length,4);
  assert.equal((svg.match(/class="muted-string"/g)||[]).length,2);
  assert.ok(svg.includes('>♭3</text>'));
  assert.ok(svg.includes('>♭7</text>'));
  assert.ok(svg.includes('Mute string'));
});

test('wide inversions expand the fret grid rather than clipping notes or omitting an inversion',()=>{
  const harmony=harmonyAt({key:0,mode:'major',chord:'maj9'});
  const board=guitarVoicings(harmony,'drop3','6432').voicings.find(v=>v.wide);
  assert.ok(board);
  const svg=voicingSvg(board,harmony.intervals,false,'Wide inversion');
  const columns=board.end-board.start+1;
  assert.ok(columns>5);
  assert.equal((svg.match(/class="fret-number"/g)||[]).length,columns);
  assert.equal((svg.match(/class="fret-wire/g)||[]).length,columns+1);
  for(const note of board.notes)assert.ok(note.fret>=board.start&&note.fret<=board.end);
});
