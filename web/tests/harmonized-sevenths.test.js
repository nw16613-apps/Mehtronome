import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MODES,harmonyAt} from '../src/audio/music.js';
import {harmonizedSevenths} from '../src/practice/harmonized-sevenths.js';

function mode(key,mode){return harmonyAt({key,mode,chord:MODES[mode].chord,progression:false},0);}

test('C Lydian augmented produces the seven reviewed seventh chords',()=>{
  const chords=harmonizedSevenths(mode(0,'lydian_augmented'));
  assert.deepEqual(chords.map(chord=>[chord.symbol,chord.notes]),[
    ['Cmaj7♯5',['C','E','G♯','B']],['D7',['D','F♯','A','C']],['E7',['E','G♯','B','D']],
    ['F♯m7♭5',['F♯','A','C','E']],['G♯m7♭5',['G♯','B','D','F♯']],['Am(maj7)',['A','C','E','G♯']],['Bm7',['B','D','F♯','A']],
  ]);
});

test('major and harmonic minor include correctly identified seventh qualities',()=>{
  assert.deepEqual(harmonizedSevenths(mode(0,'major')).map(chord=>chord.symbol),['Cmaj7','Dm7','Em7','Fmaj7','G7','Am7','Bm7♭5']);
  assert.deepEqual(harmonizedSevenths(mode(9,'harmonic_minor')).map(chord=>chord.symbol),['Am(maj7)','Bm7♭5','Cmaj7♯5','Dm7','E7','Fmaj7','G♯°7']);
});

test('all supported modes in every tonic stack alternate degrees and preserve enharmonic spelling',()=>{
  for(let key=0;key<12;key++)for(const id of Object.keys(MODES)){
    const harmony=mode(key,id),chords=harmonizedSevenths(harmony);
    assert.equal(chords.length,harmony.scalePcs.length);
    chords.forEach((chord,degree)=>{
      const indices=(harmony.scalePcs.length<=6?[0,2,4]:[0,2,4,6]).map(offset=>(degree+offset)%harmony.scalePcs.length);
      assert.equal(chord.degree,degree+1);assert.equal(chord.root,harmony.scalePcs[degree]);
      assert.deepEqual(chord.notes,indices.map(index=>harmony.scaleNames[index]));
      assert.deepEqual(chord.pcs,indices.map(index=>harmony.scalePcs[index]));
      assert.equal(new Set(chord.pcs).size,harmony.scalePcs.length<=6?3:4);
      assert.ok(chord.symbol.startsWith(harmony.scaleNames[degree]));
    });
  }
  const flat=harmonizedSevenths(mode(8,'locrian'));
  assert.deepEqual(flat[0].notes,['A♭','C♭','E♭♭','G♭']);
});

test('harmonization follows each jazz chord scale without mutating its current backing chord',()=>{
  const settings={key:0,mode:'major',chord:'maj9',progression:true,template:'major251'};
  for(let step=0;step<3;step++){
    const harmony=harmonyAt(settings,step),snapshot=structuredClone(harmony);
    const chords=harmonizedSevenths(harmony);
    assert.equal(chords[0].rootName,harmony.scaleNames[0]);
    for(const chord of chords)assert.ok(chord.pcs.every(pc=>harmony.scalePcs.includes(pc)));
    assert.deepEqual(harmony,snapshot);
  }
});
