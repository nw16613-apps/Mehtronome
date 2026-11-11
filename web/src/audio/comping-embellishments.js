import {CHORDS} from './music.js';
import {pianoVoicings} from './piano-voicings.js';
import {playableCompingGrip} from './comping-vocabulary.js';
import {segmentAt} from './reference-catalogue.js';
const pc=n=>(n%12+12)%12;
const adventurous=new Set(['traditionalJazz','jazzWaltz','modernStraightJazz','fusionJazz','legatoFusion','neoSoul','ballad','boogaloo']);
const chromaticStyles=new Set([...adventurous,'blues']);
const rows=score=>score.comping.flatMap((events,grid)=>events.map(event=>({grid,event})));
const allowed=h=>[...new Set([...h.chordPcs,...h.scalePcs])];
const sameHarmony=(a,b)=>a.root===b.root&&a.chord===b.chord&&a.mode===b.mode;
const cost=(notes,target)=>notes.reduce((sum,n,i)=>sum+Math.abs(n-target[Math.min(i,target.length-1)]),0);
const playable=(notes,guitar)=>notes.length>=3&&notes.length<=4&&notes[0]>=48&&notes.at(-1)<=81&&new Set(notes).size===notes.length&&(!guitar||playableCompingGrip(notes));
function dominantOptions(root,guitar){
 const h={root,chord:'dom7',midi:[48+root],chordPcs:[0,4,7,10].map(n=>pc(root+n)),scalePcs:[0,2,4,5,7,9,10].map(n=>pc(root+n))};
 return pianoVoicings(h).filter(n=>n.some(p=>pc(p)===root)&&n.some(p=>pc(p)===pc(root+4))&&n.some(p=>pc(p)===pc(root+10))&&playable(n,guitar));
}
/** Validates the audible preparation/resolution link, not just an annotation. */
export function validCompingDeparture(score,event,grid){
 const t=event.harmonicTransition;if(!t||!['chromaticApproach','secondaryDominant','tritoneSubstitution','suspension'].includes(t.kind)||t.resolveGrid<=grid||t.resolveGrid-grid>12||Math.abs(event.duration-(t.resolveGrid-grid)/12)>1e-7)return false;
 const resolution=score.comping[t.resolveGrid]?.find(e=>e.harmonicResolution===t.id);if(!resolution||resolution.targetStep!==t.targetStep)return false;
 if(t.kind==='chromaticApproach')return event.notes.length===resolution.notes.length&&event.notes.every((n,i)=>resolution.notes[i]-n===t.direction)&&Math.abs(t.direction)===1;
 if(t.kind==='suspension')return event.notes.includes(t.suspendedMidi)&&resolution.notes.includes(t.resolvedMidi)&&Math.abs(t.suspendedMidi-t.resolvedMidi)<=2;
 const root=t.kind==='secondaryDominant'?pc(t.targetRoot+7):pc(t.targetRoot+1);
 return t.sourceRoot===root&&[0,4,10].every(interval=>event.notes.some(n=>pc(n)===pc(root+interval)));
}
function preferredOptions(options,score){
 if(score.id!=='legatoFusion')return options;
 const spread=[...options];
 for(const notes of options)for(let i=0;i<notes.length-1;i++){
  const open=notes.map((n,index)=>index===i?n-12:n).sort((a,b)=>a-b);
  if(playable(open,score.guitarComping)&&open.at(-1)-open[0]<=22)spread.push(open);
 }
 const open=spread.filter(n=>n.at(-1)-n[0]>=12);return open.length?open:options;
}
export function embellishComping(score,targets,{protectMelody=false}={}){
 if(!chromaticStyles.has(score.id))return;
 const at=beat=>segmentAt(targets,beat),guitar=score.guitarComping,total=score.comping.length,original=rows(score);
 // Move an inner colour by a scale step while holding the outer voices and
 // structural defining tones. This modifies an existing attack, not density.
 let previous=null;
 for(const row of original){
  const h=at(row.grid/12),bar=Math.floor(row.grid/(score.beats*12));
  if(adventurous.has(score.id)&&previous&&sameHarmony(h,at(previous.grid/12))&&[0,1].includes(bar%4)&&['rootless','shell'].includes(row.event.compingTechnique)){
   const notes=previous.event.notes,ints=CHORDS[h.chord].intervals,required=[ints[1],ints.find(n=>n>=9&&n<=11),...ints.filter(n=>n===6||n===8)].filter(n=>n!==undefined).map(n=>pc(h.root+n)),choices=[];
   for(let index=1;index<notes.length-1;index++)for(const delta of [1,-1,2,-2]){
    const moved=[...notes];moved[index]+=delta;
    if(moved[index]<=moved[index-1]||moved[index]>=moved[index+1]||!allowed(h).includes(pc(moved[index]))||!required.every(n=>moved.some(m=>pc(m)===n))||ints.includes(4)&&moved.some(n=>pc(n)===pc(h.root+5))||!playable(moved,guitar))continue;
    choices.push(moved);
   }
   if(choices.length){row.event.notes=choices.sort((a,b)=>cost(a,row.event.notes)-cost(b,row.event.notes))[0];row.event.compingTechnique='innerVoice';row.event.innerVoiceFrom=[...notes];}
  }
  previous=row;
 }
 let id=0,lastDeparture=-Infinity,lastSuspension=-Infinity;
 const addPreparation=(resolveGrid,resolution,notes,kind,metadata={})=>{
  const span=6,start=resolveGrid-span;if(start<0||resolveGrid>=total||!playable(notes,guitar)||score.comping[start].length)return false;
  // Don't cut an intermediate authored attack to force a preparation into it.
  for(let grid=start+1;grid<resolveGrid;grid++)if(score.comping[grid].length)return false;
  const target=at(resolveGrid/12),token=`${score.id}:${resolveGrid}:${id++}`;
  resolution.harmonicResolution=token;resolution.changeEntry=true;
  const event={notes,duration:span/12,velocity:resolution.velocity*.86,bar:Math.floor(start/(score.beats*12)),at:start/12%score.beats,chorus:resolution.chorus,chorusRole:resolution.chorusRole,targetStep:at(start/12).step,changeEntry:true,articulation:score.id==='legatoFusion'?'swell':'damped',compingTechnique:kind,
   harmonicTransition:{id:token,kind,resolveGrid,targetStep:target.step,targetRoot:target.root,...metadata}};
  for(const row of rows(score))if(row.grid<start&&row.grid+row.event.duration*12>start){row.event.duration=(start-row.grid)/12;row.event.harmonicRelease=token;}
  score.comping[start].push(event);return true;
 };
 // Temporary dominants belong only to real changes. Never invent a new chord
 // for a single-chord vamp or wrap a departure beyond the finite performance.
 if(adventurous.has(score.id)&&!protectMelody)for(let cycle=0;cycle<total/12;cycle+=score.chartBeats)for(const target of targets){
  const boundary=cycle+target.start,grid=Math.round(boundary*12);if(grid<12||grid>=total||grid-lastDeparture<score.beats*48)continue;
  const outgoing=at(boundary-.01),incoming=at(boundary),ints=CHORDS[incoming.chord].intervals,outInts=CHORDS[outgoing.chord].intervals;
  if(outgoing.duration<2||outgoing.root===incoming.root||!ints.includes(7)||!ints.some(n=>n===3||n===4))continue;
  const alreadyDominant=outgoing.root===pc(incoming.root+7)&&outInts.includes(4)&&outInts.includes(10);
  const hasTritone=targets.some((to,i)=>{const from=targets[(i+targets.length-1)%targets.length],ints=CHORDS[from.chord].intervals;return from.root===pc(to.root+7)&&ints.includes(4)&&ints.includes(10);});
  if(hasTritone&&Boolean(Math.floor(cycle/score.chartBeats)%2)!==alreadyDominant)continue;
  const kind=alreadyDominant?'tritoneSubstitution':'secondaryDominant',root=pc(incoming.root+(alreadyDominant?1:7));
  const existing=score.comping[grid].find(e=>e.notes.some(n=>pc(n)===pc(incoming.root+ints[1])));
  const near=original.findLast(row=>row.grid<grid)?.event.notes||[55,60,64];
  const destination=preferredOptions(pianoVoicings(incoming).filter(n=>playable(n,guitar)),score).sort((a,b)=>cost(a,near)-cost(b,near))[0];if(!existing&&!destination)continue;
  const resolution=existing||{notes:destination,duration:Math.min(.8,incoming.duration),velocity:.32,bar:Math.floor(boundary/score.beats),at:boundary%score.beats,chorus:Math.min(3,Math.floor(boundary/score.developmentBeats)),targetStep:incoming.step,articulation:score.id==='legatoFusion'?'swell':'damped',compingTechnique:'resolution',changeEntry:true};
  const options=preferredOptions(dominantOptions(root,guitar),score).sort((a,b)=>cost(a,resolution.notes)-cost(b,resolution.notes));if(!options.length)continue;
  if(addPreparation(grid,resolution,options[0],kind,{sourceRoot:root})){if(!existing)score.comping[grid].push(resolution);lastDeparture=grid;}
 }
 for(const {grid,event}of original){
  if(event.harmonicResolution||event.compingTechnique==='innerVoice'||grid<12)continue;
  const beat=grid/12,h=at(beat),bar=Math.floor(beat/score.beats),ints=CHORDS[h.chord].intervals;
  if(!sameHarmony(h,at((grid-6)/12)))continue;
  if(adventurous.has(score.id)&&bar%4===1&&grid-lastSuspension>=score.beats*48){
   const third=ints.includes(4)?4:ints.includes(3)?3:null;if(third===null)continue;
   const index=event.notes.findIndex(n=>pc(n)===pc(h.root+third));if(index<0)continue;
   const resolvedMidi=event.notes[index],suspendedMidi=resolvedMidi+(third===4?1:2),notes=event.notes.map((n,i)=>i===index?suspendedMidi:n).sort((a,b)=>a-b);
   if(!h.scalePcs.includes(pc(suspendedMidi))||notes.some(n=>pc(n)===pc(h.root+third)))continue;
   if(addPreparation(grid,event,notes,'suspension',{suspendedMidi,resolvedMidi}))lastSuspension=grid;
  }else if(!protectMelody&&bar%8===3&&grid-lastDeparture>=score.beats*48){
   const direction=Math.floor(bar/8)%2?1:-1,notes=event.notes.map(n=>n-direction);
   if(addPreparation(grid,event,notes,'chromaticApproach',{direction}))lastDeparture=grid;
  }
 }
}
