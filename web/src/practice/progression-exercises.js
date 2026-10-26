import {cagedStudy} from '../guitar/exercises.js';
import {fretboardFor,cagedPositionFor} from '../guitar/fretboard.js';
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
 let globalStart=0;
 return harmonies.map((harmony,slot)=>{
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape),capacity=Math.max(1,Math.floor(durations[slot]*division));
  const sources=study==='pentatonic'?theoryOptions(harmony).pentatonics:study==='triadpairs'?theoryOptions(harmony).triadPairs:[];
  const chosen=sources.find(choice=>choice.id===source)||sources[0],adapted=Boolean(source&&sources.length&&!sources.some(choice=>choice.id===source));
  let cells=study==='grip'?gripStudy(board,harmony):study==='positional'?positionalArpeggio(board,harmony,motion):cagedStudy(board,harmony,study,material,motion,{source:chosen?.id,pattern});
  // Modal scales in functional harmony can share pitches. A root-first cell
  // makes the current chord context audible without changing the exercise.
  const rootCell=cells.findIndex(cell=>cell.notes[0]?.pc===harmony.chordPcs[0]);
  if(rootCell>0)cells=[...cells.slice(rootCell),...cells.slice(0,rootCell)];
  const notes=[],targetIndices=[],used=[],cellLengths=[];
  if(study==='positional'&&cells.length)cells=[{...cells[0],notes:cells[0].notes.slice(0,capacity)}];
  for(const cell of cells){
   if(!cell.notes.length)continue;
   if(notes.length+cell.notes.length>capacity)break;
   const start=notes.length;notes.push(...cell.notes);used.push(cell.chord);cellLengths.push(cell.notes.length);
   if(cell.targetIndex!==undefined)targetIndices.push(start+cell.targetIndex);
   if(stage==='cell')break;
  }
  const missing=!notes.length,warning=missing?`${harmony.name}${harmony.suffix}: no complete ${study==='grip'?'grip':'cell'} fits this chord slot in this region. Use a faster subdivision, a longer chord duration or another position.`:'';
  const group={slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,sourceName:chosen?.name||'',sourceAdapted:adapted,notes,targetIndices,pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells:used,cellLengths,globalStart,warning,
   annotation:missing?'Rest · no complete cell fits':`${MODES[harmony.mode].name} · ${used.length} ${used.length===1?'cell':'cells'}${adapted?' · source adapted':''}`};
  globalStart+=notes.length;return group;
 });
}
