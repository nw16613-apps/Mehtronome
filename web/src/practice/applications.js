export const APPLICATIONS=[
 {id:'cell-space',name:'Cell, hold, space',description:'Play the selected cell, hold its last note, then leave the written space.',challenge:'Keep the rhythm and change one pitch in your answer. End on a chord tone.'},
 {id:'delayed',name:'Delay the resolution',description:'Leave space before the cell and place its ending on beat 3 (beat 2 in a two-beat chord slot).',challenge:'Answer with the same ending, but vary when you begin the approach.'},
 {id:'cell-answer',name:'Cell and answer',description:'Play the complete cell, leave space, then answer on a nearby third of the chord.',challenge:'Keep the space. Replace the final answer with a different chord tone.'},
];
/** Authored rhythmic forms use the selected exercise pitches. They do not cut
 * resolution cells or pretend a response is recorded/scored. */
export function applicationStudy(groups,basePlan,recipeId='cell-space',response='demo'){
 const recipe=APPLICATIONS.find(r=>r.id===recipeId)||APPLICATIONS[0],warnings=(basePlan.warnings||[]).filter(w=>w.includes('so the notation'));
 let globalStart=0;
 const phrased=groups.map(group=>{
  const slot=basePlan.slots.find(s=>s.slot===group.slot),length=slot.duration>=4?4:slot.duration>=2?2:0;
  const count=group.cellLengths?.[0]??group.notes.length,source=group.notes.slice(0,count);
  const cell=basePlan.study==='positional'?source.slice(0,4):source;
  const targets=group.targetIndices||(group.targetIndex===undefined?[]:[group.targetIndex]);
  const step=length===2?.25:cell.length<=4?.5:.25;
  let start=recipe.id==='delayed'?(length===4?2:1)-(cell.length-1)*step:0;
  const hold=recipe.id==='cell-answer'?step:length===2?.5:1;
  const end=start+(cell.length-1)*step+hold,answerAt=length===4?3:1.5;
  const fits=length&&cell.length&&cell.length<=13&&start>=0&&end<=length&&(recipe.id!=='cell-answer'||end<=answerAt-.25);
  const notes=fits?[...cell]:[],timing=fits?cell.map((note,i)=>({note,start:start+i*step,duration:i===cell.length-1?hold:step,accent:i===0||i===cell.length-1||targets.includes(i),target:targets.includes(i)})):[];
  if(fits&&recipe.id==='cell-answer'){
   const candidates=group.board.notes.filter(n=>n.pc===group.harmony.chordPcs[1]);
   const answer=candidates.toSorted((a,b)=>Math.abs(a.midi-cell.at(-1).midi)-Math.abs(b.midi-cell.at(-1).midi))[0]||cell.at(-1);
   notes.push(answer);timing.push({note:answer,start:answerAt,duration:length===4?.5:.25,accent:true,target:true});
  }
  if(!fits)warnings.push(`${group.chord}: this complete cell does not fit the chosen written phrase. Try another form, a smaller cell or a longer chord duration.`);
  const result={...group,materialCells:(group.materialCells||[group.chord]).slice(0,1),notes,timing,globalStart,targetIndices:timing.flatMap((e,i)=>e.target?[i]:[]),annotation:fits?recipe.name:'Rest · phrase does not fit'};globalStart+=notes.length;return result;
 });
 const events=[];
 for(const slot of basePlan.slots){const group=phrased.find(g=>g.slot===slot.slot);for(const [local,event]of group.timing.entries())events.push({...event,index:group.globalStart+local,slot:slot.slot,step:slot.step,start:slot.start+event.start});}
 let slots=basePlan.slots.map(s=>({...s,applicationLabel:recipe.name})),duration=basePlan.duration;
 if(response==='respond'){slots=[...slots,...slots.map(s=>({...s,start:s.start+duration,response:true,applicationLabel:'Your turn · lead guitar rests'}))];duration*=2;}
 return {groups:phrased,plan:{...basePlan,events,slots,duration,division:4,warnings,application:recipe,responseStart:response==='respond'?basePlan.duration:null}};
}
