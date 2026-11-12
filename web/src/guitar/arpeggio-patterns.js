import {isExactVoicingBoard,voicingNeighbour} from './fingering-rules.js';
export const ARPEGGIO_PATTERN_STUDIES=new Set(['harmonized','alternating','chordtones','chordtonesalternating']);
const permute=items=>items.length?items.flatMap((n,i)=>permute(items.filter((_,j)=>i!==j)).map(rest=>[n,...rest])):[[]];
export const TRIAD_PERMUTATIONS=permute([1,3,5]);
export const SEVENTH_PERMUTATIONS=permute([1,3,5,7]);
const repeatedCells=tones=>Array.from({length:tones.length**(tones.length+1)},(_,n)=>Array.from({length:tones.length+1},(_,i)=>tones[Math.floor(n/tones.length**(tones.length-i))%tones.length])).filter(p=>new Set(p).size===tones.length&&p.every((n,i)=>!i||n!==p[i-1]));
export const TRIAD_CELLS=repeatedCells([1,3,5]);
export const SEVENTH_CELLS=repeatedCells([1,3,5,7]);
export const TRIAD_PAIRS=[1,3,5].flatMap(a=>[1,3,5].filter(b=>b!==a).map(b=>[a,b]));
export const SEVENTH_PAIRS=[1,3,5,7].flatMap(a=>[1,3,5,7].filter(b=>b!==a).map(b=>[a,b]));
const pedalOrder=(tones,tone)=>[tone,...tones.filter(t=>t!==tone).flatMap(t=>[t,tone])];
export const ARPEGGIO_PATTERNS={
 ...Object.fromEntries([[3,[1,3,5],TRIAD_PAIRS],[4,[1,3,5,7],SEVENTH_PAIRS]].flatMap(([size,tones,pairs])=>[...pairs.map(p=>['pair'+size+'_'+p.join(''),p.join('–')]),...tones.map(t=>['pedal'+size+'_'+t,pedalOrder(tones,t).join('–')])])),
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
export function patternedArpeggios(board,groups,pattern,{motion='ascending',register='up',alternate=false,anchorMidi=60,closeTriad=true,routine='repeat',approach='none',requireAlternate=false,deferConnection=false}={}){
 const down=motion==='descending'||motion==='down-up',ordered=down?groups.toReversed():groups;
 const fixed=isExactVoicingBoard(board);
 const byMidi=new Map(board.notes.map(n=>[n.midi,n])),result=[];let previous=anchorMidi;
 const atMidi=(midi,name,chromatic=false,target=null)=>{
  if(fixed&&chromatic&&target)return voicingNeighbour(board,target,midi,name);
  const existing=byMidi.get(midi);if(existing)return {...existing,name};
  if(!chromatic)return null;
  const candidates=tuning.map((open,string)=>({string,fret:midi-open,midi,pc:pc(midi),name})).filter(n=>n.fret>=board.start&&n.fret<=board.end);
  return candidates.sort((a,b)=>Math.abs(a.string-2.5)-Math.abs(b.string-2.5))[0]||null;
 };
 for(const [groupIndex,group]of ordered.entries()){
  const base=group.notes,size=base.length;if(![3,4].includes(size))continue;
  const permutation=pattern.match(/^(?:perm|cell)([34])_([1357]+)$/);
  if(permutation&&Number(permutation[1])!==size)continue;
  const initial=['down','alternatingDown'].includes(register)?-1:1,leg=(register==='alternating'||register==='alternatingDown'||alternate)?initial*(groupIndex%2?-1:1):initial;
  const orders=pattern==='inversionCycle'||pattern==='connected'?Array.from({length:size},(_,i)=>Array.from({length:size},(_,j)=>(i+j)%size)):
   permutation?[[...permutation[2]].map(n=>[1,3,5,7].indexOf(Number(n)))]:
   [({straight:Array.from({length:size},(_,i)=>i),brokenPairs:size===3?[0,1,2,1]:[0,1,3,2],wideSkips:size===3?[0,2,1]:[0,2,1,3],outsideInside:size===3?[0,2,1]:[0,3,1,2],returnStart:size===3?[0,1,0,2,0]:[0,1,0,2,0,3,0],upBack:size===3?[0,1,2,1]:[0,1,2,3,2,1],approachEach:Array.from({length:size},(_,i)=>i)})[pattern]||Array.from({length:size},(_,i)=>i)];
  const pair=pattern.match(/^pair[34]_([1357]+)$/),pedal=pattern.match(/^pedal[34]_([1357])$/);
  if(pair)orders.splice(0,orders.length,[...pair[1]].map(n=>[1,3,5,7].indexOf(Number(n))));
  if(pedal)orders.splice(0,orders.length,pedalOrder(Array.from({length:size},(_,i)=>i),[1,3,5,7].indexOf(Number(pedal[1]))));
  const rootOrder=orders[0],actualOrders=['inversions','connected'].includes(routine)?Array.from({length:size},(_,i)=>rootOrder.map(n=>(n+i)%size)):orders;
  const cells=[];
  for(const [variant,order]of actualOrders.entries()){
   const closed=Boolean(!fixed&&permutation&&size===3&&pattern.startsWith('perm3_')&&closeTriad),first=base[order[0]].midi,slots=closed?[...order,order[0]]:order;
   let notes=slots.map((index,i)=>{
    if(fixed)return {...base[index]};
    let midi=base[index].midi;
    if(leg>0){while(midi<first)midi+=12;while(midi>=first+12)midi-=12;}
    else{while(midi>first)midi-=12;while(midi<=first-12)midi+=12;}
    if(closed&&i===slots.length-1)midi=first+12*leg;
    return atMidi(midi,base[index].name);
   });
   if(notes.some(n=>!n))continue;
   const preparation=pattern==='approachEach'?'below':approach;
   const prepare=targets=>{
    if(preparation==='none')return {notes:targets};
    const output=[],targetIndices=[];
    for(const [i,note]of targets.entries()){
     const descending=i?note.midi<targets[i-1].midi:targets[1]?.midi<note.midi,offset=preparation==='above'||preparation==='directional'&&descending?1:-1,midi=note.midi+offset;
     const name=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][pc(midi)],before=atMidi(midi,name,true,note);if(!before)return null;
     output.push(before,note);targetIndices.push(output.length-1);
    }
    return {notes:output,targetIndices};
   };
   const normal=prepare(notes),reversed=prepare(notes.toReversed());if(!normal||requireAlternate&&!reversed)continue;
   let targetIndices=normal.targetIndices;notes=normal.notes;
   cells.push({...group,notes,names:notes.map(n=>n.name),pcs:notes.map(n=>n.pc),...(targetIndices?{targetIndices}:{}),...(requireAlternate&&reversed?{alternateNotes:reversed.notes,alternateTargetIndices:reversed.targetIndices}:{}),sequenceAnchor:base[0].midi,...(routine==='inversions'||pattern==='inversionCycle'?{sequenceCursor:base[0].midi*8+variant}:{}),sequenceDirection:down?-1:1,arpeggioPattern:pattern,patternOrder:slots.map(n=>[1,3,5,7][n]),annotation:arpeggioPatternLabel(pattern,closeTriad)});
  }
  if((pattern==='connected'||routine==='connected')&&!deferConnection&&cells.length){cells.sort((a,b)=>Math.abs(a.notes[0].midi-previous)-Math.abs(b.notes[0].midi-previous));result.push(cells[0]);previous=cells[0].notes.at(-1).midi;}
  else result.push(...cells);
  if(routine==='alternate')for(let index=result.length-cells.length;index<result.length;index++)if(index>=0&&index%2){const cell=result[index];if(cell?.alternateNotes)result[index]={...cell,notes:cell.alternateNotes,names:cell.alternateNotes.map(n=>n.name),pcs:cell.alternateNotes.map(n=>n.pc),targetIndices:cell.alternateTargetIndices,patternOrder:cell.patternOrder.toReversed()};}
 }
 if(routine==='inversions'||pattern==='inversionCycle')result.sort((a,b)=>(a.sequenceCursor-b.sequenceCursor)*(down?-1:1));
 return result;
}

export function arpeggioPatternFamily(pattern){if(pattern.startsWith('pair'))return 'pairs';if(pattern.startsWith('pedal'))return 'returnStart';return pattern.startsWith('perm')?'permutations':pattern.startsWith('cell')?'repeatTone':Object.hasOwn(ARPEGGIO_PATTERNS,pattern)?pattern:'straight';}
export function arpeggioFamilies(material='seventh'){
 const triad=material==='triad';
 return [['pairs',`Chord-tone pairs · ${triad?6:12}`],['permutations',`Permutations · each tone once · ${triad?6:24}`],['repeatTone',`Repeat one tone · no adjacent repeats · ${triad?18:144}`],['returnStart',`Starting-tone pedals · ${triad?3:4}`],...(!triad?[['upBack','Up and back · 1–3–5–7–5–3']]:[])];
}
export function arpeggioPatternGroups(material='seventh',family='permutations'){
 const tones=material==='triad'?[1,3,5]:[1,3,5,7],permutations=material==='triad'?TRIAD_PERMUTATIONS:SEVENTH_PERMUTATIONS,cells=material==='triad'?TRIAD_CELLS:SEVENTH_CELLS,size=tones.length;
 if(family==='pairs')return tones.map(tone=>({label:`Starting tone ${tone}`,items:(material==='triad'?TRIAD_PAIRS:SEVENTH_PAIRS).filter(p=>p[0]===tone).map(p=>['pair'+size+'_'+p.join(''),p.join('–')])}));
 if(family==='returnStart')return [{label:'Pedal tone',items:tones.map(t=>[t===1?'returnStart':'pedal'+size+'_'+t,pedalOrder(tones,t).join('–')])}];
 if(family==='permutations')return tones.map(tone=>({label:`Starting tone ${tone}`,items:permutations.filter(p=>p[0]===tone).map(p=>{const id=`perm${size}_`+p.join('');return [id,arpeggioOrderLabel(id)];})}));
 if(family==='repeatTone')return tones.map(tone=>({label:`Repeat tone ${tone}`,items:cells.filter(p=>p.filter(n=>n===tone).length===2).map(p=>{const id=`cell${size}_`+p.join('');return [id,arpeggioOrderLabel(id)];})}));
 return [];
}
export function normalizeArpeggioPattern(pattern,material){
 const family=arpeggioPatternFamily(pattern),size=material==='triad'?3:4;
 if(family==='pairs'&&!pattern.startsWith('pair'+size+'_'))return arpeggioPatternGroups(material,'pairs')[0].items[0][0];
 if(pattern.startsWith('pedal')&&!pattern.startsWith('pedal'+size+'_'))return 'returnStart';
 if(pattern==='pedal'+size+'_1')return 'returnStart';
 if((family==='permutations'||family==='repeatTone')&&!pattern.startsWith((family==='permutations'?'perm':'cell')+size+'_'))return arpeggioPatternGroups(material,family)[0].items[0][0];
 return Object.hasOwn(ARPEGGIO_PATTERNS,pattern)?pattern:'straight';
}

export function arpeggioPatternLabel(pattern,close=true){
 const label=ARPEGGIO_PATTERNS[pattern]||'Straight';
 return pattern.startsWith('perm3_')&&close?label+'–'+pattern.split('_')[1][0]:label;
}

// Canonical musical recipes. Names such as “wide skips” are aliases for an
// order, not independent catalogue entries. Routines/preparations are axes.
export function canonicalArpeggioRecipe(view){
 let pattern=normalizeArpeggioPattern(view.arpeggioPattern||'straight',view.material),close=view.arpeggioClose!==false;
 let routine=['repeat','alternate','inversions','connected'].includes(view.arpeggioRoutine)?view.arpeggioRoutine:'repeat';
 let approach=['none','below','above','directional'].includes(view.arpeggioApproach)?view.arpeggioApproach:'none';
 let register=['up','down','alternating','alternatingDown'].includes(view.arpeggioRegister)?view.arpeggioRegister:'up';
 const triad=view.material==='triad';
 if(pattern==='straight'){pattern=triad?'perm3_135':'perm4_1357';if(triad)close=false;}
 else if(pattern==='brokenPairs'){pattern=triad?'cell3_1353':'perm4_1375';}
 else if(pattern==='wideSkips'||pattern==='outsideInside'){pattern=triad?'perm3_153':pattern==='wideSkips'?'perm4_1537':'perm4_1735';if(triad)close=false;}
 else if(pattern==='upBack'&&triad)pattern='cell3_1353';
 else if(['inversionCycle','connected','approachEach'].includes(pattern)){
  if(pattern==='approachEach')approach='below';else routine=pattern==='inversionCycle'?'inversions':'connected';
  pattern=triad?'perm3_135':'perm4_1357';close=false;
 }
 return {...view,arpeggioPattern:pattern,arpeggioClose:close,arpeggioRegister:register,arpeggioRoutine:routine,arpeggioApproach:approach};
}
export function selectedChordSeeds(board,harmony,material='seventh'){
 const size=material==='triad'?3:4,pcs=harmony.chordPcs.slice(0,size);if(pcs.length<size)return [];
 if(isExactVoicingBoard(board)){const notes=pcs.map(pc=>board.notes.find(n=>n.pc===pc));return notes.every(Boolean)?[{rootName:harmony.tones[0],chord:harmony.name+harmony.suffix,notes,pcs,names:harmony.tones.slice(0,size)}]:[];}
 const names=harmony.tones.slice(0,size),low=Math.min(...board.notes.map(n=>n.midi)),high=Math.max(...board.notes.map(n=>n.midi)),groups=[];
 for(let root=low-12;root<=high;root++)if(pc(root)===pcs[0]){
  const notes=pcs.map((tone,i)=>({midi:root+pc(tone-pcs[0]),pc:tone,name:names[i]}));
  groups.push({rootName:names[0],chord:harmony.name+harmony.suffix,notes,pcs,names});
 }
 return groups;
}

export function arpeggioOrderLabel(pattern){
 const names={perm3_135:'straight',perm3_153:'wide skips / outside–inside',cell3_1353:'up and back / broken pairs',perm4_1357:'straight',perm4_1375:'broken pairs',perm4_1537:'wide skips',perm4_1735:'outside–inside'};
 return ARPEGGIO_PATTERNS[pattern]+(names[pattern]?' · '+names[pattern]:'');
}
