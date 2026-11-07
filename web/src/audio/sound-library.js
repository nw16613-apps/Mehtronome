import {EXPANDED_SAMPLE_ZONES,EXPANDED_DRUM_GROUPS} from './expanded-samples.js';
export {EXPANDED_SAMPLE_ZONES,EXPANDED_DRUM_GROUPS};
const TONE_BANKS={acousticPiano:'piano',softPiano:'piano',cleanGuitar:'electricGuitar',bluesGuitar:'electricGuitar',drivenGuitar:'electricGuitar',swelledGuitar:'electricGuitar',jazzGuitar:'electricGuitar',nylonGuitar:'nylonGuitar',fluteLead:'flute',brightTine:'wurlitzer',warmTine:'wurlitzer',suitcase:'wurlitzer',reed:'wurlitzer',felt:'wurlitzer',clav:'clav'};
export const expandedBankForTone=tone=>TONE_BANKS[tone];
// Choose an actual recorded dynamic layer, then rotate independent takes at the
// nearest pitch. Loudness remains controlled by the incoming musical velocity.
export function recordedZone(zones,midi,velocity,cursors){
 if(!zones?.length)return null;
 const layers=new Set(zones.map(z=>z.layer)),layer=layers.has('p')?(velocity<.39?'p':'mf'):layers.has('soft')?(velocity<.4?'soft':'hard'):undefined;
 const pool=layer?zones.filter(z=>z.layer===layer):zones;
 const nearest=pool.reduce((best,z)=>!best||Math.abs(z.rootMidi-midi)<Math.abs(best.rootMidi-midi)?z:best,null);if(!nearest)return null;
 const root=nearest.nominalMidi??Math.round(nearest.rootMidi),choices=pool.filter(z=>(z.nominalMidi??Math.round(z.rootMidi))===root),key=nearest.id.replace(/[12]$/,'')+':'+root+':'+(layer||''),count=cursors.get(key)||0;cursors.set(key,count+1);return choices[count%choices.length];
}
export function sourceFor(settings,channel){const selected=settings.soundSources?.[channel];return selected==='original'||selected==='expanded'?selected:settings.soundLibrary==='expanded'?'expanded':'original';}
