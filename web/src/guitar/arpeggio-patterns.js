export const ARPEGGIO_PATTERN_STUDIES=new Set(['harmonized','alternating','chordtones','chordtonesalternating']);
const permute=items=>items.length?items.flatMap((n,i)=>permute(items.filter((_,j)=>i!==j)).map(rest=>[n,...rest])):[[]];
export const TRIAD_PERMUTATIONS=permute([1,3,5]);
export const SEVENTH_PERMUTATIONS=permute([1,3,5,7]);
const repeatedCells=tones=>Array.from({length:tones.length**(tones.length+1)},(_,n)=>Array.from({length:tones.length+1},(_,i)=>tones[Math.floor(n/tones.length**(tones.length-i))%tones.length])).filter(p=>new Set(p).size===tones.length&&p.every((n,i)=>!i||n!==p[i-1]));
export const TRIAD_CELLS=repeatedCells([1,3,5]);
export const SEVENTH_CELLS=repeatedCells([1,3,5,7]);
export const ARPEGGIO_PATTERNS={
 straight:'Straight',inversionCycle:'Inversion cycle',brokenPairs:'Broken pairs',wideSkips:'Wide skips',outsideInside:'Outside–inside',returnStart:'Return to starting tone',upBack:'Up and back',approachEach:'Chromatic approach to each tone',connected:'Connected arpeggios',
 ...Object.fromEntries(TRIAD_PERMUTATIONS.map(p=>['perm3_'+p.join(''),p.join('–')])),
 ...Object.fromEntries(TRIAD_CELLS.map(p=>['cell3_'+p.join(''),p.join('–')])),
 ...Object.fromEntries(SEVENTH_CELLS.map(p=>['cell4_'+p.join(''),p.join('–')])),
 ...Object.fromEntries(SEVENTH_PERMUTATIONS.map(p=>['perm4_'+p.join(''),p.join('–')])),
};
const tuning=[40,45,50,55,59,64];
const pc=n=>(n%12+12)%12;
/** Pattern order and travel through the position are independent. An upward
 * register places the other tones within the octave above the entry note;
 * a downward register places them below. Only closed triad permutations
 * repeat their entry tone, an octave away. Missing pitches invalidate a cell. */
export function patternedArpeggios(board,groups,pattern,{motion='ascending',register='up',alternate=false,anchorMidi=60,closeTriad=true}={}){
 const down=motion==='descending'||motion==='down-up',ordered=down?groups.toReversed():groups;
 const byMidi=new Map(board.notes.map(n=>[n.midi,n])),result=[];let previous=anchorMidi;
 const atMidi=(midi,name,chromatic=false)=>{
  const existing=byMidi.get(midi);if(existing)return {...existing,name};
  if(!chromatic)return null;
  const candidates=tuning.map((open,string)=>({string,fret:midi-open,midi,pc:pc(midi),name})).filter(n=>n.fret>=board.start&&n.fret<=board.end);
  return candidates.sort((a,b)=>Math.abs(a.string-2.5)-Math.abs(b.string-2.5))[0]||null;
 };
 for(const [groupIndex,group]of ordered.entries()){
  const base=group.notes,size=base.length;if(![3,4].includes(size))continue;
  const permutation=pattern.match(/^(?:perm|cell)([34])_([1357]+)$/);
  if(permutation&&Number(permutation[1])!==size)continue;
  const initial=register==='down'?-1:1,leg=(register==='alternating'||alternate)?initial*(groupIndex%2?-1:1):initial;
  const orders=pattern==='inversionCycle'||pattern==='connected'?Array.from({length:size},(_,i)=>Array.from({length:size},(_,j)=>(i+j)%size)):
   permutation?[[...permutation[2]].map(n=>[1,3,5,7].indexOf(Number(n)))]:
   [({straight:Array.from({length:size},(_,i)=>i),brokenPairs:size===3?[0,1,2,1]:[0,1,3,2],wideSkips:size===3?[0,2,1]:[0,2,1,3],outsideInside:size===3?[0,2,1]:[0,3,1,2],returnStart:size===3?[0,1,0,2,0]:[0,1,0,2,0,3,0],upBack:size===3?[0,1,2,1]:[0,1,2,3,2,1],approachEach:Array.from({length:size},(_,i)=>i)})[pattern]||Array.from({length:size},(_,i)=>i)];
  const cells=[];
  for(const order of orders){
   const closed=Boolean(permutation&&size===3&&pattern.startsWith('perm3_')&&closeTriad),first=base[order[0]].midi,slots=closed?[...order,order[0]]:order;
   let notes=slots.map((index,i)=>{
    let midi=base[index].midi;
    if(leg>0){while(midi<first)midi+=12;while(midi>=first+12)midi-=12;}
    else{while(midi>first)midi-=12;while(midi<=first-12)midi+=12;}
    if(closed&&i===slots.length-1)midi=first+12*leg;
    return atMidi(midi,base[index].name);
   });
   if(notes.some(n=>!n))continue;
   let targetIndices;
   if(pattern==='approachEach'){
    const approached=[];targetIndices=[];
    for(const note of notes){const midi=note.midi-1,name=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][pc(midi)],approach=atMidi(midi,name,true);if(!approach){approached.length=0;break;}approached.push(approach,note);targetIndices.push(approached.length-1);}
    if(!approached.length)continue;notes=approached;
   }
   cells.push({...group,notes,names:notes.map(n=>n.name),pcs:notes.map(n=>n.pc),...(targetIndices?{targetIndices}:{}),sequenceAnchor:base[0].midi,sequenceDirection:down?-1:1,arpeggioPattern:pattern,patternOrder:slots.map(n=>[1,3,5,7][n]),annotation:arpeggioPatternLabel(pattern,closeTriad)});
  }
  if(pattern==='connected'&&cells.length){cells.sort((a,b)=>Math.abs(a.notes[0].midi-previous)-Math.abs(b.notes[0].midi-previous));result.push(cells[0]);previous=cells[0].notes.at(-1).midi;}
  else result.push(...cells);
 }
 return result;
}

export function arpeggioPatternFamily(pattern){return pattern.startsWith('perm')?'permutations':pattern.startsWith('cell')?'repeatTone':Object.hasOwn(ARPEGGIO_PATTERNS,pattern)?pattern:'straight';}
export function arpeggioFamilies(material='seventh'){
 const triad=material==='triad';
 return [['straight','Straight'],['permutations',`Permutations · each tone once · ${triad?6:24}`],['repeatTone',`Repeat one tone · no adjacent repeats · ${triad?18:144}`],...Object.entries(ARPEGGIO_PATTERNS).filter(([id])=>!id.startsWith('perm')&&!id.startsWith('cell')&&id!=='straight')];
}
export function arpeggioPatternGroups(material='seventh',family='permutations'){
 const tones=material==='triad'?[1,3,5]:[1,3,5,7],permutations=material==='triad'?TRIAD_PERMUTATIONS:SEVENTH_PERMUTATIONS,cells=material==='triad'?TRIAD_CELLS:SEVENTH_CELLS,size=tones.length;
 if(family==='permutations')return tones.map(tone=>({label:`Starting tone ${tone}`,items:permutations.filter(p=>p[0]===tone).map(p=>{const id=`perm${size}_`+p.join('');return [id,ARPEGGIO_PATTERNS[id]];})}));
 if(family==='repeatTone')return tones.map(tone=>({label:`Repeat tone ${tone}`,items:cells.filter(p=>p.filter(n=>n===tone).length===2).map(p=>{const id=`cell${size}_`+p.join('');return [id,ARPEGGIO_PATTERNS[id]];})}));
 return [];
}
export function normalizeArpeggioPattern(pattern,material){
 const family=arpeggioPatternFamily(pattern),size=material==='triad'?3:4;
 if((family==='permutations'||family==='repeatTone')&&!pattern.startsWith((family==='permutations'?'perm':'cell')+size+'_'))return arpeggioPatternGroups(material,family)[0].items[0][0];
 return Object.hasOwn(ARPEGGIO_PATTERNS,pattern)?pattern:'straight';
}

export function arpeggioPatternLabel(pattern,close=true){
 const label=ARPEGGIO_PATTERNS[pattern]||'Straight';
 return pattern.startsWith('perm3_')&&close?label+'–'+pattern.split('_')[1][0]:label;
}
