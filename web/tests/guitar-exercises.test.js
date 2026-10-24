import test from 'node:test';
import assert from 'node:assert/strict';
import {cagedStudy,exerciseNotationSvg,flattenExercise} from '../src/guitar/exercises.js';
import {theoryOptions} from '../src/guitar/superimposition.js';

const scalePcs=[9,11,0,2,4,6,7],scaleNames=['A','B','C','D','E','F♯','G'];
const SHARP_TEST_NAMES=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const harmony={name:'A',suffix:'m7',tones:['A','C','E','G'],intervals:['1','♭3','5','♭7'],chordPcs:[9,0,4,7],scalePcs,scaleNames};
const board={notes:Array.from({length:30},(_,index)=>{
  const midi=45+index;
  const pc=midi%12,scaleIndex=scalePcs.indexOf(pc);
  return {string:index%6,fret:5+Math.floor(index/6),midi,pc,name:scaleNames[scaleIndex]};
}).filter(note=>scalePcs.includes(note.pc))};

test('harmonized CAGED tetrads follow the reference contour from the position edge',()=>{
  const groups=cagedStudy(board,harmony,'harmonized','seventh','ascending');
  assert.ok(groups.length>=8);
  assert.deepEqual(groups.slice(0,4).map(group=>group.chord),['Am7','Bm7','Cmaj7','D7']);
  assert.equal(groups[0].notes[0].midi,Math.min(...board.notes.map(note=>note.midi)));
  assert.ok(flattenExercise(groups).every(note=>board.notes.some(candidate=>candidate.string===note.string&&candidate.fret===note.fret)));
  assert.ok(groups.every(group=>group.notes.every((note,index)=>index===0||note.midi>group.notes[index-1].midi)));
  const descending=cagedStudy(board,harmony,'harmonized','seventh','descending');
  assert.equal(descending[0].notes[0].midi,Math.max(...board.notes.map(note=>note.midi)));
  assert.ok(descending.every(group=>group.notes.every((note,index)=>index===0||note.midi<group.notes[index-1].midi)));
  assert.deepEqual(cagedStudy(board,harmony,'harmonized','seventh','up-down')[0].notes.map(note=>note.midi),[45,48,52,55,52,48,45]);
  assert.deepEqual(cagedStudy(board,harmony,'harmonized','seventh','down-up')[0].notes.map(note=>note.midi),[74,71,67,64,67,71,74]);
});

test('scale-sequence library starts every direction at the position boundary',()=>{
  const cells=cagedStudy(board,harmony,'cells','seventh','ascending');
  assert.deepEqual(cells[0].pcs,[9,11,0,4]);
  const thirds=cagedStudy(board,harmony,'thirds','seventh','ascending');
  assert.deepEqual(thirds[0].pcs,[9,0]);
  for(const study of ['thirds','fourths','sixths','groups3','groups4','digital1324','cells']){
    assert.equal(cagedStudy(board,harmony,study,'seventh','ascending')[0].notes[0].midi,45,study);
    assert.equal(cagedStudy(board,harmony,study,'seventh','descending')[0].notes[0].midi,74,study);
  }
  assert.deepEqual(cagedStudy(board,harmony,'groups3','seventh','ascending')[0].notes.map(note=>note.midi),[45,47,48]);
  assert.deepEqual(cagedStudy(board,harmony,'groups4','seventh','ascending')[0].notes.map(note=>note.midi),[45,47,48,50]);
  assert.deepEqual(cagedStudy(board,harmony,'digital1324','seventh','ascending')[0].notes.map(note=>note.midi),[45,48,47,50]);
  const alternating=cagedStudy(board,harmony,'alternating7','seventh','ascending');
  assert.equal(alternating[0].notes[0].midi,45);
  assert.ok(alternating[0].notes.every((note,index)=>index===0||note.midi>alternating[0].notes[index-1].midi));
  assert.ok(alternating[1].notes.every((note,index)=>index===0||note.midi<alternating[1].notes[index-1].midi));
});

test('diatonic triad and tetrad studies provide up/down, down/up and combined forms',()=>{
  for(const [size,suffix] of [[3,'3'],[4,'7']]){
    const up=cagedStudy(board,harmony,`alternating${suffix}`,'seventh','ascending');
    const down=cagedStudy(board,harmony,`alternating${suffix}down`,'seventh','ascending');
    const combined=cagedStudy(board,harmony,`alternating${suffix}combined`,'seventh','ascending');
    assert.ok(up.every(group=>group.notes.length===size));
    assert.ok(down.every(group=>group.notes.length===size));
    assert.equal(up[0].notes[0].midi,45);
    assert.equal(down[0].notes[0].midi,74);
    assert.ok(up[0].notes[1].midi>up[0].notes[0].midi);
    assert.ok(up[1].notes[1].midi<up[1].notes[0].midi);
    assert.ok(down[0].notes[1].midi<down[0].notes[0].midi);
    assert.ok(down[1].notes[1].midi>down[1].notes[0].midi);
    assert.deepEqual(flattenExercise(combined).map(note=>note.midi),[...flattenExercise(up),...flattenExercise(down)].map(note=>note.midi));
  }
});

test('shared material and direction controls select every alternating arpeggio form',()=>{
  for(const [material,size] of [['triad',3],['seventh',4]]){
    const up=cagedStudy(board,harmony,'alternating',material,'ascending');
    const down=cagedStudy(board,harmony,'alternating',material,'descending');
    const both=cagedStudy(board,harmony,'alternating',material,'up-down');
    const reverse=cagedStudy(board,harmony,'alternating',material,'down-up');
    assert.ok(up.every(group=>group.notes.length===size));
    assert.deepEqual(flattenExercise(both).map(note=>note.midi),[...flattenExercise(up),...flattenExercise(down)].map(note=>note.midi));
    assert.deepEqual(flattenExercise(reverse).map(note=>note.midi),[...flattenExercise(down),...flattenExercise(up)].map(note=>note.midi));
    const chordUp=cagedStudy(board,harmony,'chordtonesalternating',material,'ascending');
    const chordDown=cagedStudy(board,harmony,'chordtonesalternating',material,'descending');
    assert.deepEqual(flattenExercise(cagedStudy(board,harmony,'chordtonesalternating',material,'up-down')).map(note=>note.midi),[...flattenExercise(chordUp),...flattenExercise(chordDown)].map(note=>note.midi));
    assert.deepEqual(flattenExercise(cagedStudy(board,harmony,'chordtonesalternating',material,'down-up')).map(note=>note.midi),[...flattenExercise(chordDown),...flattenExercise(chordUp)].map(note=>note.midi));
  }
});

test('exercise library provides selected-chord inversions',()=>{
  const inversions=cagedStudy(board,harmony,'inversions','seventh','ascending');
  assert.equal(inversions.length,4);
  assert.deepEqual(new Set(inversions.map(group=>group.rootName)),new Set(['A','C','E','G']));
  assert.equal(inversions[0].notes[0].midi,Math.min(...board.notes.filter(note=>harmony.chordPcs.includes(note.pc)).map(note=>note.midi)));
  const descending=cagedStudy(board,harmony,'inversions','seventh','descending');
  assert.equal(descending[0].notes[0].midi,Math.max(...board.notes.filter(note=>harmony.chordPcs.includes(note.pc)).map(note=>note.midi)));
});

test('chord-tone tetrads stack diatonic thirds from every available chord tone',()=>{
  const groups=cagedStudy(board,harmony,'chordtones7','seventh','ascending');
  assert.ok(groups.length>=4);
  assert.deepEqual(groups.slice(0,4).map(group=>group.chord),[
    'From 1 · Am7','From ♭3 · Cmaj7','From 5 · Em7','From ♭7 · Gmaj7'
  ]);
  assert.deepEqual(groups[0].notes.map(note=>note.midi),[45,48,52,55]);
  assert.deepEqual(groups[1].notes.map(note=>note.midi),[48,52,55,59]);
  assert.ok(groups.every(group=>group.notes.length===4));
  assert.ok(groups.every(group=>group.notes.every((note,index)=>index===0||note.midi>group.notes[index-1].midi)));
  const descending=cagedStudy(board,harmony,'chordtones7','seventh','descending');
  assert.equal(descending[0].notes[0].midi,Math.max(...groups.flatMap(group=>group.notes.map(note=>note.midi))));
  assert.ok(descending.every(group=>group.notes.every((note,index)=>index===0||note.midi<group.notes[index-1].midi)));
});

test('up/down chord-tone tetrads alternate ascending and descending groups',()=>{
  const groups=cagedStudy(board,harmony,'chordtones7turns','seventh','descending');
  assert.ok(groups.length>=4);
  assert.deepEqual(groups[0].notes.map(note=>note.midi),[45,48,52,55]);
  assert.deepEqual(groups[1].notes.map(note=>note.midi),[59,55,52,48]);
  assert.deepEqual(groups[2].notes.map(note=>note.midi),[52,55,59,62]);
  assert.ok(groups.every(group=>group.notes.length===4));
});

test('down/up chord-tone tetrads alternate descending and ascending groups from the top',()=>{
  const ascending=cagedStudy(board,harmony,'chordtones7','seventh','ascending');
  const groups=cagedStudy(board,harmony,'chordtones7turnsdown','seventh','ascending');
  const highest=Math.max(...ascending.flatMap(group=>group.notes.map(note=>note.midi)));
  assert.equal(groups[0].notes[0].midi,highest);
  assert.ok(groups[0].notes.every((note,index)=>index===0||note.midi<groups[0].notes[index-1].midi));
  assert.ok(groups[1].notes.every((note,index)=>index===0||note.midi>groups[1].notes[index-1].midi));
  assert.equal(Math.min(...groups.flatMap(group=>group.notes.map(note=>note.midi))),45);
  assert.ok(groups.every(group=>group.notes.length===4));
});

test('chord-tone triads mirror every tetrad sequence and combined studies join both directions',()=>{
  const straight=cagedStudy(board,harmony,'chordtones3','seventh','ascending');
  assert.deepEqual(straight.slice(0,4).map(group=>group.chord),[
    'From 1 · Am','From ♭3 · C','From 5 · Em','From ♭7 · G'
  ]);
  assert.deepEqual(straight[0].notes.map(note=>note.midi),[45,48,52]);
  const up=cagedStudy(board,harmony,'chordtones3turns','seventh','ascending');
  const down=cagedStudy(board,harmony,'chordtones3turnsdown','seventh','ascending');
  assert.deepEqual(up[0].notes.map(note=>note.midi),[45,48,52]);
  assert.deepEqual(up[1].notes.map(note=>note.midi),[55,52,48]);
  assert.ok(down[0].notes.every((note,index)=>index===0||note.midi<down[0].notes[index-1].midi));
  assert.ok(down[1].notes.every((note,index)=>index===0||note.midi>down[1].notes[index-1].midi));
  for(const [size,prefix] of [[3,'chordtones3'],[4,'chordtones7']]){
    const ascending=cagedStudy(board,harmony,`${prefix}turns`,'seventh','ascending');
    const descending=cagedStudy(board,harmony,`${prefix}turnsdown`,'seventh','ascending');
    const combined=cagedStudy(board,harmony,`${prefix}combined`,'seventh','ascending');
    assert.ok(combined.every(group=>group.notes.length===size));
    assert.deepEqual(flattenExercise(combined).map(note=>note.midi),[...flattenExercise(ascending),...flattenExercise(descending)].map(note=>note.midi));
  }
});

test('notation aligns its single exercise title, written guitar notes and tablature',()=>{
  const groups=cagedStudy(board,harmony,'harmonized','triad','ascending').slice(0,2);
  const svg=exerciseNotationSvg(groups,'eighths','A Dorian triads');
  assert.match(svg,/class="treble-clef"/);
  assert.match(svg,/class="tab-clef"/);
  assert.equal((svg.match(/class="exercise-title"/g)||[]).length,1);
  assert.match(svg,/>A Dorian triads</);
  assert.equal((svg.match(/class="note-head"/g)||[]).length,flattenExercise(groups).length);
  assert.equal((svg.match(/class="tab-fret"/g)||[]).length,flattenExercise(groups).length);
  assert.equal((svg.match(/class="pattern-bracket"/g)||[]).length,groups.length);
  assert.match(svg,/class="pattern-bracket" d="M [^"]+ 246 V 250 H [^"]+ V 246"/);
});

test('long notation wraps into multiple complete systems',()=>{
  const groups=cagedStudy(board,harmony,'alternating','seventh','up-down');
  const svg=exerciseNotationSvg(groups,'eighths','Combined tetrads');
  assert.ok((svg.match(/class="exercise-notation"/g)||[]).length>1);
  assert.equal((svg.match(/class="note-head"/g)||[]).length,flattenExercise(groups).length);
  assert.equal((svg.match(/class="treble-clef"/g)||[]).length,(svg.match(/class="exercise-notation"/g)||[]).length);
  assert.equal((svg.match(/class="phrase-cell/g)||[]).length,0);
  assert.equal((svg.match(/class="exercise-title"/g)||[]).length,1);
  assert.equal((svg.match(/class="pattern-bracket"/g)||[]).length,groups.length);
  const indexes=[...svg.matchAll(/class="exercise-note[^>]*data-note-index="(\d+)"/g)].map(match=>Number(match[1]));
  assert.deepEqual(indexes,Array.from({length:flattenExercise(groups).length},(_,index)=>index));
});

test('jazz language library generates playable notation for every new study family',()=>{
  const boundedBoard={...board,start:1,end:12};
  const modalHarmony={...harmony,mode:'dorian',midi:[57,60,64,67]};
  const studies=['enclosures','enclosuresbelowabove','enclosureschromatic','enclosuresdouble','enclosuresfiveone','enclosuresfivetwo','enclosuresfivethree','enclosuresfivefour','approach','doubleapproach','chromaticneighbors','passingtones','approacheverytone','upperstructure','guidetones','connections','triadpairs','pentatonic'];
  for(const study of studies){
    const groups=cagedStudy(boundedBoard,modalHarmony,study,'seventh','ascending',{progression:[modalHarmony]});
    assert.ok(groups.length>0,`${study} should produce at least one group`);
    assert.ok(flattenExercise(groups).length>0,`${study} should produce notes`);
    assert.ok(flattenExercise(groups).every(note=>note.fret>=boundedBoard.start&&note.fret<=boundedBoard.end),`${study} should stay in the displayed fret range`);
    assert.match(exerciseNotationSvg(groups,'eighths',study),/class="tab-fret"/,`${study} should render TAB`);
  }
  assert.ok(cagedStudy(boundedBoard,modalHarmony,'enclosures').some(group=>group.notes.some(note=>!modalHarmony.scalePcs.includes(note.pc))),'enclosures should include chromatic neighbours');
  assert.ok(cagedStudy(boundedBoard,modalHarmony,'upperstructure')[0].annotation.includes('9'));
  assert.ok(cagedStudy(boundedBoard,modalHarmony,'triadpairs')[0].source);
  assert.equal(cagedStudy(boundedBoard,modalHarmony,'pentatonic')[0].source,undefined);
});

test('pentatonic library provides groups, cells and alternating up/down permutations',()=>{
  const boundedBoard={...board,start:1,end:12};
  const modalHarmony={...harmony,mode:'dorian',midi:[57,60,64,67]};
  const patterns={groups3:3,groups4:4,groups5:5,groups6:6,thirds:2,digital1324:4,rolling:4,alternating3:3,alternating4:4,alternating5:5,lesson3:3,lesson4:4,lesson5:5,lesson6:6,
    lesson64:10,lesson46:10,lesson43:7,lesson34:7,lesson45:9,lesson54:9,lesson65:11,lesson56:11,lesson456:15,
    cascade64:10,cascade46:10,cascade43:7,cascade34:7,cascade45:9,cascade54:9,cascade65:11,cascade56:11,cascade456:15};
  for(const [pattern,size] of Object.entries(patterns)){
    const groups=cagedStudy(boundedBoard,modalHarmony,'pentatonic','seventh','ascending',{pattern});
    assert.ok(groups.length>0,pattern);
    assert.ok(groups.every(group=>group.notes.length===size),pattern);
    assert.ok(flattenExercise(groups).every(note=>modalHarmony.scalePcs.includes(note.pc)),pattern);
  }
  const alternating=cagedStudy(boundedBoard,modalHarmony,'pentatonic','seventh','ascending',{pattern:'alternating4'});
  assert.ok(alternating[0].notes[1].midi>alternating[0].notes[0].midi);
  assert.ok(alternating[1].notes[1].midi<alternating[1].notes[0].midi);
  const descending=cagedStudy(boundedBoard,modalHarmony,'pentatonic','seventh','descending',{pattern:'groups3'});
  assert.ok(descending[0].notes[1].midi<descending[0].notes[0].midi);
});

test('cascading pentatonic cells reproduce the video exercise families',()=>{
  const boundedBoard={...board,start:1,end:12};
  const modalHarmony={...harmony,mode:'dorian',midi:[57,60,64,67]};
  const selectedPentatonic=theoryOptions(modalHarmony).pentatonics[0];
  const descendingAvailable=[...new Map(boundedBoard.notes.filter(note=>selectedPentatonic.pcs.includes(note.pc)).map(note=>[note.midi,note])).values()].sort((a,b)=>b.midi-a.midi);
  for(const pattern of ['lesson3','lesson4','lesson5','lesson6']){
    const groups=cagedStudy(boundedBoard,modalHarmony,'pentatonic','seventh','descending',{pattern});
    assert.ok(groups.length>1,pattern);
    assert.equal(groups[1].notes[0].midi,groups[0].notes[2].midi,`${pattern} moves to the adjacent two-note string pair`);
  }
  const five=cagedStudy(boundedBoard,modalHarmony,'pentatonic','seventh','descending',{pattern:'lesson5'});
  assert.deepEqual(five[0].notes.map(note=>note.midi),descendingAvailable.slice(1,6).map(note=>note.midi),'descending 5s begin on the lower note of the highest string');
  assert.deepEqual(five[1].notes.map(note=>note.midi),descendingAvailable.slice(3,8).map(note=>note.midi),'the next 5-note cell moves down one string pair');
  for(const [pattern,runs] of Object.entries({lesson64:[6,4],lesson46:[4,6],lesson43:[4,3],lesson34:[3,4],lesson45:[4,5],lesson54:[5,4],lesson65:[6,5],lesson56:[5,6],lesson456:[4,5,6]})){
    const groups=cagedStudy(boundedBoard,modalHarmony,'pentatonic','seventh','descending',{pattern});
    assert.ok(groups.length,pattern);
    const midi=groups[0].notes.map(note=>note.midi);let cursor=0;
    for(let cell=0;cell<runs.length;cell++){
      const run=midi.slice(cursor,cursor+runs[cell]);
      assert.ok(run.slice(1).every((note,index)=>note<run[index]),`${pattern} cell ${cell+1} descends`);
      const expectedStart=cell*2+(runs[cell]%2===1?1:0);
      assert.equal(run[0],descendingAvailable[expectedStart].midi,`${pattern} cell ${cell+1} starts on its next string pair with the lesson's ${runs[cell]}-note pickup`);
      cursor+=runs[cell];
    }
    if(groups.length>1)assert.equal(groups[1].notes[0].midi,groups[0].notes[2].midi,`${pattern} advances by one two-note string pair`);
  }
  const exact=cagedStudy(boundedBoard,modalHarmony,'pentatonic','seventh','descending',{pattern:'lesson64'});
  assert.deepEqual(exact[0].notes.map(note=>note.midi),[...descendingAvailable.slice(0,6),...descendingAvailable.slice(2,6)].map(note=>note.midi),'6s + 4s matches the source TAB: six notes, then four from the next string pair');
  const variation=cagedStudy(boundedBoard,modalHarmony,'pentatonic','seventh','descending',{pattern:'cascade64'});
  assert.notDeepEqual(variation[0].notes.map(note=>note.midi),exact[0].notes.map(note=>note.midi),'the earlier sliding picking variation remains available');
  assert.equal(variation[1].notes[0].midi,variation[0].notes[1].midi,'the sliding variation advances one pentatonic note at a time');
});

test('notation prints one exercise heading and no pattern-cell labels',()=>{
  const boundedBoard={...board,start:1,end:12};
  const modalHarmony={...harmony,mode:'dorian',midi:[57,60,64,67]};
  const groups=cagedStudy(boundedBoard,modalHarmony,'pentatonic','seventh','ascending',{pattern:'thirds'});
  const svg=exerciseNotationSvg(groups,'eighths','Pentatonic thirds');
  assert.ok(groups.length>3);
  assert.equal((svg.match(/class="exercise-title"/g)||[]).length,1);
  assert.equal((svg.match(/class="chord-symbol"/g)||[]).length,0);
  assert.equal((svg.match(/class="phrase-cell"/g)||[]).length,0);
  assert.equal((svg.match(/class="exercise-source"/g)||[]).length,0);
});

test('repeated voice-leading and chromatic concept captions print once',()=>{
  const boundedBoard={...board,start:1,end:12};
  const modalHarmony={...harmony,mode:'dorian',midi:[57,60,64,67]};
  for(const study of ['connections','enclosures','enclosuresbelowabove','enclosureschromatic','enclosuresdouble','enclosuresfiveone','enclosuresfivetwo','enclosuresfivethree','enclosuresfivefour','approach','doubleapproach','chromaticneighbors','passingtones','approacheverytone']){
    const groups=cagedStudy(boundedBoard,modalHarmony,study,'seventh','ascending');
    const svg=exerciseNotationSvg(groups,'eighths',study);
    const repeated=[...new Set(groups.map(group=>group.annotation).filter(Boolean))];
    for(const caption of repeated)assert.equal(svg.split(caption).length-1,1,`${study}: ${caption}`);
  }
});

test('expanded chromatic language patterns resolve clearly inside the position',()=>{
  const boundedBoard={...board,start:1,end:12};
  const modalHarmony={...harmony,mode:'dorian',midi:[57,60,64,67]};
  for(const study of ['doubleapproach','chromaticneighbors','passingtones','approacheverytone']){
    for(const motion of ['ascending','descending']){
      const groups=cagedStudy(boundedBoard,modalHarmony,study,'seventh',motion);
      assert.ok(groups.length,`${study} ${motion}`);
      assert.ok(flattenExercise(groups).every(note=>note&&note.fret>=boundedBoard.start&&note.fret<=boundedBoard.end),`${study} stays in position`);
      assert.ok(groups.some(group=>group.notes.some(note=>!modalHarmony.scalePcs.includes(note.pc))),`${study} includes chromatic colour`);
    }
  }
});

test('jazz enclosure variants surround and resolve to chord tones',()=>{
  const boundedBoard={...board,start:1,end:12};
  const modalHarmony={...harmony,mode:'dorian',midi:[57,60,64,67]};
  const studies=['enclosures','enclosuresbelowabove','enclosureschromatic','enclosuresdouble'];
  const signatures=new Set();
  for(const study of studies){
    const groups=cagedStudy(boundedBoard,modalHarmony,study,'seventh','ascending');
    assert.ok(groups.length,study);
    assert.ok(groups.every(group=>modalHarmony.chordPcs.includes(group.notes.at(-1).pc)),`${study} resolves to chord tones`);
    assert.ok(flattenExercise(groups).every(note=>note.fret>=boundedBoard.start&&note.fret<=boundedBoard.end),`${study} stays in position`);
    signatures.add(groups[0].notes.map(note=>note.midi-groups[0].notes.at(-1).midi).join(','));
  }
  assert.equal(signatures.size,studies.length);
});

test('five-note enclosures reproduce the requested A Dorian cells and spellings',()=>{
  const boundedBoard={...board,start:1,end:12};
  const modalHarmony={...harmony,mode:'dorian',midi:[57,60,64,67]};
  const expected={
    enclosuresfiveone:{offsets:[-1,2,1,-1,0],names:['A♭','B','B♭','A♭','A']},
    enclosuresfivetwo:{offsets:[1,-2,-1,1,0],names:['B♭','G','G♯','B♭','A']},
    enclosuresfivethree:{offsets:[-2,1,-2,-1,0],names:['G','B♭','G','G♯','A']},
    enclosuresfivefour:{offsets:[2,-1,2,1,0],names:['B','A♭','B','B♭','A']},
  };
  for(const [study,pattern] of Object.entries(expected)){
    const group=cagedStudy(boundedBoard,modalHarmony,study,'seventh','ascending').find(candidate=>candidate.notes.at(-1).pc===9);
    assert.ok(group,study);
    const target=group.notes.at(-1).midi;
    assert.deepEqual(group.notes.map(note=>note.midi-target),pattern.offsets,`${study} pitches`);
    assert.deepEqual(group.notes.map(note=>note.name),pattern.names,`${study} spellings`);
  }
});

test('voice-led arpeggio connections follow progression chords using nearby inversions',()=>{
  const chromaticBoard={start:1,end:12,notes:Array.from({length:30},(_,index)=>{const midi=45+index;return {string:index%6,fret:1+index%12,midi,pc:midi%12,name:SHARP_TEST_NAMES[midi%12]};})};
  const progression=[
    {name:'D',suffix:'m7',chordPcs:[2,5,9,0],tones:['D','F','A','C']},
    {name:'G',suffix:'7',chordPcs:[7,11,2,5],tones:['G','B','D','F']},
    {name:'C',suffix:'maj7',chordPcs:[0,4,7,11],tones:['C','E','G','B']},
  ];
  const groups=cagedStudy(chromaticBoard,harmony,'connections','seventh','ascending',{progression});
  assert.deepEqual(groups.map(group=>group.chord),['Dm7','G7','Cmaj7']);
  assert.ok(groups.every(group=>group.notes.length===4));
  assert.ok(groups.every(group=>group.annotation==='nearest inversion into the next chord'));
  assert.ok(groups.slice(1).every((group,index)=>Math.abs(group.notes[0].midi-groups[index].notes.at(-1).midi)<=7));
});

test('guitar pitch is written one octave above its sounding pitch',()=>{
  const note={name:'A',midi:57,string:1,fret:12,pc:9};
  const groups=[
    {chord:'Am7',source:'A minor',notes:[note]},
    {chord:'Am7',source:'A minor',notes:[note]},
    {chord:'D7',source:'D Mixolydian',notes:[note]},
    {chord:'Am7',source:'A minor',notes:[note]},
  ];
  const svg=exerciseNotationSvg(groups,'eighths','Harmony changes');
  assert.match(svg,/class="note-head" cx="105" cy="86"/);
  assert.equal((svg.match(/class="exercise-title"/g)||[]).length,1);
});
