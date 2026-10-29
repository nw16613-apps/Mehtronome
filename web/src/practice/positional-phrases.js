import {fretboardFor} from '../guitar/fretboard.js';
import {positionalArpeggio} from './learning.js';
import {MODES} from '../audio/music.js';

const SPAN_SIZE=9;
const cycleFor=(span,descending)=>{
 const ordered=descending?span.toReversed():span;
 return [...ordered,...ordered.slice(1,-1).toReversed()];
};

/** Keep the phrase's ordinal place across chart/position changes. Pitch proximity
 * chooses among complete windows; it never advances or resets the phrase phase. */
export function positionalProgressionGroups(harmonies,durations,path,options){
 const {motion='ascending',rhythm='eighths',stage='full'}=options,descending=['descending','down-up'].includes(motion);
 const division=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2;
 let cursor=0,globalStart=0,previousContext='',span=[],lastMidi=null;
 return harmonies.map((harmony,slot)=>{
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape),available=positionalArpeggio(board,harmony,'ascending')[0]?.notes||[];
  const context=JSON.stringify(available.map(n=>[n.midi,n.string,n.fret,n.name]));
  const size=Math.min(SPAN_SIZE,available.length),windows=Array.from({length:Math.max(0,available.length-size+1)},(_,i)=>available.slice(i,i+size)).filter(ns=>ns.length);
  if(context!==previousContext){
   span=descending?windows.at(-1)||[]:windows[0]||[];
   if(lastMidi!==null&&windows.length>1){
    const candidates=windows.map((window,index)=>{
     const cycle=cycleFor(window,descending),phase=cursor%cycle.length,note=cycle[phase],previous=cycle[(phase+cycle.length-1)%cycle.length];
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
  const cycle=cycleFor(span,descending),phaseStart=cycle.length?cursor%cycle.length:0,leg=Math.max(1,span.length-1);
  const capacity=Math.max(1,Math.floor(durations[slot]*division));
  // One-run scope includes its turning note, then leaves the slot's remaining
  // time silent. Continuous scope keeps cycling without repeating endpoints.
  const count=cycle.length?Math.min(capacity,stage==='cell'?leg-phaseStart%leg+1:capacity):0;
  const notes=Array.from({length:count},(_,i)=>cycle[(cursor+i)%cycle.length]);
  const cellLengths=[],materialCells=[];
  for(let offset=0;offset<notes.length;){
   const phase=(phaseStart+offset)%cycle.length,length=Math.min(notes.length-offset,leg-phase%leg);
   const up=(phase<leg)!==descending;cellLengths.push(length);materialCells.push(`${harmony.name}${harmony.suffix} · ${up?'ascending':'descending'} half`);offset+=length;
  }
  cursor+=notes.length;lastMidi=notes.at(-1)?.midi??lastMidi;
  const warning=!span.length?`${harmony.name}${harmony.suffix}: no chord tones are available in this position.`:span.length<SPAN_SIZE?`${harmony.name}${harmony.suffix}, Position ${position.numeral}: only ${span.length} distinct chord-tone pitches fit; this span has a shorter phrase.`:'';
  const group={slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,notes,targetIndices:[],pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells,cellLengths,sequenceAnchors:[],sequenceDirections:[],globalStart,warning,positionalSpan:span,phraseCycleLength:cycle.length,phrasePhase:phaseStart,phraseDivision:division,annotation:span.length?`${MODES[harmony.mode].name} · ${span.length}-note arpeggio span`:'Rest · no chord tones in this position'};
  globalStart+=notes.length;return group;
 });
}
