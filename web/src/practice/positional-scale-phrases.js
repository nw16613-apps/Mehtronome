import {scaleStartingState} from './scale-start.js';
import {fretboardFor} from '../guitar/fretboard.js';
import {cagedStudy} from '../guitar/exercises.js';
import {MODES} from '../audio/music.js';

/** Overlap twelve-note runs, reserving the destination edge for the opposite
 * form's opening attack so ordinary range turns do not repeat their endpoint. */
export function scaleTripletForm(span,down){
 const ordered=down?span.toReversed():span;
 if(!ordered.length)return [];
 const pad=run=>[...Array(12-run.length).fill(run[0]),...run];
 if(ordered.length<=12)return [...pad(ordered),...pad(ordered.length>1?ordered.slice(0,-1):ordered)];
 const runs=Math.max(2,Math.ceil((ordered.length-1)/12));
 return Array.from({length:runs},(_,run)=>{
  const start=Math.floor(run*(ordered.length-13)/(runs-1));
  return ordered.slice(start,start+12);
 }).flat();
}

/** Subdivision phase and run placement survive chord/position changes. */
export function positionalScaleTripletGroups(harmonies,durations,path,options){
 const descending=['descending','down-up'].includes(options.motion);
 let cursor=0,globalStart=0;
 return harmonies.map((harmony,slot)=>{
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape);
  const span=cagedStudy(board,harmony,'positionalscale','seventh','ascending').flatMap(cell=>cell.notes);
  const entry=scaleStartingState(span,harmony,descending,options.startTone||'default',true);
  const first=scaleTripletForm(span,descending),second=scaleTripletForm(span,!descending);
  if(entry.supported&&entry.index>0){const ordered=descending?span.toReversed():span;first.splice(0,12,...ordered.slice(entry.index,entry.index+12));second.splice(second.length-12,12,...ordered.slice(0,12).toReversed());}
  const cycle=[...first,...second];
  const half=first.length||24,cycleLength=half*2,phaseStart=cursor%cycleLength;
  const capacity=Math.max(1,Math.floor(durations[slot]*3+1e-8));
  const notes=span.length?Array.from({length:capacity},(_,i)=>cycle[(cursor+i)%cycle.length]):[];
  const cellLengths=[],materialCells=[];
  for(let offset=0;offset<notes.length;){
   const attack=cursor+offset,length=Math.min(notes.length-offset,12-attack%12),down=descending!==(Math.floor(attack/half)%2===1);
   cellLengths.push(length);materialCells.push(`${harmony.scaleNames[0]} ${MODES[harmony.mode].name} · ${down?'descending':'ascending'} overlapping run`);offset+=length;
  }
  cursor+=capacity;
  const warning=span.length?entry.warning:`${harmony.name}${harmony.suffix}: no scale pitches are available in this position.`;
  const group={slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,notes,targetIndices:[],pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells,cellLengths,sequenceAnchors:[],sequenceDirections:[],globalStart,warning,
   positionalSpan:span,phraseCycleLength:cycleLength,phraseHalfLength:half,phrasePhase:phaseStart,phraseDivision:3,phraseSpanSize:span.length,phraseStyle:'scale-overlap',
   annotation:span.length?`${MODES[harmony.mode].name} · full positional scale in overlapping runs`:'Rest · no scale pitches in this position'};
  globalStart+=notes.length;return group;
 });
}
