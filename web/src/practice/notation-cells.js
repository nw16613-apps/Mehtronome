const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cellDetails(cell,harmony){
 const notes=cell.notes||[],first=notes[0],letters='CDEFGAB',degree=first&&harmony?(letters.indexOf(first.name[0])-letters.indexOf(harmony.name[0])+7)%7:0,natural=[0,2,4,5,7,9,11],alteration=first&&harmony?((first.pc-harmony.chordPcs[0]-natural[degree]+18)%12)-6:0;
 const start=first?`${alteration<0?'♭'.repeat(-alteration):'♯'.repeat(alteration)}${degree+1} · ${first.name}`:'';
 const order=cell.orderSteps||((cell.patternOrder?.length===notes.length)?cell.patternOrder:notes.map(n=>n.name));
 return {size:notes.length,order:order.join('–'),start,label:cell.sequenceLabel||cell.annotation||cell.chord||'',parts:cell.subcells?.map((p,i)=>{const offset=cell.subcells.slice(0,i).reduce((n,s)=>n+s.notes.length,0);return cellDetails({...p,notes:notes.slice(offset,offset+p.notes.length)},harmony);})||[]};
}
/** Generator-defined boundaries; bars and note beaming are independent. */
export function noteCellLayout(group){
 const lengths=group?.cellLengths||[group?.notes?.length||0],layout=[];let noteOffset=0;
 lengths.forEach((length,segment)=>{const offset=group?.cellOffsets?.[segment]||0,size=group?.cellSizes?.[segment]||length,details=group?.cellDetails?.[segment]||cellDetails({...group,notes:group?.notes?.slice(noteOffset,noteOffset+length)},group?.harmony);
  for(let i=0;i<length;i++){const at=offset+i;let subStart=0,subIndex=0;while(subIndex<details.parts.length-1&&at>=subStart+details.parts[subIndex].size)subStart+=details.parts[subIndex++].size;
   layout.push({segment,offset:at,size,details,...(details.parts.length>1?{subIndex,subOffset:at-subStart,subSize:details.parts[subIndex].size}:{})});}
  noteOffset+=length;
 });return layout;
}
/** A single bracket marks each logical cell, across bars and score systems. */
export function notationCellBrackets(events,start,end,xFor,y=250,padding=7){
 const cells=new Map();for(const event of events)if(event.cellId!==undefined&&event.cellSize>1&&!event.resolution){if(!cells.has(event.cellId))cells.set(event.cellId,[]);cells.get(event.cellId).push(event);}
 let svg='';for(const [id,allNotes]of cells){
  const notes=allNotes.filter(e=>e.start<end-1e-6&&e.start+e.duration>start+1e-6);if(!notes.length)continue;
  const first=notes[0],last=notes.at(-1),size=first.cellSize,details=first.cellInfo,left=first.cellOffset>0||first.start<start-1e-6,right=allNotes.some(e=>e.start>=end-1e-6)||last.start+last.duration>end+1e-6,partial=last.cellOffset+1<size&&!right;
  const x1=xFor(Math.max(start,first.start))-padding,x2=xFor(Math.max(start,Math.min(end-1e-6,last.start)))+padding,min=Math.min(...allNotes.map(e=>e.index)),max=Math.max(...allNotes.map(e=>e.index));
  const label=`Cell ${id+1} · notes ${first.cellOffset+1}–${last.cellOffset+1} of ${size}${details?.order?' · order '+details.order:''}${left?' · continued':''}${right?' · continues on next line':partial?' · incomplete final cell':''} · select and loop`;
  svg+=`<g class="notation-cell" data-cell-key="${id}" data-cell-index="${id}" data-cell-size="${size}" data-cell-start-offset="${first.cellOffset}" data-cell-end-offset="${last.cellOffset}" data-continued-left="${left}" data-continued-right="${right}" data-partial-cell="${partial}" data-range-start="${min}" data-range-end="${max}" tabindex="0" role="button" aria-label="${esc(label)}"><title>${esc(label)}</title><rect class="cell-hit-area" x="${x1}" y="${y-7}" width="${Math.max(1,x2-x1)}" height="14"/><path class="pattern-bracket" d="M ${x1} ${left?y:y-4}${left?'':` V ${y}`} H ${x2}${right||partial?'':` V ${y-4}`}"/></g>`;
 }return svg;
}
