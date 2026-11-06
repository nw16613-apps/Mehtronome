import test from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt,MODES,CHORDS} from '../src/audio/music.js';
import {perStringFingerings,STRING_PATTERNS} from '../src/guitar/per-string.js';
import {TUNING} from '../src/guitar/fretboard.js';
test('all scale families and transpositions produce exact continuous three-note-per-string patterns',()=>{
 for(const mode of Object.keys(MODES))for(let key=0;key<12;key++){
  const h=harmonyAt({key,mode,chord:MODES[mode].chord}),boards=h.scalePcs.flatMap((_,i)=>perStringFingerings(h,'three',i));
  assert.ok(boards.length,`${key} ${mode}`);
  for(const b of boards){assert.equal(b.notes.length,18);for(let string=0;string<6;string++)assert.equal(b.notes.filter(n=>n.string===string).length,3);
   for(const [i,n]of b.notes.entries()){assert.ok(n.fret>=0&&n.fret<=24);assert.equal(n.midi,TUNING[n.string]+n.fret);assert.ok(h.scalePcs.includes(n.pc));assert.equal(n.name,h.scaleNames[h.scalePcs.indexOf(n.pc)]);if(i){let next=b.notes[i-1].midi+1;while(!h.scalePcs.includes(next%12))next++;assert.equal(n.midi,next);}}
  }
 }
});
test('both arpeggio patterns retain exact string counts and chord qualities including extensions',()=>{
 for(const chord of Object.keys(CHORDS))for(let key=0;key<12;key++){
  const h=harmonyAt({key,mode:'lydian',chord});
  for(const kind of ['oneTwo','twoOne']){const boards=h.chordPcs.flatMap((_,i)=>perStringFingerings(h,kind,i));assert.ok(boards.length||new Set(h.chordPcs).size<3,`${chord} ${key} ${kind}`);
   for(const b of boards){assert.equal(b.notes.length,9);assert.deepEqual(TUNING.map((_,s)=>b.notes.filter(n=>n.string===s).length),STRING_PATTERNS[kind]);for(const [i,n]of b.notes.entries()){assert.ok(h.chordPcs.includes(n.pc));assert.equal(n.chromaticDegree,h.intervals[h.chordPcs.indexOf(n.pc)]);if(i)assert.ok(n.midi>b.notes[i-1].midi);}}
  }
 }
});
test('pentatonic patterns travel diagonally without repeated boundary pitches and impossible registers are omitted',()=>{
 const a=harmonyAt({key:9,mode:'minor_pentatonic',chord:'min7'}),b=perStringFingerings(a,'three',0)[0];assert.equal(b.firstFret,5);assert.deepEqual(b.notes.filter(n=>n.string===0).map(n=>n.fret),[5,8,10]);assert.equal(new Set(b.notes.map(n=>n.midi)).size,18);assert.ok(b.end-b.start>10);
 const c=harmonyAt({key:0,mode:'minor_pentatonic',chord:'min7'});assert.deepEqual(perStringFingerings(c,'three',0),[]);
 assert.throws(()=>perStringFingerings(a,'bad'));assert.throws(()=>perStringFingerings(a,'three',5));
});

test('catalogue includes every distinct scale/chord starting tone, even when the pattern extends past fret 24',async()=>{
 const {perStringCatalogue}=await import('../src/guitar/per-string.js');
 for(let key=0;key<12;key++){
  for(const mode of Object.keys(MODES)){
   const h=harmonyAt({key,mode,chord:MODES[mode].chord}),entries=perStringCatalogue(h);
   assert.equal(entries.length,new Set(h.scalePcs).size);
   for(const e of entries){assert.ok(e.choices.length,`${mode} ${key} ${e.degree}`);for(const b of e.choices){assert.equal(b.notes[0].pc,h.scalePcs[e.degree]);assert.equal(b.notes.length,18);assert.ok(b.end<=36);if(!e.extended)assert.ok(b.end<=24);}}
  }
  for(const chord of Object.keys(CHORDS))for(const kind of ['oneTwo','twoOne']){
   const h=harmonyAt({key,mode:'lydian',chord}),entries=perStringCatalogue(h,kind);assert.equal(entries.length,new Set(h.chordPcs).size);
   for(const e of entries){assert.ok(e.choices.length,`${chord} ${key} ${kind} ${e.degree}`);for(const b of e.choices){assert.equal(b.notes[0].pc,h.chordPcs[e.degree]);assert.deepEqual(TUNING.map((_,s)=>b.notes.filter(n=>n.string===s).length),STRING_PATTERNS[kind]);assert.ok(b.end<=36);}}
  }
 }
 const h=harmonyAt({key:0,mode:'minor_pentatonic',chord:'min7'}),root=perStringCatalogue(h)[0];assert.equal(root.extended,true);assert.equal(root.choices[0].firstFret,8);assert.equal(root.choices[0].end,25);
});
