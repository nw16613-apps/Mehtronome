import {characteristicNotes} from './music.js';
export const AMBIENT_DEFAULTS={padAmbient:true,padEvolution:.55,padSpace:.55,padVoicingMotion:true,padColour:'extensions',extensionMorph:true};
export const AMBIENT_TEXTURES=[['warm','Warm'],['air','Airy'],['velvet','Dark'],['aurora','Shimmering']];
const unit=(v,fallback)=>Number.isFinite(Number(v))?Math.max(0,Math.min(1,Number(v))):fallback;
export function normalizeAmbient(s){return {padAmbient:s.padAmbient===true,padEvolution:unit(s.padEvolution,.55),padSpace:unit(s.padSpace,.55),padVoicingMotion:s.padVoicingMotion===true,padColour:s.extensionMorph?'extensions':s.padColour==='modal'?'modal':'chord'};}
/** Seconds-based, independent layers; tempo edits never reset the texture. */
export function ambientVoiceState(seconds,index,foundation,evolution,space){
 const slow=Math.sin(seconds*.17+index*1.71),drift=Math.sin(seconds*.31+index*.93),breath=Math.sin(seconds*.23+index*2.17);
 return {filterOctaves:foundation?0:evolution*(slow*1.5+drift*.5),colour:.5+.5*(slow*.65+drift*.35),blend:slow*.65+breath*.35,gain:foundation?1:1+evolution*(breath*.38+slow*.17),pan:foundation?0:space*.45*evolution*drift,width:foundation?0:space};
}
export function ambientColourNotes(harmony,kind){
 if(kind!=='modal')return [];
 return characteristicNotes(harmony).slice(0,2).map((n,i)=>({midi:72+((n.pc-0+12)%12),role:'colour',weight:.85,modalColour:true,colourIndex:i,label:n.degree}));
}
/** Reserve modal colours before optional octave layers; emphasise existing tones without doubling them. */
export function ambientModalVoicing(entries,harmony){
 const voiced=entries.map(entry=>({...entry}));
 for(const colour of ambientColourNotes(harmony,'modal')){
  const existing=voiced.filter(e=>e.midi%12===colour.midi%12).sort((a,b)=>b.midi-a.midi)[0];
  if(existing)Object.assign(existing,{modalColour:true,modalExisting:true,colourIndex:colour.colourIndex,label:colour.label,weight:Math.max(1.2,existing.weight*1.4)});
  else if(voiced.length<10)voiced.push(colour);
 }
 return voiced;
}
export function ambientVoicingEntries(entries,moving){
 if(!moving)return entries;
 const extra=entries.filter(e=>e.role!=='foundation'&&e.role!=='root'&&!e.modalColour&&e.midi<84).slice(0,2).map((e,i)=>({...e,midi:e.midi+12,role:'air',weight:.3,ambientRegister:i}));
 return [...entries,...extra.filter(e=>!entries.some(n=>n.midi===e.midi))].slice(0,10);
}
export function ambientEntryGain(entry,seconds){
 if(entry.modalColour){const swell=Math.sin(seconds*.16+.9+(entry.colourIndex||0)*1.3)**2;return entry.modalExisting?.85+.15*swell:.6+.4*swell;}
 if(entry.ambientRegister!==undefined)return .05+.95*Math.sin(seconds*.035+entry.ambientRegister*1.7)**2;
 return 1;
}
