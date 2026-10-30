import {fretboardFor} from '../guitar/fretboard.js';
import {cagedStudy} from '../guitar/exercises.js';
import {rangePhrase} from './positional-phrases.js';
import {MODES} from '../audio/music.js';

/** Full positional scales in two-bar triplet forms. The emitted subdivision
 * ordinal survives context changes, including changes during a turnaround. */
export function positionalScaleTripletGroups(harmonies,durations,path,options){
 const descending=['descending','down-up'].includes(options.motion);
 let cursor=0,globalStart=0;
 return harmonies.map((harmony,slot)=>{
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape);
  const span=cagedStudy(board,harmony,'positionalscale','seventh','ascending').flatMap(cell=>cell.notes);
  const {cycle,sections}=rangePhrase(span,descending,true,24),phaseStart=cycle.length?cursor%cycle.length:0;
  const capacity=Math.max(1,Math.floor(durations[slot]*3+1e-8));
  const notes=cycle.length?Array.from({length:capacity},(_,i)=>cycle[(cursor+i)%cycle.length]):[];
  const cellLengths=[],materialCells=[];
  for(let offset=0;offset<notes.length;){
   const phase=(phaseStart+offset)%cycle.length,section=sections.find(s=>phase>=s.start&&phase<s.start+s.length);
   const length=Math.min(notes.length-offset,section.start+section.length-phase);
   cellLengths.push(length);materialCells.push(`${harmony.scaleNames[0]} ${MODES[harmony.mode].name} · ${section.up?'ascending':'descending'} scale and turnaround`);offset+=length;
  }
  // Even a rest in an unavailable region must retain the chart's phrase time.
  cursor+=capacity;
  const warning=span.length?'':`${harmony.name}${harmony.suffix}: no scale pitches are available in this position.`;
  const group={slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,notes,targetIndices:[],pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells,cellLengths,sequenceAnchors:[],sequenceDirections:[],globalStart,warning,
   positionalSpan:span,phraseCycleLength:cycle.length,phraseHalfLength:sections[0]?.length||0,phrasePhase:phaseStart,phraseDivision:3,phraseSpanSize:span.length,phraseStyle:'scale-turnaround',
   annotation:span.length?`${MODES[harmony.mode].name} · full positional scale and turnaround`:'Rest · no scale pitches in this position'};
  globalStart+=notes.length;return group;
 });
}
