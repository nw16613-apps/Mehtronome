import {COMPOSITION_STYLES} from './composition-vocabulary.js';
const walking=new Set(['traditionalJazz','jazzWaltz','blues','modernStraightJazz']);
const protectedPercussion=new Set(['latin','bossa','samba','afroCuban68']);
// Lightweight, activity-dependent coordination over an already composed score.
// It operates before playback, and never edits the cached composition itself.
export function coordinateEnsemble(source){
 if(!source.composition)return source;
 const profile=COMPOSITION_STYLES[source.id],score={...source},length=source.sequence.length,rate=12,beats=source.beats;
 for(const track of ['comping','bass','drums'])score[track]=source[track].map(events=>events.map(e=>({...e,...(e.notes?{notes:[...e.notes]}:{})})));
 const lead=new Uint8Array(length),attacks=new Uint8Array(length),chords=new Uint8Array(length);
 const busyFill=grid=>{for(let i=Math.max(0,grid-3);i<Math.min(length,grid+4);i++)if(attacks[i])return true;return false;};
 for(let grid=0;grid<length;grid++)for(const note of source.sequence[grid]){
  attacks[grid]=1;const end=Math.min(length,grid+Math.ceil(note.duration*rate));for(let i=grid;i<end;i++)lead[i]=1;
 }
 let softened=0,space=0,answers=0,matched=0,moved=0,omitted=0;
 for(let grid=0;grid<length;grid++){
  const stage=Math.min(3,Math.floor(grid/rate/source.developmentBeats)),inBeat=grid%12;
  score.comping[grid]=score.comping[grid].filter(event=>{
   const chordEntry=event.changeEntry||Math.abs(event.at-Math.round(event.at))<1e-7;
   if(!profile.ostinato&&attacks[grid]&&!chordEntry&&event.duration<1.6){space++;return false;}
   if(lead[grid]){event.velocity*=profile.ostinato?.86:.78;event.conversation='support';softened++;}
   else event.conversation='answer-space';return true;
  });
  for(const event of score.comping[grid])for(let i=grid;i<Math.min(length,grid+Math.ceil(event.duration*rate));i++)chords[i]=1;
  for(const event of score.drums[grid]){
   if(event.name==='kick'&&score.bass[grid].length&&!walking.has(score.id)&&!protectedPercussion.has(score.id)&&score.id!=='reggae'){
    event.velocity=Math.min(.85,event.velocity*1.07);event.matchedBass=true;matched++;for(const bass of score.bass[grid])bass.locksKick=true;
   }
   // Contrast is a quieter shared texture. Keep defining triplet and clave beds.
   if(stage===2&&!protectedPercussion.has(score.id)&&score.id!=='slowSoul128'&&['hat','ride','rideBell'].includes(event.name)&&inBeat!==0)event.velocity*=.74;
   if(stage===1&&event.transition&&event.name==='tomHigh'&&(Math.floor(grid/(beats*12))%2))event.name='tomLow';
  }
 }
 // An upper-voice answer needs an actual lead gap and no ringing chord beneath it.
 let lastAnswer=-Infinity;
 if(!profile.ostinato)for(let grid=0;grid<length;grid++)for(const candidate of source.answerOptions?.[grid]||[]){
  if(grid-lastAnswer<beats*rate*2||chords[grid])continue;
  let clear=true;for(let i=Math.max(0,grid-3);i<Math.min(length,grid+9);i++)if(lead[i]){clear=false;break;}
  if(!clear)continue;
  const event={...candidate,notes:[...candidate.notes],conversation:'reply'};score.comping[grid].push(event);lastAnswer=grid;answers++;
  for(let i=grid;i<Math.min(length,grid+Math.ceil(event.duration*rate));i++)chords[i]=1;
 }
 // Only ornaments move. Kick, backbeat, one-drop and Latin/compound foundations
 // retain their authored positions; a busy lead can suppress an optional fill.
 if(!protectedPercussion.has(score.id)){
  const jobs=[];for(let grid=0;grid<length;grid++)score.drums[grid]=score.drums[grid].filter(event=>{
   const ornament=event.transition&&(['tomHigh','tomLow'].includes(event.name)||event.name==='snare'&&event.velocity<.35);
   if(ornament&&busyFill(grid)){jobs.push({grid,event});return false;}return true;
  });
  const quantum=score.id==='slowSoul128'?4:['blues','traditionalJazz','jazzWaltz','secondLine'].includes(score.id)?6:3;
  for(const {grid,event}of jobs){
   const phrase=source.form.phrases.find(p=>grid/rate>=p.start&&grid/rate<p.end),end=Math.min(length,Math.round((phrase?.end??(Math.floor(grid/(beats*12))+1)*beats)*rate));let destination=-1;
   for(let at=end-quantum;at>=Math.max(0,end-12);at-=quantum){if(busyFill(at)||score.drums[at].some(e=>e.name===event.name))continue;destination=at;break;}
   if(destination>=0){score.drums[destination].push({...event,at:destination/rate%beats,bar:Math.floor(destination/rate/beats),conversation:'fill-gap'});moved++;}else omitted++;
  }
 }
 score.interaction={softenedComping:softened,collisionsRemoved:space,chordReplies:answers,bassKickMatches:matched,fillsMoved:moved,fillsOmitted:omitted};
 return score;
}
