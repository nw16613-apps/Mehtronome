import {TUNING,fullFretboardFor} from './fretboard.js';
import {FRET_REGIONS} from './position-path.js';
import {progressionStudyPlan} from '../practice/progression-timing.js';
// Explicit three-note shell templates, not inferred finger assignments.
// Each form keeps its two guide voices on D and G; only the bass string changes.
export const SHELL_STRINGS={auto:'Either bass · 6–4–3 / 5–4–3',root6:'Strings 6–4–3',root5:'Strings 5–4–3'};
export const SHELL_PHRASES={motif:'Guide-tone motif',approach:'Chromatic resolution'};
const FORMS={root6:{strings:[0,2,3],offsets:(third,seventh)=>[0,seventh-10,third-3]},root5:{strings:[1,2,3],offsets:(third,seventh)=>[0,third-5,seventh-10]}};
export function shellCandidates(harmony,stringSet='auto'){
 if(harmony.bassMidi!=null&&harmony.bassMidi%12!==harmony.chordPcs[0])return [];
 const third=harmony.intervals.findIndex(i=>['3','♭3'].includes(i));
 const seventh=harmony.intervals.findIndex(i=>['7','♭7','♭♭7'].includes(i));
 const colour=seventh>=0?seventh:harmony.intervals.indexOf('6');
 if(third<0||colour<0)return [];
 const root=harmony.chordPcs[0],thirdSteps=(harmony.chordPcs[third]-root+12)%12,seventhSteps=(harmony.chordPcs[colour]-root+12)%12;
 const result=[];
 for(const [form,definition]of Object.entries(FORMS)){
  if(stringSet!=='auto'&&form!==stringSet)continue;
  for(let rootFret=1;rootFret<=17;rootFret++){
   if((TUNING[definition.strings[0]]+rootFret)%12!==root)continue;
   const frets=definition.offsets(thirdSteps,seventhSteps).map(offset=>rootFret+offset);
   if(frets.some(fret=>fret<1||fret>17)||Math.max(...frets)-Math.min(...frets)>3)continue;
   const notes=frets.map((fret,i)=>{
    const string=definition.strings[i],midi=TUNING[string]+fret,pc=midi%12,index=harmony.chordPcs.indexOf(pc);
    return {string,fret,midi,pc,name:harmony.tones[index],chromaticDegree:harmony.intervals[index],root:pc===root,chord:true,scale:harmony.scalePcs.includes(pc),scaleIndex:harmony.scalePcs.indexOf(pc)};
   });
   const pcs=notes.map(n=>n.pc),min=Math.min(...frets),max=Math.max(...frets);
   result.push({form,notes,start:min,end:max,rootFret,intervals:notes.map(n=>n.chromaticDegree),muted:[0,1,2,3,4,5].filter(s=>!definition.strings.includes(s)),omitted:harmony.tones.filter((_,i)=>!pcs.includes(harmony.chordPcs[i]))});
  }
 }
 return result;
}
const regionalCost=(shell,region)=>Math.abs((shell.start+shell.end-region.start-region.end)/2)*.8;
export function shellRoute(harmonies,stringSet='auto',region=FRET_REGIONS.lowerMiddle){
 const rows=harmonies.map(h=>shellCandidates(h,stringSet)),route=[];
 // Separate supported runs: an unsupported chord is an explicit gap, never a
 // substituted quality or a silently shortened progression.
 for(let first=0;first<rows.length;){
  if(!rows[first].length){route.push(null);first++;continue;}
  let end=first+1;while(end<rows.length&&rows[end].length)end++;
  let costs=rows[first].map(s=>regionalCost(s,region));const parents=[];
  for(let i=first+1;i<end;i++){
   parents[i]=[];
   costs=rows[i].map((to,j)=>{let best=Infinity,parent=0;
    rows[i-1].forEach((from,k)=>{const movement=[2,3].reduce((sum,string)=>sum+Math.abs(to.notes.find(n=>n.string===string).midi-from.notes.find(n=>n.string===string).midi),0);const value=costs[k]+movement+Math.abs(to.notes[0].midi-from.notes[0].midi)*.08+regionalCost(to,region);if(value<best){best=value;parent=k;}});
    parents[i][j]=parent;return best;
   });
  }
  let chosen=costs.indexOf(Math.min(...costs));for(let i=end-1;i>=first;i--){route[i]=rows[i][chosen];chosen=parents[i]?.[chosen]??0;}first=end;
 }
 return route;
}
export function shellMovements(groups){
 return groups.slice(1).flatMap((to,i)=>{
  const from=groups[i];if(!from.shell||!to.shell)return [];
  return [2,3].map(string=>{const a=from.shell.notes.find(n=>n.string===string),b=to.shell.notes.find(n=>n.string===string),distance=b.midi-a.midi;
   return {from:from.chord,to:to.chord,string:6-string,source:a,target:b,distance,label:distance===0?'Hold the same note':`${distance>0?'Up':'Down'} ${Math.abs(distance)} semitone${Math.abs(distance)===1?'':'s'}`};
  });
 });
}
export function shellStudy(harmonies,steps,durations,beats,options={}){
 const {stringSet='auto',region='lowerMiddle',phrase=false,recipe='motif',positions=[]}=options;
 const route=shellRoute(harmonies,stringSet,FRET_REGIONS[region]||FRET_REGIONS.lowerMiddle);let globalStart=0;
 const groups=harmonies.map((harmony,slot)=>{
  const shell=route[slot],next=route[(slot+1)%route.length],duration=durations[slot];let timing=[],warning='';
  if(!shell&&harmony.bassMidi!=null)warning=`${harmony.name}${harmony.suffix}: these root-bass shell templates cannot honour the requested slash bass. No shell was substituted.`;
  else if(!shell)warning=`${harmony.name}${harmony.suffix}: this starter requires a third and a seventh (or sixth). No shell was substituted.`;
  else if(phrase&&(beats!==4||duration<4))warning=`${harmony.name}${harmony.suffix}: the written shell phrases need 4/4 and at least four beats per chord. This slot is a rest.`;
  else if(!phrase&&duration<1.5)warning=`${harmony.name}${harmony.suffix}: the complete three-note shell needs at least 1½ beats. This slot is a rest.`;
  else if(!phrase)timing=shell.notes.map((note,i)=>({note,start:i*.5,duration:.5,target:i>0}));
  else{
   const low=shell.notes.find(n=>n.string===2),high=shell.notes.find(n=>n.string===3);
   timing=[{note:low,start:0,duration:1.5,target:true},{note:high,start:2,duration:.5,target:true},{note:low,start:2.5,duration:.5,target:false},{note:high,start:3,duration:recipe==='motif'?1:.5,target:false}];
   if(recipe==='approach'&&slot===harmonies.length-1)timing.push({note:low,start:3.5,duration:.5,target:true});
   else if(recipe==='approach'){
    const target=next?.notes.find(n=>n.string===2),fret=target?target.fret+(target.midi>=low.midi?-1:1):-1;
    if(fret>=1&&fret<=17){const midi=TUNING[2]+fret,pc=midi%12,index=harmony.scalePcs.indexOf(pc),name=index>=0?harmony.scaleNames[index]:['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'][pc];timing.push({note:{string:2,fret,midi,pc,name,chromaticDegree:'approach'},start:3.5,duration:.5,target:false});}
    else warning=`${harmony.name}${harmony.suffix}: no in-range approach to the next shell; the last eighth is a rest.`;
   }
  }
  const notes=timing.map(e=>e.note),start=shell?Math.max(1,Math.min(shell.start,...notes.map(n=>n.fret))-1):1,end=shell?Math.min(17,Math.max(start+4,shell.end,...notes.map(n=>n.fret))):5;
  const group={slot,harmony,shell,position:positions[slot]||{numeral:'I',shape:'E'},fixedRegion:true,chord:harmony.name+harmony.suffix,rootName:harmony.name,notes,board:fullFretboardFor(harmony,start,end),globalStart,timing,targetIndices:timing.flatMap((e,i)=>e.target?[i]:[]),cellLengths:[notes.length],materialCells:[phrase?SHELL_PHRASES[recipe]:harmony.name+harmony.suffix+' shell'],warning,annotation:phrase?SHELL_PHRASES[recipe]:'Root, third and seventh/sixth · three strings'};
  globalStart+=notes.length;return group;
 });
 const bars=[];steps.forEach((step,i)=>bars[step]=durations[i]/beats);
 const plan=progressionStudyPlan(groups,steps,bars,beats,phrase?'shellphrases':'shells','eighths');
 plan.events=plan.slots.flatMap(slot=>groups[slot.slot].timing.map((e,index)=>({...e,index:groups[slot.slot].globalStart+index,slot:slot.slot,step:slot.step,start:slot.start+e.start,accent:e.target})));
 return {groups,plan};
}
