import {guitarVoicings,STRING_SETS} from './voicings.js';
import {fullFretboardFor} from './fretboard.js';
import {FRET_REGIONS} from './position-path.js';
import {progressionStudyPlan} from '../practice/progression-timing.js';
export function dropCandidates(harmony,type='drop2',stringSet='auto'){
 const sets=STRING_SETS[type]||STRING_SETS.drop2;
 return sets.filter(s=>stringSet==='auto'||s.id===stringSet).flatMap(set=>{
  const result=guitarVoicings(harmony,type,set.id,true);
  // This workshop teaches four distinct voices, rather than doubled triads or power chords.
  if(result.doubled)return [];
  return result.voicings.filter(v=>Math.max(...v.notes.map(n=>n.fret))<=17&&!v.wide).map(v=>{
   const notes=v.notes.map(n=>({...n,chromaticDegree:harmony.intervals[harmony.chordPcs.indexOf(n.pc)],scale:harmony.scalePcs.includes(n.pc),scaleIndex:harmony.scalePcs.indexOf(n.pc)}));
   return {...v,notes,start:Math.min(...notes.map(n=>n.fret)),end:Math.max(...notes.map(n=>n.fret)),stringSet:set.id,omitted:result.omitted,muted:[0,1,2,3,4,5].filter(s=>!set.strings.includes(s))};
  });
 });
}
export function dropRoute(harmonies,type='drop2',stringSet='auto',region=FRET_REGIONS.lowerMiddle){
 const rows=harmonies.map(h=>dropCandidates(h,type,stringSet)),route=[];
 const regional=v=>Math.abs((v.start+v.end-region.start-region.end)/2)*.8;
 for(let first=0;first<rows.length;){
  if(!rows[first].length){route[first++]=null;continue;}
  let end=first+1;while(end<rows.length&&rows[end].length)end++;
  let costs=rows[first].map(regional);const parents=[];
  for(let i=first+1;i<end;i++){
   parents[i]=[];costs=rows[i].map((to,j)=>{let best=Infinity,parent=0;rows[i-1].forEach((from,k)=>{
    const motion=from.notes.reduce((sum,n,voice)=>sum+Math.abs(n.midi-to.notes[voice].midi),0),switches=from.stringSet===to.stringSet?0:3;
    const value=costs[k]+motion+switches+regional(to);if(value<best){best=value;parent=k;}
   });parents[i][j]=parent;return best;});
  }
  let chosen=costs.indexOf(Math.min(...costs));for(let i=end-1;i>=first;i--){route[i]=rows[i][chosen];chosen=parents[i]?.[chosen]??0;}first=end;
 }
 return route;
}
export function dropMovements(groups){
 return groups.slice(1).flatMap((g,i)=>!g.drop||!groups[i].drop?[]:g.drop.notes.map((target,voice)=>{
  const source=groups[i].drop.notes[voice],distance=target.midi-source.midi;
  return {from:groups[i].chord,to:g.chord,voice:voice+1,source,target,label:distance===0?'Hold the same pitch':`${distance>0?'Up':'Down'} ${Math.abs(distance)} semitone${Math.abs(distance)===1?'':'s'}`};
 }));
}
export function dropStudy(harmonies,steps,durations,beats,options={}){
 const {type='drop2',stringSet='auto',region='lowerMiddle',positions=[]}=options,route=dropRoute(harmonies,type,stringSet,FRET_REGIONS[region]||FRET_REGIONS.lowerMiddle);let globalStart=0;
 const groups=harmonies.map((harmony,slot)=>{
  const drop=route[slot],warning=!drop?`${harmony.name}${harmony.suffix}: no four-distinct-tone ${type==='drop3'?'drop 3':'drop 2'} grip fits this string set within frets 1–17 and a four-fret span. No substitute was used.`:durations[slot]<2?'The four-note arpeggio needs at least two beats. This slot is a rest.':'';
  const notes=warning?[]:drop.notes,timing=notes.map((note,i)=>({note,start:i*.5,duration:.5,target:i===3}));
  const board=fullFretboardFor(harmony,drop?Math.max(1,drop.start-1):1,drop?Math.min(17,Math.max(drop.start+4,drop.end)):5);
  const group={slot,harmony,drop,position:positions[slot]||{numeral:'I',shape:'E'},fixedRegion:true,chord:harmony.name+harmony.suffix,rootName:harmony.name,notes,board,globalStart,timing,targetIndices:notes.length?[3]:[],cellLengths:[notes.length],materialCells:[harmony.name+harmony.suffix+' '+type],warning,annotation:'Four voices · low to high'};globalStart+=notes.length;return group;
 });
 const bars=[];steps.forEach((step,i)=>bars[step]=durations[i]/beats);
 const plan=progressionStudyPlan(groups,steps,bars,beats,'drops','eighths');
 plan.events=plan.slots.flatMap(slot=>groups[slot.slot].timing.map((e,index)=>({...e,index:groups[slot.slot].globalStart+index,slot:slot.slot,step:slot.step,start:slot.start+e.start,accent:e.target})));
 return {groups,plan};
}
