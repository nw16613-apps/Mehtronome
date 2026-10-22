const MATERIAL_SIZES = {triad:3,seventh:4,extensions:6};

function playableNotes(board,harmony,material='triad') {
  const size=MATERIAL_SIZES[material] || 3;
  const pcs=harmony.chordPcs.slice(0,Math.min(size,harmony.chordPcs.length));
  const degreeForPc=new Map(pcs.map((pc,index)=>[pc,harmony.intervals?.[index] || ['1','3','5','7','9','11'][index]]));
  return board.notes
    .filter(note=>degreeForPc.has(note.pc))
    .map(note=>({...note,degree:degreeForPc.get(note.pc)}))
    .sort((a,b)=>a.midi-b.midi || a.string-b.string);
}

function compact(notes,max=8) {
  if(notes.length<=max)return notes;
  let best=notes.slice(0,max),bestSpan=Infinity;
  for(let start=0;start<=notes.length-max;start++){
    const candidate=notes.slice(start,start+max);
    const span=candidate.at(-1).midi-candidate[0].midi;
    if(span<bestSpan){best=candidate;bestSpan=span;}
  }
  return best;
}

export function cagedExercise(board,harmony,material='triad',motion='ascending') {
  const ascending=compact(playableNotes(board,harmony,material));
  if(!ascending.length)return [];
  if(motion==='descending')return [...ascending].reverse();
  if(motion==='up-down')return [...ascending,...ascending.slice(1,-1).reverse()];
  if(motion==='thirds'){
    const result=[];
    for(let index=0;index<ascending.length;index+=2){
      result.push(ascending[index]);
      if(ascending[index+2])result.push(ascending[index+2]);
      if(ascending[index+1])result.push(ascending[index+1]);
    }
    return result.slice(0,12);
  }
  return ascending;
}

export function tabRows(notes) {
  return [5,4,3,2,1,0].map(string=>({
    string,
    label:['E','A','D','G','B','E'][string],
    frets:notes.map(note=>note.string===string?String(note.fret):'–'),
  }));
}

