import {CHORDS} from './music.js';
import {segmentAt} from './reference-catalogue.js';
import {STYLE_PERFORMANCES} from './style-performance-vocabulary.js';

const pc=n=>(n%12+12)%12;
function nearest(wanted,pcs,low=55,high=86){
 let result=low,distance=Infinity;
 for(let n=low;n<=high;n++)if(pcs.includes(pc(n))&&Math.abs(n-wanted)<distance){result=n;distance=Math.abs(n-wanted);}
 return result;
}
const third=h=>{const ints=CHORDS[h.chord].intervals;return pc(h.root+(ints.includes(3)?3:ints.includes(4)?4:ints[1]||0));};
const articulation=(profile,length)=>profile.touch==='mixed'?(length<.65?'damped':'ringing'):profile.touch;
export const hasStylePerformance=id=>Object.hasOwn(STYLE_PERFORMANCES,id);

export function buildStylePerformance(score,targets,clip,add){
 const profile=STYLE_PERFORMANCES[score.id];if(!profile)return;
 const rate=12,beats=score.beats,total=score.sequence.length/rate,at=b=>segmentAt(targets,b);
 score.sequence=score.sequence.map(()=>[]);score.comping=score.comping.map(()=>[]);
 for(let bar=0;bar<Math.ceil(total/beats);bar++){
  const start=bar*beats,pass=Math.min(3,Math.floor(start/score.developmentBeats));
  const local=Math.floor((start%score.developmentBeats)/beats),phase=local%8;
  const arcStart=start-(local%4)*beats,arcEnd=Math.min(total,arcStart+beats*4);
  const cadence=score.form.cadences.find(c=>c.at>=arcStart+beats&&c.at<=arcEnd+beats);
  const goalBeat=cadence?.at??arcEnd,goal=nearest(73,[third(at(goalBeat))]),anchor=nearest(68,[third(at(arcStart))]);
  const contrast=pass===2,cell=(phase+(pass===1||pass===3?4:contrast?2:0))%8;
  const rhythm=profile.lead[cell].filter((_,i)=>!contrast||i%2===0);
  for(const [offset,length,motifIndex]of rhythm){
   const beat=Math.round((start+offset)*rate)/rate;if(offset>=beats||beat>=total)continue;
   const progress=Math.min(1,(beat-arcStart)/Math.max(beats,goalBeat-arcStart));
   const contour=profile.motif[(motifIndex+(pass===1?1:0))%profile.motif.length]*(contrast?-.75:1);
   const desired=anchor+(goal-anchor)*progress+contour+(contrast?-2:pass===1?1:0),h=at(beat);
   const midi=nearest(desired,[...h.scalePcs,...h.chordPcs]);
   add(score,'sequence',beat,{midi,desired,duration:clip(beat,Math.min(length*(contrast?1.2:1),total-beat),[midi]),
    velocity:.57*(motifIndex===0?1.08:motifIndex===7?.9:1),phraseRole:score.form.bars[bar].role,
    motifId:score.id+':conversation',motifIndex,phraseGesture:local%4<2?'call':'answer',goalBeat,goalPc:third(at(goalBeat)),
    composed:true,studyPerformance:true},targets);
  }
  // Native ostinatos keep their metric phase in every pass. Contrast reduces
  // their weight and voicing, rather than displacing clave, skank or riff accents.
  let strokes=profile.comp[profile.ostinato?bar%8:cell];
  if(contrast&&!profile.ostinato)strokes=phase%(profile.sustain?4:2)===0?[[profile.sustain?0:.5,profile.sustain?beats*1.8:beats*.65,2]]:[];
  for(const [offset,length,gesture]of strokes){
   const beat=Math.round((start+offset)*rate)/rate;if(offset>=beats||beat>=total)continue;
   const h=at(beat),duration=Math.min(length*(contrast?.88:pass===1?1.05:pass===3?.96:1),total-beat);
   add(score,'comping',beat,{notes:h.chordPcs.map(n=>48+n),duration,
    velocity:(profile.sustain?.34:profile.voicing==='power'?.47:.39)*(gesture===0?1:gesture===1?.9:.8)*(contrast?.86:1),
    voiceShape:contrast?2:(gesture+(pass===1?1:0))%3,part:profile.ostinato?'style ostinato':profile.sustain?'sustained answers':'chord conversation',
    articulation:articulation(profile,duration),composed:true,studyPerformance:true},targets);
  }
 }
 // Honour changes inside a bar without filling every written rest with a chord.
 // A compatible ringing voicing can carry across a new chord; an ostinato states
 // changes at its next native attack, instead of acquiring arbitrary downbeats.
 if(!profile.ostinato)for(let cycle=0;cycle<total;cycle+=score.chartBeats)for(const h of targets){
  const beat=cycle+h.start;if(beat>=total)break;
  const grid=Math.round(beat*rate),end=Math.min(score.comping.length,grid+Math.min(.75,h.duration)*rate);
  const from=Math.max(0,grid-Math.ceil(beats*2*rate));
  const rings=score.comping.slice(from,grid).some((es,i)=>es.some(e=>from+i+e.duration*rate>grid&&e.notes.every(n=>[...h.chordPcs,...h.scalePcs].includes(pc(n)))));
  if(!rings&&!score.comping.slice(grid,end).some(es=>es.length))add(score,'comping',beat,{
   notes:h.chordPcs.map(n=>48+n),duration:Math.min(profile.sustain?1.5:.65,h.duration),velocity:.29,
   voiceShape:2,articulation:articulation(profile,profile.sustain?1.5:.65),changeEntry:true,composed:true,studyPerformance:true},targets);
 }
 score.performanceStudy={version:2,style:score.id,phraseBars:8};
}

export function articulateStylePerformance(score,targets,clip){
 const profile=STYLE_PERFORMANCES[score.id];if(!profile)return;
 const at=b=>segmentAt(targets,b),rate=12;
 const rows=score.sequence.flatMap((es,grid)=>es.map(event=>({grid,event})));
 for(let i=0;i<rows.length;i++){
  const {grid,event:e}=rows[i],next=rows[i+1],beat=grid/rate;
  if(profile.connected&&next&&next.grid-grid<=e.duration*rate+2&&next.grid-grid<score.beats*rate&&next.event.chorus===e.chorus){
   e.duration=clip(beat,Math.min(score.sequence.length/rate-beat,(next.grid-grid)/rate+.06),[e.midi]);e.articulation='connected';
  }else e.articulation=e.duration<.65?'detached':'held';
 }
 const voice=(e,beat)=>{
  const h=at(beat),ints=CHORDS[h.chord].intervals,seventh=ints.find(n=>n>=9&&n<=11);
  const guides=new Set([third(h),...(seventh===undefined?[]:[pc(h.root+seventh)])]);
  const notes=[...e.notes];
  if(profile.voicing==='jazz'&&e.voiceShape===2){
   const shell=notes.filter(n=>guides.has(pc(n)));e.notes=shell.length>=2?shell.slice(0,3):notes.slice(-3);
  }else if(profile.voicing==='open'&&notes.length>=3){
   const index=notes.length-2;
   if(notes[index]-12>=40){notes[index]-=12;notes.sort((a,b)=>a-b);if(notes.at(-1)-notes[0]<=22)e.notes=notes;}
  }else if(profile.voicing!=='power'){
   const limit=profile.voicing==='upper'||e.voiceShape===1?3:4;
   // Keep guides in smaller voicings and vary the upper answer without adding
   // extensions that the user's chart/scale guide does not allow.
   const core=notes.filter(n=>guides.has(pc(n)));
   e.notes=[...new Set([...core,...(e.voiceShape===1?[...notes].reverse():notes)])].slice(0,limit).sort((a,b)=>a-b);
  }
  e.duration=clip(beat,e.duration,e.notes);e.articulation=articulation(profile,e.duration);
 };
 for(let grid=0;grid<score.comping.length;grid++)for(const e of score.comping[grid])voice(e,grid/rate);
 for(let grid=0;grid<(score.answerOptions?.length||0);grid++)for(const e of score.answerOptions[grid]){e.voiceShape=1;voice(e,grid/rate);}
 for(let grid=0;grid<score.bass.length;grid++)for(const e of score.bass[grid]){
  e.duration=clip(grid/rate,e.duration*profile.bassLength,[e.midi]);
  e.velocity*=grid%(score.beats*rate)===0?1.035:e.anticipation?1.025:.98;
  e.performanceTouch=profile.bassLength<.96?'short pocket':profile.sustain?'sustained support':'flowing pulse';
 }
}
