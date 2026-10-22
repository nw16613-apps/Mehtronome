const LETTERS=['C','D','E','F','G','A','B'];
const MATERIAL_SIZES={triad:3,seventh:4,extensions:5};

function chordSuffix(rootPc,pcs) {
  const signature=pcs.slice(1).map(pc=>(pc-rootPc+12)%12).join(',');
  return ({'4,7':'','3,7':'m','3,6':'dim','4,8':'aug','4,7,11':'maj7','4,7,10':'7','3,7,10':'m7','3,6,10':'m7♭5','3,6,9':'dim7','4,8,11':'maj7♯5','3,7,11':'m(maj7)'}[signature] || (pcs.length===5?'9':'7'));
}

function pathForPcs(board,pcs,names,ascending=true,targetMidi=60) {
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
      const previous=path.at(-1);
      if(previous&&(ascending?note.midi<=previous.midi:note.midi>=previous.midi))continue;
      visit(index+1,[...path,note]);
    }
  }
  visit(0,[]);
  if(best)return best;
  return ordered.map((pc,index)=>candidates[index].toSorted((a,b)=>Math.abs(a.midi-targetMidi)-Math.abs(b.midi-targetMidi))[0]).filter(Boolean);
}

function patternDirections(motion,degree) {
  if(motion==='descending')return [false];
  if(motion==='up-down')return [true,false];
  if(motion==='down-up')return [false,true];
  if(motion==='alternating')return [degree%2===0,degree%2!==0];
  return [true];
}

export function cagedProgressionExercise(board,harmony,material='seventh',motion='ascending') {
  const size=MATERIAL_SIZES[material] || 4;
  const degrees=motion==='descending'?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
  return degrees.map((displayDegree,index)=>{
    const degree=displayDegree%7;
    const chordIndexes=Array.from({length:size},(_,offset)=>(degree+offset*2)%7);
    const pcs=chordIndexes.map(scaleIndex=>harmony.scalePcs[scaleIndex]);
    const names=chordIndexes.map(scaleIndex=>harmony.scaleNames[scaleIndex]);
    const rootName=harmony.scaleNames[degree];
    const target=Math.min(...board.notes.map(note=>note.midi))+3+displayDegree*1.7;
    const notes=[];
    patternDirections(motion,index).forEach((ascending,directionIndex)=>{
      const path=pathForPcs(board,pcs,names,ascending,target);
      notes.push(...(directionIndex?path.slice(1):path));
    });
    return {degree:displayDegree+1,chord:`${rootName}${chordSuffix(pcs[0],pcs)}`,rootName,names,pcs,notes};
  });
}

function directionalPath(board,pcs,names,motion,target,index) {
  const notes=[];
  patternDirections(motion,index).forEach((ascending,directionIndex)=>{
    const path=pathForPcs(board,pcs,names,ascending,target);
    notes.push(...(directionIndex?path.slice(1):path));
  });
  return notes;
}

function scaleCellExercise(board,harmony,motion,kind) {
  const degrees=motion==='descending'?[7,6,5,4,3,2,1,0]:[0,1,2,3,4,5,6,7];
  const offsets=kind==='thirds'?[0,2,1,3]:[0,1,2,4];
  const low=Math.min(...board.notes.map(note=>note.midi));
  return degrees.map((displayDegree,index)=>{
    const degree=displayDegree%7;
    const scaleIndexes=offsets.map(offset=>(degree+offset)%7);
    const pcs=scaleIndexes.map(i=>harmony.scalePcs[i]),names=scaleIndexes.map(i=>harmony.scaleNames[i]);
    const notes=directionalPath(board,pcs,names,motion,low+3+displayDegree*1.7,index);
    return {degree:displayDegree+1,chord:`${harmony.scaleNames[degree]} ${kind==='thirds'?'in 3rds':'1–2–3–5'}`,rootName:harmony.scaleNames[degree],names,pcs,notes};
  });
}

function inversionExercise(board,harmony,material,motion) {
  const size=MATERIAL_SIZES[material] || 4;
  const pcs=harmony.chordPcs.slice(0,Math.min(size,harmony.chordPcs.length));
  const names=harmony.tones.slice(0,pcs.length);
  const low=Math.min(...board.notes.map(note=>note.midi));
  return pcs.map((_,inversion)=>{
    const rotatedPcs=[...pcs.slice(inversion),...pcs.slice(0,inversion)];
    const rotatedNames=[...names.slice(inversion),...names.slice(0,inversion)];
    const inversionName=['root','1st inv.','2nd inv.','3rd inv.','4th inv.'][inversion] || `${inversion}th inv.`;
    return {degree:inversion+1,chord:`${harmony.name}${harmony.suffix} · ${inversionName}`,rootName:rotatedNames[0],names:rotatedNames,pcs:rotatedPcs,notes:directionalPath(board,rotatedPcs,rotatedNames,motion,low+4+inversion*3,inversion)};
  });
}

export function cagedStudy(board,harmony,study='harmonized',material='seventh',motion='ascending') {
  if(study==='cells')return scaleCellExercise(board,harmony,motion,'cells');
  if(study==='thirds')return scaleCellExercise(board,harmony,motion,'thirds');
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

export function exerciseNotationSvg(groups,rhythm='eighths',title='CAGED exercise') {
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
