import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TUNING, SHAPES, POSITIONS, positionFor, fretboardFor, diagramSvg} from '../src/guitar/fretboard.js';
import {MODES, CHORDS, harmonyAt} from '../src/audio/music.js';

test('CAGED root anchors match their standard open-shape roots in every transposition',()=>{
  assert.deepEqual(TUNING,[40,45,50,55,59,64]);
  for(let root=0;root<12;root++)for(const shape of Object.keys(SHAPES)){
    const position=positionFor(root,shape);
    assert.equal((TUNING[position.rootString]+position.rootFret)%12,root);
    assert.ok(position.rootFret>=position.start&&position.rootFret<=position.end);
    assert.equal(position.end-position.start,4);
    assert.ok(position.start>=0&&position.end<=15);
  }
  assert.deepEqual(Object.keys(SHAPES).map(shape=>positionFor(0,shape).start),[0,3,5,7,9]);
});

test('open C major reference has the correct notes, open strings and C-shape roots',()=>{
  const harmony=harmonyAt({key:0,mode:'major',chord:'maj7'});
  const board=fretboardFor(harmony,'C');
  const expected=[[0,1,3],[0,2,3],[0,2,3],[0,2,4],[0,1,3],[0,1,3]];
  for(let string=0;string<6;string++)assert.deepEqual(board.notes.filter(n=>n.string===string).map(n=>n.fret),expected[string]);
  assert.deepEqual(board.notes.filter(n=>n.root).map(n=>[n.string,n.fret]),[[1,3],[4,1]]);
  assert.equal(board.notes.find(n=>n.string===0&&n.fret===0).name,'E');
  assert.equal(board.notes.find(n=>n.string===1&&n.fret===3).name,'C');
  assert.equal(board.notes.filter(n=>n.fret===0).length,6);
});

test('all modes, keys and positions show only real scale/chord notes with correct root and degree flags',()=>{
  for(const [mode,definition] of Object.entries(MODES))for(let key=0;key<12;key++)for(const shape of Object.keys(SHAPES)){
    const harmony=harmonyAt({key,mode,chord:definition.chord});
    const board=fretboardFor(harmony,shape);
    assert.ok(board.notes.some(n=>n.root),`${key} ${mode} ${shape}`);
    for(const note of board.notes){
      assert.equal(note.midi,TUNING[note.string]+note.fret);
      assert.equal(note.pc,note.midi%12);
      assert.equal(note.root,note.pc===key);
      assert.equal(note.chord,harmony.chordPcs.includes(note.pc));
      assert.equal(note.scale,harmony.scalePcs.includes(note.pc));
      assert.ok(note.chord||note.scale);
      assert.ok(note.name);
    }
    const arpeggio=fretboardFor(harmony,shape,true);
    assert.ok(arpeggio.notes.every(note=>note.chord));
    assert.ok(arpeggio.notes.some(note=>note.root));
    assert.ok(arpeggio.notes.length<=board.notes.length);
  }
});

test('chord tones outside the chosen scale remain visible and diagrams follow jazz and diatonic harmony',()=>{
  for(const chord of Object.keys(CHORDS)){
    const harmony=harmonyAt({key:0,mode:'major',chord,progression:true,template:'fourths1'},1);
    for(const shape of Object.keys(SHAPES)){
      const board=fretboardFor(harmony,shape,true);
      assert.equal(board.rootPc,5);
      assert.ok(board.notes.every(note=>harmony.chordPcs.includes(note.pc)));
      assert.ok(board.notes.every(note=>note.name));
    }
  }
  const jazz=harmonyAt({key:0,progression:true,template:'major251'},0);
  assert.equal(fretboardFor(jazz).rootPc,2);
  const diatonic=harmonyAt({key:0,mode:'major',progression:true,template:'diatonic'},1);
  const board=fretboardFor(diatonic);
  assert.equal(board.rootPc,9);
  assert.ok(board.notes.filter(n=>n.root).every(n=>n.scaleIndex===5));
});

test('SVG identifies frets, tuning and note roles and changes to degree labels',()=>{
  const harmony=harmonyAt({key:0,mode:'dorian',chord:'min13'});
  const board=fretboardFor(harmony);
  const svg=diagramSvg(board,false,MODES.dorian.degrees,'C Dorian reference');
  assert.ok(svg.includes('role="img"'));
  assert.ok(svg.includes('class="fret-wire nut"'));
  assert.ok(svg.includes('string 5, fret 3, chord root'));
  assert.ok(diagramSvg(board,true,MODES.dorian.degrees,'Degrees').includes('>♭3</text>'));
});


test('Roman positions follow the E-D-C-A-G sequence without changing fretboard pitch data',()=>{
  assert.deepEqual(POSITIONS.map(position=>[position.numeral,position.shape]),[['I','E'],['II','D'],['III','C'],['IV','A'],['V','G']]);
  const harmony=harmonyAt({key:0,mode:'major',chord:'maj7'});
  assert.deepEqual(POSITIONS.map(position=>fretboardFor(harmony,position.shape).start),[7,9,0,3,5]);
});

test('horizontal diagrams have horizontal strings, vertical frets, high e above low E, and open notes left of the nut',()=>{
  const harmony=harmonyAt({key:0,mode:'major',chord:'maj7'});
  const svg=diagramSvg(fretboardFor(harmony,'C'),false,MODES.major.degrees,'Position III');
  const strings=[...svg.matchAll(/class="guitar-string"[^>]+x1="([^"]+)" x2="([^"]+)" y1="([^"]+)" y2="([^"]+)"/g)];
  assert.equal(strings.length,6);
  for(const line of strings){ assert.notEqual(line[1],line[2]);assert.equal(line[3],line[4]); }
  assert.ok(Number(strings[0][3])>Number(strings[5][3]));
  const frets=[...svg.matchAll(/class="fret-wire[^"]*" x1="([^"]+)" x2="([^"]+)" y1="([^"]+)" y2="([^"]+)"/g)];
  for(const line of frets){ assert.equal(line[1],line[2]);assert.notEqual(line[3],line[4]); }
  const nut=Number(svg.match(/class="fret-wire nut" x1="([^"]+)"/)[1]);
  const openX=Number(svg.match(/data-fret="0"[^>]*>.*?<circle cx="([^"]+)"/)[1]);
  assert.ok(openX<nut);
});
