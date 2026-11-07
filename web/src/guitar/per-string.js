import {TUNING} from './fretboard.js';
import {characteristicNotes} from '../audio/music.js';
export const STRING_PATTERNS={three:[3,3,3,3,3,3],oneTwo:[1,2,1,2,1,2],twoOne:[2,1,2,1,2,1]};

/** Consecutive ascending pitches, read low E to high E. No boundary-note
 * duplication or window filtering: exactly the requested attacks per string. */
export function perStringFingerings(harmony,kind='three',startDegree=0,maxFret=24){
 const pattern=STRING_PATTERNS[kind];if(!pattern)throw new Error('Choose a supported per-string pattern.');
 const arpeggio=kind!=='three',pcs=arpeggio?harmony.chordPcs:harmony.scalePcs;
 if(!Number.isInteger(startDegree)||startDegree<0||startDegree>=pcs.length)throw new Error('Choose an available starting degree.');
 const startPc=pcs[startDegree],colour=new Set(characteristicNotes(harmony).map(n=>n.pc)),fingerings=[];
 for(let first=0;first<=maxFret;first++){
  if((TUNING[0]+first)%12!==startPc)continue;
  const notes=[];let previous=TUNING[0]+first-1,valid=true;
  for(let string=0;string<6&&valid;string++)for(let i=0;i<pattern[string];i++){
   let midi=previous+1;while(!pcs.includes(midi%12))midi++;
   const fret=midi-TUNING[string];
   // Reject an unplayable register instead of skipping material or wrapping.
   if(fret<0||fret>maxFret){valid=false;break;}
   const pc=midi%12,scaleIndex=harmony.scalePcs.indexOf(pc),chordIndex=harmony.chordPcs.indexOf(pc);
   notes.push({string,fret,midi,pc,scaleIndex:arpeggio?-1:scaleIndex,root:pc===harmony.chordPcs[0],chord:chordIndex>=0,scale:scaleIndex>=0,characteristic:colour.has(pc),name:arpeggio?harmony.tones[chordIndex]:harmony.scaleNames[scaleIndex],chromaticDegree:arpeggio?harmony.intervals[chordIndex]:''});
   previous=midi;
  }
  if(valid){const frets=notes.map(n=>n.fret);fingerings.push({kind,startDegree,firstFret:first,start:Math.min(...frets),end:Math.max(...frets),rootPc:harmony.chordPcs[0],notes});}
 }
 return fingerings;
}

/** One catalogue entry per distinct starting tone. Prefer registers within a
 * 24-fret guitar; retain a labelled theoretical diagram if the full continuous
 * pattern needs a longer neck. Never omit a degree to satisfy the range. */
export function perStringCatalogue(harmony,kind='three'){
 const pcs=kind==='three'?harmony.scalePcs:harmony.chordPcs;
 return pcs.flatMap((pc,index)=>{
  if(pcs.indexOf(pc)!==index)return [];
  // Recommended scale and arpeggio registers are always fully fretted.
  const fretted=board=>board.notes.every(note=>note.fret>0);
  const playable=perStringFingerings(harmony,kind,index).filter(fretted);
  const choices=playable.length?playable:perStringFingerings(harmony,kind,index,36).filter(fretted);
  return [{degree:index,choices,extended:!playable.length}];
 });
}
