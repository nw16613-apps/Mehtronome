import {CHORDS} from './music.js';
import {segmentAt} from './reference-catalogue.js';

const pc=n=>(n%12+12)%12;
const chromatic=new Set(['traditionalJazz','jazzWaltz','modernStraightJazz','blues','motown','secondLine','boogaloo']);
const pickups=new Set([...chromatic,'popRock','fusionJazz','funk','hardRock','legatoFusion']);
const native=new Set(['latin','bossa','samba','afroCuban68','reggae']);
const cymbals=new Set(['hat','hatOpen','hatPedal','ride','rideBell','flatRide','crash']);
export const SESSION_ROLES=['opening','build','space-and-return'];
function nearest(wanted,pcs){
 let note=36,cost=Infinity;
 for(let n=28;n<=55;n++)if(pcs.includes(pc(n))&&Math.abs(n-wanted)<cost){note=n;cost=Math.abs(n-wanted);}
 return note;
}
function bassPhrase(score,targets,clip,variation){
 const slots=score.bass.map(es=>es.map(e=>({...e}))),rows=slots.flatMap((es,grid)=>es.map(e=>({grid,e})));
 const at=b=>segmentAt(targets,b),beats=score.beats,total=slots.length/12;
 let previous=rows[0]?.e.midi??36;
 for(let i=0;i<rows.length;i++){
  const {grid,e}=rows[i],beat=grid/12,h=at(beat),distance=h.end-beat%score.chartBeats,next=at(beat+distance);
  const first=beat%score.chartBeats-h.start<.75;
  e.sessionBassRole='foundation';
  if(!e.anticipation&&!e.slashEntry&&!e.changeEntry&&!first){
   const lastBeforeChange=(rows[i+1]?.grid??slots.length)>=grid+Math.round(distance*12);
   const goal=Number.isFinite(next.bassMidi)?pc(next.bassMidi):next.root;
   if(chromatic.has(score.id)&&lastBeforeChange&&distance<=1.01&&pc(h.bassMidi??h.root)!==goal){
    e.midi=nearest(previous,[pc(goal-1),pc(goal+1)]);e.approach=true;e.sessionBassRole='approach';
    e.duration=Math.min(e.duration,distance);
   }else if(!e.approach&&(variation===1||variation===2&&Math.floor(beat/beats)%4===3)){
    const ints=CHORDS[h.chord].intervals,gesture=Math.floor(beat/beats)%4;
    const preferred=variation===2?[h.root]:[pc(h.root+(ints[gesture%Math.min(3,ints.length)]??0)),...h.chordPcs];
    e.midi=nearest(previous+(gesture===3?-1:gesture===1?2:0),preferred.slice(0,variation===2?1:3));
    e.sessionBassRole='connected';
   }
   e.duration=clip(beat,Math.min(e.duration,total-beat),[e.midi]);
  }
  previous=e.midi;
 }
 // A brief pickup is a phrase ending, not a new repeated bass rhythm. Do not
 // add it to tumbao, one-drop or compound-metre foundations.
 if(variation===1&&pickups.has(score.id))for(const phrase of score.form.phrases){
  if(phrase.end-phrase.start<beats*2||phrase.index%2!==1)continue;
  const grid=Math.round((phrase.end-.5)*12);if(grid<0||grid>=slots.length||slots.slice(Math.max(0,grid-3),Math.min(slots.length,grid+4)).some(es=>es.length))continue;
  const beat=grid/12,h=at(beat),goal=at(phrase.end),ints=CHORDS[h.chord].intervals;
  const goalPc=Number.isFinite(goal.bassMidi)?pc(goal.bassMidi):goal.root;
  const before=rows.findLast(row=>row.grid<grid),wanted=nearest(before?.e.midi??36,[goalPc]);
  const useApproach=chromatic.has(score.id)&&pc(h.bassMidi??h.root)!==goalPc;
  const midi=nearest(wanted,useApproach?[pc(goalPc-1),pc(goalPc+1)]:[pc(h.root+(ints[1]??0)),pc(h.root+(ints[2]??0))]);
  if(before&&before.grid+before.e.duration*12>grid)before.e.duration=Math.max(.08,(grid-before.grid)/12-.06);
  slots[grid].push({midi,duration:clip(beat,.4,[midi]),velocity:.48,at:beat%beats,bar:Math.floor(beat/beats),targetStep:h.step,
   chorus:Math.min(3,Math.floor(beat/score.developmentBeats)),sessionBassRole:'pickup',approach:useApproach,composed:true});
 }
 return slots;
}
function sparseBass(original,changed){
 const result={};
 for(let grid=0;grid<changed.length;grid++){
  const a=original[grid],b=changed[grid];
  if(a.length!==b.length||b.some((e,i)=>e.midi!==a[i]?.midi||e.duration!==a[i]?.duration||e.approach!==a[i]?.approach))result[grid]=b;
 }
 return result;
}
function drumsForCycle(score,variation){
 const result={},length=score.drums.length,beats=score.beats;
 const row=grid=>result[grid]??(result[grid]=score.drums[grid].map(e=>({...e})));
 if(variation===2)for(let grid=0;grid<length;grid++){
  const pass=Math.floor(grid/12/score.developmentBeats);
  const ornaments=score.drums[grid].some(e=>e.transition&&['tomHigh','tomLow','crash'].includes(e.name));
  if(pass!==3&&ornaments)result[grid]=score.drums[grid].filter(e=>!e.transition||!['tomHigh','tomLow','crash'].includes(e.name));
 }
 let lastEnd=-Infinity;
 for(const phrase of score.form.phrases){
  const end=Math.round(phrase.end*12),bar=Math.max(0,Math.ceil(phrase.end/beats)-1),part=score.form.bars[bar];
  const pass=Math.min(3,Math.floor((phrase.end-.01)/score.developmentBeats));
  if(end-lastEnd<beats*4*12||!part?.transition||variation===2&&pass!==3)continue;
  lastEnd=end;
  let strokes;
  if(score.id==='ballad')strokes=[[6,'hatPedal',.085]];
  else if(native.has(score.id))strokes=[[6,score.id==='latin'||score.id==='afroCuban68'?'congaMute':'rim',.16]];
  else if(score.id==='slowSoul128')strokes=[[8,'snare',.14],[4,'tomLow',.2]];
  else if(['traditionalJazz','jazzWaltz','blues','secondLine'].includes(score.id))strokes=[[12,'snare',.16],[6,variation===1?'tomLow':'tomHigh',.23]];
  else if(['neoSoul','legatoFusion','modernStraightJazz'].includes(score.id))strokes=[[9,'snare',.13],[3,'tomLow',.2]];
  else strokes=variation===1?[[12,'snare',.22],[9,'tomHigh',.24],[6,'tomLow',.28],[3,'snare',.2]]:[[12,'snare',.22],[6,'tomLow',.27]];
  for(const [offset,name,velocity]of strokes){
   const grid=end-offset;if(grid<0||grid>=length)continue;
   // Full melody is a conservative collision map: later Supporting filters
   // can only create additional space, never expose a new collision.
   let clear=true;for(let g=Math.max(0,grid-3);g<Math.min(length,grid+4);g++)if(score.sequence[g].length){clear=false;break;}
   if(!clear||row(grid).some(e=>e.name===name))continue;
   row(grid).push({at:grid/12%beats,bar:Math.floor(grid/12/beats),name,velocity,transition:true,sessionFill:true,phraseRole:phrase.role});
  }
 }
 return result;
}

// Sparse alternate event rows avoid tripling the entire tick grid. Composition
// and harmonic validation happen on the main thread before the score is sent.
export function prepareSessionPerformance(score,targets,clip){
 if(!score.composition)return score;
 const base=bassPhrase(score,targets,clip,0);score.bass=base;
 const variants=[null];
 for(const variation of [1,2]){
  const tracks={bass:sparseBass(base,bassPhrase(score,targets,clip,variation)),drums:drumsForCycle(score,variation)};
  if(variation===2){
   tracks.comping={};tracks.sequence={};
   for(let grid=0;grid<score.sequence.length;grid++){
    const pass=Math.floor(grid/12/score.developmentBeats),bar=Math.floor(grid/12/score.beats);
    if(pass===2&&bar%2===1){
     if(!score.pianoComping&&!score.composition.ostinato&&score.comping[grid].length&&score.comping[grid].every(e=>!e.changeEntry))tracks.comping[grid]=[];
     if(score.sequence[grid].length&&score.sequence[grid].every(e=>!e.cadenceRole))tracks.sequence[grid]=[];
    }
   }
  }
  variants.push(tracks);
 }
 score.sessionPerformance={version:1,roles:SESSION_ROLES,cycleBeats:score.sequence.length/12,variants};
 return score;
}

export function sessionCycle(score,beat){return score.sessionPerformance?Math.floor(Math.max(0,beat)/score.sessionPerformance.cycleBeats)%3:0;}
export function sessionEvents(score,track,grid,local){
 const variant=score.sessionPerformance?.variants[sessionCycle(score,grid/12)];
 return variant?.[track]?.[local]??score[track][local];
}
const gains=[[1,1,1,1],[.97,1.04,.94,1.03],[.84,.92,.75,1]];
export function sessionEventGain(plan,track,grid,piece=null){
 const score=plan.score;if(!score.sessionPerformance)return 1;
 const cycle=sessionCycle(score,grid/12);if(!cycle)return 1;
 const local=(grid%score.sequence.length+score.sequence.length)%score.sequence.length;
 const pass=Math.min(3,Math.floor(local/12/score.developmentBeats));
 const progress=(local/12%score.developmentBeats)/score.developmentBeats;
 let gain=gains[cycle][pass]*(cycle===2&&pass===3?.88+.12*progress:cycle===1?.96+.04*progress:1);
 if(cycle===2&&pass===2&&(track==='sequence'||track==='comping'))gain*=.88;
 if(track==='drums'&&cymbals.has(piece))gain=Math.min(1,gain);
 return gain;
}
