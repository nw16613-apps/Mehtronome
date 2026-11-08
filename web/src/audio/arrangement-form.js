import {CHORDS} from './music.js';
const pc=n=>((n%12)+12)%12;
const dominant=h=>CHORDS[h.chord].intervals.includes(4)&&CHORDS[h.chord].intervals.includes(10);
const minor=h=>CHORDS[h.chord].intervals.includes(3);
export function cadenceKind(previous,current,next,settings){
 const delta=pc(next.root-current.root),target=CHORDS[next.chord].intervals;
 const tonic=target.includes(7)&&!dominant(next)||['blues','secondLine','boogaloo'].includes(settings.backingStyle)&&next.root===settings.key;
 if(dominant(current)&&tonic){
  if(delta===5)return 'dominant';
  if(delta===11)return 'tritone';
  if(delta===2&&previous&&minor(previous)&&pc(current.root-previous.root)===5)return minor(next)&&next.root!==settings.key?'deceptive':'backdoor';
 }
 if(minor(current)&&tonic&&delta===7)return 'plagal';
 return null;
}
function sectionRole(name,seen,last,fallback){
 const label=String(name||'').trim(),token=label.split(/[·:—]/)[0].trim().toLowerCase();
 if(/return|outro|resolve|turnaround/i.test(label))return 'return';
 if(/bridge|contrast/i.test(label)||token==='b')return 'contrast';
 if(/intro|opening|state|call|verse/i.test(label))return 'opening';
 if(/develop|chorus|lift|solo/i.test(label))return 'develop';
 if(token&&seen.has(token)&&token!==last)return 'return';
 return token&&!seen.size?'opening':fallback;
}
// Chart structure is analysed once before playback. Repeated short vamps keep
// a long phrase arc; real rehearsal sections and cadential arrivals add cues.
export function arrangementForm(settings,def,targets,total){
 const beats=settings.beats,chart=targets.at(-1).end,bars=Math.ceil(total/beats),boundaries=new Map([[0,{label:targets[0].section||'',explicit:!!targets[0].section}]]),cadences=[];
 const marks=targets.filter(t=>t.section&&t.start>0),multi=marks.length>0;
 for(let cycle=0;cycle<total;cycle+=chart){
  for(const mark of marks){const at=cycle+mark.start;if(at<total)boundaries.set(at,{label:mark.section,explicit:true});}
  if(multi&&cycle>0)boundaries.set(cycle,{label:targets[0].section||'A',explicit:true});
  for(let i=0;i<targets.length;i++){
   const next=targets[(i+1)%targets.length],current=targets[i],previous=targets[(i-1+targets.length)%targets.length];
   const at=cycle+current.end,kind=cadenceKind(previous,current,next,settings);
   if(kind&&at<=total)cadences.push({at,kind,fromStep:current.step,toStep:next.step,from:current,to:next});
  }
 }
 // Fill long unmarked stretches with four-bar phrases, without moving marks.
 const explicit=[...boundaries.keys(),total].sort((a,b)=>a-b);
 for(let i=0;i<explicit.length-1;i++)for(let at=explicit[i]+beats*4;at<explicit[i+1];at+=beats*4)if(!boundaries.has(at))boundaries.set(at,{label:'',explicit:false});
 const starts=[...boundaries.keys()].filter(at=>at<total).sort((a,b)=>a-b),seen=new Set();let last='',section='';
 const phrases=starts.map((start,index)=>{
  const mark=boundaries.get(start),end=starts[index+1]??total,fallback=['opening','develop','contrast','return'][index%4];
  const role=mark.explicit?sectionRole(mark.label,seen,last,fallback):fallback;
  if(mark.explicit){section=mark.label;last=String(mark.label).split(/[·:—]/)[0].trim().toLowerCase();seen.add(last);}
  return {start,end,role,section,index,explicit:mark.explicit};
 });
 const sourceBases={opening:0,develop:Math.min(4,def.bars-4),contrast:Math.floor(def.bars/8)*4,return:Math.max(0,def.bars-4)};
 const barPlan=Array.from({length:bars},(_,bar)=>{
  const start=bar*beats,end=Math.min(total,start+beats),phrase=phrases.find(p=>start>=p.start&&start<p.end)||phrases[0];
  let local=Math.max(0,Math.floor((start-phrase.start)/beats));
  const closes=end>=phrase.end-1e-7,sourceBar=sourceBases[phrase.role]+(closes?3:local%4);
  return {bar,start,end,role:phrase.role,section:phrase.section,phraseIndex:phrase.index,phraseStart:start<=phrase.start,phraseEnd:closes,sourceBar:Math.min(def.bars-1,sourceBar),transitionAt:phrase.end,transition:closes&&(boundaries.get(phrase.end)?.explicit||phrase.end===total||cadences.some(c=>Math.abs(c.at-phrase.end)<1e-7))};
 });
 return {phrases,bars:barPlan,cadences,totalBeats:total};
}
const nearest=(wanted,pcs,low,high)=>{let best=null;for(let midi=low;midi<=high;midi++)if(pcs.includes(pc(midi))&&(best===null||Math.abs(midi-wanted)<Math.abs(best-wanted)))best=midi;return best;};
function lastEvent(slots,from,to){for(let grid=Math.min(slots.length-1,to);grid>=Math.max(0,from);grid--)if(slots[grid].length)return {grid,event:slots[grid].at(-1)};return null;}
function firstEvent(slots,from,to){for(let grid=Math.max(0,from);grid<=Math.min(slots.length-1,to);grid++)if(slots[grid].length)return {grid,event:slots[grid][0]};return null;}
export function finishArrangement(score,settings,def,targets,clip){
 const form=score.form,beats=settings.beats,length=score.sequence.length,rate=12;
 // Turn written cadential gestures toward the actual destination, rather than
 // snapping a phrase to whichever source chord happened to occur at that bar.
 for(const cadence of form.cadences){
  const grid=Math.round(cadence.at*rate),lead=lastEvent(score.sequence,grid-Math.min(2,cadence.from.duration)*rate,grid-1),arrival=grid===length?firstEvent(score.sequence,0,rate*2):firstEvent(score.sequence,grid,grid+rate*2);
  if(lead&&arrival){
   const before=lead.event,after=arrival.event,to=CHORDS[cadence.to.chord].intervals;
   const targetPcs=[pc(cadence.to.root+(to[1]??0)),cadence.to.root];
   const leadPcs=dominant(cadence.from)?[pc(cadence.from.root+4),pc(cadence.from.root+10)]:cadence.from.chordPcs;
   let best=null;for(const leadPc of leadPcs)for(const targetPc of targetPcs){const a=nearest(before.midi,[leadPc],55,86),b=nearest(a,[targetPc],55,86);if(a===null||b===null)continue;const cost=Math.abs(b-a)*3+Math.abs(a-before.midi)+Math.abs(b-after.midi)*.5;if(!best||cost<best.cost)best={a,b,cost};}
   if(best){before.midi=best.a;before.duration=clip(lead.grid/rate,before.duration,[best.a]);before.cadence=after.cadence=cadence.kind;before.cadenceRole='lead-in';after.cadenceRole='arrival';after.midi=best.b;after.duration=clip(arrival.grid/rate,after.duration,[best.b]);}
  }
  if(['traditionalJazz','jazzWaltz','modernStraightJazz','blues','secondLine','motown','boogaloo'].includes(def.id)){
   const bass=lastEvent(score.bass,grid-rate,grid-1);
   if(bass&&!bass.event.anticipation){const to=Number.isFinite(cadence.to.bassMidi)?pc(cadence.to.bassMidi):cadence.to.root,pcs=[pc(to-1),pc(to+1)],inChord=pcs.filter(n=>cadence.from.chordPcs.includes(n));
    const midi=nearest(bass.event.midi,inChord.length?inChord:pcs,28,55);if(midi!==null){Object.assign(bass.event,{midi,approach:true,cadence:cadence.kind,duration:Math.min(bass.event.duration,(grid-bass.grid)/rate)});}
   }
  }
 }
 const gentle=['ballad','neoSoul','legatoFusion','slowSoul128'].includes(def.id),latin=['latin','bossa','samba','afroCuban68'].includes(def.id);
 for(let grid=0;grid<length;grid++){
  const bar=Math.min(form.bars.length-1,Math.floor(grid/rate/beats)),part=form.bars[bar];
  // Remove source-location fills when they do not belong to a target phrase.
  score.drums[grid]=score.drums[grid].filter(e=>!['tomHigh','tomLow','crash'].includes(e.name)||part.transition&&e.at>=beats-1||part.phraseStart&&e.name==='crash');
  for(const event of score.comping[grid])event.velocity*=part.role==='contrast'?.88:part.role==='develop'?1.03:1;
 }
 for(const part of form.bars){
  if(!part.transition)continue;
  const end=Math.min(length,Math.round(part.transitionAt*rate)),one=Math.max(0,end-12),half=Math.max(0,end-(def.id==='slowSoul128'?4:6));
  const add=(grid,name,velocity)=>{if(grid>=length)return;const existing=score.drums[grid].find(e=>e.name===name);if(existing){existing.transition=true;existing.phraseRole=part.role;return;}score.drums[grid].push({at:grid/rate%beats,bar:Math.floor(grid/rate/beats),name,velocity,transition:true,phraseRole:part.role});};
  if(latin){if(def.id==='latin'||def.id==='afroCuban68')add(half,'congaOpen',.18);else add(half,'rim',.17);}
  else if(def.id==='reggae')add(half,'rim',.17);
  else if(def.id==='ballad')add(half,'hatPedal',.075);
  else{add(one,'snare',gentle?.12:.2);add(half,gentle?'tomLow':'tomHigh',def.id==='hardRock'?.3:gentle?.16:.21);}
 }
 return score;
}
