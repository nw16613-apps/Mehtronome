import {test} from 'node:test';import assert from 'node:assert/strict';
import {harmonyAt} from '../src/audio/music.js';import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';import {progressionStudyPlan} from '../src/practice/progression-timing.js';import {progressionNotationSvg} from '../src/practice/progression-notation.js';
test('cell/segment counts are omitted and position labels appear only when positions change, across systems and long slots',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),groups=['C','C','C','C','A','A','C'].map((shape,slot)=>{const board=fretboardFor(h,shape);return {slot,chord:'Am7',harmony:h,board,position:cagedPositionFor(board),annotation:slot%2?'Dorian · 6 cell segments':'Dorian · 5 cells',notes:[board.notes[0]]};});
 const plan=progressionStudyPlan(groups,[0,1,2,3,4,5,6],[1,1,1,2,1,1,1],4,'harmonized','sixteenths');
 for(const chordDiagrams of [false,true]){
  const svg=progressionNotationSvg(plan,'Captions',{chordDiagrams});assert.doesNotMatch(svg,/>\d+ cell(?: segments|s)?<\/text>/);
  const captions=[...svg.matchAll(/class="exercise-degree"[^>]*>([^<]+)<\/text>/g)].map(m=>m[1]).filter(c=>c.startsWith('Position '));assert.deepEqual(captions,['Position II · D shape','Position III · C shape','Position II · D shape']);
 }
});
