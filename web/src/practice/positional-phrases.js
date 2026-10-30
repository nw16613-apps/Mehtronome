import {resolveArpeggioStart} from './arpeggio-start.js';
import {fretboardFor} from '../guitar/fretboard.js';
import {positionalArpeggio} from './learning.js';
import {MODES} from '../audio/music.js';

// Full-position arpeggio triplets overlap six-note runs in twelve-note blocks.
// Reserve the destination edge for the next, opposite form.
// The following form uses the opposite direction, even in a new position.
export function rangePhrase(span,descending,turnaround,block=12){
 const cycle=[],sections=[];
 if(span.length<2)return {cycle:[...span],sections:span.length?[{start:0,length:1,up:!descending}]:[]};
 const leg=span.length-1,half=turnaround?Math.ceil(leg/block)*block:leg;
 for(const down of [descending,!descending]){
  const ordered=down?span.toReversed():span;
  let notes=ordered.slice(0,leg);
  if(turnaround){
   const runLength=block/2,runs=half/runLength;
   notes=Array.from({length:runs},(_,run)=>{
    const start=Math.floor(run*Math.max(0,leg-runLength)/(runs-1));
    const part=ordered.slice(start,Math.min(start+runLength,leg));
    return [...Array(runLength-part.length).fill(part[0]),...part];
   }).flat();
  }
  sections.push({start:cycle.length,length:half,up:!down});cycle.push(...notes);
 }
 return {cycle,sections};
}

/** Cycle complete balanced phrases: base, variation 2, variation 3, variation 2. */
function cyclingBalancedPhrase(available,descending){
 const cycle=[],sections=[],size=Math.min(7,available.length);
 if(!size)return {cycle,sections};
 const last=available.length-size;
 for(const variation of [0,1,2,1]){
  const offset=Math.min(variation,last),start=descending?last-offset:offset,span=available.slice(start,start+size);
  const phrase=rangePhrase(span,descending,false),base=cycle.length;
  sections.push(...phrase.sections.map(section=>({...section,start:base+section.start,variation:variation+1,endpoint:section.up?span.at(-1):span[0]})));
  cycle.push(...phrase.cycle);
 }
 return {cycle,sections};
}

/** Keep the phrase's ordinal place across chart/position changes. Pitch proximity
 * chooses among complete windows; it never advances or resets the phrase phase. */
export function positionalProgressionGroups(harmonies,durations,path,options){
 const {motion='ascending',rhythm='eighths',stage='full'}=options,descending=['descending','down-up'].includes(motion);
 const division=rhythm==='sixteenths'?4:rhythm==='triplets'?3:2,turnaround=rhythm==='triplets'&&options.phrase==='turnaround',spanSize=turnaround?Infinity:rhythm==='triplets'?7:9;
 const selectedStart=options.startTone||'default';
 const cycling=rhythm==='triplets'&&options.phrase==='balancedcycle';
 const variation=rhythm==='triplets'&&!turnaround?({balanced2:1,balanced3:2}[options.phrase]||0):0;
 let cursor=0,globalStart=0,previousContext='',span=[],lastMidi=null;
 return harmonies.map((harmony,slot)=>{
  const position=path[slot],board=fretboardFor(harmony,position.geometryShape),available=positionalArpeggio(board,harmony,'ascending')[0]?.notes||[];
  const context=JSON.stringify(available.map(n=>[n.midi,n.string,n.fret,n.name]));
  const size=Math.min(spanSize,available.length),windows=Array.from({length:Math.max(0,available.length-size+1)},(_,i)=>available.slice(i,i+size)).filter(ns=>ns.length);
  if(context!==previousContext){
   const offset=Math.min(variation,Math.max(0,windows.length-1));
   span=windows[descending?windows.length-1-offset:offset]||[];
   if(!cycling&&!variation&&lastMidi!==null&&windows.length>1){
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
  const patternStart=resolveArpeggioStart(cycling?available:span,harmony,descending,selectedStart);
  const {cycle,sections}=cycling?cyclingBalancedPhrase(available,descending):rangePhrase(span,descending,turnaround);
  const rotation=selectedStart==='default'?0:Math.max(0,cycle.findIndex(note=>note.midi===patternStart.note?.midi));
  const phaseStart=cycle.length?(cursor+rotation)%cycle.length:0,sectionAt=phase=>sections.find(s=>phase>=s.start&&phase<s.start+s.length);
  const capacity=Math.max(1,Math.floor(durations[slot]*division));
  // One-run scope includes its turning note, then leaves the slot's remaining
  // time silent. Cycling variations preserve repeated attacks at shared joins.
  const count=cycle.length?Math.min(capacity,stage==='cell'?sectionAt(phaseStart).start+sectionAt(phaseStart).length-phaseStart+1:capacity):0;
  const notes=Array.from({length:count},(_,i)=>cycling&&stage==='cell'&&i===sectionAt(phaseStart).start+sectionAt(phaseStart).length-phaseStart?sectionAt(phaseStart).endpoint:cycle[(phaseStart+i)%cycle.length]);
  const cellLengths=[],materialCells=[];
  for(let offset=0;offset<notes.length;){
   const phase=(phaseStart+offset)%cycle.length,section=sectionAt(phase),length=Math.min(notes.length-offset,section.start+section.length-phase);
   const up=section.up;cellLengths.push(length);materialCells.push(`${harmony.name}${harmony.suffix} · ${cycling?'variation '+section.variation+' · ':''}${up?'ascending':'descending'} half`);offset+=length;
  }
  cursor+=notes.length;
  // Preserve the original window route: a starting-degree choice rotates the
  // reference cycle rather than influencing which pitch span is chosen next.
  lastMidi=notes.length?cycle[(cursor-1)%cycle.length]?.midi:notes.at(-1)?.midi??lastMidi;
  const variationWarning=cycling&&windows.length<3&&span.length?' Some cycling variations need more chord tones in this position; using the nearest available spans.':variation>=windows.length&&span.length?` Variation ${variation+1} needs more chord tones in this position; using the nearest available span.`:'';
  const warning=(!span.length?`${harmony.name}${harmony.suffix}: no chord tones are available in this position.`:!turnaround&&span.length<spanSize?`${harmony.name}${harmony.suffix}, Position ${position.numeral}: only ${span.length} distinct chord-tone pitches fit; this span has a shorter phrase.`:'')+variationWarning+(patternStart.warning?' '+patternStart.warning:'');
  const group={slot,chord:harmony.name+harmony.suffix,rootName:harmony.name,harmony,board,position,notes,targetIndices:[],pcs:notes.map(n=>n.pc),names:notes.map(n=>n.name),materialCells,cellLengths,sequenceAnchors:[],sequenceDirections:[],globalStart,warning,positionalSpan:cycling?available:span,phraseLegLength:cycling?Math.max(1,size-1):null,phraseCycleLength:cycle.length,phrasePhase:phaseStart,phraseDivision:division,phraseSpanSize:turnaround?span.length:spanSize,phraseStyle:cycling?'balanced-cycle':turnaround?'turnaround':'balanced',phraseVariation:variation,phraseStartIndex:patternStart.index,annotation:span.length?`${MODES[harmony.mode].name} · ${span.length}-note arpeggio span`:'Rest · no chord tones in this position'};
  globalStart+=notes.length;return group;
 });
}
