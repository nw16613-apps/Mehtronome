import {positionalProgressionGroups} from './positional-phrases.js';
import {cagedStudy,approachNoteFor} from '../guitar/exercises.js';
import {fretboardFor} from '../guitar/fretboard.js';
import {progressionPositionPath} from '../guitar/position-path.js';
import {theoryOptions} from '../guitar/superimposition.js';
import {gripStudy} from './learning.js';
import {MODES} from '../audio/music.js';
import {continuationCell} from './sequence-continuity.js';
/** Rebuild the same study for each harmony; never transpose the starting cell
 * blindly through chord qualities. Harmonized cells retain their note phase through slot boundaries. */
export function progressionExerciseGroups(harmonies,durations,anchor,options){
 const {study,material='seventh',motion='ascending',rhythm='eighths',stage='full',source='',pattern='groups3'}=options;
 const division=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2;
 const path=options.positionPath?.length===harmonies.length?options.positionPath:progressionPositionPath(harmonies,{start:anchor.start,end:anchor.end});
 if(study==='positional')return positionalProgressionGroups(harmonies,durations,path,options);
 const flowingCells=study==='harmonized'&&stage!=='cell';
 let cellOffset=0,pendingCell=null;
 let globalStart=0,previousContext='',cellIndex=0,pendingScaleBoundary=false,pendingScaleTurn=false;
 let lastAnchor=null,lastMidi=null,lastRangeEdge=null,travel=motion==='descending'||motion==='down-up'?-1:1,nextAscending=travel>0;
 const directional=study!=='grip'&&study!=='triadpairs';
 const alternating=study==='alternating'||study==='chordtonesalternating'||study==='pentatonic'&&pattern.startsWith('alternating');
 const approachEnds=[];let emittedCells=0,triadReference=60;
 const groups=harmonies.map((harmony,slot)=>{
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape),capacity=Math.max(1,Math.floor(durations[slot]*division));
  const sources=study==='pentatonic'?theoryOptions(harmony).pentatonics:study==='triadpairs'?theoryOptions(harmony).triadPairs:[];
  const chosen=sources.find(choice=>choice.id===source)||sources[0],adapted=Boolean(source&&sources.length&&!sources.some(choice=>choice.id===source));
  const context=JSON.stringify([harmony.chordPcs,harmony.scalePcs,harmony.scaleNames,chosen?.id,board.notes.map(n=>[n.string,n.fret,n.pc])]);
  if(context!==previousContext){triadReference=lastMidi??60;if(study==='positionalscale'&&pendingScaleTurn)travel=-travel;}
  const makeCells=()=>{
   const leg=directional?(travel>0?'ascending':'descending'):motion;
   return (study==='grip'?gripStudy(board,harmony):cagedStudy(board,harmony,study,material,leg,{source:chosen?.id,pattern,anchorMidi:triadReference})).filter(cell=>cell.notes?.length);
  };
  let cells=makeCells();
  // The family owns its starting edge, ordering and contour. Never rotate
  // its cells to the backing root. Identical contexts retain their cursor;
  // Changed contexts may rearticulate a shared endpoint; otherwise choose
  // the nearest valid cell in the ongoing direction.
  if(context!==previousContext){
   cellIndex=study==='triadpairs'&&cells.length?emittedCells%cells.length:0;
   if(flowingCells&&cellOffset&&pendingCell&&cells.length){
    // A change inside a stack adapts its unplayed tones at the same ordinal.
    // Compare the next structural tone, not a fresh cell's starting note.
    const target=pendingCell.notes[cellOffset].midi;
    cellIndex=cells.map((cell,index)=>({index,distance:Math.abs(cell.notes[cellOffset].midi-target)}))
     .sort((a,b)=>a.distance-b.distance||a.index-b.index)[0].index;
   }else if(lastAnchor!==null&&cells.some(c=>Number.isFinite(c.sequenceAnchor))){
    // Preserve the next structural scale endpoint, even when its pitch
    // changes with the incoming mode/shape. Do not insert a tiny extra
    // traversal by choosing a new intermediary pitch before that turn.
    let next=study==='positionalscale'&&pendingScaleBoundary?{index:cells.length-1,direction:travel,reset:false}:continuationCell(cells,lastAnchor,travel,false,directional&&!alternating?lastMidi:null);
    if(next.reset&&directional){travel=-travel;cells=makeCells();next=continuationCell(cells,lastRangeEdge??lastAnchor,travel);}
    cellIndex=next.index;
   }
  }
  if(!directional&&cellIndex>=cells.length)cellIndex=0;
  previousContext=context;
  const notes=[],targetIndices=[],used=[],cellLengths=[],cellOffsets=[],cellSizes=[],sequenceAnchors=[],sequenceDirections=[];
  while(cells.length&&notes.length<capacity){
   const previousTravel=travel,previousIndex=cellIndex;
   if(cellIndex>=cells.length){
    if(study==='positionalscale'&&stage==='cell'&&notes.length)break;
    if(!directional)break;
    travel=-travel;cells=makeCells();
    if(!cells.length)break;
    cellIndex=0;
    if(lastAnchor!==null)cellIndex=continuationCell(cells,lastRangeEdge??lastAnchor,travel).index;
   }
   const cell=cells[cellIndex];
   // Other families keep their existing complete-cell slot policy.
   if(!flowingCells&&notes.length+cell.notes.length>capacity){
    if(travel!==previousTravel){travel=previousTravel;cells=makeCells();cellIndex=previousIndex;}
    break;
   }
   const direction=cell.sequenceDirection??travel;
   if(direction!==travel)travel=direction;
   let cellNotes=cell.notes;
   if(alternating){
    const asc=cell.notes[1]?.midi>cell.notes[0].midi;
    if(asc!==nextAscending)cellNotes=[...cell.notes].reverse();
    nextAscending=!nextAscending;
   }
   const offset=flowingCells?cellOffset:0,remaining=cellNotes.length-offset;
   const take=flowingCells?Math.min(remaining,capacity-notes.length):remaining;
   const played=cellNotes.slice(offset,offset+take);
   const start=notes.length;notes.push(...played);used.push(cell.chord);cellLengths.push(played.length);cellOffsets.push(offset);cellSizes.push(cellNotes.length);
   if(Number.isFinite(cell.sequenceAnchor)){lastAnchor=cell.sequenceAnchor;sequenceAnchors.push(lastAnchor);sequenceDirections.push(travel);}
   // Opposite legs anchor different ends of a cell. At a turn, compare
   // against the outgoing extent, not the previous leg's starting anchor.
   // Use the structural extent so an alternating stroke cannot move the turn.
   lastRangeEdge=travel>0?Math.max(...cell.notes.map(n=>n.midi)):Math.min(...cell.notes.map(n=>n.midi));
   lastMidi=played.at(-1).midi;
   if(cell.targetIndex!==undefined)targetIndices.push(start+cell.targetIndex);
   approachEnds[slot]=cell.annotation==='arpeggio · chromatic approach';
   if(flowingCells&&offset+take<cellNotes.length){cellOffset=offset+take;pendingCell=cell;}
   else{cellOffset=0;pendingCell=null;cellIndex++;emittedCells++;}
   if(stage==='cell'&&study!=='positionalscale')break;
  }
  if(study==='positionalscale'){pendingScaleBoundary=cells.length>1&&cellIndex===cells.length-1;pendingScaleTurn=cells.length>1&&cellIndex>=cells.length;}
  const missing=!notes.length,warning=missing?`${harmony.name}${harmony.suffix}: no complete ${study==='grip'?'grip':'cell'} fits this chord slot in this region. Use a faster subdivision, a longer chord duration or another position.`:'';
  const group={slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,sourceName:chosen?.name||'',sourceAdapted:adapted,notes,targetIndices,pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells:used,cellLengths,cellOffsets,cellSizes,sequenceAnchors,sequenceDirections,globalStart,warning,
   annotation:missing?'Rest · no complete cell fits':`${MODES[harmony.mode].name} · ${used.length} ${cellOffsets.some((offset,i)=>offset||cellLengths[i]<cellSizes[i])?'cell segments':used.length===1?'cell':'cells'}${adapted?' · source adapted':''}`};
  globalStart+=notes.length;return group;
 });
 if(study==='approach'){
  // Across a harmonic boundary, resolve into the actual next written cell,
  // not a discarded cell from the previous chord's scale. Do not leave an
  // unsupported chromatic approach at the end of a non-looping study.
  groups.forEach((group,slot)=>{
   if(!approachEnds[slot])return;
   const target=(groups[slot+1]||(options.loop?groups[0]:null))?.notes[0];
   const approach=target&&approachNoteFor(group.board,group.harmony,group.notes.at(-2).midi,target.midi);
   if(approach)group.notes[group.notes.length-1]=approach;
   else{group.notes.pop();group.cellLengths[group.cellLengths.length-1]--;}
   group.pcs=group.notes.map(n=>n.pc);group.names=group.notes.map(n=>n.name);
  });
  globalStart=0;for(const group of groups){group.globalStart=globalStart;globalStart+=group.notes.length;}
 }
 return groups;
}
