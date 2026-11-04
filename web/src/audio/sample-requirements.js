import {DRUM_KITS} from './instrumentation.js';
import {DRUM_SAMPLE_GROUPS,JAZZ_DRUM_GROUPS,LIVE_DRUM_GROUPS,BASS_SAMPLE_ZONES} from './sample-map.js';
import {INSTRUMENT_SAMPLE_ZONES} from './instrument-samples.js';
const compingBanks={acousticPiano:'piano',softPiano:'piano',cleanGuitar:'electricGuitar',bluesGuitar:'electricGuitar',nylonGuitar:'nylonGuitar'};
// Synthesized click, harmony and melodic movement need no downloaded recordings.
export function sampleNamesForSettings(settings){
 const muted=new Set(String(settings.mutedChannels||'').split(',')),names=new Set();
 const audible=(id,volume)=>settings[id]===true&&!muted.has(id)&&(settings[volume]??.25)>0;
 if(audible('drums','drumsVolume')){const profile=DRUM_KITS[settings.drumKit]||DRUM_KITS.rock,groups=profile.bank==='live'?LIVE_DRUM_GROUPS:profile.bank==='jazz'?JAZZ_DRUM_GROUPS:DRUM_SAMPLE_GROUPS;for(const ids of Object.values(groups))for(const id of ids)names.add(id);if(profile.tambourine)for(const id of DRUM_SAMPLE_GROUPS.tambourine)names.add(id);}
 if(audible('bass','bassVolume'))for(const zone of settings.bassInstrument==='upright'?INSTRUMENT_SAMPLE_ZONES.upright:BASS_SAMPLE_ZONES)names.add(zone.id);
 if(audible('comping','compingVolume'))for(const zone of INSTRUMENT_SAMPLE_ZONES[compingBanks[settings.compingTone]]||[])names.add(zone.id);
 return [...names];
}
