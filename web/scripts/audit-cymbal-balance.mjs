import {readSampleBank} from './read-sample-bank.mjs';import {Rhythm} from '../src/audio/rhythm.js';import {DRUM_KITS} from '../src/audio/instrumentation.js';
const rate=24000,kit=await readSampleBank(rate),pieces={kick:{gain:.7,at:[0,1]},snare:{gain:.65,at:[.5,1.5]},hat:{gain:.24,at:[0,.25,.5,.75,1,1.25,1.5,1.75]},hatOpen:{gain:.19,at:[1.75]},hatPedal:{gain:.13,at:[.5,1.5]},ride:{gain:.25,at:[0,.25,.5,.75,1,1.25,1.5,1.75]},rideAccented:{type:'ride',gain:.31,at:[0,.25,.5,.75,1,1.25,1.5,1.75]},rideBell:{gain:.25,at:[0,1]},flatRide:{gain:.22,at:[0,.5,1,1.5]},crash:{gain:.25,at:[0]}};
const rows=[];for(const profile of Object.keys(DRUM_KITS))for(const [piece,{gain,at,type}]of Object.entries(pieces)){
 const r=new Rhythm(rate,kit);let square=0,peak=0,tail=0,hits=0;const onset=new Set(at.map(t=>Math.round(t*rate))),frames=rate*8;
 for(let n=0;n<frames;n++){if(onset.has(n%(rate*2))&&(piece!=='crash'||n===0)){r.hitDrum(type||piece,gain,n,0,0,0,()=>{hits++;},profile);}r.render(true,false);square+=r.drums*r.drums;peak=Math.max(peak,Math.abs(r.drums));if(n>=frames-rate)tail+=r.drums*r.drums;}
 rows.push({kit:profile,piece,hits,rmsDb:+(10*Math.log10(square/frames+1e-20)).toFixed(1),peakDb:+(20*Math.log10(peak+1e-20)).toFixed(1),tailDb:+(10*Math.log10(tail/rate+1e-20)).toFixed(1)});
}console.log(JSON.stringify(rows,null,2));
