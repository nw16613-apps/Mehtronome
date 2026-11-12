import {voicingExerciseBoard} from '../guitar/fingering-rules.js';
import {sequenceEntryState} from './sequence-entry.js';
import {cellDetails} from './notation-cells.js';
import {SCALE_SEQUENCES,orderedScaleCell} from '../guitar/scale-sequences.js';
import {ARPEGGIO_PATTERN_STUDIES} from '../guitar/arpeggio-patterns.js';
import {isEnclosureStudy,enclosureNoteStarts} from '../guitar/enclosures.js';
import {scaleStartingState} from './scale-start.js';
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
 const {study:requestedStudy,material='seventh',motion='ascending',rhythm='eighths',stage='full',source='',pattern='groups3'}=options;
 const study=requestedStudy.replace(/scaleperm_1234$/, 'groups4').replace(/scaleperm_123$/, 'groups3');
 const division=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2;
 const path=options.positionPath?.length===harmonies.length?options.positionPath:progressionPositionPath(harmonies,{start:anchor.start,end:anchor.end});
 if(study==='positional')return positionalProgressionGroups(harmonies,durations,path,options);
 const scalar=Boolean(SCALE_SEQUENCES[study.replace(/^arpseq_/, '')]);
 const patterned=ARPEGGIO_PATTERN_STUDIES.has(study)&&options.arpeggioPattern&&options.arpeggioPattern!=='straight';
 const routineConnected=patterned&&options.arpeggioRoutine==='connected';
 const routineAlternating=patterned&&options.arpeggioRoutine==='alternate';
 const flowingCells=(['harmonized','groups3','groups4','arpgroups3','arpgroups4'].includes(study)||patterned||scalar)&&(!patterned||options.arpeggioPattern!=='approachEach'&&(!options.arpeggioApproach||options.arpeggioApproach==='none'))&&stage!=='cell';
 const scaleTraversal=study==='positionalscale'&&stage!=='cell';
 // Fixed-order cells travel by their root/target. Their last/highest pitch
 // belongs to the pattern, not to the cursor used to select the next cell.
 // Interval cells now use the same lower anchor on both legs: reverse the
 // order of cells, independently of their internal written/reversed order.
 const anchoredTraversal=patterned||scalar&&!['groups3','groups4'].includes(study)||isEnclosureStudy(study);
 let scaleRemaining=null;
 let cellOffset=0,pendingCell=null;
 let globalStart=0,previousContext='',previousStart='default',cellIndex=0,pendingScaleBoundary=false,pendingScaleTurn=false;
 let lastAnchor=null,lastCursor=null,lastMidi=null,lastRangeEdge=null,travel=motion==='descending'||motion==='down-up'?-1:1,nextAscending=travel>0;
 const directional=study!=='grip'&&study!=='triadpairs';
 const alternating=!patterned&&(study==='alternating'||study==='chordtonesalternating')||study==='pentatonic'&&pattern.startsWith('alternating');
 const continueCell=(cells,anchor,direction,canTurn=false,shared=null)=>continuationCell(cells.map(c=>c.sequenceCursor===undefined?c:{...c,sequenceAnchor:c.sequenceCursor}),anchor,direction,canTurn,shared);
 const approachEnds=[];let emittedCells=0,triadReference=60;
 const groups=harmonies.map((backingHarmony,slot)=>{
  const harmony=options.harmonyFor?.(backingHarmony,slot)||backingHarmony;
  const override=options.startTones?.[slot],explicit=override&&override!=='inherit',selectedStart=explicit?override:options.startTone||'default';
  const position=path[slot],board=options.boardFor?.(backingHarmony,slot)||fretboardFor(harmony,position.geometryShape),capacity=Math.max(1,Math.floor(durations[slot]*division));
  const sources=study==='pentatonic'?theoryOptions(harmony).pentatonics:study==='triadpairs'?theoryOptions(harmony).triadPairs:[];
  const chosen=sources.find(choice=>choice.id===source)||sources[0],adapted=Boolean(source&&sources.length&&!sources.some(choice=>choice.id===source));
  const context=JSON.stringify([harmony.chordPcs,harmony.scalePcs,harmony.scaleNames,chosen?.id,board.notes.map(n=>[n.string,n.fret,n.pc])]);
  const phaseTurn=scaleTraversal&&scaleRemaining===0;
  if(context!==previousContext||scaleTraversal&&explicit){triadReference=lastMidi??60;if(phaseTurn||study==='positionalscale'&&pendingScaleTurn)travel=-travel;}
  const makeCells=()=>{
   const leg=directional?(travel>0?'ascending':'descending'):motion;
   return (study==='grip'?gripStudy(board,harmony):cagedStudy(board,harmony,study,material,leg,{sequenceAdvance:options.sequenceAdvance,sequenceOrder:'normal',arpeggioSequence:options.arpeggioSequence,source:chosen?.id,pattern,anchorMidi:triadReference,arpeggioPattern:options.arpeggioPattern,arpeggioRegister:options.arpeggioRegister,arpeggioClose:options.arpeggioClose,arpeggioSource:options.arpeggioSource,arpeggioRoutine:routineAlternating?'repeat':options.arpeggioRoutine,arpeggioApproach:options.arpeggioApproach,arpeggioRequireAlternate:routineAlternating,arpeggioDeferConnection:routineConnected,enclosureTarget:options.enclosureTarget,enclosurePattern:options.enclosurePattern})).filter(cell=>cell.notes?.length);
  };
  let cells=makeCells();
  if(scaleTraversal&&scaleRemaining===null)scaleRemaining=Math.max(1,cells.length-1);
  // The family owns its starting edge, ordering and contour. Never rotate
  // its cells to the backing root. Identical contexts retain their cursor;
  // Changed contexts may rearticulate a shared endpoint; otherwise choose
  // the nearest valid cell in the ongoing direction.
  if(context!==previousContext){
   cellIndex=study==='triadpairs'&&cells.length?emittedCells%cells.length:0;
   if(phaseTurn){
    // The preceding form has used its allotted traversal steps. Start the
    // opposite form at the incoming position's actual endpoint, rather than
    // continuing upward to it from the nearest pitch.
    cellIndex=0;scaleRemaining=Math.max(1,cells.length-1);
   }else if(flowingCells&&cellOffset&&pendingCell&&cells.length){
    // A change inside a group adapts its unplayed tones at the same ordinal.
    // Compare the next structural tone, not a fresh cell's starting note.
    const target=pendingCell.notes[cellOffset].midi;
    cellIndex=cells.map((cell,index)=>({index,distance:Math.abs((scalar?orderedScaleCell(cell,options.sequenceOrder,emittedCells).notes:routineAlternating&&emittedCells%2?cell.alternateNotes:cell.notes)[cellOffset].midi-target)}))
     .sort((a,b)=>a.distance-b.distance||a.index-b.index)[0].index;
   }else if(lastAnchor!==null&&cells.some(c=>Number.isFinite(c.sequenceAnchor))){
    // Preserve the next structural scale endpoint, even when its pitch
    // changes with the incoming mode/shape. Do not insert a tiny extra
    // traversal by choosing a new intermediary pitch before that turn.
    let next=study==='positionalscale'&&pendingScaleBoundary?{index:cells.length-1,direction:travel,reset:false}:continueCell(cells,lastCursor??lastAnchor,travel,false,directional&&!alternating?lastMidi:null);
    const rangeTurn=next.reset&&directional;
    if(rangeTurn){travel=-travel;cells=makeCells();next=continueCell(cells,lastRangeEdge??lastCursor??lastAnchor,travel);}
    cellIndex=next.index;
    if(scaleTraversal&&(pendingScaleTurn||rangeTurn))scaleRemaining=Math.max(1,cells.length-1-cellIndex);
   }
  }
  let startWarning='';
  if(scaleTraversal&&(explicit||previousStart!==selectedStart)&&selectedStart==='default'){cellIndex=0;scaleRemaining=Math.max(1,cells.length-1);}
  if(scaleTraversal&&(explicit||slot===0||context!==previousContext||selectedStart!==previousStart)&&selectedStart&&selectedStart!=='default'&&cells.length){const directed=cells.flatMap(cell=>cell.notes),entry=scaleStartingState(travel<0?directed.toReversed():directed,harmony,travel<0,selectedStart);cellIndex=entry.index;scaleRemaining=Math.max(1,cells.length-1-cellIndex);startWarning=entry.warning;}
  if(slot===0&&!scaleTraversal&&cells.length&&options.entryTone&&options.entryTone!=='default'){const entry=sequenceEntryState(cells,harmony,{...options,study});cellIndex=entry.index;if(study==='triadpairs')emittedCells=entry.index;startWarning=entry.warning;}
  if(!directional&&cellIndex>=cells.length)cellIndex=0;
  previousContext=context;previousStart=selectedStart;
  const notes=[],targetIndices=[],used=[],cellLengths=[],cellOffsets=[],cellSizes=[],cellDetailsList=[],sequenceAnchors=[],sequenceCursors=[],sequenceDirections=[];
  while(cells.length&&notes.length<capacity){
   const previousTravel=travel,previousIndex=cellIndex;
   if(scaleTraversal&&scaleRemaining===0){
    const edgeAlreadyPlayed=cellIndex>=cells.length;travel=-travel;cells=makeCells();
    cellIndex=edgeAlreadyPlayed?continuationCell(cells,lastAnchor,travel).index:0;
    scaleRemaining=Math.max(1,cells.length-1-cellIndex);
   }
   if(cellIndex>=cells.length){
    if(study==='positionalscale'&&stage==='cell'&&notes.length)break;
    if(!directional)break;
    travel=-travel;cells=makeCells();
    if(!cells.length)break;
    cellIndex=0;
    if(lastAnchor!==null)cellIndex=continueCell(cells,lastRangeEdge??lastCursor??lastAnchor,travel).index;
    if(scaleTraversal)scaleRemaining=Math.max(1,cells.length-1-cellIndex);
   }
   if(routineConnected&&!cellOffset){const root=cells[cellIndex].sequenceAnchor,reference=lastMidi??triadReference,choices=cells.map((cell,index)=>({cell,index})).filter(({cell})=>cell.sequenceAnchor===root).sort((a,b)=>Math.abs(a.cell.notes[0].midi-reference)-Math.abs(b.cell.notes[0].midi-reference)||a.index-b.index);cellIndex=choices[0].index;}
   const nextIndex=routineConnected?cells.findLastIndex(c=>c.sequenceAnchor===cells[cellIndex].sequenceAnchor)+1:cellIndex+1;
   const originalCell=scalar?orderedScaleCell(cells[cellIndex],options.sequenceOrder,emittedCells):cells[cellIndex],cell=routineAlternating&&emittedCells%2?{...originalCell,notes:originalCell.alternateNotes,patternOrder:originalCell.patternOrder?.toReversed(),targetIndices:originalCell.alternateTargetIndices}:originalCell;
   // Other families keep their existing complete-cell slot policy.
   if(!flowingCells&&(isEnclosureStudy(study)?enclosureNoteStarts([...cellLengths,cell.notes.length],division).at(-1)>=durations[slot]:notes.length+cell.notes.length>capacity)){
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
   const start=notes.length;notes.push(...played);used.push(cell.chord);cellLengths.push(played.length);cellOffsets.push(offset);cellSizes.push(cellNotes.length);cellDetailsList.push(cellDetails({...cell,notes:cellNotes},harmony));
   if(Number.isFinite(cell.sequenceAnchor)){lastAnchor=cell.sequenceAnchor;lastCursor=cell.sequenceCursor??lastAnchor;sequenceAnchors.push(lastAnchor);sequenceCursors.push(lastCursor);sequenceDirections.push(travel);}
   // Opposite legs anchor different ends of a cell. At a turn, compare
   // against the outgoing extent, not the previous leg's starting anchor.
   // Use the structural extent so an alternating stroke cannot move the turn.
   lastRangeEdge=anchoredTraversal?lastCursor:travel>0?Math.max(...cell.notes.map(n=>n.midi)):Math.min(...cell.notes.map(n=>n.midi));
   lastMidi=played.at(-1).midi;
   if(scaleTraversal)scaleRemaining=Math.max(0,scaleRemaining-played.length);
   for(const target of cell.targetIndices||(cell.targetIndex===undefined?[]:[cell.targetIndex]))if(target>=offset&&target<offset+take)targetIndices.push(start+target-offset);
   approachEnds[slot]=cell.annotation==='arpeggio · chromatic approach';
   if(flowingCells&&offset+take<cellNotes.length){cellOffset=offset+take;pendingCell=cell;}
   else{cellOffset=0;pendingCell=null;cellIndex=nextIndex;emittedCells++;}
   if(stage==='cell'&&study!=='positionalscale')break;
  }
  if(study==='positionalscale'){pendingScaleBoundary=cells.length>1&&cellIndex===cells.length-1;pendingScaleTurn=cells.length>1&&cellIndex>=cells.length;}
  const missing=!notes.length,warning=missing?`${harmony.name}${harmony.suffix}: no complete ${study==='grip'?'grip':'cell'} fits this chord slot in this region. Use a faster subdivision, a longer chord duration or another position.`:startWarning;
  const group={...(isEnclosureStudy(study)?{noteStarts:enclosureNoteStarts(cellLengths,division)}:{}),...(study==='positionalscale'?{positionalSpan:cagedStudy(board,harmony,'positionalscale','seventh','ascending').flatMap(cell=>cell.notes)}:{}),slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board:voicingExerciseBoard(board,notes),position,sourceName:chosen?.name||'',sourceAdapted:adapted,notes,targetIndices,pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells:used,cellLengths,cellOffsets,cellSizes,cellDetails:cellDetailsList,sequenceAnchors,sequenceCursors,sequenceDirections,endingDirection:travel,globalStart,warning,
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
