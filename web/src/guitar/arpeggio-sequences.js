import {SCALE_SEQUENCES,SCALE_SEQUENCE_FAMILY_LABELS} from './scale-sequences.js';
/** @type {Record<string, {label:string,offsets:number[],pedal?:string}>} */
export const ARPEGGIO_ROOT_SEQUENCES={stepwise:{label:'Successive roots · one arpeggio per cell',offsets:[0]},...SCALE_SEQUENCES};
export function arpeggioSequenceGroups(){return [{label:'Successive roots',items:[['stepwise',ARPEGGIO_ROOT_SEQUENCES.stepwise.label]]},...Object.entries(SCALE_SEQUENCE_FAMILY_LABELS).map(([family,label])=>({label,items:Object.entries(SCALE_SEQUENCES).filter(([,d])=>d.family===family).map(([id,d])=>[id,d.label])}))];}
/** A root motif contains whole arpeggios. Missing roots/tones invalidate the
 * entire motif, rather than silently shortening or changing its harmony. */
export function sequenceArpeggioCells(cells,board,harmony,sequence='stepwise',source='diatonic',motion='ascending',advance=1){
 const definition=ARPEGGIO_ROOT_SEQUENCES[sequence]||ARPEGGIO_ROOT_SEQUENCES.stepwise,direction=['descending','down-up'].includes(motion)?-1:1;
 const pcs=source==='selectedChord'?[harmony.chordPcs[0]]:source==='chordRoots'?harmony.scalePcs.filter(pc=>harmony.chordPcs.includes(pc)):harmony.scalePcs;
 const roots=Array.from({length:128},(_,i)=>i).filter(midi=>pcs.includes(midi%12)).sort((a,b)=>(a-b)*direction),byRoot=new Map();
 for(const cell of cells){const root=cell.sequenceAnchor;if(!byRoot.has(root))byRoot.set(root,[]);byRoot.get(root).push(cell);}
 const availableRoots=[...byRoot.keys()];
 if(sequence==='stepwise'||!ARPEGGIO_ROOT_SEQUENCES[sequence])return cells.filter(c=>availableRoots.indexOf(c.sequenceAnchor)%([1,2,3].includes(Number(advance))?Number(advance):1)===0);
 const output=[];
 for(const cell of cells){
  const index=roots.indexOf(cell.sequenceAnchor),variant=byRoot.get(cell.sequenceAnchor).indexOf(cell),offsets=definition.offsets;
  const motif=definition.pedal?[definition.pedal==='lower'?Math.min(...availableRoots):Math.max(...availableRoots),cell.sequenceAnchor]:offsets.map(offset=>roots[index+offset]);
  if(motif.some(root=>root===undefined)||definition.pedal&&motif[0]===motif[1])continue;
  const parts=motif.map(root=>byRoot.get(root)?.[variant]);if(parts.some(c=>!c))continue;
  const notes=parts.flatMap(c=>c.notes),targetIndices=[];let offset=0;
  for(const part of parts){targetIndices.push(...(part.targetIndices||[]).map(i=>i+offset));offset+=part.notes.length;}
  const alternateNotes=parts.every(p=>p.alternateNotes)?parts.flatMap(p=>p.alternateNotes):undefined,alternateTargetIndices=[];offset=0;
  for(const part of parts){alternateTargetIndices.push(...(part.alternateTargetIndices||[]).map(i=>i+offset));offset+=part.notes.length;}
  output.push({...cell,notes,names:notes.map(n=>n.name),pcs:notes.map(n=>n.pc),targetIndices,alternateNotes,alternateTargetIndices,subcells:parts.map(p=>({notes:p.notes,patternOrder:p.patternOrder,label:p.chord})),sequenceLabel:definition.label,orderSteps:definition.offsets.map(i=>i+1),rootSequence:motif,annotation:definition.label});
 }
 const anchors=[...new Set(output.map(c=>c.sequenceAnchor))];
 return output.filter(c=>anchors.indexOf(c.sequenceAnchor)%([1,2,3].includes(Number(advance))?Number(advance):1)===0);
}
