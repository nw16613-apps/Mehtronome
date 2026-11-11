// Counts include the final target (0). Offsets are semitones, not scale steps.
export const ENCLOSURE_PATTERNS={
 enclosures4:{upper:[2,1,-1,0],lower:[-2,-1,1,0],crossUp:[1,-2,-1,0],crossDown:[-1,2,1,0]},
 enclosures5:{upper:[2,1,-2,-1,0],lower:[-2,-1,2,1,0],returnBelow:[-1,2,1,-1,0],returnAbove:[1,-2,-1,1,0]},
};
// Exhaust this explicitly bounded family: ±1/±2 semitones, both sides,
// no adjacent duplicate approaches, final approach a semitone from target.
for(const [study,patterns]of Object.entries(ENCLOSURE_PATTERNS)){
 const count=Number(study.at(-1))-1,offsets=[2,1,-1,-2],known=new Set(Object.values(patterns).map(p=>p.join(',')));
 for(let n=0;n<4**count;n++){
  const order=Array.from({length:count},(_,i)=>offsets[Math.floor(n/4**(count-1-i))%4]);
  if(Math.abs(order.at(-1))!==1||!order.some(n=>n<0)||!order.some(n=>n>0)||order.some((n,i)=>i&&n===order[i-1]))continue;
  const cell=[...order,0],signature=cell.join(',');if(known.has(signature))continue;known.add(signature);
  patterns['order_'+order.map(n=>n<0?'m'+(-n):'p'+n).join('_')]=cell;
 }
}
export const enclosureFamily=offsets=>new Set(offsets.slice(0,-1)).size===offsets.length-1?'unique':'repeated';
export function enclosurePatternGroups(study,family='unique'){
 return [1,-1].map(last=>({label:last>0?'Final approach from above':'Final approach from below',items:Object.entries(ENCLOSURE_PATTERNS[study]||{}).filter(([,offsets])=>enclosureFamily(offsets)===family&&offsets.at(-2)===last)}));
}
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
