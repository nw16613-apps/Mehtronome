/** Written chord-degree role plus occurrence follows harmony without changing
 * the positional pitch library or its ordering. Altered thirds/fifths/sevenths
 * retain their role when the chord quality changes. */
export function arpeggioStartingChoices(span,harmony,descending=false){
 const counts=new Map(),ordered=descending?span.toReversed():span;
 return ordered.map(note=>{
  const interval=harmony.intervals?.[harmony.chordPcs.indexOf(note.pc)]||'1',degree=interval.match(/\d+/)?.[0]||'1',occurrence=counts.get(degree)||0;
  counts.set(degree,occurrence+1);return {value:`${degree}:${occurrence}`,degree,occurrence,interval,note};
 });
}
export function resolveArpeggioStart(span,harmony,descending,selected='default'){
 const choices=arpeggioStartingChoices(span,harmony,descending);
 if(selected==='default'||!choices.length)return {index:0,note:choices[0]?.note,warning:''};
 const exact=choices.findIndex(choice=>choice.value===selected);
 if(exact>=0)return {index:exact,note:choices[exact].note,warning:''};
 const degree=selected.split(':')[0],matches=choices.map((choice,index)=>({...choice,index})).filter(choice=>choice.degree===degree),fallback=matches.at(-1);
 return fallback?{index:fallback.index,note:fallback.note,warning:`The selected occurrence of chord degree ${degree} does not fit this span; using its nearest available octave.`}:{index:0,note:choices[0]?.note,warning:`Chord degree ${degree} is absent from this arpeggio span; using its default starting note.`};
}
