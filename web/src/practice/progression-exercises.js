import {cagedStudy,approachNoteFor} from '../guitar/exercises.js';
import {fretboardFor} from '../guitar/fretboard.js';
import {progressionPositionPath} from '../guitar/position-path.js';
import {theoryOptions} from '../guitar/superimposition.js';
import {gripStudy,positionalArpeggio} from './learning.js';
import {MODES} from '../audio/music.js';
/** Rebuild the same study for each harmony; never transpose the starting cell
 * blindly through chord qualities. Only complete phrase cells enter a slot. */
export function progressionExerciseGroups(harmonies,durations,anchor,options){
 const {study,material='seventh',motion='ascending',rhythm='eighths',stage='full',source='',pattern='groups3'}=options;
 const division=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2;
 const path=options.positionPath?.length===harmonies.length?options.positionPath:progressionPositionPath(harmonies,{start:anchor.start,end:anchor.end});
 let globalStart=0,previousContext='',cellIndex=0,noteOffset=0;
 const approachEnds=[];
 const groups=harmonies.map((harmony,slot)=>{
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape),capacity=Math.max(1,Math.floor(durations[slot]*division));
  const sources=study==='pentatonic'?theoryOptions(harmony).pentatonics:study==='triadpairs'?theoryOptions(harmony).triadPairs:[];
  const chosen=sources.find(choice=>choice.id===source)||sources[0],adapted=Boolean(source&&sources.length&&!sources.some(choice=>choice.id===source));
  let cells=study==='grip'?gripStudy(board,harmony):study==='positional'?positionalArpeggio(board,harmony,motion):cagedStudy(board,harmony,study,material,motion,{source:chosen?.id,pattern});
  cells=cells.filter(cell=>cell.notes?.length);
  // The family owns its starting edge, ordering and contour. Never rotate
  // its cells to the backing root. Adjacent identical contexts continue the
  // sequence; a chord/scale/source or fingering change starts a fresh one.
  const context=JSON.stringify([harmony.chordPcs,harmony.scalePcs,harmony.scaleNames,chosen?.id,board.notes.map(n=>[n.string,n.fret,n.pc])]);
  if(context!==previousContext){cellIndex=0;noteOffset=0;}
  previousContext=context;
  if(cellIndex>=cells.length){cellIndex=0;noteOffset=0;}
  const notes=[],targetIndices=[],used=[],cellLengths=[];
  while(cellIndex<cells.length){
   const cell=cells[cellIndex];
   // A continuous positional run can cross a bar boundary. Pattern cells
   // (enclosures, interval groups, arpeggios, etc.) must remain complete.
   if(study==='positional'){
    const portion=cell.notes.slice(noteOffset,noteOffset+capacity);notes.push(...portion);used.push(cell.chord);cellLengths.push(portion.length);
    noteOffset+=portion.length;if(noteOffset>=cell.notes.length){cellIndex++;noteOffset=0;}break;
   }
   if(notes.length+cell.notes.length>capacity)break;
   const start=notes.length;notes.push(...cell.notes);used.push(cell.chord);cellLengths.push(cell.notes.length);
   if(cell.targetIndex!==undefined)targetIndices.push(start+cell.targetIndex);
   approachEnds[slot]=cell.annotation==='arpeggio · chromatic approach';
   cellIndex++;
   if(stage==='cell')break;
  }
  const missing=!notes.length,warning=missing?`${harmony.name}${harmony.suffix}: no complete ${study==='grip'?'grip':'cell'} fits this chord slot in this region. Use a faster subdivision, a longer chord duration or another position.`:'';
  const group={slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,sourceName:chosen?.name||'',sourceAdapted:adapted,notes,targetIndices,pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells:used,cellLengths,globalStart,warning,
   annotation:missing?'Rest · no complete cell fits':`${MODES[harmony.mode].name} · ${used.length} ${used.length===1?'cell':'cells'}${adapted?' · source adapted':''}`};
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
