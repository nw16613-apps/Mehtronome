import {MIX_REFERENCE_PERCENT} from '../audio/mix-balance.js';
export const MIX_CHANNELS=[
  {id:'click',label:'Metronome',control:'click',output:'click-value',value:MIX_REFERENCE_PERCENT},
  {id:'harmony',label:'Harmony',control:'harmony',output:'harmony-value',value:MIX_REFERENCE_PERCENT},
  {id:'drums',label:'Drums',control:'drums-volume',output:'drums-volume-value',value:MIX_REFERENCE_PERCENT},
  {id:'bass',label:'Bass',control:'bass-volume',output:'bass-volume-value',value:MIX_REFERENCE_PERCENT},
  {id:'comping',label:'Comping',control:'comping-volume',output:'comping-volume-value',value:MIX_REFERENCE_PERCENT},
  {id:'sequence',label:'Melodic movement',control:'sequence-volume',output:'sequence-volume-value',value:MIX_REFERENCE_PERCENT},
  {id:'space',label:'Harmony room',control:'space',output:'space-value',value:MIX_REFERENCE_PERCENT},
];

export const BACKING_CHANNELS=['drums','bass','comping','sequence'];
// Legacy presets had independent power and mute states. Preserve audibility
// while translating power-off into the single mute state used by the mixer.
export function backingMutesForPreset(controls){
 return Object.fromEntries(BACKING_CHANNELS.map(id=>['mute-'+id,controls[id]===false||
  (typeof controls['mute-'+id]==='boolean'?controls['mute-'+id]:controls[id]!==true)]));
}
