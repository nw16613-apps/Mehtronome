import {EXPANDED_SAMPLE_ZONES as LEGACY_SAMPLE_ZONES,EXPANDED_DRUM_GROUPS} from './expanded-samples.js';
import {STUDIO_SAMPLE_ZONES} from './studio-zones.js';
import {PREFERRED_SAMPLE_ZONES} from './preferred-zones.js';
export const EXPANDED_SAMPLE_ZONES={...LEGACY_SAMPLE_ZONES,...STUDIO_SAMPLE_ZONES,...PREFERRED_SAMPLE_ZONES};
export const STUDIO_BANKS=new Set([...Object.keys(STUDIO_SAMPLE_ZONES),...Object.keys(PREFERRED_SAMPLE_ZONES)]);
export {EXPANDED_DRUM_GROUPS};
const TONE_BANKS={acousticPiano:'piano',softPiano:'piano',cleanGuitar:'electricGuitar',bluesGuitar:'electricGuitar',drivenGuitar:'electricGuitar',swelledGuitar:'electricGuitar',jazzGuitar:'electricGuitar',nylonGuitar:'nylonGuitar',fluteLead:'flute',brightTine:'wurlitzer',warmTine:'wurlitzer',suitcase:'wurlitzer',reed:'wurlitzer',felt:'wurlitzer',clav:'clav',drawbarOrgan:'organ',legatoGuitar:'electricGuitar'};
export const expandedBankForTone=tone=>TONE_BANKS[tone];
// Choose an actual recorded dynamic layer, then rotate independent takes at the
// nearest pitch. Loudness remains controlled by the incoming musical velocity.
export function recordedZone(zones,midi,velocity,cursors){
 if(!zones?.length)return null;
 const explicit=zones.some(z=>Number.isFinite(z.velLow));
 let pool;
 if(explicit){pool=zones.filter(z=>velocity>=z.velLow&&velocity<z.velHigh);if(!pool.length)pool=zones;}
 else{const layers=new Set(zones.map(z=>z.layer)),layer=layers.has('p')?(velocity<.39?'p':'mf'):layers.has('soft')?(velocity<.4?'soft':'hard'):undefined;pool=layer?zones.filter(z=>z.layer===layer):zones;}
 let nearest=pool.reduce((best,z)=>!best||Math.abs(z.rootMidi-midi)<Math.abs(best.rootMidi-midi)?z:best,null);if(!nearest)return null;
 // Prefer a nearby available recording over stretching an absent upper layer.
 if(Math.abs(nearest.rootMidi-midi)>5){const nearby=zones.filter(z=>Math.abs(z.rootMidi-midi)<=3);if(nearby.length){pool=nearby;nearest=nearby.reduce((best,z)=>Math.abs(z.rootMidi-midi)<Math.abs(best.rootMidi-midi)?z:best,nearby[0]);}}
 const root=nearest.nominalMidi??Math.round(nearest.rootMidi),choices=pool.filter(z=>(z.nominalMidi??Math.round(z.rootMidi))===root&&z.layer===nearest.layer),key=root+':'+nearest.layer+':'+nearest.id.replace(/r\d+$/,''),count=cursors.get(key)||0;cursors.set(key,count+1);return choices[count%choices.length];
}
export function sourceFor(settings,channel){const selected=settings.soundSources?.[channel];return selected==='original'||selected==='expanded'?selected:settings.soundLibrary==='expanded'?'expanded':'original';}
