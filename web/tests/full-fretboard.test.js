import {test} from 'node:test';
import assert from 'node:assert/strict';
import {POSITIONS,fretboardFor,fullFretboardFor,fullFretboardSvg} from '../src/guitar/fretboard.js';
import {harmonyAt,MODES} from '../src/audio/music.js';

test('full fretboard maps every scale and chord pitch from frets 1 through 17',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian',chord:'min13'});
  const board=fullFretboardFor(harmony);
  assert.equal(board.start,1);assert.equal(board.end,17);
  assert.ok(board.notes.length>50);
  assert.ok(board.notes.every(note=>note.fret>=1&&note.fret<=17));
  assert.ok(board.notes.every(note=>harmony.scalePcs.includes(note.pc)||harmony.chordPcs.includes(note.pc)));
  assert.ok(board.notes.filter(note=>note.root).every(note=>note.pc===9));
});

test('full fretboard renders selectable CAGED regions and shared theory overlays',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian',chord:'min13'});
  const regions=POSITIONS.map(position=>{const board=fretboardFor(harmony,position.shape);return {...position,start:board.start,end:board.end};});
  const theory={kind:'pentatonic',name:'A minor pentatonic',rootPc:9,pcs:[9,0,2,4,7]};
  const svg=fullFretboardSvg(fullFretboardFor(harmony),true,MODES.dorian.degrees,'A Dorian',regions,'IV',true,theory,true);
  assert.equal((svg.match(/class="caged-region/g)||[]).length,5);
  assert.match(svg,/class="caged-region selected" data-full-position="IV"/);
  assert.match(svg,/class="fretboard full-fretboard theory-active theory-pentatonic"/);
  assert.match(svg,/class="theory-ring"/);
  assert.match(svg,/aria-label="A Dorian, pentatonic overlay: A minor pentatonic"/);
});
