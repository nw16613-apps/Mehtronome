import test from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt,MODES} from '../src/audio/music.js';import {POSITIONS,cagedPositionFor,fretboardFor,diagramSvg,occupiedFretRange} from '../src/guitar/fretboard.js';
test('reported A Dorian shapes exclude unused edge frets without changing the fingering windows or notes',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),expected={V:[2,5],I:[4,8],II:[7,10],III:[9,14],IV:[11,15]};
 for(const p of POSITIONS){const b=fretboardFor(h,p.shape),before=structuredClone(b),range=occupiedFretRange(b);assert.deepEqual([range.start,range.end],expected[cagedPositionFor(b).numeral]);const svg=diagramSvg(b,true,MODES.dorian.degrees,'A Dorian');const frets=[...svg.matchAll(/class="fret-number"[^>]*>(\d+)</g)].map(m=>Number(m[1]));assert.deepEqual(frets,Array.from({length:range.end-range.start+1},(_,i)=>range.start+i));assert.deepEqual(b,before);}
});
test('display extents preserve all notes and have an occupied fret at each edge for every scale, root and CAGED shape',()=>{
 for(const mode of Object.keys(MODES))for(let key=0;key<12;key++)for(const p of POSITIONS){const b=fretboardFor(harmonyAt({key,mode,chord:MODES[mode].chord}),p.shape),range=occupiedFretRange(b);assert.ok(b.notes.some(n=>n.fret===range.start));assert.ok(b.notes.some(n=>n.fret===range.end));assert.ok(b.notes.every(n=>n.fret>=range.start&&n.fret<=range.end));}
});
