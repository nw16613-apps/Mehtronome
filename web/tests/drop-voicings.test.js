import test from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {arpeggioHarmony} from '../src/guitar/arpeggio-harmony.js';import {dropVoicingCatalogue,DROP_STRING_SETS} from '../src/guitar/drop-voicings.js';
test('drop 2 and 3 voicings reverse into close position with the correct voice restored',()=>{
 for(const chord of ['maj7','min7','dom7','halfDim','dim7','minMaj7','six','min6','maj9','dom13'])for(let key=0;key<12;key++)for(const kind of ['drop2','drop3'])for(let set=0;set<DROP_STRING_SETS[kind].length;set++){
  const h=harmonyAt({key,mode:'major',chord}),core=arpeggioHarmony(h),entries=dropVoicingCatalogue(h,kind,set);assert.equal(entries.length,4);
  for(const e of entries){assert.ok(e.choices.length,`${chord} ${key} ${kind} ${set} inversion ${e.inversion}`);for(const b of e.choices){assert.equal(b.notes.length,4);assert.deepEqual(b.notes.map(n=>n.string),DROP_STRING_SETS[kind][set]);assert.equal(b.notes[0].pc,core.chordPcs[e.inversion]);assert.equal(new Set(b.notes.map(n=>n.pc)).size,4);assert.ok(b.notes.every(n=>core.chordPcs.includes(n.pc)&&n.fret>=1&&n.fret<=24));const restored=b.notes.map(n=>n.midi);restored[0]+=12;restored.sort((a,b)=>a-b);assert.ok(restored.at(-1)-restored[0]<12);assert.equal(restored[kind==='drop2'?2:1],b.notes[0].midi+12);}}
 }
});
test('canonical Cmaj7 shapes and unsupported chords are handled explicitly',()=>{
 const h=harmonyAt({key:0,mode:'major',chord:'maj7'}),a=dropVoicingCatalogue(h,'drop2',1)[0].choices,b=dropVoicingCatalogue(h,'drop3',0)[0].choices;
 assert.ok(a.some(v=>JSON.stringify(v.notes.map(n=>n.fret))==='[3,5,4,5]'));assert.ok(b.some(v=>JSON.stringify(v.notes.map(n=>n.fret))==='[8,9,9,8]'));assert.deepEqual(dropVoicingCatalogue(harmonyAt({key:0,mode:'major',chord:'major'}),'drop2'),[]);
});
