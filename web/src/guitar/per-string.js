import {TUNING} from './fretboard.js';
import {characteristicNotes} from '../audio/music.js';
export const STRING_PATTERNS={three:[3,3,3,3,3,3],oneTwo:[1,2,1,2,1,2],twoOne:[2,1,2,1,2,1]};

/** Consecutive ascending pitches, read low E to high E. No boundary-note
 * duplication or window filtering: exactly the requested attacks per string. */
export function perStringFingerings(harmony,kind='three',startDegree=0){
 const pattern=STRING_PATTERNS[kind];if(!pattern)throw new Error('Choose a supported per-string pattern.');
 const arpeggio=kind!=='three',pcs=arpeggio?harmony.chordPcs:harmony.scalePcs;
 if(!Number.isInteger(startDegree)||startDegree<0||startDegree>=pcs.length)throw new Error('Choose an available starting degree.');
 const startPc=pcs[startDegree],colour=new Set(characteristicNotes(harmony).map(n=>n.pc)),fingerings=[];
 for(let first=0;first<=24;first++){
  if((TUNING[0]+first)%12!==startPc)continue;
  const notes=[];let previous=TUNING[0]+first-1,valid=true;
  for(let string=0;string<6&&valid;string++)for(let i=0;i<pattern[string];i++){
   let midi=previous+1;while(!pcs.includes(midi%12))midi++;
   const fret=midi-TUNING[string];
   // Reject an unplayable register instead of skipping material or wrapping.
   if(fret<0||fret>24){valid=false;break;}
   const pc=midi%12,scaleIndex=harmony.scalePcs.indexOf(pc),chordIndex=harmony.chordPcs.indexOf(pc);
   notes.push({string,fret,midi,pc,scaleIndex:arpeggio?-1:scaleIndex,root:pc===harmony.chordPcs[0],chord:chordIndex>=0,scale:scaleIndex>=0,characteristic:colour.has(pc),name:arpeggio?harmony.tones[chordIndex]:harmony.scaleNames[scaleIndex],chromaticDegree:arpeggio?harmony.intervals[chordIndex]:''});
   previous=midi;
  }
  if(valid){const frets=notes.map(n=>n.fret);fingerings.push({kind,startDegree,firstFret:first,start:Math.min(...frets),end:Math.max(...frets),rootPc:harmony.chordPcs[0],notes});}
 }
 return fingerings;
}
