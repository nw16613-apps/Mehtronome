import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TUNING, SHAPES, POSITIONS, positionFor, fretboardFor, diagramSvg, parentMajorFor} from '../src/guitar/fretboard.js';
import {MODES, CHORDS, harmonyAt} from '../src/audio/music.js';

test('CAGED root anchors stay correct in fully fretted positions in every key',()=>{
  assert.deepEqual(TUNING,[40,45,50,55,59,64]);
  for(let root=0;root<12;root++)for(const shape of Object.keys(SHAPES)){
    const position=positionFor(root,shape);
    assert.equal((TUNING[position.rootString]+position.rootFret)%12,root);
    assert.ok(position.rootFret>=position.start&&position.rootFret<=position.end);
    assert.equal(position.end-position.start,['A','G'].includes(shape)?5:4);
    assert.ok(position.start>=1&&position.end<=17);
  }
  assert.deepEqual(Object.keys(SHAPES).map(shape=>positionFor(0,shape).start),[12,2,4,7,9]);
});

test('C major C form moves up an octave with the same notes and root pattern',()=>{
  const harmony=harmonyAt({key:0,mode:'major',chord:'maj7'});
  const board=fretboardFor(harmony,'C');
  const expected=[[12,13,15],[12,14,15],[12,14,15],[12,14,16],[12,13,15],[12,13,15]];
  for(let string=0;string<6;string++)assert.deepEqual(board.notes.filter(n=>n.string===string).map(n=>n.fret),expected[string]);
  assert.deepEqual(board.notes.filter(n=>n.root).map(n=>[n.string,n.fret]),[[1,15],[4,13]]);
  assert.equal(board.notes.find(n=>n.string===0&&n.fret===12).name,'E');
  assert.equal(board.notes.find(n=>n.string===1&&n.fret===15).name,'C');
  assert.equal(board.notes.filter(n=>n.fret===0).length,0);
});

test('all modes, keys and positions show only real scale/chord notes with correct root and degree flags',()=>{
  for(const [mode,definition] of Object.entries(MODES))for(let key=0;key<12;key++)for(const shape of Object.keys(SHAPES)){
    const harmony=harmonyAt({key,mode,chord:definition.chord});
    const board=fretboardFor(harmony,shape);
    assert.ok(board.notes.some(n=>n.root),`${key} ${mode} ${shape}`);
    for(const note of board.notes){
      assert.ok(note.fret > 0);
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
  assert.ok(!svg.includes('class="fret-wire nut"'));
  assert.ok(svg.includes('string 4, fret 10, chord root'));
  assert.equal(board.anchorName,'B♭');
  assert.ok(diagramSvg(board,true,MODES.dorian.degrees,'Degrees').includes('>♭3</text>'));
});


test('Roman positions follow the E-D-C-A-G sequence without changing fretboard pitch data',()=>{
  assert.deepEqual(POSITIONS.map(position=>[position.numeral,position.shape]),[['I','E'],['II','D'],['III','C'],['IV','A'],['V','G']]);
  const harmony=harmonyAt({key:0,mode:'major',chord:'maj7'});
  assert.deepEqual(POSITIONS.map(position=>fretboardFor(harmony,position.shape).start),[7,9,12,2,4]);
});

test('horizontal diagrams have horizontal strings, vertical frets, high E above low E, and no open strings',()=>{
  const harmony=harmonyAt({key:0,mode:'major',chord:'maj7'});
  const svg=diagramSvg(fretboardFor(harmony,'C'),false,MODES.major.degrees,'Position III');
  const strings=[...svg.matchAll(/class="guitar-string"[^>]+x1="([^"]+)" x2="([^"]+)" y1="([^"]+)" y2="([^"]+)"/g)];
  assert.equal(strings.length,6);
  for(const line of strings){ assert.notEqual(line[1],line[2]);assert.equal(line[3],line[4]); }
  assert.ok(Number(strings[0][3])>Number(strings[5][3]));
  const frets=[...svg.matchAll(/class="fret-wire[^"]*" x1="([^"]+)" x2="([^"]+)" y1="([^"]+)" y2="([^"]+)"/g)];
  for(const line of frets){ assert.equal(line[1],line[2]);assert.notEqual(line[3],line[4]); }
  assert.ok(!svg.includes('data-fret="0"'));
  assert.ok(!svg.includes('fret-wire nut'));
});


test('A-form C-major fingering relocates B, E and A to the next string at fret two',()=>{
  const info=harmonyAt({key:0,mode:'major',chord:'maj9'});
  for(const chordOnly of [false,true]){
    const board=fretboardFor(info,'A',chordOnly);
    assert.equal(board.start,2);assert.equal(board.end,7);assert.equal(board.rootFret,3);
    for(const [string,name] of [[1,'B'],[2,'E'],[3,'A']]){
      assert.ok(!board.notes.some(n=>n.string===string-1&&n.fret===7));
      if(!chordOnly||name!=='A')assert.equal(board.notes.find(n=>n.string===string&&n.fret===2)?.name,name);
    }
    assert.equal(board.notes.find(n=>n.string===5&&n.fret===7)?.name,'B');
    assert.ok(!board.notes.some(n=>n.string===3&&n.fret===7));
  }
});

test('A-form string windows omit the far G-string endpoint, transpose across all modes and avoid open frets',()=>{
  for(const [mode,definition] of Object.entries(MODES))for(let key=0;key<12;key++)for(const chordOnly of [false,true]){
    const info=harmonyAt({key,mode,chord:definition.chord}),board=fretboardFor(info,'A',chordOnly);
    const expected=[];
    const fingeringIntervals=info.scalePcs.map(pc=>(pc-board.anchorPc+12)%12).sort((a,b)=>a-b);
    // Compare against the original rectangular pitch collection at the same root.
    for(const [string,tuning] of TUNING.entries())for(let fret=board.rootFret;fret<=board.rootFret+4;fret++){
      const midi=tuning+fret,pc=midi%12;
      if(string===3 && midi>=TUNING[1]+board.rootFret+12+fingeringIntervals[1])continue;
      if(chordOnly?info.chordPcs.includes(pc):info.chordPcs.includes(pc)||info.scalePcs.includes(pc))expected.push(midi);
    }
    assert.ok(!board.notes.some(n=>n.string===3&&n.midi===TUNING[1]+board.rootFret+12+fingeringIntervals[1]));
    assert.deepEqual(board.notes.map(n=>n.midi).sort((a,b)=>a-b),expected.sort((a,b)=>a-b));
    assert.ok(board.notes.every(n=>n.fret>=board.start&&n.fret<=board.end&&n.fret>0));
    if(!chordOnly||info.chordPcs.includes(board.anchorPc))assert.ok(board.notes.some(n=>n.pc===board.anchorPc&&n.string===1&&n.fret===board.rootFret));
    const svg=diagramSvg(board,true,definition.degrees,'Position IV',true);
    assert.ok(!svg.includes('data-fret="0"'));assert.ok(svg.includes(`>${board.start}</text>`));
  }
});


test('G-form C-major B moves from D-string fret nine to G-string fret four',()=>{
  const info=harmonyAt({key:0,mode:'major',chord:'maj9'});
  for(const chordOnly of [false,true]){
    const board=fretboardFor(info,'G',chordOnly);
    assert.equal(board.start,4);assert.equal(board.end,9);assert.equal(board.rootFret,8);
    assert.ok(!board.notes.some(n=>n.string===2&&n.fret===9));
    assert.ok(!board.notes.some(n=>n.string===3&&n.fret===9));
    const note=board.notes.find(n=>n.string===3&&n.fret===4);
    assert.equal(note?.name,'B');assert.equal(note.midi,59);assert.ok(note.chord&&note.characteristic);
    assert.equal(board.notes.find(n=>n.string===2&&n.fret===7)?.name,chordOnly?undefined:'A');
  }
});

test('G-form relocation and shorter G-string boundary transpose across modes and keys without open strings',()=>{
  for(const [mode,definition] of Object.entries(MODES))for(let key=0;key<12;key++)for(const chordOnly of [false,true]){
    const info=harmonyAt({key,mode,chord:definition.chord}),board=fretboardFor(info,'G',chordOnly);
    const expected=[];
    const fingeringIntervals=info.scalePcs.map(pc=>(pc-board.anchorPc+12)%12).sort((a,b)=>a-b);
    const melodicMinor=definition.family==='Melodic minor';
    for(const [string,tuning] of TUNING.entries())for(let fret=board.rootFret-3;fret<=board.rootFret+1;fret++){
      const midi=tuning+fret,pc=midi%12;
      if(string===3 && midi>=TUNING[0]+board.rootFret+12+fingeringIntervals[2] && !melodicMinor)continue;
      if(chordOnly?info.chordPcs.includes(pc):info.chordPcs.includes(pc)||info.scalePcs.includes(pc))expected.push(midi);
    }
    assert.equal(board.notes.some(n=>n.string===3&&n.midi===TUNING[0]+board.rootFret+12+fingeringIntervals[2]),melodicMinor&&(!chordOnly||info.chordPcs.includes((board.anchorPc+fingeringIntervals[2])%12)));
    assert.deepEqual(board.notes.map(n=>n.midi).sort((a,b)=>a-b),expected.sort((a,b)=>a-b));
    assert.ok(board.notes.every(n=>n.fret>=board.start&&n.fret<=board.end&&n.fret>0));
    assert.ok(!board.notes.some(n=>n.string===2&&n.midi===TUNING[0]+board.rootFret+fingeringIntervals[6]));
    if(!chordOnly||info.chordPcs.includes(board.anchorPc))assert.ok(board.notes.some(n=>n.pc===board.anchorPc&&n.string===0&&n.fret===board.rootFret));
  }
});

test('all major-scale modes share the exact parent-major shapes in all keys with modal root highlights',()=>{
  const modes=['major','dorian','phrygian','lydian','mixolydian','minor','locrian'];
  for(let parent=0;parent<12;parent++)for(const [rotation,mode] of modes.entries()){
    const key=(parent+MODES.major.intervals[rotation])%12;
    const info=harmonyAt({key,mode,chord:MODES[mode].chord});
    assert.equal(parentMajorFor(info).pc,parent);
    for(const shape of Object.keys(SHAPES)){
      const board=fretboardFor(info,shape),reference=fretboardFor(harmonyAt({key:parent,mode:'major',chord:'maj9'}),shape);
      const coordinates=board=>board.notes.map(n=>[n.string,n.fret,n.midi]);
      assert.deepEqual(coordinates(board),coordinates(reference),`${parent}: ${mode} ${shape}`);
      assert.equal(board.start,reference.start);assert.equal(board.end,reference.end);
      assert.equal(board.anchorPc,parent);assert.equal(board.rootPc,key);
      assert.ok(board.notes.some(n=>n.root));
      for(const note of board.notes)assert.equal(note.root,note.pc===key);
      const arpeggio=fretboardFor(info,shape,true);
      assert.ok(arpeggio.notes.every(n=>n.chord));assert.ok(arpeggio.notes.some(n=>n.root));
    }
  }
  const cMixolydian=harmonyAt({key:0,mode:'mixolydian',chord:'dom13'});
  assert.deepEqual(parentMajorFor(cMixolydian),{pc:5,name:'F',family:'Major scale'});
  assert.equal(fretboardFor(cMixolydian,'A').rootFret,8);
  assert.deepEqual(parentMajorFor(harmonyAt({key:0,mode:'melodic_minor'})),{pc:0,name:'C',family:'Melodic minor'});
});

test('melodic-minor and harmonic-minor modes retain their parent-scale fingering geometry',()=>{
  const families=[
    {parent:'melodic_minor',modes:['melodic_minor','dorian_b2','lydian_augmented','lydian_dominant','mixolydian_b6','locrian_natural2','altered']},
    {parent:'harmonic_minor',modes:['harmonic_minor','locrian_natural6','ionian_sharp5','dorian_sharp4','phrygian_dominant','lydian_sharp2','ultralocrian']},
  ];
  for(const family of families)for(const parent of [0,5,9]){
    const parentHarmony=harmonyAt({key:parent,mode:family.parent,chord:MODES[family.parent].chord});
    for(const [rotation,mode] of family.modes.entries()){
      const key=parentHarmony.scalePcs[rotation],info=harmonyAt({key,mode,chord:MODES[mode].chord});
      assert.equal(parentMajorFor(info).pc,parent);
      for(const shape of Object.keys(SHAPES)){
        const coordinates=board=>board.notes.map(note=>[note.string,note.fret,note.pc]);
        assert.deepEqual(coordinates(fretboardFor(info,shape)),coordinates(fretboardFor(parentHarmony,shape)),`${parent} ${mode} ${shape}`);
      }
    }
  }
});

test('melodic-minor parent geometry places the flat third correctly in A and G forms for every mode and key',()=>{
  const modes=['melodic_minor','dorian_b2','lydian_augmented','lydian_dominant','mixolydian_b6','locrian_natural2','altered'];
  for(let parent=0;parent<12;parent++){
    const parentHarmony=harmonyAt({key:parent,mode:'melodic_minor',chord:MODES.melodic_minor.chord});
    const flatThird=(parent+3)%12;
    for(const [rotation,mode] of modes.entries()){
      const key=parentHarmony.scalePcs[rotation];
      const info=harmonyAt({key,mode,chord:MODES[mode].chord});
      const a=fretboardFor(info,'A'),g=fretboardFor(info,'G');
      assert.ok(a.notes.some(note=>note.string===1&&note.pc===flatThird),`${parent} ${mode} A form keeps ♭3 on A string`);
      assert.ok(!a.notes.some(note=>note.string===2&&note.pc===flatThird),`${parent} ${mode} A form removes ♭3 from D string`);
      assert.ok(g.notes.some(note=>note.string===3&&note.pc===flatThird),`${parent} ${mode} G form includes ♭3 on G string`);
    }
  }
});

test('diatonic harmony keeps its parent shapes while chord roots change, and jazz follows each scale',()=>{
  for(const mode of ['major','minor'])for(const step of [0,1,2,3]){
    const info=harmonyAt({key:0,mode,progression:true,template:'diatonic'},step);
    const reference=harmonyAt({key:0,mode});
    for(const shape of Object.keys(SHAPES)){
      const board=fretboardFor(info,shape),base=fretboardFor(reference,shape);
      assert.deepEqual(board.notes.map(n=>[n.string,n.fret,n.pc]),base.notes.map(n=>[n.string,n.fret,n.pc]));
      assert.ok(board.notes.filter(n=>n.root).every(n=>n.pc===info.midi[0]%12));
    }
  }
  assert.equal(parentMajorFor(harmonyAt({key:0,progression:true,template:'major251'},0)).name,'C');
  assert.deepEqual(parentMajorFor(harmonyAt({key:0,progression:true,template:'major251'},1)),{pc:8,name:'A♭',family:'Melodic minor'});
  assert.equal(parentMajorFor(harmonyAt({key:0,progression:true,template:'major251'},2)).name,'G');
});
