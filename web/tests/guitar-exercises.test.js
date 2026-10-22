import test from 'node:test';
import assert from 'node:assert/strict';
import {cagedExercise,tabRows} from '../src/guitar/exercises.js';

const harmony={chordPcs:[9,0,4,7,11],intervals:['1','♭3','5','♭7','9']};
const board={notes:[
  {string:0,fret:5,midi:45,pc:9},{string:0,fret:8,midi:48,pc:0},
  {string:1,fret:7,midi:52,pc:4},{string:2,fret:5,midi:55,pc:7},
  {string:2,fret:9,midi:59,pc:11},{string:3,fret:5,midi:60,pc:0},
]};

test('CAGED exercises stay inside the board and selected chord material',()=>{
  const triad=cagedExercise(board,harmony,'triad','ascending');
  assert.deepEqual(triad.map(note=>note.pc),[9,0,4,0]);
  assert.deepEqual(triad.map(note=>note.degree),['1','♭3','5','♭3']);
  assert.ok(triad.every(note=>board.notes.includes(board.notes.find(candidate=>candidate.midi===note.midi))));
});

test('exercise motions and TAB retain the physical string and fret',()=>{
  const descending=cagedExercise(board,harmony,'seventh','descending');
  assert.deepEqual(descending.map(note=>note.midi),[60,55,52,48,45]);
  const rows=tabRows(descending);
  assert.equal(rows[0].label,'E');
  assert.equal(rows.at(-1).label,'E');
  assert.equal(rows.find(row=>row.string===3).frets[0],'5');
});
