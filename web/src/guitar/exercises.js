const LETTERS=['C','D','E','F','G','A','B'];
const MATERIAL_SIZES={triad:3,seventh:4,extensions:5};

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

export function cagedStudy(board,harmony,study='harmonized',material='seventh',motion='ascending') {
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
    const ys=[];
    group.notes.forEach(note=>{
      const x=xFor(noteIndex),y=staffY(note),tabY=150+(5-note.string)*18;
      ys.push(y);
      for(let ledger=86;ledger<=y+1;ledger+=10)svg+=`<line class="ledger-line" x1="${x-9}" x2="${x+9}" y1="${ledger}" y2="${ledger}"/>`;
      for(let ledger=26;ledger>=y-1;ledger-=10)svg+=`<line class="ledger-line" x1="${x-9}" x2="${x+9}" y1="${ledger}" y2="${ledger}"/>`;
      const acc=accidental(note.name);
      if(acc)svg+=`<text class="accidental" x="${x-14}" y="${y+4}">${esc(acc)}</text>`;
      svg+=`<ellipse class="note-head" cx="${x}" cy="${y}" rx="6.5" ry="4.5" transform="rotate(-18 ${x} ${y})"/><rect class="tab-fret-bg" x="${x-8}" y="${tabY-8}" width="16" height="16"/><text class="tab-fret" x="${x}" y="${tabY+4}">${note.fret}</text>`;
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
