import {EXPANDED_SAMPLE_ZONES,EXPANDED_DRUM_GROUPS,expandedBankForTone,sourceFor} from './sound-library.js';
import {TAMA_DRUM_GROUPS,LIVE_DYNAMIC_GROUPS} from './tama-groups.js';
import {DRUM_KITS} from './instrumentation.js';
import {DRUM_SAMPLE_GROUPS,JAZZ_DRUM_GROUPS,LIVE_DRUM_GROUPS,BASS_SAMPLE_ZONES,latinSampleGroups} from './sample-map.js';
import {INSTRUMENT_SAMPLE_ZONES} from './instrument-samples.js';
const originalBanks={jazzGuitar:'electricGuitar',swelledGuitar:'electricGuitar',drivenGuitar:'electricGuitar',acousticPiano:'piano',softPiano:'piano',cleanGuitar:'electricGuitar',bluesGuitar:'electricGuitar',nylonGuitar:'nylonGuitar'};
export function sampleNamesForSettings(s){
 const muted=new Set(String(s.mutedChannels||'').split(',')),names=new Set(),audible=id=>s[id]===true&&!muted.has(id)&&(s[id+'Volume']??.25)>0;
 const addGroups=groups=>{for(const ids of Object.values(groups))for(const id of ids)names.add(id);},addZones=zones=>{for(const z of zones||[])names.add(z.id);};
 if(audible('drums')){
  const profile=DRUM_KITS[s.drumKit]||DRUM_KITS.rock,groups=profile.bank==='tama'?TAMA_DRUM_GROUPS:profile.bank==='live'?LIVE_DRUM_GROUPS:profile.bank==='jazz'?JAZZ_DRUM_GROUPS:DRUM_SAMPLE_GROUPS;
  const latin=profile.bank==='jazz'&&['bossa','tumbao'].includes(s.drumGroove);if(latin)for(const ids of s.drumGroove==='bossa'?[groups.kickSoft,groups.rim,groups.hat]:[groups.kickSoft])for(const id of ids)names.add(id);else addGroups(groups);
  addGroups(latinSampleGroups(s.drumGroove));if(profile.tambourine||['samba','motown'].includes(s.drumGroove))for(const id of DRUM_SAMPLE_GROUPS.tambourine)names.add(id);
  if(sourceFor(s,'drums')==='expanded'&&profile.bank==='live'){addGroups(EXPANDED_DRUM_GROUPS);addGroups(LIVE_DYNAMIC_GROUPS);}
 }
 if(audible('bass')){addZones(s.bassInstrument==='upright'?INSTRUMENT_SAMPLE_ZONES.upright:BASS_SAMPLE_ZONES);if(sourceFor(s,'bass')==='expanded')addZones(EXPANDED_SAMPLE_ZONES[s.bassInstrument==='upright'?'upright':'electricBass']);}
 for(const channel of ['comping','sequence'])if(audible(channel)){
  const tone=channel==='comping'?s.compingTone:s.sequenceTone||s.compingTone,expanded=sourceFor(s,channel)==='expanded',bank=expandedBankForTone(tone);
  if(!expanded||!['electricGuitar','flute','wurlitzer','clav'].includes(bank))addZones(INSTRUMENT_SAMPLE_ZONES[originalBanks[tone]]);
  if(expanded){addZones(EXPANDED_SAMPLE_ZONES[bank]);if(['cleanGuitar','bluesGuitar','drivenGuitar'].includes(tone))addZones(EXPANDED_SAMPLE_ZONES.guitarMuted);}
 }
 return [...names];
}
