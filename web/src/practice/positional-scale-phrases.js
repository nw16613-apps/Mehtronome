import {fretboardFor} from '../guitar/fretboard.js';
import {cagedStudy} from '../guitar/exercises.js';
import {MODES} from '../audio/music.js';

/** One sweep and one broad return arc. Among stepwise arcs of the required
 * length, finish nearest the next form's actual entry pitch. */
export function scaleTurnaroundForm(span,down,target=null){
 const ordered=down?span.toReversed():span;
 if(ordered.length<2)return ordered.length?Array(24).fill(ordered[0]):[];
 const half=Math.ceil(ordered.length/24)*24,remaining=half-ordered.length,edge=ordered.length-1;
 if(!remaining)return ordered;
 const candidates=[];
 for(let depth=1;depth<=edge;depth++){
  const returning=remaining-depth,end=depth-returning;
  if(returning<1||end<1)continue;
  const arc=[...Array.from({length:depth},(_,i)=>ordered[edge-i-1]),...Array.from({length:returning},(_,i)=>ordered[edge-depth+i+1])];
  candidates.push({arc,depth,distance:Math.abs(arc.at(-1).midi-(target??ordered.at(-1).midi))});
 }
 candidates.sort((a,b)=>a.distance-b.distance||a.depth-b.depth);
 // Every current scale/position admits a full arc. A future very short
 // collection must still stay inside its range when filling the form.
 const arc=candidates[0]?.arc||Array.from({length:remaining},(_,i)=>ordered[Math.max(0,edge-1-i%Math.max(1,edge))]);
 return [...ordered,...arc];
}

/** Full positional scales in two-bar triplet forms. Subdivision phase survives
 * context changes; look ahead to the actual next form instead of rocking at an edge. */
export function positionalScaleTripletGroups(harmonies,durations,path,options){
 const descending=['descending','down-up'].includes(options.motion);
 let timeline=0;
 const rows=harmonies.map((harmony,slot)=>{
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape);
  const span=cagedStudy(board,harmony,'positionalscale','seventh','ascending').flatMap(cell=>cell.notes);
  const capacity=Math.max(1,Math.floor(durations[slot]*3+1e-8)),start=timeline;timeline+=capacity;
  return {harmony,slot,position,board,span,capacity,start,end:timeline};
 });
 let globalStart=0;
 return rows.map(({harmony,slot,position,board,span,capacity,start})=>{
  const half=span.length?Math.ceil(span.length/24)*24:24,cycleLength=half*2,phaseStart=start%cycleLength,forms=new Map();
  const formAt=attack=>{
   const section=Math.floor(attack/half),down=descending!==(section%2===1),nextStart=(section+1)*half;
   if(!forms.has(section)){
    const incoming=rows.find(row=>nextStart>=row.start&&nextStart<row.end),nextDown=!down;
    const target=incoming?.span.length?(nextDown?incoming.span.at(-1).midi:incoming.span[0].midi):null;
    forms.set(section,scaleTurnaroundForm(span,down,target));
   }
   return {notes:forms.get(section),down};
  };
  const notes=span.length?Array.from({length:capacity},(_,i)=>formAt(start+i).notes[(start+i)%half]):[];
  const cellLengths=[],materialCells=[];
  for(let offset=0;offset<notes.length;){
   const attack=start+offset,length=Math.min(notes.length-offset,half-attack%half),{down}=formAt(attack);
   cellLengths.push(length);materialCells.push(`${harmony.scaleNames[0]} ${MODES[harmony.mode].name} · ${down?'descending':'ascending'} scale and return arc`);offset+=length;
  }
  const warning=span.length?'':`${harmony.name}${harmony.suffix}: no scale pitches are available in this position.`;
  const group={slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,notes,targetIndices:[],pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells,cellLengths,sequenceAnchors:[],sequenceDirections:[],globalStart,warning,
   positionalSpan:span,phraseCycleLength:cycleLength,phraseHalfLength:half,phrasePhase:phaseStart,phraseDivision:3,phraseSpanSize:span.length,phraseStyle:'scale-turnaround',
   annotation:span.length?`${MODES[harmony.mode].name} · full positional scale and return arc`:'Rest · no scale pitches in this position'};
  globalStart+=notes.length;return group;
 });
}
