import {test} from 'node:test';
import assert from 'node:assert/strict';
import {harmonyAt,MODES,progressionBeatDurations,progressionDefinition} from '../src/audio/music.js';
import {fretboardFor,TUNING,cagedPositionFor} from '../src/guitar/fretboard.js';
import {cagedStudy,alignedProgressionGroups} from '../src/guitar/exercises.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {gripStudy,positionalArpeggio} from '../src/practice/learning.js';
import {progressionStudyPlan} from '../src/practice/progression-timing.js';
const studies=['grip','positional','thirds','fourths','sixths','groups3','groups4','digital1324','cells','harmonized','alternating','chordtones','chordtonesalternating','inversions','upperstructure','enclosures','enclosuresbelowabove','enclosureschromatic','enclosuresdouble','enclosuresfiveone','enclosuresfivetwo','enclosuresfivethree','enclosuresfivefour','approach','doubleapproach','chromaticneighbors','passingtones','approacheverytone','triadpairs','pentatonic'];
const stamp=notes=>notes.map(n=>[n.midi,n.string,n.fret]);
const pathFor=(harmonies,shapes)=>harmonies.map((h,i)=>({...cagedPositionFor(fretboardFor(h,shapes[i%shapes.length])),geometryShape:shapes[i%shapes.length]}));
const direct=(study,board,h,material,motion)=>study==='grip'?gripStudy(board,h):study==='positional'?positionalArpeggio(board,h,motion):cagedStudy(board,h,study,material,motion,{pattern:'groups3'});

test('all pattern families preserve their ordered cells through non-static chord progressions',()=>{
 for(const template of ['major251essential','major251altered','modal_dorian','fourths1'])for(const key of [0,6,9])for(const shapes of [['E'],['C','A','G']])for(const motion of ['ascending','descending','up-down','down-up']){
  const setup={key,mode:'dorian',chord:'min13',template,progression:true,beats:4};
  const harmonies=progressionDefinition(setup).roman.map((_,i)=>harmonyAt(setup,i)),positionPath=pathFor(harmonies,shapes),durations=progressionBeatDurations(setup);
  for(const study of studies){
   const groups=progressionExerciseGroups(harmonies,durations,fretboardFor(harmonies[0],shapes[0]),{study,motion,positionPath});
   for(const group of groups){
    const label=`${template} ${key} ${motion} ${study} ${group.slot}`;
    const expected=['ascending','descending'].flatMap(leg=>direct(study,group.board,group.harmony,'seventh',leg)).filter(c=>c.notes?.length);
    const full=expected.flatMap(c=>c.notes);
    // Adapted cells retain their internal intervals and contour; selecting
    // a different starting cell is now intentional across chord changes.
    if(study==='positional'){
     assert.ok(group.notes.every(n=>full.some(m=>JSON.stringify(stamp([m]))===JSON.stringify(stamp([n])))),label);
    }else if(study!=='triadpairs'){
     let offset=0;
     group.cellLengths.forEach((length,i)=>{
      const actual=group.notes.slice(offset,offset+length);offset+=length;
      const matches=Number.isFinite(group.sequenceAnchors[i])?expected.filter(c=>c.sequenceAnchor===group.sequenceAnchors[i]&&c.sequenceDirection===group.sequenceDirections[i]):expected;
      const check=study==='approach'&&i===group.cellLengths.length-1?actual.slice(0,-1):actual;
      assert.ok(matches.some(c=>(['alternating','chordtonesalternating'].includes(study)?[c.notes,[...c.notes].reverse()]:[c.notes]).some(notes=>JSON.stringify(stamp(notes.slice(0,check.length)))===JSON.stringify(stamp(check)))),label);
     });
    }
    assert.ok(group.notes.length<=durations[group.slot]*2,label);
    assert.ok(group.notes.length||group.warning,label);
    for(const note of group.notes){assert.equal(note.midi,TUNING[note.string]+note.fret,label);assert.ok(note.fret>=group.board.start&&note.fret<=group.board.end,label);}
    for(const index of group.targetIndices)assert.ok(group.harmony.chordPcs.includes(group.notes[index].pc),label);
   }
  }
 }
});

test('repeated harmony retains its cursor across complete cells',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min13'}),other=harmonyAt({key:9,mode:'lydian',chord:'maj9sharp11'});
 for(const study of studies)for(const motion of ['ascending','descending']){
  const harmonies=[h,h,h,other],positionPath=pathFor(harmonies,['C','C','G','G']),board=fretboardFor(h,'C');
  const options={study,motion,positionPath};const groups=progressionExerciseGroups(harmonies,[4,4,4,4],board,options);
  if(study==='approach')continue; // final chromatic target depends on the next written slot
  const joined=progressionExerciseGroups([h],[8],board,{...options,positionPath:[positionPath[0]]})[0];
  if(study==='grip'||study==='triadpairs')continue;
  const emitted=groups.slice(0,2).flatMap(g=>g.notes);
  assert.deepEqual(stamp(emitted),stamp(joined.notes.slice(0,emitted.length)),`${study} ${motion}: bar boundaries must not alter traversal`);

 }
});

test('alternating cells retain direction and register across repeated bars in every mode and framework',()=>{
 for(const [mode,definition] of Object.entries(MODES))for(const shape of ['C','A','G','E','D'])for(const material of ['triad','seventh','extensions'])for(const motion of ['ascending','descending']){
  const h=harmonyAt({key:9,mode,chord:definition.chord}),b=fretboardFor(h,shape);
  const source=cagedStudy(b,h,'alternating',material,motion);
  const groups=progressionExerciseGroups([h,h],[4,4],b,{study:'alternating',material,motion,positionPath:pathFor([h,h],[shape])});
  const expected=source.flatMap(c=>c.notes),actual=groups.flatMap(g=>g.notes);
  if(source.length>=groups[0].cellLengths.length+groups[1].cellLengths.length)assert.deepEqual(stamp(actual),stamp(expected.slice(0,actual.length)));
  source.forEach((cell,index)=>{
   const ascending=(motion==='ascending')===(index%2===0);
   assert.ok(cell.notes.every((note,i)=>!i||(ascending?note.midi>cell.notes[i-1].midi:note.midi<cell.notes[i-1].midi)),`${mode} ${shape} ${material} ${motion} ${index}`);
  });
 }
});

test('upper structures retain the compound ninth and interval patterns keep their written offsets',()=>{
 for(const key of [0,6,9])for(const mode of ['dorian','lydian','altered'])for(const shape of ['C','A','G','E','D'])for(const motion of ['ascending','descending']){
  const h=harmonyAt({key,mode,chord:MODES[mode].chord}),b=fretboardFor(h,shape);
  for(const cell of cagedStudy(b,h,'upperstructure','seventh',motion)){
   assert.equal(cell.notes.length,4);const direction=motion==='ascending'?1:-1;
   for(let i=1;i<4;i++)assert.ok((cell.notes[i].midi-cell.notes[i-1].midi)*direction>0);
   assert.ok(Math.abs(cell.notes[3].midi-cell.notes[0].midi)>7);
  }
 }
});

test('guide tones and connected arpeggios retain harmonic order and valid directions in moving harmony',()=>{
 for(const template of ['major251essential','major251altered','modal_dorian','fourths1'])for(const key of [0,6,9])for(const motion of ['ascending','descending']){
  const setup={key,mode:'dorian',chord:'min13',template,progression:true,beats:4},hs=progressionDefinition(setup).roman.map((_,i)=>harmonyAt(setup,i));
  const boards=hs.map((h,i)=>fretboardFor(h,['C','G','D'][i%3]));
  for(const study of ['guidetones','connections']){
   const groups=alignedProgressionGroups(boards[0],hs,study,'seventh',motion,boards);
   assert.deepEqual(groups.map(g=>g.chord),hs.map(h=>h.name+h.suffix));
   groups.forEach((g,i)=>g.notes.forEach((note,j)=>{assert.ok(hs[i].chordPcs.includes(note.pc));if(study==='connections'&&j)assert.ok(motion==='ascending'?note.midi>g.notes[j-1].midi:note.midi<g.notes[j-1].midi);}));
   const plan=progressionStudyPlan(groups,groups.map((_,i)=>i),groups.map(()=>1),4,study);
   assert.equal(plan.slots.length,hs.length);
  }
 }
});

test('reported alternating examples preserve their edge and continue instead of jumping to the tonic',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min13'}),b=fretboardFor(h,'G');
 for(const [motion,expected] of [
  ['ascending',[[52,55,59,62,64,60,57,54],[55,59,62,66,67,64,60,57]]],
  ['descending',[[79,76,72,69,67,71,74,78],[76,72,69,66,64,67,71,74]]]
 ]){
  const groups=progressionExerciseGroups([h,h],[4,4],b,{study:'alternating',motion,positionPath:pathFor([h,h],['G'])});
  assert.deepEqual(groups.map(g=>g.notes.map(n=>n.midi)),expected);
 }
});

test('diatonic enclosure neighbours follow semitone boundaries and every-tone approaches remain complete',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min13'});
 for(const shape of ['C','A','G','E','D']){
  const b=fretboardFor(h,shape);
  for(const study of ['enclosures','enclosuresbelowabove'])for(const motion of ['ascending','descending']){
   for(const cell of cagedStudy(b,h,study,'seventh',motion)){
    const target=cell.notes.at(-1),diatonic=cell.notes[study==='enclosures'?0:1],direction=motion==='ascending'?1:-1;
    const distance=Array.from({length:12},(_,i)=>i+1).find(n=>h.scalePcs.includes((target.midi+direction*n+120)%12));
    assert.equal(diatonic.midi,target.midi+direction*distance);
   }
  }
  for(const motion of ['ascending','descending'])for(const cell of cagedStudy(b,h,'approacheverytone','seventh',motion)){
   assert.equal(cell.notes.length,8);
   for(let i=0;i<8;i+=2)assert.equal(cell.notes[i+1].midi-cell.notes[i].midi,motion==='ascending'?1:-1);
  }
 }
});

test('unavailable arpeggio paths do not invent octave leaps or reverse direction',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min7'}),b=fretboardFor(h,'G');
 const sparse={...b,notes:[45,60,64,67].map(midi=>({midi,pc:midi%12,string:0,fret:midi-40,name:h.scaleNames[h.scalePcs.indexOf(midi%12)]}))};
 assert.deepEqual(cagedStudy(sparse,h,'harmonized','seventh','ascending'),[]);
 for(const cell of cagedStudy(sparse,h,'inversions','seventh','ascending')){
  for(let i=1;i<cell.notes.length;i++)assert.equal(cell.notes[i].midi-cell.notes[i-1].midi,(cell.notes[i].pc-cell.notes[i-1].pc+12)%12||12);
 }
});

test('chromatic approaches resolve into actual next-chord cells, with no dangling final approach',()=>{
 let resolved=0;
 for(const template of ['major251essential','major251altered','modal_dorian','fourths1'])for(const motion of ['ascending','descending']){
  const setup={key:9,mode:'dorian',chord:'min13',template,progression:true,beats:4},hs=progressionDefinition(setup).roman.map((_,i)=>harmonyAt(setup,i));
  for(const loop of [false,true]){
   const gs=progressionExerciseGroups(hs,hs.map(()=>4),fretboardFor(hs[0],'C'),{study:'approach',motion,loop,positionPath:pathFor(hs,['C'])});
   gs.forEach((g,i)=>{
    const lastLength=g.cellLengths.at(-1);if(lastLength===5){
     const target=(gs[i+1]||(loop?gs[0]:null))?.notes[0];assert.ok(target);assert.equal(Math.abs(g.notes.at(-1).midi-target.midi),1);resolved++;
    }
   });
   if(!loop)assert.notEqual(gs.at(-1).cellLengths.at(-1),5);
  }
 }
 assert.ok(resolved>0);
});

test('combined triad-pair contours start in the requested direction, and scale patterns exclude out-of-scale chord tones',()=>{
 let pairs=0;
 for(const shape of ['C','A','G','E','D']){
  const h=harmonyAt({key:9,mode:'dorian',chord:'min13'}),b=fretboardFor(h,shape);
  for(const motion of ['up-down','down-up']){
   const cells=cagedStudy(b,h,'triadpairs','triad',motion);if(cells.length){pairs++;assert.ok(motion==='up-down'?cells[0].notes[1].midi>cells[0].notes[0].midi:cells[0].notes[1].midi<cells[0].notes[0].midi);}
  }
  const outside=harmonyAt({key:9,mode:'dorian',chord:'maj7'}),outBoard=fretboardFor(outside,shape);
  for(const study of ['harmonized','alternating','thirds','groups4'])for(const motion of ['ascending','descending']){
   const cells=cagedStudy(outBoard,outside,study,'seventh',motion);assert.ok(cells.length);assert.ok(cells.flatMap(c=>c.notes).every(n=>outside.scalePcs.includes(n.pc)));
  }
 }
 assert.ok(pairs>0);
});

test('chromatic approach studies honour both legs of combined directions',()=>{
 const h=harmonyAt({key:9,mode:'dorian',chord:'min13'}),b=fretboardFor(h,'G');
 for(const [motion,first,second] of [['up-down','ascending','descending'],['down-up','descending','ascending']]){
  const combined=cagedStudy(b,h,'approach','seventh',motion);
  assert.deepEqual(stamp(combined.flatMap(c=>c.notes)),stamp([...cagedStudy(b,h,'approach','seventh',first),...cagedStudy(b,h,'approach','seventh',second)].flatMap(c=>c.notes)));
  for(const cell of cagedStudy(b,h,'approacheverytone','seventh',motion)){
   const targets=cell.notes.filter((_,i)=>i%2===1);assert.equal(targets.length,7);
   targets.forEach((target,i)=>{const down=i?target.midi<targets[i-1].midi:targets[1].midi<target.midi;assert.equal(cell.notes[i*2].midi,target.midi+(down?1:-1));});
  }
 }
});
