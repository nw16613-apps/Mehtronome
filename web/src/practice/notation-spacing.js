import {writtenPitch} from './notation-pitch.js';
// Reserve room for the preceding head, an accidental and a visible gap.
// TAB masks include the complete fret number, including both digits.
export const tabFretWidth=fret=>Math.max(16,String(fret).length*7+6);
export const accidentalOffset=symbol=>14+Math.max(0,[...symbol].length-1)*6;
export function notationColumnWidth(notes){
 return Math.max(32,...notes.map(note=>Math.max(tabFretWidth(note.fret)+10,24+8*Math.abs(writtenPitch(note).alteration))));
}
export function notationBeatWidth(plan){
 let shortest=1;
 for(let i=0;i<plan.events.length;i++){
  const event=plan.events[i],gap=plan.events[i+1]?.start-event.start;
  if(event.duration>1e-6)shortest=Math.min(shortest,event.duration);
  if(gap>1e-6)shortest=Math.min(shortest,gap);
 }
 return notationColumnWidth(plan.events.map(e=>e.note))/shortest;
}
