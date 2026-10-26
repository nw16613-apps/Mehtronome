/** Describe the actual written path, rather than generating a second path. */
export function voiceLeadingTargets(groups){
 const starts=[];let offset=0;for(const group of groups){starts.push(group.globalStart??offset);offset+=group.notes.length;}
 const edges=[];
 for(let i=1;i<groups.length;i++){
  const from=groups[i-1],to=groups[i],source=from.notes.at(-1),target=to.notes[0];
  if(!source||!target||!Number.isFinite(source.midi)||!Number.isFinite(target.midi))continue;
  const distance=target.midi-source.midi,absolute=Math.abs(distance);
  const interval=(group,note)=>{const index=group.harmony?.chordPcs.indexOf(note.pc);return index>=0?group.harmony.intervals[index]:'chord tone';};
  const movement=distance===0?'Hold · common tone':`${distance>0?'Up':'Down'} ${absolute===1?'a semitone':absolute===2?'a whole tone':absolute===12?'an octave':`${absolute} semitones`}${absolute&&absolute%12===0?' · same pitch class':''}`;
  edges.push({source,target,fromChord:from.chord,toChord:to.chord,sourceInterval:interval(from,source),targetInterval:interval(to,target),sourceIndex:starts[i-1]+from.notes.length-1,targetIndex:starts[i],slot:to.slot??i,distance,movement});
 }
 return edges;
}
