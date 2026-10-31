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

/** Restore older numbered span presets as a phrase plus a chord-degree start. */
export function migrateTripletPhrase(view,available,harmony,descending){
 if(!['balanced2','balanced3'].includes(view.phrase))return;
 const size=Math.min(7,available.length),offset=Math.min(view.phrase==='balanced2'?1:2,Math.max(0,available.length-size));
 const note=available[descending?available.length-1-offset:offset];
 const degree=note&&harmony.intervals?.[harmony.chordPcs.indexOf(note.pc)]?.match(/\d+/)?.[0];
 view.phrase='balanced';view.startTone=degree?degree+':0':'default';
}

/** Phrase-aware triplet entries preserve complete runs and the CAGED boundary. */
export function tripletStartingState(available,harmony,descending,phrase,selected='default'){
 const ordered=descending?available.toReversed():available,size=Math.min(7,available.length),degree=selected.split(':')[0];
 const role=note=>note&&harmony.intervals?.[harmony.chordPcs.indexOf(note.pc)]?.match(/\d+/)?.[0];
 if(selected==='default'||!available.length)return {supported:true,span:null,rotation:0,note:ordered[0],warning:''};
 const fail=reason=>({supported:false,span:null,rotation:0,note:ordered[0],warning:reason+' Using Shape default.'});
 if(phrase==='turnaround')return role(ordered[0])===degree?{supported:true,span:available,rotation:0,note:ordered[0],warning:''}:fail('Full-position runs start at the position’s range edge to retain the complete range and paired-run formula.');
 const last=available.length-size;
 if(phrase==='balancedcycle'){
  const variations=[0,1,2,1],index=variations.findIndex(variation=>role(ordered[Math.min(variation,last)])===degree);
  if(index<0)return fail(`Chord degree ${degree} cannot begin a complete phrase in Cycling spans here.`);
  return {supported:true,span:available,rotation:index*(size<2?size:2*(size-1)),note:ordered[Math.min(variations[index],last)],warning:''};
 }
 const index=ordered.findIndex((note,i)=>role(note)===degree&&i+size<=ordered.length);
 if(index<0)return fail(`Chord degree ${degree} cannot begin an intact ${size}-note Balanced span span in this position.`);
 const window=ordered.slice(index,index+size);
 return {supported:true,span:descending?window.toReversed():window,rotation:0,note:ordered[index],warning:''};
}
