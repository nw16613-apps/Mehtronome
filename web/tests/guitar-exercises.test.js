import test from 'node:test';
import assert from 'node:assert/strict';
import {cagedStudy,exerciseNotationSvg,flattenExercise} from '../src/guitar/exercises.js';

const scalePcs=[9,11,0,2,4,6,7],scaleNames=['A','B','C','D','E','F♯','G'];
const harmony={name:'A',suffix:'m7',tones:['A','C','E','G'],chordPcs:[9,0,4,7],scalePcs,scaleNames};
const board={notes:Array.from({length:30},(_,index)=>{
  const midi=45+index;
  const pc=midi%12,scaleIndex=scalePcs.indexOf(pc);
  return {string:index%6,fret:5+Math.floor(index/6),midi,pc,name:scaleNames[scaleIndex]};
}).filter(note=>scalePcs.includes(note.pc))};

test('harmonized CAGED study generates every modal tetrad inside the position',()=>{
  const groups=cagedStudy(board,harmony,'harmonized','seventh','ascending');
  assert.equal(groups.length,8);
  assert.deepEqual(groups.slice(0,4).map(group=>group.chord),['Am7','Bm7','Cmaj7','D7']);
  assert.ok(flattenExercise(groups).every(note=>board.notes.some(candidate=>candidate.string===note.string&&candidate.fret===note.fret)));
  assert.ok(groups.every(group=>group.notes.every((note,index)=>index===0||note.midi>group.notes[index-1].midi)));
});

test('exercise library provides cells, thirds and selected-chord inversions',()=>{
  const cells=cagedStudy(board,harmony,'cells','seventh','ascending');
  assert.deepEqual(cells[0].pcs,[9,11,0,4]);
  const thirds=cagedStudy(board,harmony,'thirds','seventh','ascending');
  assert.deepEqual(thirds[0].pcs,[9,0,11,2]);
  const inversions=cagedStudy(board,harmony,'inversions','seventh','ascending');
  assert.equal(inversions.length,4);
  assert.deepEqual(inversions.map(group=>group.rootName),['A','C','E','G']);
});

test('notation aligns chord symbols, staff notes and tablature in one SVG',()=>{
  const groups=cagedStudy(board,harmony,'harmonized','triad','ascending').slice(0,2);
  const svg=exerciseNotationSvg(groups,'eighths','A Dorian triads');
  assert.match(svg,/class="treble-clef"/);
  assert.match(svg,/class="tab-clef"/);
  assert.match(svg,/>Am</);
  assert.equal((svg.match(/class="note-head"/g)||[]).length,flattenExercise(groups).length);
  assert.equal((svg.match(/class="tab-fret"/g)||[]).length,flattenExercise(groups).length);
});
