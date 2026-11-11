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
const labelFor=(details,mode)=>mode==='order'?details?.order:mode==='start'?details?.start:mode==='length'?`${details?.size} notes`:'';
/** Open bracket ends retain identity across score systems. Nested brackets
 * group complete arpeggios inside a root-sequence motif. */
export function notationCellBrackets(events,start,end,xFor,y=250,padding=7,labelMode='none'){
 const all=new Map();for(const event of events)if(event.cellId!==undefined&&event.cellSize>1&&!event.resolution){const key=String(event.cellId);if(!all.has(key))all.set(key,[]);all.get(key).push(event);}
 const rows=[...all].flatMap(([key,notes])=>{const outer={key,notes,size:notes[0].cellSize,details:notes[0].cellInfo,inner:false};if(!outer.details?.parts?.length)return [outer];const parts=new Map();for(const note of notes){const part=note.subcellIndex;if(part===undefined)continue;if(!parts.has(part))parts.set(part,[]);parts.get(part).push({...note,cellOffset:note.subcellOffset,cellSize:note.subcellSize});}return [outer,...[...parts].map(([part,notes])=>({key:key+':'+part,notes,size:notes[0].cellSize,details:outer.details.parts[part],inner:true}))];});
 const previous={inner:'',outer:''};let svg='';
 for(const row of rows){const {key,details,inner}=row,allNotes=row.notes,notes=allNotes.filter(e=>e.start<end-1e-6&&e.start+e.duration>start+1e-6),caption=labelFor(details,labelMode),lane=inner?'inner':'outer',showLabel=caption&&caption!==previous[lane];previous[lane]=caption;
  if(!notes.length)continue;const first=notes[0],last=notes.at(-1),left=first.cellOffset>0||first.start<start-1e-6,right=allNotes.some(e=>e.start>=end-1e-6)||last.start+last.duration>end+1e-6,partial=last.cellOffset+1<row.size&&!right,nested=!inner&&details?.parts?.length>1,baseline=y+(nested?18:0);
  const x1=xFor(Math.max(start,first.start))-padding,x2=xFor(Math.max(start,Math.min(end-1e-6,last.start)))+padding,min=Math.min(...allNotes.map(e=>e.index)),max=Math.max(...allNotes.map(e=>e.index));
  const label=`${inner?'Arpeggio':'Cell'} ${key.split(':').map(n=>Number(n)+1).join('.')} · notes ${first.cellOffset+1}–${last.cellOffset+1} of ${row.size}${details?.order?' · order '+details.order:''}${details?.start?' · start '+details.start:''}${left?' · continued':''}${right?' · continues on next line':partial?' · incomplete final cell':''} · select and loop`;
  svg+=`<g class="notation-cell${inner?' inner-cell':''}" data-cell-key="${key}" data-cell-index="${first.cellId}" data-subcell-index="${inner?first.subcellIndex:''}" data-cell-size="${row.size}" data-cell-start-offset="${first.cellOffset}" data-cell-end-offset="${last.cellOffset}" data-continued-left="${left}" data-continued-right="${right}" data-partial-cell="${partial}" data-range-start="${min}" data-range-end="${max}" tabindex="0" role="button" aria-label="${esc(label)}"><title>${esc(label)}</title><rect class="cell-hit-area" x="${x1}" y="${baseline-7}" width="${Math.max(1,x2-x1)}" height="14"/><path class="pattern-bracket" d="M ${x1} ${left?baseline:baseline-4}${left?'':` V ${baseline}`} H ${x2}${right||partial?'':` V ${baseline-4}`}"/>${showLabel&&!left?`<text class="cell-label" x="${x1}" y="${baseline+11}" textLength="${Math.min(Math.max(1,x2-x1),caption.length*4.3)}" lengthAdjust="spacingAndGlyphs">${esc(caption)}</text>`:''}</g>`;
 }return svg;
}
