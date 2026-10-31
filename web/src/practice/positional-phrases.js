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

/** Keep the phrase's ordinal place across chart/position changes. Pitch proximity
 * chooses among complete windows; it never advances or resets the phrase phase. */
export function positionalProgressionGroups(harmonies,durations,path,options){
 const {motion='ascending',rhythm='eighths',stage='full'}=options,descending=['descending','down-up'].includes(motion);
 const division=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2,spanSize=9;
 const selectedStart=options.startTone||'default';
 let cursor=0,globalStart=0,previousContext='',span=[],lastMidi=null;
 return harmonies.map((harmony,slot)=>{
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape),available=positionalArpeggio(board,harmony,'ascending')[0]?.notes||[];
  const context=JSON.stringify(available.map(n=>[n.midi,n.string,n.fret,n.name]));
  const size=Math.min(spanSize,available.length),windows=Array.from({length:Math.max(0,available.length-size+1)},(_,i)=>available.slice(i,i+size)).filter(ns=>ns.length);
  if(context!==previousContext){
   span=windows[descending?windows.length-1:0]||[];
   if(lastMidi!==null&&windows.length>1){
    const candidates=windows.map((window,index)=>{
     const {cycle}=rangePhrase(window,descending),phase=cursor%cycle.length,note=cycle[phase],previous=cycle[(phase+cycle.length-1)%cycle.length];
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
  const patternStart=resolveArpeggioStart(span,harmony,descending,selectedStart);
  const {cycle,sections}=rangePhrase(span,descending),referenceCycle=cycle;
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
  // Preserve the original window route: a starting-degree choice rotates the
  // reference cycle rather than influencing which pitch span is chosen next.
  lastMidi=notes.length?referenceCycle[(cursor-1)%referenceCycle.length]?.midi:notes.at(-1)?.midi??lastMidi;
  const warning=(!span.length?`${harmony.name}${harmony.suffix}: no chord tones are available in this position.`:span.length<spanSize?`${harmony.name}${harmony.suffix}, Position ${position.numeral}: only ${span.length} distinct chord-tone pitches fit; this span has a shorter phrase.`:'')+(patternStart.warning?' '+patternStart.warning:'');
  const group={slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,notes,targetIndices:[],pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells,cellLengths,sequenceAnchors:[],sequenceDirections:[],globalStart,warning,positionalSpan:span,phraseLegLength:Math.max(1,size-1),phraseCycleLength:cycle.length,phrasePhase:phaseStart,phraseDivision:division,phraseSpanSize:spanSize,phraseStyle:'continuous',phraseStartIndex:patternStart.index,annotation:span.length?`${MODES[harmony.mode].name} · ${span.length}-note arpeggio span`:'Rest · no chord tones in this position'};
  globalStart+=notes.length;return group;
 });
}
