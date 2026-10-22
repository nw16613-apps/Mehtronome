import {theoryOptions} from './superimposition.js';

const LETTERS=['C','D','E','F','G','A','B'];
const TUNING=[40,45,50,55,59,64];
const MATERIAL_SIZES={triad:3,seventh:4,extensions:5};
const SHARP_NAMES=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const FLAT_NAMES=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
export const PENTATONIC_PATTERNS={
  groups3:'Groups of 3',groups4:'Groups of 4',groups5:'Groups of 5',thirds:'Pentatonic thirds',digital1324:'Pentatonic 1–3–2–4',rolling:'Rolling 1–2–3–2',
  alternating3:'Alternating 3-note groups',alternating4:'Alternating 4-note groups',alternating5:'Alternating 5-note groups',
};

function chordSuffix(rootPc,pcs) {
  const signature=pcs.slice(1).map(pc=>(pc-rootPc+12)%12).join(',');
  const suffixes={'4,7':'','3,7':'m','3,6':'dim','4,8':'aug','4,7,11':'maj7','4,7,10':'7','3,7,10':'m7','3,6,10':'m7♭5','3,6,9':'dim7','4,8,11':'maj7♯5','3,7,11':'m(maj7)'};
  return Object.hasOwn(suffixes,signature)?suffixes[signature]:(pcs.length===5?'9':'7');
}

function pathForPcs(board,pcs,names,ascending=true,targetMidi=60,anchorMidi=null) {
  const ordered=ascending?pcs:[...pcs].reverse();
  const orderedNames=ascending?names:[...names].reverse();
  const candidates=ordered.map((pc,index)=>board.notes.filter(note=>note.pc===pc).map(note=>({...note,name:orderedNames[index]})));
  let best=null,bestScore=Infinity;
  function visit(index,path) {
    if(index===candidates.length){
      const span=Math.abs(path.at(-1).midi-path[0].midi);
      const score=span+Math.abs(path[0].midi-targetMidi)*.7;
      if(score<bestScore){best=path;bestScore=score;}
      return;
    }
    for(const note of candidates[index]){
      if(index===0&&anchorMidi!==null&&note.midi!==anchorMidi)continue;
      const previous=path.at(-1);
      if(previous&&(ascending?note.midi<=previous.midi:note.midi>=previous.midi))continue;
      visit(index+1,[...path,note]);
    }
  }
  visit(0,[]);
  if(best)return best;
  if(anchorMidi!==null)return null;
  return ordered.map((pc,index)=>candidates[index].toSorted((a,b)=>Math.abs(a.midi-targetMidi)-Math.abs(b.midi-targetMidi))[0]).filter(Boolean);
}

function contour(path,motion) {
  if(motion==='up-down')return [...path,...path.slice(0,-1).reverse()];
  if(motion==='down-up')return [...path,...path.slice(0,-1).reverse()];
  return path;
}

function noteNameForPc(harmony,pc) {
  const scaleIndex=harmony.scalePcs.indexOf((pc+12)%12);
  return scaleIndex>=0?harmony.scaleNames[scaleIndex]:['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][(pc+12)%12];
}

function chromaticRoleName(harmony,pc,role) {
  if(role==='sharp')return SHARP_NAMES[(pc+12)%12];
  if(role==='flat')return FLAT_NAMES[(pc+12)%12];
  return noteNameForPc(harmony,pc);
}

function noteAtMidi(board,midi,harmony) {
  const existing=board.notes.find(note=>note.midi===midi);
  if(existing)return {...existing,name:noteNameForPc(harmony,midi%12)};
  const candidates=TUNING.map((open,string)=>({string,fret:midi-open,midi,pc:(midi%12+12)%12,name:noteNameForPc(harmony,midi%12)}))
    .filter(note=>note.fret>=board.start&&note.fret<=board.end);
  return candidates.toSorted((a,b)=>Math.abs(a.string-2.5)-Math.abs(b.string-2.5))[0]||null;
}

function chromaticEnclosures(board,harmony,motion,variant='abovebelow') {
  const descending=motion==='descending'||motion==='down-up';
  const targets=[...board.notes].filter(note=>harmony.chordPcs.includes(note.pc)).sort((a,b)=>descending?b.midi-a.midi:a.midi-b.midi);
  const patterns={
    abovebelow:{ascending:[2,-1,0],descending:[-2,1,0],annotation:'diatonic above · chromatic below · target'},
    belowabove:{ascending:[-1,2,0],descending:[1,-2,0],annotation:'chromatic below · diatonic above · target'},
    chromatic:{ascending:[1,-1,0],descending:[-1,1,0],annotation:'half-step above · half-step below · target'},
    double:{ascending:[2,1,-1,0],descending:[-2,-1,1,0],annotation:'double enclosure · target'},
    fiveone:{ascending:[-1,2,1,-1,0],descending:[-1,2,1,-1,0],spellings:['flat','scale','flat','flat','scale'],annotation:'♭ target · 2 above · half-step above · ♭ target · target'},
    fivetwo:{ascending:[1,-2,-1,1,0],descending:[1,-2,-1,1,0],spellings:['flat','scale','sharp','flat','scale'],annotation:'half-step above · 2 below · leading tone · half-step above · target'},
    fivethree:{ascending:[-2,1,-2,-1,0],descending:[-2,1,-2,-1,0],spellings:['scale','flat','scale','sharp','scale'],annotation:'2 below · half-step above · 2 below · leading tone · target'},
    fivefour:{ascending:[2,-1,2,1,0],descending:[2,-1,2,1,0],spellings:['scale','flat','scale','flat','scale'],annotation:'2 above · ♭ target · 2 above · half-step above · target'},
  };
  const pattern=patterns[variant]||patterns.abovebelow;
  const groups=[];
  for(const target of targets){
    const offsets=descending?pattern.descending:pattern.ascending;
    const notes=offsets.map((offset,index)=>{const note=noteAtMidi(board,target.midi+offset,harmony);return note&&pattern.spellings?{...note,name:chromaticRoleName(harmony,note.pc,pattern.spellings[index])}:note;});
    if(notes.every(Boolean))groups.push({chord:`Enclose ${target.name}`,rootName:target.name,pcs:notes.map(note=>note.pc),names:notes.map(note=>note.name),notes,annotation:pattern.annotation,targetIndex:notes.length-1});
  }
  return motion==='up-down'?[...groups,...chromaticEnclosures(board,harmony,'descending',variant)]:motion==='down-up'?[...groups,...chromaticEnclosures(board,harmony,'ascending',variant)]:groups;
}

function approachArpeggios(board,harmony,material,motion) {
  const base=cagedProgressionExercise(board,harmony,material,motion==='down-up'?'descending':motion==='up-down'?'ascending':motion);
  return base.map((group,index)=>{
    const next=base[index+1];if(!next)return group;
    const target=next.notes[0].midi,from=group.notes.at(-1).midi;
    const approach=noteAtMidi(board,target+(from<target?-1:1),harmony);
    return approach?{...group,notes:[...group.notes,approach],pcs:[...group.pcs,approach.pc],names:[...group.names,approach.name],annotation:'arpeggio · chromatic approach'}:group;
  });
}

function chromaticTargetCells(board,harmony,motion,kind) {
  const descending=motion==='descending'||motion==='down-up';
  const targets=[...new Map(board.notes.filter(note=>harmony.chordPcs.includes(note.pc)).map(note=>[note.midi,note])).values()]
    .sort((a,b)=>descending?b.midi-a.midi:a.midi-b.midi);
  const definitions={
    doubleapproach:{offsets:descending?[2,1,0]:[-2,-1,0],annotation:'two chromatic approaches · target'},
    chromaticneighbors:{offsets:descending?[0,-1,0,1,0]:[0,1,0,-1,0],annotation:'target · upper/lower neighbours · target'},
  };
  const definition=definitions[kind],groups=[];
  for(const target of targets){
    const notes=definition.offsets.map(offset=>noteAtMidi(board,target.midi+offset,harmony));
    if(notes.every(Boolean))groups.push({chord:`Resolve to ${target.name}`,rootName:target.name,pcs:notes.map(note=>note.pc),names:notes.map(note=>note.name),notes,annotation:definition.annotation,targetIndex:notes.length-1});
  }
  if(motion==='up-down')return [...groups,...chromaticTargetCells(board,harmony,'descending',kind)];
  if(motion==='down-up')return [...groups,...chromaticTargetCells(board,harmony,'ascending',kind)];
  return groups;
}

function chromaticPassingTones(board,harmony,motion) {
  if(motion==='up-down')return [...chromaticPassingTones(board,harmony,'ascending'),...chromaticPassingTones(board,harmony,'descending')];
  if(motion==='down-up')return [...chromaticPassingTones(board,harmony,'descending'),...chromaticPassingTones(board,harmony,'ascending')];
  const descending=motion==='descending';
  const scale=[...new Map(board.notes.filter(note=>harmony.scalePcs.includes(note.pc)).map(note=>[note.midi,note])).values()].sort((a,b)=>descending?b.midi-a.midi:a.midi-b.midi);
  const line=[];
  for(const [index,note] of scale.entries()){
    line.push({...note,name:noteNameForPc(harmony,note.pc)});
    const next=scale[index+1];if(next&&Math.abs(next.midi-note.midi)===2){const passing=noteAtMidi(board,note.midi+(descending?-1:1),harmony);if(passing)line.push(passing);}
  }
  const groups=[];
  for(let index=0;index<line.length;index+=4){const notes=line.slice(index,index+4);if(notes.length>1)groups.push({chord:'Chromatic scale connection',rootName:notes[0].name,pcs:notes.map(note=>note.pc),names:notes.map(note=>note.name),notes,annotation:'diatonic line · chromatic passing tones'});}
  return groups;
}

function approachEveryArpeggioTone(board,harmony,material,motion) {
  return cagedProgressionExercise(board,harmony,material,motion).map(group=>{
    const descending=group.notes.length>1&&group.notes[1].midi<group.notes[0].midi,notes=[];
    for(const target of group.notes){const approach=noteAtMidi(board,target.midi+(descending?1:-1),harmony);if(approach)notes.push(approach);notes.push(target);}
    return {...group,notes,pcs:notes.map(note=>note.pc),names:notes.map(note=>note.name),annotation:'chromatic approach into every arpeggio tone'};
  });
}

function upperStructureExercise(board,harmony,motion) {
  return scalePatternExercise(board,harmony,motion,[2,4,6,8],'3–5–7–9').map(group=>({...group,annotation:'3 · 5 · 7 · 9'}));
}

function guideToneLines(board,harmony,motion,progression=[]) {
  const harmonies=progression.length?progression:[harmony];
  const descending=motion==='descending'||motion==='down-up';
  let previous=descending?Infinity:-Infinity;
  const groups=[];
  for(let cycle=0;cycle<(harmonies.length===1?4:2);cycle++)for(const current of harmonies){
    const guidePcs=[current.chordPcs[1],current.chordPcs[3]??current.chordPcs.at(-1)].filter((pc,index,array)=>pc!==undefined&&array.indexOf(pc)===index);
    const candidates=[];
    const desiredPcs=harmonies.length===1?[guidePcs[cycle%guidePcs.length]]:guidePcs;
    for(const pc of desiredPcs)for(let midi=40;midi<85;midi++)if(midi%12===pc){const note=noteAtMidi(board,midi,current);if(note)candidates.push(note);}
    const note=candidates.toSorted((a,b)=>{
      if(!Number.isFinite(previous))return descending?b.midi-a.midi:a.midi-b.midi;
      return Math.abs(a.midi-previous)-Math.abs(b.midi-previous)||Math.abs(a.midi-60)-Math.abs(b.midi-60);
    })[0];
    if(!note)continue;previous=note.midi;
    groups.push({chord:`${current.name}${current.suffix}`,rootName:note.name,pcs:[note.pc],names:[note.name],notes:[note],annotation:current.intervals?.[current.chordPcs.indexOf(note.pc)]||'guide tone'});
  }
  if(descending)groups.reverse();
  return contourGroups(groups,motion);
}

function contourGroups(groups,motion){
  if(motion==='up-down')return [...groups,...[...groups].reverse()];
  if(motion==='down-up')return [...[...groups].reverse(),...groups];
  return groups;
}

function connectedArpeggios(board,harmony,material,motion,progression=[]) {
  if(progression.length){
    const size=MATERIAL_SIZES[material]||4,descending=motion==='descending'||motion==='down-up',groups=[];
    let previous=descending?Math.max(...board.notes.map(note=>note.midi)):Math.min(...board.notes.map(note=>note.midi));
    const harmonies=motion==='up-down'?[...progression,...progression.toReversed()]:motion==='down-up'?[...progression.toReversed(),...progression]:progression;
    for(const current of harmonies){
      const pcs=current.chordPcs.slice(0,Math.min(size,current.chordPcs.length)),names=current.tones.slice(0,pcs.length),candidates=[];
      for(let inversion=0;inversion<pcs.length;inversion++){
        const rotatedPcs=[...pcs.slice(inversion),...pcs.slice(0,inversion)],rotatedNames=[...names.slice(inversion),...names.slice(0,inversion)];
        const path=pathForPcs(board,rotatedPcs,rotatedNames,!descending,previous);
        if(path?.length===pcs.length)candidates.push(path);
      }
      const path=candidates.toSorted((a,b)=>Math.abs(a[0].midi-previous)-Math.abs(b[0].midi-previous)||Math.abs(a.at(-1).midi-a[0].midi)-Math.abs(b.at(-1).midi-b[0].midi))[0];
      if(!path)continue;previous=path.at(-1).midi;
      groups.push({chord:`${current.name}${current.suffix}`,rootName:current.name,pcs:path.map(note=>note.pc),names:path.map(note=>note.name),notes:path,annotation:'nearest inversion into the next chord'});
    }
    return groups;
  }
  const size=MATERIAL_SIZES[material]||4,descending=motion==='descending'||motion==='down-up',groups=[];
  let previous=descending?Math.max(...board.notes.map(note=>note.midi)):Math.min(...board.notes.map(note=>note.midi));
  for(let degree=0;degree<7;degree++){
    const rootIndex=descending?(7-degree)%7:degree;
    const indexes=Array.from({length:size},(_,offset)=>(rootIndex+offset*2)%7);
    const pcs=indexes.map(index=>harmony.scalePcs[index]),names=indexes.map(index=>harmony.scaleNames[index]);
    const candidates=[true,false].map(ascending=>pathForPcs(board,pcs,names,ascending,previous)).filter(path=>path?.length===size);
    const path=candidates.toSorted((a,b)=>Math.abs(a[0].midi-previous)-Math.abs(b[0].midi-previous))[0];if(!path)continue;
    previous=path.at(-1).midi;groups.push({chord:`${names[0]}${chordSuffix(pcs[0],pcs)}`,rootName:names[0],pcs,names,notes:path,annotation:'nearest voice-led connection'});
  }
  return contourGroups(groups,motion);
}

function pentatonicExercise(board,harmony,choice,motion,pattern='groups4') {
  if(motion==='up-down')return [...pentatonicExercise(board,harmony,choice,'ascending',pattern),...pentatonicExercise(board,harmony,choice,'descending',pattern)];
  if(motion==='down-up')return [...pentatonicExercise(board,harmony,choice,'descending',pattern),...pentatonicExercise(board,harmony,choice,'ascending',pattern)];
  const descending=motion==='descending';
  const available=[...new Map(board.notes.filter(note=>choice.pcs.includes(note.pc)).map(note=>[note.midi,note])).values()].sort((a,b)=>descending?b.midi-a.midi:a.midi-b.midi);
  const definitions={groups3:[0,1,2],groups4:[0,1,2,3],groups5:[0,1,2,3,4],thirds:[0,2],digital1324:[0,2,1,3],rolling:[0,1,2,1],alternating3:[0,1,2],alternating4:[0,1,2,3],alternating5:[0,1,2,3,4]};
  const offsets=definitions[pattern]||definitions.groups4,alternating=pattern.startsWith('alternating'),groups=[];
  for(let index=0;index+Math.max(...offsets)<available.length;index++){
    let notes=offsets.map(offset=>available[index+offset]).map(note=>({...note,name:noteNameForPc(harmony,note.pc)}));
    if(alternating&&index%2===1)notes.reverse();
    groups.push({chord:choice.name,rootName:notes[0].name,pcs:notes.map(note=>note.pc),names:notes.map(note=>note.name),notes});
  }
  return groups;
}

function overlayExercise(board,harmony,kind,motion,choiceId,pattern) {
  const options=theoryOptions(harmony);
  const choices=kind==='pentatonic'?options.pentatonics:options.triadPairs;
  const choice=choices.find(option=>option.id===choiceId)||choices[0];
  if(!choice)return [];
  const descending=motion==='descending'||motion==='down-up';
  if(kind==='pentatonic')return pentatonicExercise(board,harmony,choice,motion,pattern);
  const groups=choice.groups.map((triad,index)=>{
    const path=pathForPcs(board,triad.pcs,triad.names,index%2===0?!descending:descending,60);
    return {chord:triad.name,rootName:triad.names[0],pcs:triad.pcs,names:triad.names,notes:path,annotation:`Triad ${index===0?'A':'B'}`,source:`${index===0?'A':'B'} · ${triad.name}`};
  }).filter(group=>group.notes?.length===3);
  return contourGroups(Array.from({length:4},()=>groups).flat(),motion);
}

export function cagedProgressionExercise(board,harmony,material='seventh',motion='ascending') {
  const size=MATERIAL_SIZES[material] || 4;
  const ascending=motion==='ascending'||motion==='up-down';
  const edge=[...board.notes].sort((a,b)=>ascending?a.midi-b.midi:b.midi-a.midi)[0];
  if(!edge)return [];
  const edgeScaleIndex=harmony.scalePcs.indexOf(edge.pc);
  // Ascending tetrads begin on their root. Descending tetrads begin on their
  // seventh (or highest extension), exactly as a written arpeggio study does.
  const rootStart=ascending?edgeScaleIndex:(edgeScaleIndex-2*(size-1)+70)%7;
  const groups=[];
  let previousAnchor=edge.midi;
  for(let index=0;index<16;index++){
    const degree=(rootStart+(ascending?index:-index)+70)%7;
    const chordIndexes=Array.from({length:size},(_,offset)=>(degree+offset*2)%7);
    const pcs=chordIndexes.map(scaleIndex=>harmony.scalePcs[scaleIndex]);
    const names=chordIndexes.map(scaleIndex=>harmony.scaleNames[scaleIndex]);
    const rootName=harmony.scaleNames[degree];
    const firstPc=ascending?pcs[0]:pcs.at(-1);
    const anchors=board.notes.filter(note=>note.pc===firstPc&&(index===0?note.midi===edge.midi:ascending?note.midi>previousAnchor:note.midi<previousAnchor)).sort((a,b)=>ascending?a.midi-b.midi:b.midi-a.midi);
    const anchor=anchors[0];
    if(!anchor)break;
    const path=pathForPcs(board,pcs,names,ascending,anchor.midi,anchor.midi);
    if(!path||path.length!==size)break;
    groups.push({degree:index+1,chord:`${rootName}${chordSuffix(pcs[0],pcs)}`,rootName,names,pcs,notes:contour(path,motion)});
    previousAnchor=anchor.midi;
  }
  return groups;
}

function directionalPath(board,pcs,names,motion,target,index) {
  const ascending=motion==='ascending'||motion==='up-down'||motion==='alternating'&&index%2===0;
  const path=pathForPcs(board,pcs,names,ascending,target);
  return contour(path,motion);
}

function scalePatternExercise(board,harmony,motion,offsets,label) {
  const ascending=motion==='ascending'||motion==='up-down';
  const edge=[...board.notes].sort((a,b)=>ascending?a.midi-b.midi:b.midi-a.midi)[0];
  if(!edge)return [];
  const startDegree=harmony.scalePcs.indexOf(edge.pc),groups=[];
  let previousAnchor=edge.midi;
  for(let index=0;index<18;index++){
    const degree=(startDegree+(ascending?index:-index)+70)%7;
    const anchors=board.notes.filter(note=>note.pc===harmony.scalePcs[degree]&&(index===0?note.midi===edge.midi:ascending?note.midi>previousAnchor:note.midi<previousAnchor)).sort((a,b)=>ascending?a.midi-b.midi:b.midi-a.midi);
    const anchor=anchors[0];if(!anchor)break;
    const signedOffsets=offsets.map(offset=>ascending?offset:-offset);
    const notes=[];
    for(const offset of signedOffsets){
      const scaleIndex=((degree+offset)%7+7)%7;
      let delta=harmony.scalePcs[scaleIndex]-harmony.scalePcs[degree];
      if(offset>0)while(delta<=0)delta+=12;
      if(offset<0)while(delta>=0)delta-=12;
      const midi=anchor.midi+delta;
      const found=board.notes.find(note=>note.midi===midi&&note.pc===harmony.scalePcs[scaleIndex]);
      if(!found){notes.length=0;break;}
      notes.push({...found,name:harmony.scaleNames[scaleIndex]});
    }
    if(!notes.length)break;
    groups.push({degree:index+1,chord:`${harmony.scaleNames[degree]} · ${label}`,rootName:harmony.scaleNames[degree],names:notes.map(note=>note.name),pcs:notes.map(note=>note.pc),notes:contour(notes,motion)});
    previousAnchor=anchor.midi;
  }
  return groups;
}

function alternatingDiatonic(board,harmony,material='seventh',descending=false) {
  const motion=descending?'descending':'ascending';
  const groups=cagedProgressionExercise(board,harmony,material,motion);
  return groups.map((group,index)=>{
    if(index%2===0)return group;
    const notes=pathForPcs(board,group.pcs,group.names,descending,group.notes.at(-1).midi);
    return {...group,notes};
  });
}

function combinedAlternatingDiatonic(board,harmony,material,descendingFirst=false) {
  const up=alternatingDiatonic(board,harmony,material),down=alternatingDiatonic(board,harmony,material,true);
  return descendingFirst?[...down,...up]:[...up,...down];
}

function chordToneStacks(board,harmony,size,motion) {
  const chordPcs=new Set(harmony.chordPcs);
  const anchors=[...new Map(board.notes.filter(note=>chordPcs.has(note.pc)).sort((a,b)=>a.midi-b.midi).map(note=>[note.midi,note])).values()];
  const groups=[];
  for(const anchor of anchors){
    const degree=harmony.scalePcs.indexOf(anchor.pc);
    if(degree<0)continue;
    const scaleIndexes=Array.from({length:size},(_,offset)=>(degree+offset*2)%7);
    const pcs=scaleIndexes.map(index=>harmony.scalePcs[index]),names=scaleIndexes.map(index=>harmony.scaleNames[index]);
    const path=pathForPcs(board,pcs,names,true,anchor.midi,anchor.midi);
    if(!path||path.length!==size)continue;
    const chordDegree=harmony.chordPcs.indexOf(anchor.pc);
    const degreeName=harmony.intervals?.[chordDegree] || ['1','3','5','7'][chordDegree] || anchor.name;
    groups.push({degree:groups.length+1,chord:`From ${degreeName} · ${names[0]}${chordSuffix(pcs[0],pcs)}`,rootName:names[0],names,pcs,notes:path});
  }
  if(motion==='descending'||motion==='down-up')groups.reverse();
  return groups.map(group=>{
    const path=motion==='descending'||motion==='down-up'?[...group.notes].reverse():group.notes;
    return {...group,notes:contour(path,motion)};
  });
}

function alternatingChordToneStacks(board,harmony,size,descending=false) {
  const motion=descending?'descending':'ascending';
  const groups=chordToneStacks(board,harmony,size,motion);
  return groups.map((group,index)=>{
    if(index%2===0)return group;
    const ascending=descending;
    const target=group.notes.at(-1).midi;
    const notes=pathForPcs(board,group.pcs,group.names,ascending,target);
    return {...group,notes};
  });
}

function combinedAlternatingChordTones(board,harmony,size,descendingFirst=false) {
  const up=alternatingChordToneStacks(board,harmony,size),down=alternatingChordToneStacks(board,harmony,size,true);
  return descendingFirst?[...down,...up]:[...up,...down];
}

function inversionExercise(board,harmony,material,motion) {
  const size=MATERIAL_SIZES[material] || 4;
  const pcs=harmony.chordPcs.slice(0,Math.min(size,harmony.chordPcs.length));
  const names=harmony.tones.slice(0,pcs.length);
  const ascending=motion==='ascending'||motion==='up-down';
  const edge=board.notes.filter(note=>pcs.includes(note.pc)).sort((a,b)=>ascending?a.midi-b.midi:b.midi-a.midi)[0];
  if(!edge)return [];
  const edgeIndex=pcs.indexOf(edge.pc);
  const firstRotation=ascending?edgeIndex:(edgeIndex+1)%pcs.length;
  return pcs.map((_,sequenceIndex)=>{
    const inversion=(firstRotation+(ascending?sequenceIndex:-sequenceIndex)+pcs.length*2)%pcs.length;
    const rotatedPcs=[...pcs.slice(inversion),...pcs.slice(0,inversion)];
    const rotatedNames=[...names.slice(inversion),...names.slice(0,inversion)];
    const inversionName=['root','1st inv.','2nd inv.','3rd inv.','4th inv.'][inversion] || `${inversion}th inv.`;
    const path=pathForPcs(board,rotatedPcs,rotatedNames,ascending,edge.midi,sequenceIndex===0?edge.midi:null);
    return {degree:sequenceIndex+1,chord:`${harmony.name}${harmony.suffix} · ${inversionName}`,rootName:rotatedNames[0],names:rotatedNames,pcs:rotatedPcs,notes:contour(path,motion)};
  });
}

export function cagedStudy(board,harmony,study='harmonized',material='seventh',motion='ascending',context={}) {
  const size=MATERIAL_SIZES[material] || 4;
  if(study==='cells')return scalePatternExercise(board,harmony,motion,[0,1,2,4],'1–2–3–5');
  if(study==='thirds')return scalePatternExercise(board,harmony,motion,[0,2],'3rds');
  if(study==='fourths')return scalePatternExercise(board,harmony,motion,[0,3],'4ths');
  if(study==='sixths')return scalePatternExercise(board,harmony,motion,[0,5],'6ths');
  if(study==='digital1324')return scalePatternExercise(board,harmony,motion,[0,2,1,3],'1–3–2–4');
  if(study==='groups3')return scalePatternExercise(board,harmony,motion,[0,1,2],'group of 3');
  if(study==='groups4')return scalePatternExercise(board,harmony,motion,[0,1,2,3],'group of 4');
  if(study==='alternating')return motion==='ascending'?alternatingDiatonic(board,harmony,material):motion==='descending'?alternatingDiatonic(board,harmony,material,true):combinedAlternatingDiatonic(board,harmony,material,motion==='down-up');
  if(study==='chordtones')return chordToneStacks(board,harmony,size,motion);
  if(study==='chordtonesalternating')return motion==='ascending'?alternatingChordToneStacks(board,harmony,size):motion==='descending'?alternatingChordToneStacks(board,harmony,size,true):combinedAlternatingChordTones(board,harmony,size,motion==='down-up');
  if(study==='alternating7')return alternatingDiatonic(board,harmony,'seventh');
  if(study==='alternating7down')return alternatingDiatonic(board,harmony,'seventh',true);
  if(study==='alternating7combined')return combinedAlternatingDiatonic(board,harmony,'seventh');
  if(study==='alternating3')return alternatingDiatonic(board,harmony,'triad');
  if(study==='alternating3down')return alternatingDiatonic(board,harmony,'triad',true);
  if(study==='alternating3combined')return combinedAlternatingDiatonic(board,harmony,'triad');
  if(study==='chordtones7')return chordToneStacks(board,harmony,4,motion);
  if(study==='chordtones7turns')return alternatingChordToneStacks(board,harmony,4);
  if(study==='chordtones7turnsdown')return alternatingChordToneStacks(board,harmony,4,true);
  if(study==='chordtones7combined')return combinedAlternatingChordTones(board,harmony,4);
  if(study==='chordtones3')return chordToneStacks(board,harmony,3,motion);
  if(study==='chordtones3turns')return alternatingChordToneStacks(board,harmony,3);
  if(study==='chordtones3turnsdown')return alternatingChordToneStacks(board,harmony,3,true);
  if(study==='chordtones3combined')return combinedAlternatingChordTones(board,harmony,3);
  if(study==='inversions')return inversionExercise(board,harmony,material,motion);
  if(study==='enclosures')return chromaticEnclosures(board,harmony,motion);
  if(study==='enclosuresbelowabove')return chromaticEnclosures(board,harmony,motion,'belowabove');
  if(study==='enclosureschromatic')return chromaticEnclosures(board,harmony,motion,'chromatic');
  if(study==='enclosuresdouble')return chromaticEnclosures(board,harmony,motion,'double');
  if(study==='enclosuresfiveone')return chromaticEnclosures(board,harmony,motion,'fiveone');
  if(study==='enclosuresfivetwo')return chromaticEnclosures(board,harmony,motion,'fivetwo');
  if(study==='enclosuresfivethree')return chromaticEnclosures(board,harmony,motion,'fivethree');
  if(study==='enclosuresfivefour')return chromaticEnclosures(board,harmony,motion,'fivefour');
  if(study==='approach')return approachArpeggios(board,harmony,material,motion);
  if(study==='doubleapproach')return chromaticTargetCells(board,harmony,motion,'doubleapproach');
  if(study==='chromaticneighbors')return chromaticTargetCells(board,harmony,motion,'chromaticneighbors');
  if(study==='passingtones')return chromaticPassingTones(board,harmony,motion);
  if(study==='approacheverytone')return approachEveryArpeggioTone(board,harmony,material,motion);
  if(study==='upperstructure')return upperStructureExercise(board,harmony,motion);
  if(study==='guidetones')return guideToneLines(board,harmony,motion,context.progression);
  if(study==='connections')return connectedArpeggios(board,harmony,material,motion,context.progression);
  if(study==='triadpairs')return overlayExercise(board,harmony,'triads',motion,context.source);
  if(study==='pentatonic')return overlayExercise(board,harmony,'pentatonic',motion,context.source,context.pattern);
  return cagedProgressionExercise(board,harmony,material,motion);
}

export function flattenExercise(groups) { return groups.flatMap(group=>group.notes); }

function accidental(name) { return name.slice(1); }
function staffY(note) {
  const letter=LETTERS.indexOf(note.name[0]);
  const octave=Math.floor(note.midi/12)-1;
  // Guitar sounds an octave below its written treble-clef pitch.
  return 101-((octave*7+letter)-(4*7+2))*5-35;
}
function esc(text) { return String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }

function notationSystemSvg(groups,rhythm='eighths',title='CAGED exercise',systemIndex=0) {
  const notes=flattenExercise(groups);
  const perBeat=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2;
  const step=30,left=90,right=24,width=Math.max(760,left+notes.length*step+right),height=280;
  const xFor=index=>left+index*step+step/2;
  let svg=`<svg class="exercise-notation" data-system-index="${systemIndex}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>`;
  svg+=`<rect width="${width}" height="${height}" rx="8" class="notation-paper"/><text x="15" y="94" class="treble-clef">𝄞</text><text x="62" y="74" class="time-signature">4</text><text x="62" y="94" class="time-signature">4</text><text x="18" y="193" class="tab-clef">T<tspan x="18" dy="13">A</tspan><tspan x="18" dy="13">B</tspan></text>`;
  if(systemIndex===0)svg+=`<text class="exercise-title" x="90" y="20">${esc(title)}</text>`;
  for(let line=0;line<5;line++)svg+=`<line class="notation-line" x1="44" x2="${width-12}" y1="${61+line*10}" y2="${61+line*10}"/>`;
  for(let string=0;string<6;string++)svg+=`<line class="notation-line tab-line" x1="44" x2="${width-12}" y1="${150+string*18}" y2="${150+string*18}"/>`;
  let noteIndex=0;
  groups.forEach((group,groupIndex)=>{
    const start=noteIndex;
    const globalStart=group._globalStart??start;
    const bracketStart=xFor(start)-step*.34,bracketEnd=xFor(start+group.notes.length-1)+step*.34;
    svg+=`<path class="pattern-bracket" d="M ${bracketStart} 246 V 250 H ${bracketEnd} V 246"/>`;
    if(group.source&&group._showSource!==false)svg+=`<text class="exercise-source" x="${xFor(start)-10}" y="137">${esc(group.source)}</text>`;
    const ys=[];
    group.notes.forEach((note,localIndex)=>{
      const x=xFor(noteIndex),y=staffY(note),tabY=150+(5-note.string)*18;
      const globalIndex=globalStart+localIndex,target=group.targetIndex===localIndex;
      ys.push(y);
      for(let ledger=111;ledger<=y+1;ledger+=10)svg+=`<line class="ledger-line" x1="${x-9}" x2="${x+9}" y1="${ledger}" y2="${ledger}"/>`;
      for(let ledger=51;ledger>=y-1;ledger-=10)svg+=`<line class="ledger-line" x1="${x-9}" x2="${x+9}" y1="${ledger}" y2="${ledger}"/>`;
      const acc=accidental(note.name);
      if(acc)svg+=`<text class="accidental" x="${x-14}" y="${y+4}">${esc(acc)}</text>`;
      svg+=`<g class="exercise-note${target?' target-note':''}" data-note-index="${globalIndex}" data-group-index="${group._groupIndex??groupIndex}" tabindex="0" role="button" aria-label="${esc(`${note.name}, string ${6-note.string}, fret ${note.fret}`)}"><ellipse class="note-head" cx="${x}" cy="${y}" rx="6.5" ry="4.5" transform="rotate(-18 ${x} ${y})"/><rect class="tab-fret-bg" x="${x-8}" y="${tabY-8}" width="16" height="16"/><text class="tab-fret" x="${x}" y="${tabY+4}">${note.fret}</text><text class="note-name-label" x="${x}" y="${y+16}">${esc(note.name)}</text><text class="degree-note-label" x="${x}" y="${y+16}">${esc(note.chromaticDegree||note.name)}</text></g>`;
      if(noteIndex%perBeat===0)svg+=`<line class="beat-guide" x1="${x-step/2}" x2="${x-step/2}" y1="140" y2="245"/>`;
      noteIndex++;
    });
    const stemsUp=ys.reduce((sum,y)=>sum+y,0)/ys.length>56;
    group.notes.forEach((note,local)=>{
      const x=xFor(start+local),y=ys[local],stemX=x+(stemsUp?6:-6),stemEnd=stemsUp?Math.min(...ys)-24:Math.max(...ys)+24;
      svg+=`<line class="note-stem" x1="${stemX}" x2="${stemX}" y1="${y}" y2="${stemEnd}"/>`;
    });
    if(group.notes.length>1){
      const beamY=stemsUp?Math.min(...ys)-24:Math.max(...ys)+24;
      svg+=`<line class="note-beam" x1="${xFor(start)+(stemsUp?6:-6)}" x2="${xFor(noteIndex-1)+(stemsUp?6:-6)}" y1="${beamY}" y2="${beamY}"/>`;
    }
    if(group.annotation&&group._showAnnotation!==false)svg+=`<text class="exercise-degree" x="${xFor(start)}" y="268">${esc(group.annotation)}</text>`;
    if((groupIndex+1)%2===0||groupIndex===groups.length-1){
      const x=xFor(noteIndex-1)+step/2;
      svg+=`<line class="bar-line" x1="${x}" x2="${x}" y1="61" y2="101"/><line class="bar-line" x1="${x}" x2="${x}" y1="150" y2="240"/>`;
    }
  });
  return svg+'</svg>';
}

export function exerciseNotationSvg(groups,rhythm='eighths',title='CAGED exercise') {
  const systems=[],maxNotes=24;
  let current=[],count=0,globalStart=0,previousSource=null;
  const shownAnnotations=new Set();
  for(const [groupIndex,group] of groups.entries()){
    if(current.length&&count+group.notes.length>maxNotes){systems.push(current);current=[];count=0;}
    const showSource=Boolean(group.source)&&group.source!==previousSource;
    const showAnnotation=Boolean(group.annotation)&&!shownAnnotations.has(group.annotation);
    current.push({...group,_globalStart:globalStart,_groupIndex:groupIndex,_showSource:showSource,_showAnnotation:showAnnotation});count+=group.notes.length;globalStart+=group.notes.length;
    if(group.annotation)shownAnnotations.add(group.annotation);
    previousSource=group.source||null;
  }
  if(current.length)systems.push(current);
  return systems.map((system,index)=>notationSystemSvg(system,rhythm,title,index)).join('');
}
