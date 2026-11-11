/** Preserve the generator's cell boundaries; bars and beaming are independent. */
export function noteCellLayout(group){
 const lengths=group?.cellLengths||[group?.notes?.length||0],layout=[];
 lengths.forEach((length,segment)=>{const offset=group?.cellOffsets?.[segment]||0,size=group?.cellSizes?.[segment]||length;
  for(let i=0;i<length;i++)layout.push({segment,offset:offset+i,size});
 });
 return layout;
}
/** Clip one logical bracket to the current score system. Open ends mean the
 * same cell continues, rather than starting again at a line/bar boundary. */
export function notationCellBrackets(events,start,end,xFor,y=250,padding=7){
 const cells=new Map();for(const event of events)if(event.cellId!==undefined&&event.cellSize>1&&!event.resolution&&event.start<end-1e-6&&event.start+event.duration>start+1e-6){if(!cells.has(event.cellId))cells.set(event.cellId,[]);cells.get(event.cellId).push(event);}
 let svg='';for(const [id,notes]of cells){
  const first=notes[0],last=notes.at(-1),left=first.cellOffset>0||first.start<start-1e-6,right=events.some(e=>e.cellId===id&&e.start>=end-1e-6)||last.start+last.duration>end+1e-6,partial=last.cellOffset+1<last.cellSize&&!right;
  const x1=xFor(Math.max(start,first.start))-padding,x2=xFor(Math.max(start,Math.min(end-1e-6,last.start)))+padding;
  const label=`Cell ${id+1} · notes ${first.cellOffset+1}–${last.cellOffset+1} of ${first.cellSize}${left?' · continued from previous line or bar':''}${right?' · continues on next line':partial?' · exercise ends before this cell is complete':''}`;
  svg+=`<g class="notation-cell" data-cell-index="${id}" data-cell-size="${first.cellSize}" data-cell-start-offset="${first.cellOffset}" data-cell-end-offset="${last.cellOffset}" data-continued-left="${left}" data-continued-right="${right}" data-partial-cell="${partial}" role="img" aria-label="${label}"><title>${label}</title><path class="pattern-bracket" d="M ${x1} ${left?y:y-4}${left?'':` V ${y}`} H ${x2}${right||partial?'':` V ${y-4}`}"/></g>`;
 }
 return svg;
}
