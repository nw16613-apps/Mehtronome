import {STANDARD_MELODIES} from './standard-melodies-data.js';
import {progressionBeatDurations,progressionTimeline} from './music.js';
const names={'autumn-leaves':'Autumn Leaves','all-the-things':'All the Things You Are','another-you':'There Will Never Be Another You','blue-bossa':'Blue Bossa'};
const pitch=value=>{const [,letter,accidental,octave]=value.match(/^([A-G])([b#]?)(-?\d+)$/);return (Number(octave)+1)*12+({C:0,D:2,E:4,F:5,G:7,A:9,B:11}[letter])+({b:-1,'#':1}[accidental]||0);};
export function standardMelodyStatus(settings){
 const id=settings.template==='custom'&&settings.progression?settings.customProgression?.standardMelody:null;
 const source=Object.hasOwn(STANDARD_MELODIES,id)?STANDARD_MELODIES[id]:null;if(!source||settings.beats!==4)return null;
 const total=progressionBeatDurations(settings).reduce((a,b)=>a+b,0),ending=settings.standardMelodyEnding||0,body=settings.standardMelodyOriginalBeats??total-ending,form=source.bars*4;
 if(body<form||Math.abs(body/form-Math.round(body/form))>1e-7)return null;
 return {id,name:names[id],source,total,body,form,ending};
}
// Melody is independent of the arranger's generated phrases, activity windows,
// harmonic remapping and later-chorus variations. Only key and playback range adapt.
export function prepareStandardMelody(settings){
 const status=standardMelodyStatus(settings);if(!status)return null;
 const {source,body,form}=status,rate=12,timeline=settings.standardMelodyTimeline||progressionTimeline(settings),spans=[];let period=0;
 for(const segment of timeline){
  const previous=spans.at(-1);
  if(previous&&Math.abs(previous.end-segment.start)<1e-7)previous.end+=segment.duration;
  else spans.push({start:segment.start,end:segment.start+segment.duration,at:period});
  period+=segment.duration;
 }
 const shift=((settings.key-source.key+18)%12)-6;
 const swing=source.swing&&['traditionalJazz','blues','jazzWaltz','secondLine'].includes(settings.backingStyle);
 const performed=t=>{const beat=Math.floor(t),fraction=t-beat;return beat+(swing&&Math.abs(fraction-.5)<1e-6?2/3:fraction);};
 const written=source.notes.map(([at,note,duration])=>({at:performed(at),end:performed(at+duration),midi:pitch(note)+shift}));
 const slots=Array.from({length:Math.round(period*rate)},()=>[]),pickup={};
 const add=(rows,at,event)=>{const index=Math.round(at*rate);(rows[index]??(rows[index]=[])).push({...event,at,velocity:.7,standardMelody:status.id});};
 for(const span of spans){
  const end=Math.min(span.end,body);if(end<=span.start)continue;
  for(let pass=Math.floor(span.start/form);pass<Math.ceil(end/form);pass++)for(const event of written){
   if(event.at<0)continue;
   const start=pass*form+event.at,finish=pass*form+event.end,from=Math.max(start,span.start),to=Math.min(finish,end);
   if(to<=from+1e-7||start>=end)continue;
   add(slots,span.at+from-span.start,{midi:event.midi,duration:to-from,resumed:from>start});
  }
 }
 if(timeline[0]?.start===0)for(const event of written)if(event.at<0)add(pickup,event.at,{midi:event.midi,duration:event.end-event.at,pickup:true});
 return {id:status.id,name:status.name,rate,period,slots,pickup,pickupBeats:Object.keys(pickup).length?source.pickupBeats:0};
}

// Shared by the audio clock and the transport's initial display state.
export function playbackLeadInBeats(settings,melody=prepareStandardMelody(settings)){
 if(settings.countIn)return settings.beats;
 if(!settings.sequence||settings.standardMelodyPickup===false||(settings.sequenceVolume??.25)<=0||String(settings.mutedChannels||'').split(',').includes('sequence'))return 0;
 return melody?.pickupBeats||0;
}
