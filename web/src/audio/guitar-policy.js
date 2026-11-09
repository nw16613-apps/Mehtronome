import {sourceFor} from './sound-library.js';
const TONES=new Set(['cleanGuitar','bluesGuitar','swelledGuitar','jazzGuitar','drivenGuitar','legatoGuitar']);
export const isElectricGuitarTone=tone=>TONES.has(tone);
export const nativeGuitarChannel=(s,channel)=>sourceFor(s,channel)==='expanded'&&isElectricGuitarTone(channel==='comping'?s.compingTone:s.sequenceTone||s.compingTone);
export const guitarChannelVolume=(s,channel)=>s[channel]===true&&!String(s.mutedChannels||'').split(',').includes(channel)?Math.max(0,Number(s[channel+'Volume'])||0):0;
export const needsGuitarCabinet=s=>['comping','sequence'].some(c=>nativeGuitarChannel(s,c)&&guitarChannelVolume(s,c)>0);
export function guitarToneProfile(tone,channel='comping'){
 const chorus=channel==='comping'&&['cleanGuitar','bluesGuitar','swelledGuitar'].includes(tone);
 const base=tone==='bluesGuitar'||tone==='drivenGuitar'?{gain:85,lowcut:95,tone:4800,outputCut:6500,trim:chorus?8.82:6.26}:tone==='swelledGuitar'||tone==='legatoGuitar'?{gain:24,lowcut:85,tone:5600,outputCut:6500,trim:chorus?3.52:.84}:{gain:28,lowcut:75,tone:7000,outputCut:7800,trim:chorus?4.42:1.78};
 if(tone==='drivenGuitar')base.gain=140;
 if(tone==='jazzGuitar'){base.tone=4200;base.outputCut=5200;}
 return {...base,chorus:chorus?.35:0};
}
