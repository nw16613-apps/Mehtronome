import {buildStudyPerformance,articulateStudyPerformance} from './study-performance.js';
import {CHORDS,MODES} from './music.js';
import {segmentAt,pitchForDegree} from './reference-catalogue.js';
import {COMPOSITION_STYLES,CHORUS_ROLES} from './composition-vocabulary.js';
const pc=n=>((n%12)+12)%12;
const closest=(wanted,pcs,low,high,count=7)=>Array.from({length:high-low+1},(_,i)=>i+low).filter(n=>pcs.includes(pc(n))).sort((a,b)=>Math.abs(a-wanted)-Math.abs(b-wanted)||a-b).slice(0,count);
const entries=slots=>slots.flatMap((events,grid)=>events.map(event=>({grid,event})));
const degreePc=(h,degree)=>{const p=pc(h.root+pitchForDegree(h.chord,String(degree))),allowed=[...h.scalePcs,...h.chordPcs];return allowed.includes(p)?p:pc(closest(60+p,allowed,48,84,1)[0]);};
// Global shortest-path voice leading. Future landing constraints influence
// earlier choices through the backward trace; this is not a greedy chord mapper.
function route(rows,candidates,localCost,edgeCost){
 if(!rows.length)return [];
 const layers=[];let previous=[];
 for(let i=0;i<rows.length;i++){
  const options=candidates(rows[i],i),layer=options.map(value=>({value,cost:Infinity,from:-1}));
  for(const node of layer){const local=localCost(node.value,rows[i],i);if(!i)node.cost=local;else for(let j=0;j<previous.length;j++){const cost=previous[j].cost+local+edgeCost(previous[j].value,node.value,rows[i-1],rows[i]);if(cost<node.cost){node.cost=cost;node.from=j;}}}
  layers.push(layer);previous=layer;
 }
 let index=previous.reduce((best,node,i)=>node.cost<previous[best].cost?i:best,0);const path=new Array(rows.length);
 for(let i=rows.length-1;i>=0;i--){path[i]=layers[i][index].value;index=layers[i][index].from;}
 return path;
}
function planMelody(score,targets,pass,clip){
 const rows=entries(score.sequence),at=beat=>segmentAt(targets,beat);
 const candidates=row=>{const h=at(row.grid/12),e=row.event,arrival=e.cadenceRole==='arrival'&&e.targetStep===h.step,lead=e.cadenceRole==='lead-in'&&e.targetStep===h.step,ints=CHORDS[h.chord].intervals,guide=ints.includes(4)&&ints.includes(10)?[pc(h.root+4),pc(h.root+10)]:h.chordPcs,pcs=arrival?[h.root,degreePc(h,3)]:lead?guide:Number.isInteger(row.grid/12)&&e.duration>=.65?h.chordPcs:[...new Set([...h.scalePcs,...h.chordPcs])];return closest(e.desired??e.midi,pcs,55,86);};
 const path=route(rows,candidates,(n,row)=>Math.abs(n-(row.event.desired??row.event.midi))*.45,
  (a,b,prev,next)=>{const interval=b-a,wanted=(next.event.desired??next.event.midi)-(prev.event.desired??prev.event.midi);return Math.abs(interval)*.35+Math.max(0,Math.abs(interval)-7)*2+(wanted&&Math.sign(wanted)!==Math.sign(interval)?1.5:0)+(a===b&&wanted?1:0);});
 rows.forEach((row,i)=>{row.event.midi=path[i];row.event.duration=clip(row.grid/12,row.event.duration,[path[i]]);row.event.composed=!!row.event.composed;});
}
function voicings(h,power){
 const ints=CHORDS[h.chord].intervals,important=[ints[1],ints.find(n=>n>=9&&n<=11),...ints.filter(n=>n>=13),ints[2]].filter(n=>n!==undefined);
 let pcs=power?[h.root,degreePc(h,5)]:[...new Set(important.slice(0,5).map(i=>pc(h.root+i)))];if(pcs.length<3&&!power)pcs=[...new Set([h.root,...pcs])];
 const result=[];
 for(let inversion=0;inversion<pcs.length;inversion++)for(let octave=3;octave<=5;octave++){
  let last=octave*12+pcs[inversion],notes=[last];for(let i=1;i<pcs.length;i++){let n=octave*12+pcs[(inversion+i)%pcs.length];while(n<=last)n+=12;notes.push(n);last=n;}
  if(power)notes.push(notes[0]+12);notes.sort((a,b)=>a-b);if(notes[0]>=40&&notes.at(-1)<=84)result.push(notes);
 }
 return result;
}
function planChords(score,targets,profile,pass,clip){
 const rows=entries(score.comping),at=beat=>segmentAt(targets,beat),center=profile.power?52:profile.sustain?60:64;
 const path=route(rows,row=>voicings(at(row.grid/12),profile.power),(notes,row)=>notes.reduce((n,p)=>n+Math.abs(p-(center+(row.event.chorus===2?-3:row.event.chorus===3?1:0)))*.06,0),
  (a,b)=>b.reduce((sum,n,i)=>sum+Math.abs(n-a[Math.min(i,a.length-1)])*.55-(a.includes(n)?.7:0),0));
 rows.forEach((row,i)=>{row.event.notes=path[i];row.event.duration=clip(row.grid/12,row.event.duration,path[i]);});
 // Harmonically prepared answers can be selected later using the audible lead.
 score.answerOptions=Array.from({length:score.sequence.length},()=>[]);
 for(let bar=0;bar<Math.ceil(score.bars);bar++)for(const offset of (profile.triplet?[1+1/3,2+1/3]:profile.sustain?[1.5,2.5]:[.5,2.5])){
  if(offset>=score.beats)continue;
  const atBeat=bar*score.beats+offset,grid=Math.round(atBeat*12);if(grid>=score.sequence.length)continue;
  const h=at(atBeat),prior=rows.findLast(row=>row.grid<=grid),options=voicings(h,profile.power),previous=prior?.event.notes||[55,60,64];
  const notes=options.sort((a,b)=>a.reduce((n,p,i)=>n+Math.abs(p-previous[Math.min(i,previous.length-1)]),0)-b.reduce((n,p,i)=>n+Math.abs(p-previous[Math.min(i,previous.length-1)]),0))[0];
  if(notes)score.answerOptions[grid].push({at:atBeat%score.beats,bar,notes:notes.slice(-3),duration:clip(atBeat,profile.sustain?2:1.1,notes.slice(-3)),velocity:.3,targetStep:h.step,answer:true,chorus:Math.floor(atBeat/score.developmentBeats)%4,chorusRole:CHORUS_ROLES[Math.floor(atBeat/score.developmentBeats)%4]});
 }
}
function planBass(score,targets,pass,clip){
 const rows=entries(score.bass),at=beat=>segmentAt(targets,beat);
 const path=route(rows,row=>closest(row.event.midi,[pc(row.event.midi)],28,55,3),(n,row)=>Math.abs(n-row.event.midi)*.15,
  (a,b)=>Math.abs(b-a)*.6+Math.max(0,Math.abs(b-a)-7)*1.5);
 rows.forEach((row,i)=>{row.event.midi=path[i];row.event.duration=clip(row.grid/12,row.event.duration,[path[i]]);});
}
function chorusAt(score,beat){return Math.min(3,Math.floor(beat/score.developmentBeats));}
function add(score,track,beat,event,targets){
 const grid=Math.round(beat*12);if(grid<0||grid>=score.sequence.length)return;
 const chorus=chorusAt(score,beat),h=segmentAt(targets,beat);
 score[track][grid].push({at:beat%score.beats,bar:Math.floor(beat/score.beats),...event,chorus,chorusRole:CHORUS_ROLES[chorus],targetStep:h.step});
}
function generateParts(score,targets,profile,clip){
 const beats=score.beats,length=score.sequence.length,total=length/12,at=beat=>segmentAt(targets,beat);
 for(const track of ['sequence','bass','comping','drums'])score[track]=score[track].map((events,grid)=>events.map(event=>({...event,...(event.notes?{notes:[...event.notes]}:{}),chorus:chorusAt(score,grid/12),chorusRole:CHORUS_ROLES[chorusAt(score,grid/12)]})));
 for(let chorus=0;chorus<4;chorus++){
  const startBeat=chorus*score.developmentBeats,endBeat=Math.min(total,startBeat+score.developmentBeats),startGrid=Math.round(startBeat*12),endGrid=Math.round(endBeat*12);
  if(chorus===1||chorus===2){
   for(let grid=startGrid;grid<endGrid;grid++){score.sequence[grid]=[];score.comping[grid]=[];}
   for(const phrase of score.form.phrases){
    const start=Math.max(startBeat,phrase.start),end=Math.min(endBeat,phrase.end);if(start>=end)continue;
    const cadence=score.form.cadences.find(c=>c.at>=start+Math.min(beats,end-start)&&c.at<=end+beats),goalBeat=cadence?.at??end,goalHarmony=at(goalBeat);
    const goal=closest(chorus===2?68:74,[degreePc(goalHarmony,3),goalHarmony.root],57,84,1)[0],first=closest(goal,[degreePc(at(start),3)],57,84,1)[0];
    const contour=chorus===2?[...profile.contour].reverse().map(n=>-n):profile.contour;let index=0;
    for(let bar=Math.floor(start/beats);bar*beats<end;bar++){
     const rhythm=profile.lead[bar%profile.lead.length].filter((_,i)=>chorus!==2||i%2===0);
     for(const [offset,duration]of rhythm){
      const beat=Math.round((bar*beats+offset)*12)/12;if(beat<start||beat>=end)continue;
      const progress=Math.min(1,(beat-start)/Math.max(1,goalBeat-start)),motif=contour[index++%contour.length],desired=first+(goal-first)*progress+motif*(chorus===2?1.3:1.7),h=at(beat),midi=closest(desired,[...h.scalePcs,...h.chordPcs],55,86,1)[0];
      add(score,'sequence',beat,{midi,desired,duration:clip(beat,Math.min(duration*(chorus===2?1.5:1),end-beat),[midi]),velocity:chorus===2?.53:.62,phraseRole:phrase.role,motifId:profile.contour.join(','),goalBeat,goalPc:degreePc(goalHarmony,3),composed:true},targets);
     }
    }
   }
   for(let bar=Math.floor(startBeat/beats);bar*beats<endBeat;bar++){
    const rhythm=chorus===2&&!profile.ostinato?[[0,profile.sustain?beats*1.7:beats-.3]]:profile.comp[(bar+chorus-1)%profile.comp.length];
    for(const [offset,duration]of rhythm){const beat=Math.round((bar*beats+offset)*12)/12;if(beat<startBeat||beat>=endBeat)continue;const notes=voicings(at(beat),profile.power)[0];if(notes)add(score,'comping',beat,{notes,duration,velocity:chorus===2?.34:.4,part:profile.ostinato?'ostinato':profile.sustain?'sustained':'comping',composed:true},targets);}
   }
  }
  if(chorus>0){
   for(let grid=startGrid;grid<endGrid;grid++)score.bass[grid]=[];
   for(let bar=Math.floor(startBeat/beats);bar*beats<endBeat;bar++){
    let rhythm=profile.bass[(bar+chorus-1)%profile.bass.length];
    if(chorus===2&&!profile.ostinato)rhythm=profile.walking?[[0,1,beats===3?1.4:1.8],[beats===3?1.5:2,5,beats===3?1.3:1.7]]:rhythm.filter((_,i)=>i%2===0);
    for(const [offset,degree,duration]of rhythm){
     const beat=Math.round((bar*beats+offset)*12)/12;if(beat<startBeat||beat>=endBeat)continue;
     const current=at(beat),distance=current.end-(beat%score.chartBeats),anticipated=degree===0||profile.anticipated&&Math.abs(distance-.5)<1e-6;
     const target=anticipated?at(beat+Math.min(distance,beats-offset)):current,next=at(beat+distance),approach=degree===-1&&distance<=1.01&&(profile.walking||profile.chromatic);
     const pitch=approach?pc((Number.isFinite(next.bassMidi)?next.bassMidi:next.root)-1):(degree===1||anticipated)&&Number.isFinite(target.bassMidi)?pc(target.bassMidi):degreePc(target,anticipated?1:degree<0?5:degree),midi=closest(36+((bar+chorus)%2?3:0),[pitch],28,55,1)[0];
     add(score,'bass',beat,{midi,duration:clip(beat,duration,[midi]),velocity:(degree===1?.64:.55)*(chorus===2?.88:1),anticipation:!!anticipated,approach,composed:true},targets);
    }
   }
  }
 }
 // State a changed harmony without breaking a skank, guajeo or anticipated bass.
 for(let cycle=0;cycle<total;cycle+=score.chartBeats)for(const h of targets){
  const beat=cycle+h.start;if(beat>=total)break;const grid=Math.round(beat*12),end=Math.min(score.sequence.length,grid+Math.min(.75,h.duration)*12);
  if(profile.anticipated){
   const before=(grid-6+length)%length;if(!score.bass[before].some(e=>e.anticipation)){
    const pitch=Number.isFinite(h.bassMidi)?pc(h.bassMidi):h.root,midi=closest(36,[pitch],28,55,1)[0];
    add(score,'bass',before/12,{midi,duration:Math.min(1.5,h.duration+.5),velocity:.58,anticipation:true,goalStep:h.step,changeEntry:true,composed:true},targets);
   }
  }else if(!score.bass.slice(grid,end).some(events=>events.length)&&!score.bass[(grid-6+length)%length].some(e=>e.anticipation)){
   const pitch=Number.isFinite(h.bassMidi)?pc(h.bassMidi):h.root,midi=closest(36,[pitch],28,55,1)[0];add(score,'bass',beat,{midi,duration:Math.min(.7,h.duration),velocity:.56,changeEntry:true},targets);
  }
  if(Number.isFinite(h.bassMidi)&&!profile.anticipated){
   const first=score.bass.slice(grid,end).flat().find(e=>!e.anticipation);if(first){first.midi=closest(first.midi,[pc(h.bassMidi)],28,55,1)[0];first.slashEntry=true;}
  }
  if(!profile.ostinato&&!score.comping.slice(grid,end).some(events=>events.length)){
   const notes=voicings(h,profile.power)[0];if(notes)add(score,'comping',beat,{notes,duration:Math.min(1.5,h.duration),velocity:.34,changeEntry:true},targets);
  }
 }
 buildStudyPerformance(score,targets,clip,add);
 // The actual destination constrains both ends of a cadence, including wraps.
 const melody=entries(score.sequence);
 for(const c of score.form.cadences){
  const grid=Math.round(c.at*12),arrivalStart=grid===length?0:grid;
  const lead=melody.findLast(row=>row.grid<grid&&row.grid>=grid-Math.min(2,c.from.duration)*12&&row.event.targetStep===c.fromStep);
  const arrival=melody.find(row=>row.grid>=arrivalStart&&row.grid<arrivalStart+Math.min(24,c.to.duration*12)&&row.event.targetStep===c.toStep);
  for(const [row,kind,h]of [[lead,'lead-in',c.from],[arrival,'arrival',c.to]])if(row){row.event.cadenceRole=kind;row.event.cadence=c.kind;const ints=CHORDS[h.chord].intervals,pcs=kind==='arrival'?[h.root,degreePc(h,3)]:ints.includes(4)&&ints.includes(10)?[pc(h.root+4),pc(h.root+10)]:h.chordPcs;row.event.desired=closest(row.event.desired??row.event.midi,pcs,55,86,1)[0];}
 }
}
export function composeProgression(base,settings,def,targets,clip){
 const profile=COMPOSITION_STYLES[def.id],score={...base,developmentBeats:base.developmentBeats};
 generateParts(score,targets,profile,clip);
 planMelody(score,targets,null,clip);planBass(score,targets,null,clip);planChords(score,targets,profile,null,clip);
 articulateStudyPerformance(score,targets,clip);
 const energy=[.87,1,.8,.94];
 for(const track of ['sequence','bass','comping','drums'])for(const events of score[track])for(const event of events)event.velocity*=energy[event.chorus];
 score.choruses=CHORUS_ROLES.map((role,index)=>({index,role,start:index*score.developmentBeats,end:(index+1)*score.developmentBeats}));
 score.composition={method:'whole-progression-paths',roles:CHORUS_ROLES,goals:score.form.cadences.map(c=>({beat:c.at,kind:c.kind,toStep:c.toStep})),ostinato:!!profile.ostinato};
 return score;
}
