import {EXPANDED_SAMPLE_ZONES,EXPANDED_DRUM_GROUPS,expandedBankForTone} from './sound-library.js';
import {DRUM_KITS} from './instrumentation.js';
import {DRUM_SAMPLE_GROUPS,JAZZ_DRUM_GROUPS,LIVE_DRUM_GROUPS,BASS_SAMPLE_ZONES,latinSampleGroups} from './sample-map.js';
import {INSTRUMENT_SAMPLE_ZONES} from './instrument-samples.js';
const compingBanks={jazzGuitar:'electricGuitar',swelledGuitar:'electricGuitar',drivenGuitar:'electricGuitar',acousticPiano:'piano',softPiano:'piano',cleanGuitar:'electricGuitar',bluesGuitar:'electricGuitar',nylonGuitar:'nylonGuitar'};
// Click and harmony are synthesized. Style melodic parts can share recorded guitar/piano banks.
export function sampleNamesForSettings(settings){
 const needsOriginal=tone=>settings.soundLibrary!=='expanded'||!['electricGuitar','flute','wurlitzer','clav'].includes(expandedBankForTone(tone));
 const muted=new Set(String(settings.mutedChannels||'').split(',')),names=new Set();
 const audible=(id,volume)=>settings[id]===true&&!muted.has(id)&&(settings[volume]??.25)>0;
 if(audible('drums','drumsVolume')){const profile=DRUM_KITS[settings.drumKit]||DRUM_KITS.rock,groups=profile.bank==='live'?LIVE_DRUM_GROUPS:profile.bank==='jazz'?JAZZ_DRUM_GROUPS:DRUM_SAMPLE_GROUPS;const latin=profile.bank==='jazz'&&['bossa','tumbao'].includes(settings.drumGroove);const selected=latin?(settings.drumGroove==='bossa'?[groups.kickSoft,groups.rim,groups.hat]:[groups.kickSoft]):Object.values(groups);for(const ids of selected)for(const id of ids)names.add(id);for(const ids of Object.values(latinSampleGroups(settings.drumGroove)))for(const id of ids)names.add(id);if(profile.tambourine||settings.drumGroove==='samba')for(const id of DRUM_SAMPLE_GROUPS.tambourine)names.add(id);}
 if(audible('bass','bassVolume'))for(const zone of settings.bassInstrument==='upright'?INSTRUMENT_SAMPLE_ZONES.upright:BASS_SAMPLE_ZONES)names.add(zone.id);
 if(audible('sequence','sequenceVolume')&&settings.sequenceStyle&&needsOriginal(settings.sequenceTone||settings.compingTone))for(const zone of INSTRUMENT_SAMPLE_ZONES[compingBanks[settings.sequenceTone||settings.compingTone]]||[])names.add(zone.id);
 if(audible('comping','compingVolume')&&needsOriginal(settings.compingTone))for(const zone of INSTRUMENT_SAMPLE_ZONES[compingBanks[settings.compingTone]]||[])names.add(zone.id);
 if(settings.soundLibrary==='expanded'){
  if(audible('drums','drumsVolume')&&(DRUM_KITS[settings.drumKit]||DRUM_KITS.rock).bank==='live')for(const ids of Object.values(EXPANDED_DRUM_GROUPS))for(const id of ids)names.add(id);
  if(audible('bass','bassVolume'))for(const zone of EXPANDED_SAMPLE_ZONES[settings.bassInstrument==='upright'?'upright':'electricBass']||[])names.add(zone.id);
  for(const [channel,tone]of [['comping',settings.compingTone],['sequence',settings.sequenceTone||settings.compingTone]])if(audible(channel,channel+'Volume')){
   const bank=expandedBankForTone(tone);for(const zone of EXPANDED_SAMPLE_ZONES[bank]||[])names.add(zone.id);
   if(['cleanGuitar','bluesGuitar','drivenGuitar'].includes(tone))for(const zone of EXPANDED_SAMPLE_ZONES.guitarMuted||[])names.add(zone.id);
  }
 }
 return [...names];
}
