import {fretboardFor} from '../guitar/fretboard.js';
import {positionalArpeggio} from './learning.js';
import {MODES} from '../audio/music.js';

// An arpeggio triplet form traverses the full span, then turns near its
// destination edge in twelve-note blocks.
// The following form uses the opposite direction, even in a new position.
export function rangePhrase(span,descending,turnaround,block=12){
 const cycle=[],sections=[];
 if(span.length<2)return {cycle:[...span],sections:span.length?[{start:0,length:1,up:!descending}]:[]};
 const leg=span.length-1,half=turnaround?Math.ceil(leg/block)*block:leg;
 for(const down of [descending,!descending]){
  const ordered=down?span.toReversed():span,notes=ordered.slice(0,leg);
  const radius=Math.min(2,leg),period=2*radius;
  while(notes.length<half){
   const phase=(notes.length-leg)%period,distance=phase<=radius?phase:period-phase;
   notes.push(ordered[leg-distance]);
  }
  // The opposite form begins on the endpoint. Leave its lead-in below that
  // endpoint (above it for downward-first), avoiding a repeated turning note.
  if(turnaround&&notes.length>leg&&notes.at(-1)===ordered[leg]&&radius===2)notes[notes.length-1]=ordered[leg-2];
  sections.push({start:cycle.length,length:half,up:!down});cycle.push(...notes);
 }
 return {cycle,sections};
}

/** Keep the phrase's ordinal place across chart/position changes. Pitch proximity
 * chooses among complete windows; it never advances or resets the phrase phase. */
export function positionalProgressionGroups(harmonies,durations,path,options){
 const {motion='ascending',rhythm='eighths',stage='full'}=options,descending=['descending','down-up'].includes(motion);
 const division=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2,turnaround=rhythm==='triplets'&&options.phrase==='turnaround',spanSize=turnaround?Infinity:rhythm==='triplets'?7:9;
 let cursor=0,globalStart=0,previousContext='',span=[],lastMidi=null;
 return harmonies.map((harmony,slot)=>{
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape),available=positionalArpeggio(board,harmony,'ascending')[0]?.notes||[];
  const context=JSON.stringify(available.map(n=>[n.midi,n.string,n.fret,n.name]));
  const size=Math.min(spanSize,available.length),windows=Array.from({length:Math.max(0,available.length-size+1)},(_,i)=>available.slice(i,i+size)).filter(ns=>ns.length);
  if(context!==previousContext){
   span=descending?windows.at(-1)||[]:windows[0]||[];
   if(lastMidi!==null&&windows.length>1){
    const candidates=windows.map((window,index)=>{
     const {cycle}=rangePhrase(window,descending,turnaround),phase=cursor%cycle.length,note=cycle[phase],previous=cycle[(phase+cycle.length-1)%cycle.length];
     const direction=Math.sign(note.midi-previous.midi),distance=note.midi-lastMidi;
     // Prefer forward movement when it fits the same phrase phase. A shared
     // boundary can be rearticulated; a forced register move keeps the phase.
     const rank=distance*direction>0?0:distance===0?1:2;
     return {window,index,rank,distance:Math.abs(distance)};
    }).sort((a,b)=>a.rank-b.rank||a.distance-b.distance||(descending?b.index-a.index:a.index-b.index));
    span=candidates[0].window;
   }
  }
  previousContext=context;
  const {cycle,sections}=rangePhrase(span,descending,turnaround),phaseStart=cycle.length?cursor%cycle.length:0,sectionAt=phase=>sections.find(s=>phase>=s.start&&phase<s.start+s.length);
  const capacity=Math.max(1,Math.floor(durations[slot]*division));
  // One-run scope includes its turning note, then leaves the slot's remaining
  // time silent. Continuous scope keeps cycling without repeating endpoints.
  const count=cycle.length?Math.min(capacity,stage==='cell'?sectionAt(phaseStart).start+sectionAt(phaseStart).length-phaseStart+1:capacity):0;
  const notes=Array.from({length:count},(_,i)=>cycle[(cursor+i)%cycle.length]);
  const cellLengths=[],materialCells=[];
  for(let offset=0;offset<notes.length;){
   const phase=(phaseStart+offset)%cycle.length,section=sectionAt(phase),length=Math.min(notes.length-offset,section.start+section.length-phase);
   const up=section.up;cellLengths.push(length);materialCells.push(`${harmony.name}${harmony.suffix} · ${up?'ascending':'descending'} half`);offset+=length;
  }
  cursor+=notes.length;lastMidi=notes.at(-1)?.midi??lastMidi;
  const warning=!span.length?`${harmony.name}${harmony.suffix}: no chord tones are available in this position.`:!turnaround&&span.length<spanSize?`${harmony.name}${harmony.suffix}, Position ${position.numeral}: only ${span.length} distinct chord-tone pitches fit; this span has a shorter phrase.`:'';
  const group={slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,notes,targetIndices:[],pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells,cellLengths,sequenceAnchors:[],sequenceDirections:[],globalStart,warning,positionalSpan:span,phraseCycleLength:cycle.length,phrasePhase:phaseStart,phraseDivision:division,phraseSpanSize:turnaround?span.length:spanSize,phraseStyle:turnaround?'turnaround':'balanced',annotation:span.length?`${MODES[harmony.mode].name} · ${span.length}-note arpeggio span`:'Rest · no chord tones in this position'};
  globalStart+=notes.length;return group;
 });
}
