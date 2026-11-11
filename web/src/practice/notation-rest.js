/** Font-independent music rests, centred on the middle staff line. */
export function notationRest(x,duration,y=81){
 const kind=duration>=4?'whole':duration>=2?'half':duration>=1?'quarter':duration>=.3?'eighth':'sixteenth';
 let shape;
 if(kind==='whole')shape='<rect x="-6" y="-10" width="12" height="4"/>';
 else if(kind==='half')shape='<rect x="-6" y="-4" width="12" height="4"/>';
 else if(kind==='quarter')shape='<path d="M -2 -17 L 5 -9 L 0 -3 L 5 5 C -3 1 -6 6 -1 12 C -9 8 -8 1 -2 0 L -7 -7 L -2 -13 Z"/>';
 else{
  const flag=offset=>`<circle cx="-3" cy="${offset}" r="3"/><path d="M -3 ${offset+2} Q 3 ${offset+5} 6 ${offset-3} L 4 ${offset+4} Q 1 ${offset+6} -3 ${offset+2} Z"/>`;
  shape=flag(kind==='eighth'?-6:-13)+(kind==='sixteenth'?flag(-5):'')+`<path d="M 5 ${kind==='eighth'?-10:-17} L 7 ${kind==='eighth'?-10:-17} L 0 13 L -2 13 Z"/>`;
 }
 return `<g class="notation-rest" data-rest-beats="${duration}" data-rest-kind="${kind}" role="img" aria-label="${kind} rest" transform="translate(${x} ${y})">${shape}</g>`;
}
