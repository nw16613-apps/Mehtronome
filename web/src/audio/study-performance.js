import {CHORDS} from './music.js';
import {segmentAt} from './reference-catalogue.js';
import {hasStylePerformance,buildStylePerformance,articulateStylePerformance} from './style-performance.js';
const pc=n=>(n%12+12)%12;
const nearest=(n,pcs,low=55,high=86)=>{let best=low,d=Infinity;for(let p=low;p<=high;p++)if(pcs.includes(pc(p))&&Math.abs(p-n)<d){best=p;d=Math.abs(p-n);}return best;};
const cell=s=>s.split('|').map(bar=>bar.split(' ').filter(Boolean).map(n=>n.split(':').map(Number)));
// Eight-bar conversations, rather than repeating the same two-bar rhythm.
// Entries are [beat, sounding length, position in the recurring motif].
const STUDIES={
 blues:{motif:[0,3,5,3,0,-2,-3,0],lead:cell('.5:.34:0 1:.34:1 1.5:.95:2|1.5:.34:2 2:.34:1 2.5:.85:0|.5:.34:0 1:.34:1 1.5:.34:2 2:.85:3|.5:.34:3 1:.34:4 1.5:1.1:5|.5:.34:0 1:.34:1 2:1.1:2|1:.34:2 1.5:.34:3 2.5:.8:4|.5:.34:4 1:.34:5 1.5:.34:6 2:.85:7|.5:.34:3 1:.34:4 1.5:1.2:7'),comp:cell('0:.8:0|1.5:.45:1 3:.55:2|0:.7:0 2.5:.5:1|1:1.1:2|0:.85:0 2.5:.4:1|1.5:.9:2|0:.8:0 3:.4:1|.5:.45:1 1.5:.65:2')},
 legatoFusion:{motif:[0,2,5,4,1,3,-1,0],lead:cell('.5:.82:0 1.25:.85:1 2:1.5:2|0:1.08:2 1:.83:3 1.75:1.6:4|.75:1.35:4 2:1.3:5|1:1.8:7|.25:1.08:0 1.25:.58:1 1.75:1.2:2 3:.5:3|.5:1.2:3 2:1.4:4|0:.83:4 .75:.83:5 1.5:1.4:6|.5:2.1:7'),comp:cell('0:5.5:0||1:3.3:1||.5:4.8:0||1:2.5:2|2:.9:1')},
};
export const hasStudyPerformance=id=>Object.hasOwn(STUDIES,id)||hasStylePerformance(id);
export function buildStudyPerformance(score,targets,clip,add){
 const study=STUDIES[score.id];if(!study)return buildStylePerformance(score,targets,clip,add);
 const rate=12,beats=score.beats,total=score.sequence.length/rate,at=b=>segmentAt(targets,b),third=h=>pc(h.root+(CHORDS[h.chord].intervals.includes(3)?3:CHORDS[h.chord].intervals.includes(4)?4:CHORDS[h.chord].intervals[1]||0));
 score.sequence=score.sequence.map(()=>[]);score.comping=score.comping.map(()=>[]);
 for(let bar=0;bar<Math.ceil(total/beats);bar++){
  const start=bar*beats,pass=Math.min(3,Math.floor(start/score.developmentBeats)),local=Math.floor((start%score.developmentBeats)/beats),phase=local%8,arcStart=start-(local%4)*beats,arcEnd=Math.min(total,arcStart+beats*4);
  const cadence=score.form.cadences.find(c=>c.at>=arcStart+beats&&c.at<=arcEnd+beats),goalBeat=cadence?.at??arcEnd,goal=nearest(score.id==='blues'?70:74,[third(at(goalBeat))]),anchor=nearest(score.id==='blues'?67:70,[third(at(arcStart))]),contrast=pass===2;
  const rhythm=study.lead[(phase+(pass===1?4:0))%8].filter((_,i)=>!contrast||i%2===0);
  for(const [offset,length,motifIndex]of rhythm){
   const beat=Math.round((start+offset)*rate)/rate;if(offset>=beats||beat>=total)continue;
   const progress=Math.min(1,(beat-arcStart)/Math.max(beats,goalBeat-arcStart)),contour=study.motif[(motifIndex+(pass===1?1:0))%study.motif.length]*(contrast?-.75:1),desired=anchor+(goal-anchor)*progress+contour+(contrast?-2:pass===1?1:0),h=at(beat),midi=nearest(desired,[...h.scalePcs,...h.chordPcs]);
   add(score,'sequence',beat,{midi,desired,duration:clip(beat,Math.min(length*(contrast?1.2:1),total-beat),[midi]),velocity:(score.id==='blues'?.59:.57)*(motifIndex===0?1.08:motifIndex===7?.9:1),phraseRole:score.form.bars[bar].role,motifId:score.id+':conversation',motifIndex,phraseGesture:local%4<2?'call':'answer',goalBeat,goalPc:third(at(goalBeat)),composed:true,studyPerformance:true},targets);
  }
  const developmentOffset=pass===1?(score.id==='blues'?2:4):0;
  let strokes=study.comp[(phase+developmentOffset)%8];
  if(contrast&&score.id==='blues')strokes=phase%2?[]:[[.5,1.1,2]];
  if(score.id==='legatoFusion'){if(contrast)strokes=phase%4===0?[[.5,beats*2.2,0]]:phase%4===2?[[2,beats*.85,1]]:[];else if(pass===1&&phase===3)strokes=[[2,.9,2]];else if(pass===3)strokes=strokes.map(([offset,length,shape])=>[offset+.5,length,shape]);}
  for(const [offset,length,shape]of strokes){
   const beat=Math.round((start+offset)*rate)/rate;if(offset>=beats||beat>=total)continue;const h=at(beat);
   add(score,'comping',beat,{notes:h.chordPcs.map(n=>48+n),duration:Math.min(length,total-beat),velocity:score.id==='blues'?(shape===0?.43:.35):shape===0?.34:.29,voiceShape:shape,part:score.id==='blues'?'blues double-stops':'open sustained guitar',articulation:score.id==='blues'?(length<.7?'damped':'ringing'):'swell',composed:true,studyPerformance:true},targets);
  }
 }
 // State split-bar changes if a long written rest would conceal the new harmony.
 for(let cycle=0;cycle<total;cycle+=score.chartBeats)for(const h of targets){
  const beat=cycle+h.start;if(beat>=total)break;const grid=Math.round(beat*rate),end=Math.min(score.comping.length,grid+Math.min(.75,h.duration)*rate);
  const rings=score.comping.slice(Math.max(0,grid-Math.ceil(beats*2*rate)),grid).some((es,i)=>es.some(e=>i+Math.max(0,grid-Math.ceil(beats*2*rate))+e.duration*rate>grid&&e.notes.every(n=>[...h.chordPcs,...h.scalePcs].includes(pc(n)))));
  if(!rings&&!score.comping.slice(grid,end).some(es=>es.length))add(score,'comping',beat,{notes:h.chordPcs.map(n=>48+n),duration:Math.min(.65,h.duration),velocity:.3,voiceShape:2,articulation:score.id==='blues'?'damped':'swell',changeEntry:true,composed:true,studyPerformance:true},targets);
 }
 score.performanceStudy={version:1,style:score.id,phraseBars:8};
}
export function articulateStudyPerformance(score,targets,clip){
 if(!Object.hasOwn(STUDIES,score.id))return articulateStylePerformance(score,targets,clip);
 const at=b=>segmentAt(targets,b),rate=12,rows=score.sequence.flatMap((es,grid)=>es.map(event=>({grid,event})));
 for(let i=0;i<rows.length;i++){
  const {grid,event:e}=rows[i],next=rows[i+1],beat=grid/rate;
  if(score.id==='legatoFusion'&&next&&next.grid-grid<=e.duration*rate+2&&next.grid-grid<score.beats*rate&&next.event.chorus===e.chorus){e.duration=clip(beat,(next.grid-grid)/rate+.08,[e.midi]);e.articulation='connected';}
  else if(score.id==='blues')e.articulation=e.duration<.6?'detached':'held';
 }
 const shape=(e,beat)=>{
  const h=at(beat),ints=CHORDS[h.chord].intervals,third=pc(h.root+(ints.includes(3)?3:ints.includes(4)?4:ints[1]||0)),seventh=ints.find(n=>n>=9&&n<=11),guide=new Set([third,...(seventh===undefined?[]:[pc(h.root+seventh)])]);
  if(score.id==='blues'){
   if(['pentatonic','shell'].includes(e.compingTechnique)){e.duration=clip(beat,e.duration,e.notes);e.articulation=e.articulation||'damped';return;}
   let notes=e.notes.filter(n=>guide.has(pc(n)));if(notes.length<2)notes=[...new Set([...notes,...e.notes])].slice(0,2);if(e.voiceShape===1&&e.notes.length>2)notes=[...new Set([...notes,e.notes.at(-1)])].slice(0,3);e.notes=notes.sort((a,b)=>a-b);
   e.duration=clip(beat,e.duration,e.notes);e.articulation=e.articulation||'damped';
  }else if(['quartal','pentatonic','triadPair'].includes(e.compingTechnique)){e.duration=clip(beat,e.duration,e.notes);e.articulation='swell';}else if(e.notes.length>=3){const notes=[...e.notes],index=notes.length-2;if(notes[index]-12>=40){notes[index]-=12;notes.sort((a,b)=>a-b);if(notes.at(-1)-notes[0]<=22)e.notes=notes;}e.duration=clip(beat,e.duration,e.notes);e.articulation='swell';}
 };
 for(let grid=0;grid<score.comping.length;grid++)for(const e of score.comping[grid])shape(e,grid/rate);
 for(let grid=0;grid<(score.answerOptions?.length||0);grid++)for(const e of score.answerOptions[grid]){e.voiceShape=1;e.articulation=score.id==='blues'?'damped':'swell';shape(e,grid/rate);}
 for(let grid=0;grid<score.bass.length;grid++)for(const e of score.bass[grid]){e.velocity*=grid%(score.beats*rate)===0?1.04:.97;e.performanceTouch=score.id==='blues'?'walking pulse':'sustained support';}
}
