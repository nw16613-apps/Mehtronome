import {theoryOptions} from './superimposition.js';

const LETTERS=['C','D','E','F','G','A','B'];
const TUNING=[40,45,50,55,59,64];
const MATERIAL_SIZES={triad:3,seventh:4,extensions:5};
export const INTERVALLIC_STUDIES=['intervalcells','permutations','cycles','interpolation','ultrapolation','infrapolation','mirror','chordcycles','patterncombo','progressionpattern'];
export const EXERCISE_VARIANTS={
  intervalcells:[['up3down2','Up a 3rd · down a 2nd'],['up4down3','Up a 4th · down a 3rd'],['up5down4','Up a 5th · down a 4th'],['wide','Alternating wide and narrow']],
  permutations:[['1324','1–3–2–4'],['1423','1–4–2–3'],['2143','2–1–4–3'],['2413','2–4–1–3']],
  cycles:[['m3','Minor-third cycle'],['M3','Major-third cycle'],['tritone','Tritone cycle'],['whole','Whole-tone cycle']],
  interpolation:[['chromatic','Chromatic interpolation'],['diatonic','Diatonic interpolation'],['chord','Chord-tone interpolation']],
  ultrapolation:[['semitone','Semitone overshoot'],['tone','Whole-tone overshoot'],['alternating','Alternating overshoots']],
  infrapolation:[['chromatic','Chromatic lower neighbour'],['diatonic','Diatonic lower neighbour'],['alternating','Alternating lower approaches']],
  mirror:[['chromatic','Chromatic expansion'],['diatonic','Diatonic expansion'],['thirds','Expansion in thirds']],
  chordcycles:[['root','From the root'],['third','From the 3rd'],['fifth','From the 5th'],['seventh','From the 7th']],
  patterncombo:[['statementretro','Statement + retrograde'],['statementinverse','Statement + inversion'],['interpolatecycle','Interpolation + interval cycle']],
  progressionpattern:[['restart','Restart on each chord'],['continuous','Continue across changes'],['targets','Connect nearest chord tones']],
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

function noteAtMidi(board,midi,harmony) {
  const existing=board.notes.find(note=>note.midi===midi);
  if(existing)return {...existing,name:noteNameForPc(harmony,midi%12)};
  const candidates=TUNING.map((open,string)=>({string,fret:midi-open,midi,pc:(midi%12+12)%12,name:noteNameForPc(harmony,midi%12)}))
    .filter(note=>note.fret>=board.start&&note.fret<=board.end);
  return candidates.toSorted((a,b)=>Math.abs(a.string-2.5)-Math.abs(b.string-2.5))[0]||null;
}

function groupFromMidis(board,harmony,midis,chord,annotation,roles=[]) {
  const notes=midis.map(midi=>noteAtMidi(board,midi,harmony));
  if(notes.some(note=>!note))return null;
  return {chord,rootName:notes[0].name,pcs:notes.map(note=>note.pc),names:notes.map(note=>note.name),notes,annotation,roles};
}

function treatment(group,kind,board,harmony) {
  if(!group||!kind||kind==='original')return group;
  const retro=kind==='retrograde'||kind==='inverted-retrograde';
  const invert=kind==='inversion'||kind==='inverted-retrograde';
  let midis=group.notes.map(note=>note.midi);
  if(invert){const axis=midis[0];midis=midis.map(midi=>axis-(midi-axis));}
  if(retro)midis.reverse();
  const changed=groupFromMidis(board,harmony,midis,group.chord,`${group.annotation} · ${kind.replace('-',' ')}`,retro?[...group.roles].reverse():group.roles);
  return changed||group;
}

function fitGroups(groups,motion,treatmentName,board,harmony) {
  let result=groups.map(group=>treatment(group,treatmentName,board,harmony)).filter(Boolean);
  if(motion==='descending'||motion==='down-up')result=result.map(group=>({...group,notes:[...group.notes].reverse(),pcs:[...group.pcs].reverse(),names:[...group.names].reverse(),roles:[...(group.roles||[])].reverse()})).reverse();
  return contourGroups(result,motion);
}

function diatonicCellStudy(board,harmony,study,variant,motion,treatmentName) {
  const definitions={
    intervalcells:{up3down2:[0,2,1,3],up4down3:[0,3,1,4],up5down4:[0,4,1,5],wide:[0,4,2,6]},
    permutations:{'1324':[0,2,1,3],'1423':[0,3,1,2],'2143':[1,0,3,2],'2413':[1,3,0,2]},
  };
  const offsets=definitions[study]?.[variant]||[0,2,1,3];
  const groups=scalePatternExercise(board,harmony,'ascending',offsets,offsets.map(offset=>offset+1).join('–'))
    .map(group=>({...group,annotation:offsets.map(offset=>offset+1).join(' · '),roles:offsets.map((_,index)=>index===0?'structural':'cell')}));
  return fitGroups(groups,motion,treatmentName,board,harmony);
}

function cycleInterval(variant){return {m3:3,M3:4,tritone:6,whole:2}[variant]||3;}
function intervalCycleStudy(board,harmony,variant,motion,treatmentName) {
  const interval=cycleInterval(variant),low=Math.min(...board.notes.map(note=>note.midi)),high=Math.max(...board.notes.map(note=>note.midi)),groups=[];
  let notes=[];for(let midi=low;midi<=high;midi+=interval){if(noteAtMidi(board,midi,harmony))notes.push(midi);}
  for(let index=0;index<notes.length;index+=4){const midis=notes.slice(index,index+4);if(midis.length>1){const group=groupFromMidis(board,harmony,midis,`${variant} cycle`,`equal division · +${interval} semitones`,midis.map(()=>'structural'));if(group)groups.push(group);}}
  return fitGroups(groups,motion,treatmentName,board,harmony);
}

function elaboratedCycleStudy(board,harmony,study,variant,motion,treatmentName) {
  const interval=3,low=Math.min(...board.notes.map(note=>note.midi)),high=Math.max(...board.notes.map(note=>note.midi)),groups=[];
  for(let structural=low;structural+interval<=high;structural+=interval){
    const target=structural+interval;let midis,roles;
    if(study==='interpolation'){
      const inserted=variant==='chord'?board.notes.filter(note=>harmony.chordPcs.includes(note.pc)&&note.midi>structural&&note.midi<target)[0]?.midi:variant==='diatonic'?board.notes.filter(note=>note.midi>structural&&note.midi<target)[0]?.midi:structural+1;
      midis=[structural,inserted??structural+1,target];roles=['structural','inserted','structural'];
    }else if(study==='ultrapolation'){
      const amount=variant==='tone'?2:variant==='alternating'&&groups.length%2?2:1;midis=[structural,target+amount,target];roles=['structural','overshoot','structural'];
    }else{
      const amount=variant==='diatonic'?2:variant==='alternating'&&groups.length%2?2:1;midis=[structural,target-amount,target];roles=['structural','lower approach','structural'];
    }
    const group=groupFromMidis(board,harmony,midis,study,`${roles.join(' · ')}`,roles);if(group)groups.push(group);
  }
  return fitGroups(groups,motion,treatmentName,board,harmony);
}

function mirrorStudy(board,harmony,variant,motion,treatmentName) {
  const available=[...new Map([...board.notes].sort((a,b)=>a.midi-b.midi).map(note=>[note.midi,note])).values()];
  const step=variant==='thirds'?2:1,groups=[];
  for(let center=1;center<available.length-1;center+=4){
    const centerMidi=available[center].midi,midis=[centerMidi];
    for(let distance=step;midis.length<5;distance+=step){
      const lower=variant==='chromatic'?centerMidi-distance:available[center-distance]?.midi;
      const upper=variant==='chromatic'?centerMidi+distance:available[center+distance]?.midi;
      if(lower!==undefined&&noteAtMidi(board,lower,harmony))midis.push(lower);
      if(upper!==undefined&&noteAtMidi(board,upper,harmony))midis.push(upper);
      if(lower===undefined&&upper===undefined)break;
    }
    const sorted=[...midis].sort((a,b)=>a-b);const group=groupFromMidis(board,harmony,sorted,'Mirror expansion',`${variant} · around ${noteNameForPc(harmony,centerMidi%12)}`,sorted.map(midi=>midi===centerMidi?'axis':'mirror'));if(group)groups.push(group);
  }
  return fitGroups(groups,motion,treatmentName,board,harmony);
}

function chordCycleStudy(board,harmony,variant,motion,treatmentName) {
  const startIndex={root:0,third:1,fifth:2,seventh:3}[variant]||0,pc=harmony.chordPcs[startIndex%harmony.chordPcs.length];
  const anchors=board.notes.filter(note=>note.pc===pc).sort((a,b)=>a.midi-b.midi),groups=[];
  for(const anchor of anchors){const midis=[0,3,6,9].map(offset=>anchor.midi+offset);const group=groupFromMidis(board,harmony,midis,`Cycle from ${harmony.intervals?.[startIndex]||variant}`,'chord tone · minor-third cycle',midis.map((_,index)=>index===0?'chord target':'cycle'));if(group)groups.push(group);}
  return fitGroups(groups,motion,treatmentName,board,harmony);
}

function combinationStudy(board,harmony,variant,motion,treatmentName) {
  const base=diatonicCellStudy(board,harmony,'permutations','1324','ascending','original').slice(0,4);
  const groups=[];for(const group of base){
    groups.push(group);
    const kind=variant==='statementinverse'?'inversion':'retrograde';groups.push(treatment(group,kind,board,harmony));
    if(variant==='interpolatecycle'){const extra=groupFromMidis(board,harmony,[group.notes.at(-1).midi,group.notes.at(-1).midi+1,group.notes.at(-1).midi+3],'Interpolated cycle','inserted · structural',['inserted','structural','structural']);if(extra)groups.push(extra);}
  }
  return fitGroups(groups,motion,treatmentName,board,harmony);
}

function progressionPatternStudy(board,harmony,progression,variant,motion,treatmentName) {
  const harmonies=progression?.length?progression:[harmony],groups=[];let previous=null;
  for(const current of harmonies){
    const candidates=[...new Set(current.chordPcs.flatMap(pc=>Array.from({length:45},(_,index)=>40+index).filter(midi=>midi%12===pc&&noteAtMidi(board,midi,current))))].sort((a,b)=>a-b);
    if(!candidates.length)continue;
    const startIndex=variant==='restart'||previous===null?0:candidates.map((midi,index)=>({index,distance:Math.abs(midi-previous)})).toSorted((a,b)=>a.distance-b.distance)[0].index;
    const ordered=[...candidates.slice(startIndex),...candidates.slice(0,startIndex)];
    const indexes=variant==='restart'?[0,2,1,3]:[0,1,2,3],midis=indexes.map(offset=>ordered[offset]).filter(Number.isFinite);
    const group=groupFromMidis(board,current,midis,`${current.name}${current.suffix}`,variant==='targets'?'nearest chord-tone targets':'cell across harmony',midis.map((_,index)=>index===0?'chord target':'cell'));if(group){groups.push(group);previous=group.notes.at(-1).midi;}
  }
  return fitGroups(groups,motion,treatmentName,board,harmony);
}

function chromaticEnclosures(board,harmony,motion) {
  const descending=motion==='descending'||motion==='down-up';
  const targets=[...board.notes].filter(note=>harmony.chordPcs.includes(note.pc)).sort((a,b)=>descending?b.midi-a.midi:a.midi-b.midi);
  const groups=[];
  for(const target of targets){
    const offsets=descending?[-2,1,0]:[2,-1,0];
    const notes=offsets.map(offset=>noteAtMidi(board,target.midi+offset,harmony));
    if(notes.every(Boolean))groups.push({chord:`Enclose ${target.name}`,rootName:target.name,pcs:notes.map(note=>note.pc),names:notes.map(note=>note.name),notes,annotation:`upper · lower · target`,targetIndex:2});
  }
  return motion==='up-down'?[...groups,...chromaticEnclosures(board,harmony,'descending')]:motion==='down-up'?[...groups,...chromaticEnclosures(board,harmony,'ascending')]:groups;
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

function connectedArpeggios(board,harmony,material,motion) {
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

function overlayExercise(board,harmony,kind,motion,choiceId) {
  const options=theoryOptions(harmony);
  const choices=kind==='pentatonic'?options.pentatonics:options.triadPairs;
  const choice=choices.find(option=>option.id===choiceId)||choices[0];
  if(!choice)return [];
  const descending=motion==='descending'||motion==='down-up';
  if(kind==='pentatonic'){
    const available=board.notes.filter(note=>choice.pcs.includes(note.pc)).sort((a,b)=>descending?b.midi-a.midi:a.midi-b.midi);
    const groups=[];
    for(let index=0;index+3<available.length;index++){
      const notes=available.slice(index,index+4).map(note=>({...note,name:noteNameForPc(harmony,note.pc)}));
      groups.push({chord:choice.name,rootName:notes[0].name,pcs:notes.map(note=>note.pc),names:notes.map(note=>note.name),notes,annotation:notes.map(note=>choice.degrees[choice.pcs.indexOf(note.pc)]).join(' · '),source:choice.name});
    }
    return contourGroups(groups,motion);
  }
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
  if(study==='approach')return approachArpeggios(board,harmony,material,motion);
  if(study==='upperstructure')return upperStructureExercise(board,harmony,motion);
  if(study==='guidetones')return guideToneLines(board,harmony,motion,context.progression);
  if(study==='connections')return connectedArpeggios(board,harmony,material,motion);
  if(study==='triadpairs')return overlayExercise(board,harmony,'triads',motion,context.source);
  if(study==='pentatonic')return overlayExercise(board,harmony,'pentatonic',motion,context.source);
  if(study==='intervalcells'||study==='permutations')return diatonicCellStudy(board,harmony,study,context.source,motion,context.treatment);
  if(study==='cycles')return intervalCycleStudy(board,harmony,context.source,motion,context.treatment);
  if(['interpolation','ultrapolation','infrapolation'].includes(study))return elaboratedCycleStudy(board,harmony,study,context.source,motion,context.treatment);
  if(study==='mirror')return mirrorStudy(board,harmony,context.source,motion,context.treatment);
  if(study==='chordcycles')return chordCycleStudy(board,harmony,context.source,motion,context.treatment);
  if(study==='patterncombo')return combinationStudy(board,harmony,context.source,motion,context.treatment);
  if(study==='progressionpattern')return progressionPatternStudy(board,harmony,context.progression,context.source,motion,context.treatment);
  return cagedProgressionExercise(board,harmony,material,motion);
}

export function flattenExercise(groups) { return groups.flatMap(group=>group.notes); }

function accidental(name) { return name.slice(1); }
function staffY(note) {
  const letter=LETTERS.indexOf(note.name[0]);
  const octave=Math.floor(note.midi/12)-1;
  return 76-((octave*7+letter)-(4*7+2))*5;
}
function esc(text) { return String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }

function notationSystemSvg(groups,rhythm='eighths',title='CAGED exercise') {
  const notes=flattenExercise(groups);
  const perBeat=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2;
  const step=30,left=90,right=24,width=Math.max(760,left+notes.length*step+right),height=280;
  const xFor=index=>left+index*step+step/2;
  let svg=`<svg class="exercise-notation" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>`;
  svg+=`<rect width="${width}" height="${height}" rx="8" class="notation-paper"/><text x="15" y="69" class="treble-clef">𝄞</text><text x="62" y="49" class="time-signature">4</text><text x="62" y="69" class="time-signature">4</text><text x="18" y="193" class="tab-clef">T<tspan x="18" dy="13">A</tspan><tspan x="18" dy="13">B</tspan></text>`;
  for(let line=0;line<5;line++)svg+=`<line class="notation-line" x1="44" x2="${width-12}" y1="${36+line*10}" y2="${36+line*10}"/>`;
  for(let string=0;string<6;string++)svg+=`<line class="notation-line tab-line" x1="44" x2="${width-12}" y1="${150+string*18}" y2="${150+string*18}"/>`;
  let noteIndex=0;
  groups.forEach((group,groupIndex)=>{
    const start=noteIndex;
    svg+=`<text class="chord-symbol" x="${xFor(start)-10}" y="20">${esc(group.chord)}</text>`;
    if(group.source)svg+=`<text class="exercise-source" x="${xFor(start)-10}" y="137">${esc(group.source)}</text>`;
    const ys=[];
    group.notes.forEach(note=>{
      const x=xFor(noteIndex),y=staffY(note),tabY=150+(5-note.string)*18;
      ys.push(y);
      for(let ledger=86;ledger<=y+1;ledger+=10)svg+=`<line class="ledger-line" x1="${x-9}" x2="${x+9}" y1="${ledger}" y2="${ledger}"/>`;
      for(let ledger=26;ledger>=y-1;ledger-=10)svg+=`<line class="ledger-line" x1="${x-9}" x2="${x+9}" y1="${ledger}" y2="${ledger}"/>`;
      const acc=accidental(note.name);
      if(acc)svg+=`<text class="accidental" x="${x-14}" y="${y+4}">${esc(acc)}</text>`;
      const role=group.roles?.[noteIndex-start]||'';
      svg+=`<ellipse class="note-head${role==='structural'||role==='chord target'?' structural-note':role?' elaborated-note':''}"${role?` data-pattern-role="${esc(role)}"`:''} cx="${x}" cy="${y}" rx="6.5" ry="4.5" transform="rotate(-18 ${x} ${y})"/><rect class="tab-fret-bg" x="${x-8}" y="${tabY-8}" width="16" height="16"/><text class="tab-fret" x="${x}" y="${tabY+4}">${note.fret}</text>`;
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
    if(group.annotation)svg+=`<text class="exercise-degree" x="${xFor(start)}" y="268">${esc(group.annotation)}</text>`;
    if((groupIndex+1)%2===0||groupIndex===groups.length-1){
      const x=xFor(noteIndex-1)+step/2;
      svg+=`<line class="bar-line" x1="${x}" x2="${x}" y1="36" y2="76"/><line class="bar-line" x1="${x}" x2="${x}" y1="150" y2="240"/>`;
    }
  });
  return svg+'</svg>';
}

export function exerciseNotationSvg(groups,rhythm='eighths',title='CAGED exercise') {
  const systems=[],maxNotes=24;
  let current=[],count=0;
  for(const group of groups){
    if(current.length&&count+group.notes.length>maxNotes){systems.push(current);current=[];count=0;}
    current.push(group);count+=group.notes.length;
  }
  if(current.length)systems.push(current);
  return systems.map((system,index)=>notationSystemSvg(system,rhythm,systems.length>1?`${title}, system ${index+1} of ${systems.length}`:title)).join('');
}
