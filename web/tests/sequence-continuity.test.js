import {test} from 'node:test';
import assert from 'node:assert/strict';
import {continuationCell,continuationNote} from '../src/practice/sequence-continuity.js';
import {progressionExerciseGroups} from '../src/practice/progression-exercises.js';
import {cagedStudy,alignedProgressionGroups} from '../src/guitar/exercises.js';
import {fretboardFor,cagedPositionFor} from '../src/guitar/fretboard.js';
import {harmonyAt,progressionDefinition} from '../src/audio/music.js';
import {positionalArpeggio,gripStudy} from '../src/practice/learning.js';
import {theoryOptions} from '../src/guitar/superimposition.js';
const pathFor=(hs,shapes)=>hs.map((h,i)=>({...cagedPositionFor(fretboardFor(h,shapes[i%shapes.length])),geometryShape:shapes[i%shapes.length]}));
const ordinary=['thirds','fourths','sixths','groups3','groups4','digital1324','cells','harmonized','alternating','chordtones','chordtonesalternating','inversions','upperstructure','enclosures','enclosuresbelowabove','enclosureschromatic','enclosuresdouble','enclosuresfiveone','enclosuresfivetwo','enclosuresfivethree','enclosuresfivefour','approach','doubleapproach','chromaticneighbors','passingtones','approacheverytone','pentatonic'];
const notes=groups=>groups.map(g=>g.notes.map(n=>n.midi));

test('nearest continuation uses a cell anchor, turns only at a range boundary, and restarts only when necessary',()=>{
 const cells=[72,70,68].map(sequenceAnchor=>({sequenceAnchor,sequenceDirection:-1}));
 assert.deepEqual(continuationCell(cells,71,-1),{index:1,direction:-1,reset:false});
 assert.deepEqual(continuationCell(cells,70,-1),{index:2,direction:-1,reset:false});
 assert.deepEqual(continuationCell(cells,60,-1),{index:0,direction:-1,reset:true});
 const both=[...cells,...[60,62,64].map(sequenceAnchor=>({sequenceAnchor,sequenceDirection:1}))];
 assert.deepEqual(continuationCell(both,59,-1,true),{index:3,direction:1,reset:false});
 assert.deepEqual(continuationNote([60,64,67].map(midi=>({midi})),63,1),{offset:1,direction:1});
});

test('the reported Am7 to Bm7 descending tetrads continue from A69 to G-sharp68, rather than D74',()=>{
 const a=harmonyAt({key:9,mode:'dorian',chord:'min7'}),b=harmonyAt({key:11,mode:'dorian',chord:'min7'}),hs=[a,a,b,b];
 const gs=progressionExerciseGroups(hs,[4,4,4,4],fretboardFor(a,'C'),{study:'harmonized',motion:'descending',positionPath:pathFor(hs,['C'])});
 assert.deepEqual(gs.map(g=>g.sequenceAnchors),[[74,72],[71,69],[68,66],[64,62]]);
 assert.deepEqual(notes(gs).slice(2),[[68,64,61,57,66,62,59,56],[64,61,57,54,62,59,56,52]]);
 assert.deepEqual(gs[2].notes.slice(0,4).map(n=>n.name),['G♯','E','C♯','A']);
});

test('every directional family selects the nearest forward cell through jazz, modal, altered and fourths changes',()=>{
 for(const template of ['major251essential','major251altered','modal_dorian','fourths1'])for(const key of [0,6,9])for(const shapes of [['C'],['C','G','D']])for(const motion of ['ascending','descending']){
  const setup={key,mode:'dorian',chord:'min13',template,progression:true,beats:4},hs=progressionDefinition(setup).roman.map((_,i)=>harmonyAt(setup,i)),positionPath=pathFor(hs,shapes),direction=motion==='ascending'?1:-1;
  for(const study of ordinary){
   const gs=progressionExerciseGroups(hs,hs.map(()=>4),fretboardFor(hs[0],shapes[0]),{study,motion,positionPath});let previous=null;
   for(const g of gs){
    const source=cagedStudy(g.board,g.harmony,study,'seventh',motion,{pattern:'groups3'}).filter(c=>c.notes?.length&&Number.isFinite(c.sequenceAnchor));
    if(previous!==null&&g.sequenceAnchors.length){
     const forward=source.map(c=>c.sequenceAnchor).filter(a=>(a-previous)*direction>0).sort((a,b)=>(a-b)*direction);
     assert.equal(g.sequenceAnchors[0],forward[0]??source[0].sequenceAnchor,`${template} ${key} ${motion} ${study} ${g.slot}`);
    }
    if(g.sequenceAnchors.length)previous=g.sequenceAnchors.at(-1);
   }
  }
 }
});

test('alternating strokes retain their phase when the nearest new-scale cell has different library parity',()=>{
 const hs=[9,11,2,4].map(key=>harmonyAt({key,mode:'dorian',chord:'min7'}));
 for(const study of ['alternating','chordtonesalternating'])for(const motion of ['ascending','descending']){
  const direction=motion==='ascending'?1:-1,gs=progressionExerciseGroups(hs,hs.map(()=>4),fretboardFor(hs[0],'C'),{study,motion,positionPath:pathFor(hs,['C'])});let next=direction>0,previous=null;
  for(const g of gs){
   const source=cagedStudy(g.board,g.harmony,study,'seventh',motion);
   if(previous!==null&&!source.some(c=>(c.sequenceAnchor-previous)*direction>0))next=direction>0;
   let offset=0;for(const length of g.cellLengths){const cell=g.notes.slice(offset,offset+length);offset+=length;assert.equal(cell[1].midi>cell[0].midi,next);next=!next;}
   if(g.sequenceAnchors.length)previous=g.sequenceAnchors.at(-1);
  }
 }
});

test('positional arpeggios choose the nearest continuing chord tone instead of returning to an edge',()=>{
 const hs=[9,11,2,4].map(key=>harmonyAt({key,mode:'dorian',chord:'min7'}));
 for(const motion of ['ascending','descending']){
  const direction=motion==='ascending'?1:-1,gs=progressionExerciseGroups(hs,hs.map(()=>2),fretboardFor(hs[0],'C'),{study:'positional',motion,positionPath:pathFor(hs,['C'])});let previous=null;
  for(const g of gs){if(!g.notes.length)continue;const source=positionalArpeggio(g.board,g.harmony,motion)[0].notes;
   if(previous!==null){const forward=source.filter(n=>(n.midi-previous)*direction>0).sort((a,b)=>(a.midi-b.midi)*direction);assert.equal(g.notes[0].midi,forward[0]?.midi??source[0].midi);}
   previous=g.notes.at(-1).midi;
  }
 }
});

test('combined directions retain their current traversal leg across a scale change',()=>{
 const hs=[9,9,11,11,2,2].map(key=>harmonyAt({key,mode:'dorian',chord:'min7'}));
 for(const study of ['alternating','chordtonesalternating','enclosures','pentatonic','approach'])for(const motion of ['up-down','down-up']){
  const gs=progressionExerciseGroups(hs,hs.map(()=>2),fretboardFor(hs[0],'C'),{study,motion,positionPath:pathFor(hs,['C'])});
  let last=null,travel=motion==='up-down'?1:-1;
  for(const g of gs){
   const source=cagedStudy(g.board,g.harmony,study,'seventh',motion,{pattern:'groups3'});
   if(last!==null&&g.sequenceAnchors.length&&hs[g.slot]!==hs[g.slot-1]){
    const forward=source.filter(c=>c.sequenceDirection===travel&&(c.sequenceAnchor-last)*travel>0).sort((a,b)=>(a.sequenceAnchor-b.sequenceAnchor)*travel);
    if(forward.length){assert.equal(g.sequenceAnchors[0],forward[0].sequenceAnchor);assert.equal(g.sequenceDirections[0],travel);}
   }
   if(g.sequenceAnchors.length){last=g.sequenceAnchors.at(-1);travel=g.sequenceDirections.at(-1);}
  }
 }
});

test('triad pairs preserve A/B phase across chord changes, while exact grips retain their chosen voicings',()=>{
 const hs=[9,11,2,4].map(key=>harmonyAt({key,mode:'dorian',chord:'min7'})),positionPath=pathFor(hs,['C']);
 const gs=progressionExerciseGroups(hs,hs.map(()=>4),fretboardFor(hs[0],'C'),{study:'triadpairs',stage:'cell',positionPath});let phase=0;
 for(const g of gs){if(!g.notes.length)continue;const source=theoryOptions(g.harmony).triadPairs[0];assert.equal(g.materialCells[0],source.groups[phase%2].name);phase++;}
 const grips=progressionExerciseGroups(hs,hs.map(()=>4),fretboardFor(hs[0],'C'),{study:'grip',positionPath});
 for(const g of grips)assert.deepEqual(g.notes,gripStudy(g.board,g.harmony)[0]?.notes||[]);
});

test('voice-led arpeggio connections continue their cell-anchor direction through harmonic changes',()=>{
 const hs=[9,9,11,11,2].map(key=>harmonyAt({key,mode:'dorian',chord:'min7'})),boards=hs.map(h=>fretboardFor(h,'C'));
 for(const motion of ['ascending','descending']){
  const gs=alignedProgressionGroups(boards[0],hs,'connections','seventh',motion,boards),direction=motion==='ascending'?1:-1;
  for(let i=1;i<gs.length;i++)if(gs[i-1].notes.length&&gs[i].notes.length){
   const before=gs[i-1].notes[0].midi;
   const pitches=[...new Set(boards[i].notes.filter(n=>hs[i].chordPcs.slice(0,4).includes(n.pc)).map(n=>n.midi))].sort((a,b)=>(a-b)*direction);
   const anchors=pitches.slice(0,-3),forward=anchors.filter(a=>(a-before)*direction>0);
   assert.equal(gs[i].notes[0].midi,forward[0]??anchors[0]);
  }

 }
});
