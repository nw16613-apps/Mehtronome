import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chordSheet} from '../src/practice/chord-sheet.js';
const repeats=(chords,durations,options={})=>(chordSheet(chords,durations,4,{repeatBars:true,...options}).match(/class="chart-bar-repeat"/g)||[]).length;
test('repeated harmony works across separate entries and held chords',()=>{
 assert.equal(repeats(['Am7','Am7','Am7','Am7'],[4,4,4,4]),3);
 assert.equal(repeats(['Am7'],[16]),3);
 assert.equal(repeats(['Am7','A7','Am7'],[4,4,4]),0);
 assert.equal(repeats(['Dm7','G7','Dm7','G7'],[2,2,2,2]),1);
 assert.equal(repeats(['Dm7','G7','G7','Dm7'],[2,2,2,2]),0);
 assert.equal(repeats(['Am7'],[6]),0);
 assert.equal(repeats(['Am7','Am7'],[4,4],{annotations:['Dorian','Aeolian']}),0);
});
