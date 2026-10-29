export const MIX_CHANNELS=[
  {id:'click',label:'Metronome',control:'click',output:'click-value',value:50},
  {id:'harmony',label:'Harmony',control:'harmony',output:'harmony-value',value:35},
  {id:'drums',label:'Drums',control:'drums-volume',output:'drums-volume-value',value:35},
  {id:'bass',label:'Bass',control:'bass-volume',output:'bass-volume-value',value:40},
  {id:'comping',label:'Electric piano',control:'comping-volume',output:'comping-volume-value',value:30},
  {id:'sequence',label:'Melodic movement',control:'sequence-volume',output:'sequence-volume-value',value:25},
  {id:'space',label:'Ambient space',control:'space',output:'space-value',value:75},
];

export const BACKING_CHANNELS=['drums','bass','comping','sequence'];
// Legacy presets had independent power and mute states. Preserve audibility
// while translating power-off into the single mute state used by the mixer.
export function backingMutesForPreset(controls){
 return Object.fromEntries(BACKING_CHANNELS.map(id=>['mute-'+id,controls[id]===false||
  (typeof controls['mute-'+id]==='boolean'?controls['mute-'+id]:controls[id]!==true)]));
}
