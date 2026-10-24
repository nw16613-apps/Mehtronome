import {test} from 'node:test';
import assert from 'node:assert/strict';
import {POSITIONS,fretboardFor,fullFretboardFor,fullFretboardSvg} from '../src/guitar/fretboard.js';
import {harmonyAt,MODES} from '../src/audio/music.js';
import {recommendedGrip} from '../src/guitar/grips.js';

test('full fretboard maps every scale and chord pitch from frets 1 through 17',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian',chord:'min13'});
  const board=fullFretboardFor(harmony);
  assert.equal(board.start,1);assert.equal(board.end,17);
  assert.ok(board.notes.length>50);
  assert.ok(board.notes.every(note=>note.fret>=1&&note.fret<=17));
  assert.ok(board.notes.every(note=>harmony.scalePcs.includes(note.pc)||harmony.chordPcs.includes(note.pc)));
  assert.ok(board.notes.filter(note=>note.root).every(note=>note.pc===9));
});

test('full fretboard highlights recommended chord shapes from every CAGED position',()=>{
  const harmony=harmonyAt({key:9,mode:'dorian',chord:'min13'});
  const regions=POSITIONS.map(position=>{const board=fretboardFor(harmony,position.shape);return {...position,start:board.start,end:board.end,grip:recommendedGrip(harmony,board)};});
  const grips=regions.filter(region=>region.grip).map(region=>({numeral:region.numeral,notes:region.grip.notes}));
  const svg=fullFretboardSvg(fullFretboardFor(harmony),true,MODES.dorian.degrees,'A Dorian',regions,'IV',true,null,true,grips);
  const uniqueNotes=new Set(grips.flatMap(grip=>grip.notes.map(note=>`${note.string}:${note.fret}`)));
  assert.match(svg,/class="fretboard full-fretboard grip-active"/);
  assert.equal((svg.match(/class="grip-ring"/g)||[]).length,uniqueNotes.size);
  assert.match(svg,/grip-note selected-grip-note/);
  assert.match(svg,/recommended chord shape/);
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
