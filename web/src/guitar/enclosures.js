// Counts include the final target (0). Offsets are semitones, not scale steps.
export const ENCLOSURE_PATTERNS={
 enclosures4:{upper:[2,1,-1,0],lower:[-2,-1,1,0],crossUp:[1,-2,-1,0],crossDown:[-1,2,1,0]},
 enclosures5:{upper:[2,1,-2,-1,0],lower:[-2,-1,2,1,0],returnBelow:[-1,2,1,-1,0],returnAbove:[1,-2,-1,1,0]},
};
export const isEnclosureStudy=study=>Object.hasOwn(ENCLOSURE_PATTERNS,study);
export const enclosurePatternLabel=offsets=>offsets.map(n=>n===0?'target':n>0?'+'+n:String(n).replace('-','−')).join(' → ');
// Rest before each cell so its final target lands on a quarter-note beat.
// Every cell remains complete and inside its own harmony slot.
export function enclosureNoteStarts(lengths,division){
 let tick=0;const starts=[];
 for(const count of lengths){
  tick+=(division-(tick+count-1)%division)%division;
  for(let i=0;i<count;i++)starts.push(tick++/division);
 }
 return starts;
}
