import {exerciseArpeggioHarmony} from '../guitar/arpeggio-harmony.js';
import {resolveArpeggioStart} from './arpeggio-start.js';
import {fretboardFor} from '../guitar/fretboard.js';
import {positionalArpeggio} from './learning.js';
import {MODES} from '../audio/music.js';

// A positional traversal has the same pitches and unrepeated endpoints at
// every subdivision. Timing never inserts runs or pads a phrase to a bar.
export function rangePhrase(span,descending){
 const cycle=[],sections=[];
 if(span.length<2)return {cycle:[...span],sections:span.length?[{start:0,length:1,up:!descending}]:[]};
 const leg=span.length-1;
 for(const down of [descending,!descending]){
  sections.push({start:cycle.length,length:leg,up:!down});
  cycle.push(...(down?span.toReversed():span).slice(0,leg));
 }
 return {cycle,sections};
}

/** Shape default enters each new harmony/position at its directional boundary;
 * explicit degrees re-enter on their chosen tone. Fixed boundary spans prevent pitch proximity from
 * silently skipping the lowest (upward-first) or highest available pitch. */
export function positionalProgressionGroups(harmonies,durations,path,options){
 const {motion='ascending',rhythm='eighths',stage='full'}=options,descending=['descending','down-up'].includes(motion);
 const division=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2,spanSize=9;
 let cursor=0,globalStart=0,phaseOffset=0,previousContext='',previousStart='default',nextUp=!descending;
 return harmonies.map((harmony,slot)=>{
  const override=options.startTones?.[slot],explicit=override&&override!=='inherit',selectedStart=explicit?override:options.startTone||'default';
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape),available=positionalArpeggio(board,exerciseArpeggioHarmony(harmony,options.material),'ascending')[0]?.notes||[];
  const size=Math.min(spanSize,available.length),span=descending?available.slice(-size):available.slice(0,size);
  const context=JSON.stringify([harmony.name,harmony.suffix,harmony.mode,harmony.intervals,available.map(n=>[n.midi,n.string,n.fret,n.name])]);
  const patternStart=resolveArpeggioStart(span,harmony,selectedStart==='default'?descending:!nextUp,selectedStart);
  const {cycle,sections}=rangePhrase(span,descending);
  const sectionAt=phase=>sections.find(s=>phase>=s.start&&phase<s.start+s.length);
  if(selectedStart==='default'&&(explicit||context!==previousContext||previousStart!==selectedStart))phaseOffset=-cursor;
  if(selectedStart!=='default'&&(explicit||context!==previousContext||selectedStart!==previousStart)){
   // A selected degree is an entry instruction for every new harmony/shape.
   // Choose its occurrence in the ongoing direction; unchanged bars continue.
   const entries=cycle.flatMap((note,phase)=>note.midi===patternStart.note?.midi?[phase]:[]);
   phaseOffset=(entries.find(phase=>sectionAt(phase)?.up===nextUp)??entries[0]??0)-cursor;
  }
  const phaseStart=cycle.length?(cursor+phaseOffset)%cycle.length:0;
  previousContext=context;previousStart=selectedStart;
  const capacity=Math.max(1,Math.floor(durations[slot]*division));
  // Internal one-run callers may stop at the next endpoint. The UI always
  // streams the traversal through the full chart, across bar lines.
  const count=cycle.length?Math.min(capacity,stage==='cell'?sectionAt(phaseStart).start+sectionAt(phaseStart).length-phaseStart+1:capacity):0;
  const notes=Array.from({length:count},(_,i)=>cycle[(phaseStart+i)%cycle.length]);
  const cellLengths=[],cellOffsets=[],cellSizes=[],materialCells=[];
  for(let offset=0;offset<notes.length;){
   const phase=(phaseStart+offset)%cycle.length,section=sectionAt(phase),length=Math.min(notes.length-offset,section.start+section.length-phase);
   const up=section.up;cellLengths.push(length);cellOffsets.push(phase-section.start);cellSizes.push(section.length);materialCells.push(`${harmony.name}${harmony.suffix} · ${up?'ascending':'descending'} half`);offset+=length;
  }
  if(cycle.length)nextUp=sectionAt((phaseStart+notes.length)%cycle.length)?.up??nextUp;
  cursor+=notes.length;
  const warning=(!span.length?`${harmony.name}${harmony.suffix}: no chord tones are available in this position.`:span.length<spanSize?`${harmony.name}${harmony.suffix}, Position ${position.numeral}: only ${span.length} distinct chord-tone pitches fit; this span has a shorter phrase.`:'')+(patternStart.warning?' '+patternStart.warning:'');
  const endingDirection=notes.length&&cycle.length>1?Math.sign(cycle[(phaseStart+notes.length)%cycle.length].midi-notes.at(-1).midi):descending?-1:1;
  const group={endingDirection,slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,notes,targetIndices:[],pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells,cellLengths,cellOffsets,cellSizes,sequenceAnchors:[],sequenceDirections:[],globalStart,warning,positionalSpan:span,phraseLegLength:Math.max(1,size-1),phraseCycleLength:cycle.length,phrasePhase:phaseStart,phraseDivision:division,phraseSpanSize:spanSize,phraseStyle:'continuous',phraseStartIndex:patternStart.index,annotation:span.length?`${MODES[harmony.mode].name} · ${span.length}-note arpeggio span`:'Rest · no chord tones in this position'};
  globalStart+=notes.length;return group;
 });
}
