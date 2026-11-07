import {DRUM_KITS} from './instrumentation.js';
import {DRUM_SAMPLE_GROUPS,JAZZ_DRUM_GROUPS,LIVE_DRUM_GROUPS,BASS_SAMPLE_ZONES,latinSampleGroups} from './sample-map.js';
import {INSTRUMENT_SAMPLE_ZONES} from './instrument-samples.js';
const compingBanks={jazzGuitar:'electricGuitar',swelledGuitar:'electricGuitar',drivenGuitar:'electricGuitar',acousticPiano:'piano',softPiano:'piano',cleanGuitar:'electricGuitar',bluesGuitar:'electricGuitar',nylonGuitar:'nylonGuitar'};
// Click and harmony are synthesized. Style melodic parts can share recorded guitar/piano banks.
export function sampleNamesForSettings(settings){
 const muted=new Set(String(settings.mutedChannels||'').split(',')),names=new Set();
 const audible=(id,volume)=>settings[id]===true&&!muted.has(id)&&(settings[volume]??.25)>0;
 if(audible('drums','drumsVolume')){const profile=DRUM_KITS[settings.drumKit]||DRUM_KITS.rock,groups=profile.bank==='live'?LIVE_DRUM_GROUPS:profile.bank==='jazz'?JAZZ_DRUM_GROUPS:DRUM_SAMPLE_GROUPS;const latin=profile.bank==='jazz'&&['bossa','tumbao'].includes(settings.drumGroove);const selected=latin?(settings.drumGroove==='bossa'?[groups.kickSoft,groups.rim,groups.hat]:[groups.kickSoft]):Object.values(groups);for(const ids of selected)for(const id of ids)names.add(id);for(const ids of Object.values(latinSampleGroups(settings.drumGroove)))for(const id of ids)names.add(id);if(profile.tambourine||settings.drumGroove==='samba')for(const id of DRUM_SAMPLE_GROUPS.tambourine)names.add(id);}
 if(audible('bass','bassVolume'))for(const zone of settings.bassInstrument==='upright'?INSTRUMENT_SAMPLE_ZONES.upright:BASS_SAMPLE_ZONES)names.add(zone.id);
 if(audible('sequence','sequenceVolume')&&settings.sequenceStyle)for(const zone of INSTRUMENT_SAMPLE_ZONES[compingBanks[settings.sequenceTone||settings.compingTone]]||[])names.add(zone.id);
 if(audible('comping','compingVolume'))for(const zone of INSTRUMENT_SAMPLE_ZONES[compingBanks[settings.compingTone]]||[])names.add(zone.id);
 return [...names];
}
