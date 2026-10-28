/** Select an intact cell by the movement of its pattern anchor, not by the
 * final played note (an arpeggio normally jumps between consecutive cells). */
export function continuationCell(cells,anchor,direction,canTurn=false){
 const rows=cells.map((cell,index)=>({index,anchor:cell.sequenceAnchor,direction:cell.sequenceDirection})).filter(c=>Number.isFinite(c.anchor));
 const leg=rows.filter(c=>c.direction===direction);
 const forward=leg.filter(c=>(c.anchor-anchor)*direction>0).sort((a,b)=>(a.anchor-b.anchor)*direction);
 if(forward.length)return {index:forward[0].index,direction,reset:false};
 if(canTurn){
  const other=rows.filter(c=>c.direction===-direction).sort((a,b)=>Math.abs(a.anchor-anchor)-Math.abs(b.anchor-anchor));
  if(other.length)return {index:other[0].index,direction:-direction,reset:false};
 }
 // No complete cell can continue within the new position: restart that leg
 // at its boundary. This is a range limit, not an automatic chord reset.
 return {index:leg[0]?.index??0,direction,reset:true};
}

export function continuationNote(notes,midi,direction,canTurn=false){
 const candidates=notes.map((note,index)=>({index,midi:note.midi,direction:Math.sign(index?note.midi-notes[index-1].midi:(notes[1]?.midi??note.midi)-note.midi)}));
 const forward=candidates.filter(n=>n.direction===direction&&(n.midi-midi)*direction>0).sort((a,b)=>(a.midi-b.midi)*direction);
 if(forward.length)return {offset:forward[0].index,direction};
 if(canTurn){const other=candidates.filter(n=>n.direction===-direction).sort((a,b)=>Math.abs(a.midi-midi)-Math.abs(b.midi-midi));if(other.length)return {offset:other[0].index,direction:-direction};}
 return {offset:0,direction};
}
