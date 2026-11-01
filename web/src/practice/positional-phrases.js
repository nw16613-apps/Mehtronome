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

/** Keep the phrase's ordinal place across chart/position changes. Each shape
 * uses a fixed boundary span, so proximity cannot silently skip its lowest
 * (upward first) or highest (downward first) arpeggio pitch. */
export function positionalProgressionGroups(harmonies,durations,path,options){
 const {motion='ascending',rhythm='eighths',stage='full'}=options,descending=['descending','down-up'].includes(motion);
 const division=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2,spanSize=9;
 const selectedStart=options.startTone||'default';
 let cursor=0,globalStart=0;
 return harmonies.map((harmony,slot)=>{
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape),available=positionalArpeggio(board,harmony,'ascending')[0]?.notes||[];
  const size=Math.min(spanSize,available.length),span=descending?available.slice(-size):available.slice(0,size);
  const patternStart=resolveArpeggioStart(span,harmony,descending,selectedStart);
  const {cycle,sections}=rangePhrase(span,descending);
  const rotation=selectedStart==='default'?0:Math.max(0,cycle.findIndex(note=>note.midi===patternStart.note?.midi));
  const phaseStart=cycle.length?(cursor+rotation)%cycle.length:0,sectionAt=phase=>sections.find(s=>phase>=s.start&&phase<s.start+s.length);
  const capacity=Math.max(1,Math.floor(durations[slot]*division));
  // Internal one-run callers may stop at the next endpoint. The UI always
  // streams the traversal through the full chart, across bar lines.
  const count=cycle.length?Math.min(capacity,stage==='cell'?sectionAt(phaseStart).start+sectionAt(phaseStart).length-phaseStart+1:capacity):0;
  const notes=Array.from({length:count},(_,i)=>cycle[(phaseStart+i)%cycle.length]);
  const cellLengths=[],materialCells=[];
  for(let offset=0;offset<notes.length;){
   const phase=(phaseStart+offset)%cycle.length,section=sectionAt(phase),length=Math.min(notes.length-offset,section.start+section.length-phase);
   const up=section.up;cellLengths.push(length);materialCells.push(`${harmony.name}${harmony.suffix} · ${up?'ascending':'descending'} half`);offset+=length;
  }
  cursor+=notes.length;
  const warning=(!span.length?`${harmony.name}${harmony.suffix}: no chord tones are available in this position.`:span.length<spanSize?`${harmony.name}${harmony.suffix}, Position ${position.numeral}: only ${span.length} distinct chord-tone pitches fit; this span has a shorter phrase.`:'')+(patternStart.warning?' '+patternStart.warning:'');
  const group={slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,notes,targetIndices:[],pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells,cellLengths,sequenceAnchors:[],sequenceDirections:[],globalStart,warning,positionalSpan:span,phraseLegLength:Math.max(1,size-1),phraseCycleLength:cycle.length,phrasePhase:phaseStart,phraseDivision:division,phraseSpanSize:spanSize,phraseStyle:'continuous',phraseStartIndex:patternStart.index,annotation:span.length?`${MODES[harmony.mode].name} · ${span.length}-note arpeggio span`:'Rest · no chord tones in this position'};
  globalStart+=notes.length;return group;
 });
}
