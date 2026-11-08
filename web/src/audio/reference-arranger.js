import {arrangementForm,finishArrangement} from './arrangement-form.js';
import {CHORDS,MODES,harmonyAt,progressionTimeline} from './music.js';
import {harmonySegments,segmentAt,pitchForDegree} from './reference-catalogue.js';
const pc=n=>((n%12)+12)%12;
const nearest=(wanted,pcs,low,high)=>{let best=low,cost=Infinity;for(let n=low;n<=high;n++)if(pcs.includes(pc(n))&&Math.abs(n-wanted)<cost){best=n;cost=Math.abs(n-wanted);}return best;};
const gcd=(a,b)=>b?gcd(b,a%b):a;
export function arrangementSupport(settings,def){
 if(!settings.progression||settings.template!=='custom'||!settings.customProgression?.steps?.length)return 'Choose a chord chart first.';
 if(settings.backingStyle!==def.style)return 'Choose the matching backing style to use this arrangement.';
 if(settings.beats!==(def.beats||4))return `This arrangement uses ${def.beats||4} beats per bar.`;
 if(settings.extensionMorph)return 'Turn off automatic chord extensions to arrange the written changes.';
 const timeline=progressionTimeline(settings),total=timeline.reduce((n,s)=>n+s.duration,0);
 if(!total||total>512)return 'Use a chart or loop of up to 512 beats for this arrangement.';
 return '';
}
function targetSegments(settings){let at=0;return progressionTimeline(settings).map(s=>{const h=harmonyAt(settings,s.step),entry={...h,start:at,end:at+s.duration,root:h.chordPcs[0],chord:h.chordId,mode:h.mode,duration:s.duration,step:s.step,section:settings.customProgression.steps[s.step]?.section||''};at+=s.duration;return entry;});}
const role=(interval,chord)=>{const ints=CHORDS[chord].intervals;for(const degree of ['1','3','5','7','9'])if(pc(pitchForDegree(chord,degree))===pc(interval))return degree;return null;};
function degreePitch(to,degree){
 const mapped=pc(to.root+pitchForDegree(to.chord,degree)),allowed=[...new Set([...to.scalePcs,...to.chordPcs])];
 // A missing ninth follows the written mode (e.g. Locrian flat 9), rather
 // than silently introducing the natural 9 from a generic chord fallback.
 return allowed.includes(mapped)?mapped:pc(nearest(60+mapped,allowed,48,84));
}
function scaleMap(midi,from,to){
 const source=MODES[from.mode].intervals,target=MODES[to.mode].intervals,interval=pc(midi-from.root),degree=source.reduce((best,n,i)=>Math.abs(n-interval)<Math.abs(source[best]-interval)?i:best,0);
 return pc(to.root+target[Math.round(degree*(target.length-1)/Math.max(1,source.length-1))]);
}
function chordVoicing(from,sourceNotes,to,previous,id){
 const intervals=CHORDS[to.chord].intervals;
 let pcs;
 if(id==='hardRock')pcs=[to.root,pc(to.root+pitchForDegree(to.chord,'5'))];
 else{
  pcs=[...new Set(sourceNotes.map(n=>{const degree=role(pc(n-from.root),from.chord);return degree?degreePitch(to,degree):scaleMap(n,from,to);}))];
  // Keep the written quality audible even if the source voicing was a triad.
  for(const i of [intervals[1],intervals.find(i=>i>=9&&i<=11),...intervals.filter(i=>i>=13)])if(i!==undefined&&!pcs.includes(pc(to.root+i)))pcs.push(pc(to.root+i));
  pcs=pcs.slice(-5);
 }
 const candidates=[];
 for(let inversion=0;inversion<pcs.length;inversion++)for(let octave=3;octave<=5;octave++){
  let last=octave*12+pcs[inversion],notes=[last];for(let i=1;i<pcs.length;i++){let n=octave*12+pcs[(inversion+i)%pcs.length];while(n<=last)n+=12;notes.push(n);last=n;}
  if(id==='hardRock')notes.push(notes[0]+12);
  notes.sort((a,b)=>a-b);if(notes[0]>=40&&notes.at(-1)<=84)candidates.push(notes);
 }
 const center=id==='hardRock'?52:63,cost=notes=>notes.reduce((sum,n,i)=>sum+Math.abs(n-(previous?.[Math.min(i,previous.length-1)]??center)),0);
 return candidates.sort((a,b)=>cost(a)-cost(b))[0]||[to.root+48,to.root+60];
}
// Compose once against the entire actual playback timeline, including split bars
// and selected loops. Retain the source's multi-bar rhythm, rests and contour;
// target chord functions, future changes and prior pitches govern the new notes.
export function arrangeReference(source,def,settings){
 const beats=settings.beats,targets=targetSegments(settings),chartBeats=targets.at(-1).end,sourceBeats=def.bars*beats;
 const common=chartBeats*sourceBeats/gcd(chartBeats,sourceBeats),total=common<=512?common:Math.max(chartBeats,Math.ceil(sourceBeats/chartBeats)*chartBeats);
 const gridRate=12,length=total*gridRate,score={id:def.id,bars:total/beats,beats,rate:12,gridRate,adapted:true,chartBeats,sequence:Array.from({length},()=>[]),bass:Array.from({length},()=>[]),comping:Array.from({length},()=>[]),drums:Array.from({length},()=>[])};
 score.form=arrangementForm(settings,def,targets,total);
 const sourceSegments=harmonySegments(def),getTarget=beat=>segmentAt(targets,beat),allowed=h=>[...new Set([...h.scalePcs,...h.chordPcs])];
 const clip=(at,duration,pitches)=>{
  let remaining=duration,position=at;
  for(let guard=0;guard<20&&remaining>0;guard++){
   const h=getTarget(position),distance=h.end-(position%chartBeats);
   if(distance>=remaining-1e-7)return duration;
   const next=getTarget(position+distance+1e-6);
   if(pitches.some(n=>!allowed(next).includes(pc(n))))return Math.max(.08,duration-remaining+distance);
   position+=distance+1e-6;remaining-=distance+1e-6;
  }return duration;
 };
 let previousMelody=70,previousSource=null,previousBass=36,previousChord=null;
 const previousSourceGrid={sequence:-1,bass:-1,comping:-1,drums:-1};
 for(let grid=0;grid<length;grid++){
  const beat=grid/12,bar=Math.floor(beat/beats),inBar=beat%beats;
  const to=getTarget(beat),phrase=score.form.bars[bar];
  for(const track of ['sequence','bass','comping','drums']){
   const sourceBeat=track==='drums'?beat%sourceBeats:phrase.sourceBar*beats+inBar;
   const from=segmentAt(sourceSegments,sourceBeat);
   const rate=source.gridRate||(track==='sequence'?source.rate:4),sourceGrid=Math.floor(sourceBeat*rate+1e-7);
   if(previousSourceGrid[track]===sourceGrid)continue;previousSourceGrid[track]=sourceGrid;
   for(const event of source[track][sourceGrid%source[track].length]){
    let result={...event,at:inBar,bar,sourceBar:event.bar,targetStep:to.step,phraseRole:phrase.role,section:phrase.section};
    if(track==='drums'){score[track][grid].push(result);continue;}
    if(track==='sequence'){
     const degree=role(pc(event.midi-from.root),from.chord),mapped=degree?degreePitch(to,degree):scaleMap(event.midi,from,to);
     const contour=previousSource===null?event.midi+settings.key-def.key:previousMelody+Math.max(-9,Math.min(9,event.midi-previousSource));
     const strong=Math.abs(inBar-Math.round(inBar))<1e-7&&event.duration>=.65;
     const pcs=strong?to.chordPcs:[mapped];
     const midi=nearest(contour,pcs,55,86);previousMelody=midi;previousSource=event.midi;
     result={...result,midi,duration:clip(beat,event.duration,[midi])};
    }else if(track==='bass'){
     const nextBar=(bar+1)*beats,next=getTarget(nextBar),boundary=to.end-(beat%chartBeats),son=def.id==='latin';
     const anticipated=event.anticipation||son&&Math.abs(boundary-.5)<1e-6;
     const target=son&&Math.abs(boundary-.5)<1e-6?getTarget(beat+.5):anticipated?next:to;
     const degree=role(pc(event.midi-from.root),from.chord);
     const nextSource=segmentAt(sourceSegments,Math.floor(sourceBeat/beats+1)*beats);
     const approach=!degree&&Math.abs(((pc(event.midi-nextSource.root)+6)%12)-6)===1&&boundary<=1.01;
     let midi;
     if(approach){const delta=pc(event.midi-nextSource.root)===11?-1:1;midi=nearest(previousBass,[pc(getTarget(beat+boundary).root+delta)],28,55);}
     else{
      const mapped=degree?degreePitch(target,degree):scaleMap(event.midi,from,target);
      const bassPc=degree==='1'&&Number.isFinite(target.bassMidi)?pc(target.bassMidi):mapped;
      midi=nearest(degree==='1'?34+pc(bassPc-10):previousBass,[bassPc],28,55);
     }
     previousBass=midi;result={...result,midi,anticipation:!!anticipated,approach,duration:clip(beat,event.duration,[midi])};
    }else{
     const notes=chordVoicing(from,event.notes,to,previousChord,def.id);previousChord=notes;
     result={...result,notes,duration:clip(beat,event.duration,notes)};
    }
    score[track][grid].push(result);
   }
  }
 }
 // A new written chord must be stated even when it lands inside a held source
 // chord. Son bass stays anticipated; it is not forced onto every downbeat.
 for(let cycle=0;cycle<total;cycle+=chartBeats)for(const target of targets){
  const at=cycle+target.start;if(at>=total)break;const grid=Math.round(at*12),priorGrid=(grid-6+length)%length;
  if(!score.bass[grid].length&&def.id!=='latin'&&!score.bass[priorGrid].some(n=>n.anticipation&&pc(n.midi)===target.root)){
   const midi=nearest(36,[Number.isFinite(target.bassMidi)?pc(target.bassMidi):target.root],28,47);
   score.bass[grid].push({at:at%beats,bar:Math.floor(at/beats),midi,duration:Math.min(.7,target.duration),velocity:.56,targetStep:target.step,changeEntry:true});
  }
  if(!score.comping[grid].length){
   const first=score.comping.slice(grid,Math.min(length,grid+Math.min(target.duration,beats)*12)).find(events=>events.length);
   if(!first){const notes=chordVoicing(sourceSegments[0],[60,64,67,71],target,null,def.id);score.comping[grid].push({at:at%beats,bar:Math.floor(at/beats),notes,duration:Math.min(1.5,target.duration),velocity:.34,targetStep:target.step,changeEntry:true});}
  }
 }
 return finishArrangement(score,settings,def,targets,clip);
}
